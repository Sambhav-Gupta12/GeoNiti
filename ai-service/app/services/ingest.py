import os
import hashlib
import logging
from typing import Dict, Any
import psycopg
from psycopg.rows import dict_row

from app.services.extract import extract_text
from app.services.chunk import chunk_text
from app.core.providers import embed_batch

logger = logging.getLogger(__name__)

def get_db():
    conn_str = os.getenv("DATABASE_URL")
    if not conn_str:
        raise ValueError("DATABASE_URL not set")
    return psycopg.connect(conn_str, row_factory=dict_row)

def ingest_document(document_id: str) -> Dict[str, Any]:
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT id, title, abstract, file_path, content_hash, status FROM documents WHERE id = %s", (document_id,))
            doc = cur.fetchone()
            if not doc:
                raise ValueError(f"Document {document_id} not found")
            
            if doc['status'] not in ('approved', 'restricted', 'internal'):
                logger.warning(f"Document {document_id} is {doc['status']}, skipping ingestion.")
                return {"status": "skipped", "reason": "not approved"}

            text_parts = [doc['title']]
            if doc['abstract']:
                text_parts.append(doc['abstract'])
            
            if doc['file_path']:
                try:
                    # In local dev, we run from monorepo root or assume path is relative to it
                    # The seed data puts files in db/seeds/files/...
                    # Ensure path resolution works
                    file_text = extract_text(doc['file_path'])
                    text_parts.append(file_text)
                except Exception as e:
                    logger.error(f"Failed to extract text from {doc['file_path']}: {e}")
            
            full_text = "\n\n".join(text_parts)
            
            content_hash = hashlib.sha256(full_text.encode('utf-8')).hexdigest()
            if doc['content_hash'] == content_hash:
                logger.info(f"Document {document_id} content unchanged, skipping.")
                return {"status": "skipped", "reason": "hash_match"}

            chunks = chunk_text(full_text)
            
            batch_size = 100
            inserted_chunks = 0
            
            cur.execute("DELETE FROM document_chunks WHERE document_id = %s", (document_id,))
            
            for i in range(0, len(chunks), batch_size):
                batch = chunks[i:i+batch_size]
                texts = [c['content'] for c in batch]
                embeddings = embed_batch(texts)
                
                for c, emb in zip(batch, embeddings):
                    cur.execute("""
                        INSERT INTO document_chunks(document_id, chunk_index, content, token_count, embedding)
                        VALUES(%s, %s, %s, %s, %s)
                    """, (document_id, c['chunk_index'], c['content'], c['token_count'], str(emb)))
                    inserted_chunks += 1
            
            cur.execute("UPDATE documents SET content_hash = %s WHERE id = %s", (content_hash, document_id))
            conn.commit()
            
            logger.info(f"Ingested {document_id}: {inserted_chunks} chunks.")
            return {"status": "success", "chunks": inserted_chunks}

def ingest_all() -> Dict[str, Any]:
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT id FROM documents WHERE status = 'approved'")
            docs = cur.fetchall()
            
    results = []
    total_chunks = 0
    for d in docs:
        try:
            res = ingest_document(str(d['id']))
            if res['status'] == 'success':
                total_chunks += res.get('chunks', 0)
            results.append({"id": str(d['id']), **res})
        except Exception as e:
            logger.error(f"Failed to ingest {d['id']}: {e}")
            results.append({"id": str(d['id']), "status": "error", "error": str(e)})
            
    return {"total_documents": len(docs), "total_chunks": total_chunks, "results": results}
