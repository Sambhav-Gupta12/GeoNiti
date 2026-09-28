-- Migration 004: Documents and chunks
-- EMBEDDING_DIM is substituted by the migration runner from env

CREATE TABLE IF NOT EXISTS documents (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type             TEXT NOT NULL CHECK (type IN ('research_paper','policy','legal','case_study','report')),
  title            TEXT NOT NULL,
  abstract         TEXT,
  authors          TEXT[],
  organization_id  UUID REFERENCES organizations(id),
  year             SMALLINT,
  source_url       TEXT,
  file_path        TEXT,
  language         TEXT NOT NULL DEFAULT 'en',
  keywords         TEXT[],
  topics           TEXT[],
  status           TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','pending_review','approved','rejected')),
  visibility       TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public','internal','restricted')),
  is_illustrative  BOOLEAN NOT NULL DEFAULT FALSE,
  provenance_note  TEXT,
  approved_by      UUID REFERENCES users(id),
  approved_at      TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documents_status     ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_visibility ON documents(visibility);
CREATE INDEX IF NOT EXISTS idx_documents_type       ON documents(type);
CREATE INDEX IF NOT EXISTS idx_documents_year       ON documents(year);
CREATE INDEX IF NOT EXISTS idx_documents_org        ON documents(organization_id);
CREATE INDEX IF NOT EXISTS idx_documents_keywords   ON documents USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_documents_topics     ON documents USING GIN(topics);
CREATE INDEX IF NOT EXISTS idx_documents_title_trgm ON documents USING GIN(title gin_trgm_ops);

-- Junction: document <-> region
CREATE TABLE IF NOT EXISTS document_regions (
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  region_id   UUID NOT NULL REFERENCES regions(id)   ON DELETE CASCADE,
  PRIMARY KEY (document_id, region_id)
);

-- Document chunks for RAG (embedding dim substituted at runtime)
CREATE TABLE IF NOT EXISTS document_chunks (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id  UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  chunk_index  INT  NOT NULL,
  content      TEXT NOT NULL,
  token_count  INT,
  embedding    vector(384),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (document_id, chunk_index)
);

-- HNSW index for cosine similarity search
CREATE INDEX IF NOT EXISTS idx_chunks_embedding ON document_chunks
  USING hnsw(embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS idx_chunks_document ON document_chunks(document_id);

-- View: approved public documents (ALL search/RAG must query this)
CREATE OR REPLACE VIEW v_public_documents AS
  SELECT * FROM documents
  WHERE status = 'approved' AND visibility = 'public';
