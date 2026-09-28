-- Migration 010: Extracted metadata and average embeddings

ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS extracted_metadata JSONB,
ADD COLUMN IF NOT EXISTS average_embedding vector(384);

-- We might also need an index on the average_embedding for recommendations
CREATE INDEX IF NOT EXISTS idx_documents_avg_embedding 
ON documents USING hnsw (average_embedding vector_cosine_ops);
