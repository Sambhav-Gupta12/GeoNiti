-- Migration 007: Scenario Sandbox

CREATE TABLE IF NOT EXISTS scenarios (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT NOT NULL,
  description         TEXT,
  region_id           UUID REFERENCES regions(id),
  target_indicator_id UUID REFERENCES indicators(id),
  parameters          JSONB,
  created_by          UUID NOT NULL REFERENCES users(id),
  project_id          UUID REFERENCES projects(id),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scenarios_region    ON scenarios(region_id);
CREATE INDEX IF NOT EXISTS idx_scenarios_user      ON scenarios(created_by);
CREATE INDEX IF NOT EXISTS idx_scenarios_project   ON scenarios(project_id);

CREATE TABLE IF NOT EXISTS scenario_runs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id  UUID NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES users(id),
  inputs       JSONB,
  baseline     JSONB,
  projection   JSONB,
  band         JSONB,           -- uncertainty band {lower, upper}
  metrics      JSONB,
  assumptions  JSONB,
  explanation  TEXT,
  model_card   JSONB,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scenario_runs_scenario ON scenario_runs(scenario_id);
CREATE INDEX IF NOT EXISTS idx_scenario_runs_user     ON scenario_runs(user_id);
