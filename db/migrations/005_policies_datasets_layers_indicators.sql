-- Migration 005: Policies, Datasets, GeoLayers, Indicators

-- Policies
CREATE TABLE IF NOT EXISTS policies (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL,
  description       TEXT,
  level             TEXT NOT NULL CHECK (level IN ('national','state','district')),
  start_year        SMALLINT,
  end_year          SMALLINT,
  status            TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','repealed','draft')),
  region_id         UUID REFERENCES regions(id),
  source_document_id UUID REFERENCES documents(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_policies_region   ON policies(region_id);
CREATE INDEX IF NOT EXISTS idx_policies_status   ON policies(status);

-- Datasets
CREATE TABLE IF NOT EXISTS datasets (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title              TEXT NOT NULL,
  description        TEXT,
  organization_id    UUID REFERENCES organizations(id),
  coverage_region_id UUID REFERENCES regions(id),
  time_start         DATE,
  time_end           DATE,
  update_frequency   TEXT,
  license            TEXT,
  visibility         TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public','internal','restricted')),
  status             TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','pending_review','approved','rejected')),
  is_illustrative    BOOLEAN NOT NULL DEFAULT FALSE,
  provenance_note    TEXT,
  current_version_id UUID,   -- FK added after dataset_versions table
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_datasets_status  ON datasets(status);
CREATE INDEX IF NOT EXISTS idx_datasets_org     ON datasets(organization_id);
CREATE INDEX IF NOT EXISTS idx_datasets_region  ON datasets(coverage_region_id);

CREATE TABLE IF NOT EXISTS dataset_versions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id  UUID NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
  version     TEXT NOT NULL,
  file_path   TEXT,
  checksum    TEXT,
  row_count   BIGINT,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (dataset_id, version)
);

CREATE INDEX IF NOT EXISTS idx_dataset_versions_dataset ON dataset_versions(dataset_id);

ALTER TABLE datasets
  ADD CONSTRAINT fk_datasets_current_version
  FOREIGN KEY (current_version_id) REFERENCES dataset_versions(id)
  DEFERRABLE INITIALLY DEFERRED;

-- GeoLayers
CREATE TABLE IF NOT EXISTS geo_layers (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key              TEXT NOT NULL UNIQUE,
  name             TEXT NOT NULL,
  category         TEXT NOT NULL CHECK (category IN ('land_use','infrastructure','climate','socio_economic','disputes')),
  source           TEXT,
  resolution_note  TEXT,
  is_illustrative  BOOLEAN NOT NULL DEFAULT FALSE,
  style            JSONB,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indicators
CREATE TABLE IF NOT EXISTS indicators (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key               TEXT NOT NULL UNIQUE,
  name              TEXT NOT NULL,
  unit              TEXT,
  category          TEXT,
  description       TEXT,
  higher_is_better  BOOLEAN,
  source_dataset_id UUID REFERENCES datasets(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS indicator_values (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region_id    UUID NOT NULL REFERENCES regions(id),
  indicator_id UUID NOT NULL REFERENCES indicators(id),
  year         SMALLINT NOT NULL,
  value        NUMERIC(18,4),
  UNIQUE (region_id, indicator_id, year)
);

CREATE INDEX IF NOT EXISTS idx_indicator_values_region    ON indicator_values(region_id);
CREATE INDEX IF NOT EXISTS idx_indicator_values_indicator ON indicator_values(indicator_id);
CREATE INDEX IF NOT EXISTS idx_indicator_values_year      ON indicator_values(year);
