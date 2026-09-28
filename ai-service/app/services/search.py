import os
import logging
from typing import Dict, Any, List, Optional
import psycopg
from psycopg.rows import dict_row

from app.core.providers import embed_text

logger = logging.getLogger(__name__)

def get_db():
    conn_str = os.getenv("DATABASE_URL")
    return psycopg.connect(conn_str, row_factory=dict_row)

def build_filter_clause(filters: Dict[str, Any], caller_context: Dict[str, Any]) -> tuple:
    clauses = []
    params = []

    # RBAC constraints
    allowed_visibility = caller_context.get("allowed_visibility", ["public"])
    clauses.append("d.visibility = ANY(%s)")
    params.append(allowed_visibility)
    
    allowed_status = caller_context.get("allowed_status", ["approved"])
    clauses.append("d.status = ANY(%s)")
    params.append(allowed_status)

    if not filters:
        return " AND ".join(clauses), params

    if filters.get("types"):
        clauses.append("d.type = ANY(%s)")
        params.append(filters["types"])
    if filters.get("topics"):
        clauses.append("d.topics && %s")
        params.append(filters["topics"])
    if filters.get("year_from"):
        clauses.append("d.year >= %s")
        params.append(filters["year_from"])
    if filters.get("year_to"):
        clauses.append("d.year <= %s")
        params.append(filters["year_to"])
    if filters.get("organization_ids"):
        clauses.append("d.organization_id = ANY(%s)")
        params.append(filters["organization_ids"])
    # Note: region filtering requires a subquery or join, doing exists for simplicity
    if filters.get("region_ids"):
        clauses.append("EXISTS (SELECT 1 FROM document_regions dr WHERE dr.document_id = d.id AND dr.region_id = ANY(%s))")
        params.append(filters["region_ids"])

    return " AND ".join(clauses), params

def execute_search(query: str, filters: Dict[str, Any], mode: str, limit: int, caller_context: Dict[str, Any]) -> Dict[str, Any]:
    filter_sql, filter_params = build_filter_clause(filters, caller_context)
    
    results = {} # doc_id -> result_dict
    
    with get_db() as conn:
        with conn.cursor() as cur:
            # Semantic Search
            if mode in ("semantic", "hybrid"):
                emb = embed_text(query)
                emb_str = str(emb)
                
                # Fetch top chunks per document (using DISTINCT ON for simplicity, ranking by distance)
                # Lower cosine distance (<=>) is better
                sem_sql = f"""
                SELECT DISTINCT ON (d.id) 
                       d.id, d.title, d.abstract, d.type, d.year, d.visibility, d.status,
                       d.keywords, d.topics,
                       c.chunk_index, c.content as matched_chunk_text,
                       (c.embedding <=> %s::vector) as distance
                FROM document_chunks c
                JOIN documents d ON c.document_id = d.id
                WHERE {filter_sql}
                ORDER BY d.id, (c.embedding <=> %s::vector)
                """
                # But we want the top overall, so we wrap it
                sem_top_sql = f"""
                SELECT * FROM ({sem_sql}) sub
                ORDER BY distance ASC
                LIMIT 100
                """
                sem_params = [emb_str] + filter_params + [emb_str]
                cur.execute(sem_top_sql, sem_params)
                sem_rows = cur.fetchall()
                
                for rank, r in enumerate(sem_rows):
                    results[r['id']] = {
                        "document": {
                            "id": str(r['id']), "title": r['title'], "abstract": r['abstract'],
                            "type": r['type'], "year": r['year'], "keywords": r['keywords'], "topics": r['topics']
                        },
                        "matched_chunk": {"text": r['matched_chunk_text'], "chunk_index": r['chunk_index']},
                        "semantic_rank": rank + 1,
                        "distance": r['distance'],
                        "keyword_rank": 1000 # default
                    }

            # Keyword Search
            if mode in ("keyword", "hybrid"):
                kw_sql = f"""
                SELECT d.id, d.title, d.abstract, d.type, d.year, d.visibility, d.status,
                       d.keywords, d.topics,
                       ts_rank_cd(to_tsvector('english', d.title || ' ' || coalesce(d.abstract, '')), plainto_tsquery('english', %s)) + 
                       similarity(d.title, %s) as score
                FROM documents d
                WHERE {filter_sql}
                  AND (to_tsvector('english', d.title || ' ' || coalesce(d.abstract, '')) @@ plainto_tsquery('english', %s)
                       OR d.title %% %s)
                ORDER BY score DESC
                LIMIT 100
                """
                kw_params = [query, query] + filter_params + [query, query]
                cur.execute(kw_sql, kw_params)
                kw_rows = cur.fetchall()
                
                for rank, r in enumerate(kw_rows):
                    if r['id'] in results:
                        results[r['id']]["keyword_rank"] = rank + 1
                    else:
                        results[r['id']] = {
                            "document": {
                                "id": str(r['id']), "title": r['title'], "abstract": r['abstract'],
                                "type": r['type'], "year": r['year'], "keywords": r['keywords'], "topics": r['topics']
                            },
                            "matched_chunk": {"text": r['abstract'] or r['title'], "chunk_index": -1}, # Fake chunk from metadata
                            "semantic_rank": 1000,
                            "keyword_rank": rank + 1,
                            "distance": 1.0 # placeholder
                        }
            
            # Reciprocal Rank Fusion & Rerank
            # RRF score = 1 / (60 + semantic_rank) + 1 / (60 + keyword_rank)
            final_list = []
            for doc_id, res in results.items():
                if mode == "hybrid":
                    score = 1.0 / (60 + res["semantic_rank"]) + 1.0 / (60 + res["keyword_rank"])
                elif mode == "semantic":
                    score = 1.0 / (60 + res["semantic_rank"])
                else:
                    score = 1.0 / (60 + res["keyword_rank"])
                
                # Light boost for exact title hit (if word in title)
                if query.lower() in res["document"]["title"].lower():
                    score *= 1.2
                
                # Light boost for recency
                year = res["document"]["year"]
                if year and year >= 2020:
                    score *= 1.05
                    
                res["score"] = score
                
                # why_matched
                why = []
                if res["semantic_rank"] < 1000:
                    why.append("Semantically related chunk found.")
                if res["keyword_rank"] < 1000:
                    why.append("Keyword matches in title/abstract.")
                res["why_matched"] = " ".join(why)
                
                final_list.append(res)
                
            final_list.sort(key=lambda x: x["score"], reverse=True)
            final_list = final_list[:limit]
            
            # Compute facets (naive approach on final list)
            facets = {"type": {}, "year": {}, "topic": {}}
            for item in final_list:
                dt = item["document"]["type"]
                facets["type"][dt] = facets["type"].get(dt, 0) + 1
                dy = str(item["document"]["year"] or "Unknown")
                facets["year"][dy] = facets["year"].get(dy, 0) + 1
                for t in (item["document"]["topics"] or []):
                    facets["topic"][t] = facets["topic"].get(t, 0) + 1
            
            # Simple query understanding
            detected_topics = [t for t in ["agriculture", "urban", "climate", "policy", "land"] if t in query.lower()]
            
            return {
                "results": final_list,
                "facets": facets,
                "query_understanding": {
                    "topics": detected_topics
                }
            }
