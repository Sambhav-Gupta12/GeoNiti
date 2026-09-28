-- Migration 003: Regions (PostGIS)

CREATE TABLE IF NOT EXISTS regions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  level       TEXT NOT NULL CHECK (level IN ('country','state','district')),
  parent_id   UUID REFERENCES regions(id),
  geom        geometry(MultiPolygon, 4326),
  centroid    geometry(Point, 4326),
  population  BIGINT,
  area_km2    NUMERIC(12,2),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_regions_geom     ON regions USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_regions_centroid ON regions USING GIST(centroid);
CREATE INDEX IF NOT EXISTS idx_regions_parent   ON regions(parent_id);
CREATE INDEX IF NOT EXISTS idx_regions_level    ON regions(level);
