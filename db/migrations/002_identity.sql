-- Migration 002: Core identity tables
-- Idempotent via CREATE TABLE IF NOT EXISTS

-- Organizations
CREATE TABLE IF NOT EXISTS organizations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('ministry','state_dept','university','research_org','ngo','industry')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Roles
CREATE TABLE IF NOT EXISTS roles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed default roles (idempotent)
INSERT INTO roles (name, description) VALUES
  ('researcher',       'Accesses and contributes research content'),
  ('policy_analyst',   'Builds scenarios and policy analyses'),
  ('govt_official',    'Read-only view of approved data'),
  ('data_admin',       'Manages datasets and approvals'),
  ('system_admin',     'Full system access'),
  ('public',           'Unauthenticated or guest access')
ON CONFLICT (name) DO NOTHING;

-- Users
CREATE TABLE IF NOT EXISTS users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT NOT NULL UNIQUE,
  password_hash   TEXT NOT NULL,
  full_name       TEXT NOT NULL,
  role_id         UUID NOT NULL REFERENCES roles(id),
  organization_id UUID REFERENCES organizations(id),
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_organization_id ON users(organization_id);
