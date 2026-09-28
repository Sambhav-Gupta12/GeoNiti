import logging
from typing import List, Dict, Any
from app.db import get_db_pool

logger = logging.getLogger(__name__)

def get_recommendations(entity_type: str, entity_id: str, limit: int, caller_context: Dict[str, Any]) -> List[Dict[str, Any]]:
    pool = get_db_pool()
    allowed_vis = caller_context["allowed_visibility"]
    allowed_status = caller_context["allowed_status"]
    
    vis_in = "'" + "','".join(allowed_vis) + "'" if allowed_vis else "'public'"
    status_in = "'" + "','".join(allowed_status) + "'" if allowed_status else "'approved'"

    recommendations = []
    
    with pool as conn:
        with conn.cursor() as cur:
            if entity_type == "document":
                # Ensure the target document's average_embedding is cached
                cur.execute("SELECT id, topics, average_embedding FROM documents WHERE id = %s", (entity_id,))
                doc = cur.fetchone()
                if not doc:
                    return []
                
                target_topics = doc[1] or []
                
                if doc[2] is None:
                    # Compute and cache average embedding
                    cur.execute("""
                        UPDATE documents 
                        SET average_embedding = (
                            SELECT AVG(embedding)::vector(384) 
                            FROM document_chunks 
                            WHERE document_id = %s
                        )
                        WHERE id = %s
                        RETURNING average_embedding
                    """, (entity_id, entity_id))
                    res = cur.fetchone()
                    if res and res[0] is not None:
                        doc = (doc[0], doc[1], res[0])
                
                # Fetch recommendations based on cosine distance + shared topics
                query = f"""
                    WITH target AS (
                        SELECT id, topics, average_embedding FROM documents WHERE id = %s
                    )
                    SELECT 
                        d.id, d.title, d.type, d.topics, d.year,
                        (d.average_embedding <=> target.average_embedding) AS semantic_dist,
                        (
                            SELECT count(*) 
                            FROM unnest(d.topics) t 
                            WHERE t = ANY(target.topics)
                        ) AS shared_topics
                    FROM documents d, target
                    WHERE d.id != target.id
                      AND d.status IN ({status_in})
                      AND d.visibility IN ({vis_in})
                      AND d.average_embedding IS NOT NULL
                    ORDER BY 
                        (d.average_embedding <=> target.average_embedding) ASC, 
                        shared_topics DESC
                    LIMIT %s
                """
                cur.execute(query, (entity_id, limit))
                for row in cur.fetchall():
                    dist = float(row[5]) if row[5] is not None else 1.0
                    shared = row[6] or 0
                    
                    if dist < 0.3 and shared > 0:
                        reason = f"Highly semantically related and shares {shared} topics."
                    elif dist < 0.4:
                        reason = "Semantically similar."
                    elif shared > 0:
                        reason = f"Shares {shared} common topics."
                    else:
                        reason = "Related by context."
                        
                    recommendations.append({
                        "id": row[0],
                        "title": row[1],
                        "type": row[2],
                        "topics": row[3],
                        "year": row[4],
                        "reason": reason,
                        "entity_type": "document"
                    })
                    
            elif entity_type == "dataset":
                # For dataset, we recommend other datasets in same category or overlapping region
                query = f"""
                    WITH target AS (
                        SELECT id, category, coverage_region_id FROM datasets WHERE id = %s
                    )
                    SELECT 
                        d.id, d.title, d.category,
                        (d.category = target.category) AS same_cat,
                        (d.coverage_region_id = target.coverage_region_id) AS same_region
                    FROM datasets d, target
                    WHERE d.id != target.id
                      AND d.status IN ({status_in})
                      AND d.visibility IN ({vis_in})
                    ORDER BY same_cat DESC, same_region DESC
                    LIMIT %s
                """
                cur.execute(query, (entity_id, limit))
                for row in cur.fetchall():
                    reason = ""
                    if row[3] and row[4]:
                        reason = "Same category and coverage region."
                    elif row[3]:
                        reason = "Same dataset category."
                    elif row[4]:
                        reason = "Covers the same region."
                    else:
                        reason = "Suggested related dataset."
                        
                    recommendations.append({
                        "id": row[0],
                        "title": row[1],
                        "type": "dataset",
                        "category": row[2],
                        "reason": reason,
                        "entity_type": "dataset"
                    })
            elif entity_type == "region":
                # Recommend other regions that share the same parent or level
                query = f"""
                    WITH target AS (
                        SELECT id, parent_id, level FROM regions WHERE id = %s
                    )
                    SELECT 
                        r.id, r.name, r.level,
                        (r.parent_id = target.parent_id) AS sibling,
                        (r.level = target.level) AS same_level
                    FROM regions r, target
                    WHERE r.id != target.id
                    ORDER BY sibling DESC, same_level DESC
                    LIMIT %s
                """
                cur.execute(query, (entity_id, limit))
                for row in cur.fetchall():
                    reason = ""
                    if row[3]:
                        reason = "Neighboring region (same parent)."
                    elif row[4]:
                        reason = "Region at the same administrative level."
                    else:
                        reason = "Related region."
                        
                    recommendations.append({
                        "id": row[0],
                        "title": row[1],
                        "type": "region",
                        "level": row[2],
                        "reason": reason,
                        "entity_type": "region"
                    })
            
    return recommendations
