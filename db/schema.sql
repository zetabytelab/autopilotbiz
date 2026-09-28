-- Autopilot Index canonical data layer.
-- This schema is additive: the checked-in JSON feed remains the read source
-- until the shadow comparison proves database reads equivalent.

CREATE TABLE IF NOT EXISTS autopilot_migration_run (
  id TEXT PRIMARY KEY,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  status TEXT NOT NULL CHECK (status IN ('running', 'completed', 'failed')),
  manifest JSONB NOT NULL DEFAULT '{}'::jsonb,
  error TEXT
);

CREATE TABLE IF NOT EXISTS autopilot_snapshot (
  dataset TEXT NOT NULL,
  content_sha256 TEXT NOT NULL,
  generated_at TIMESTAMPTZ,
  payload JSONB NOT NULL,
  imported_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (dataset, content_sha256)
);

CREATE TABLE IF NOT EXISTS autopilot_source (
  source_key TEXT PRIMARY KEY,
  name TEXT,
  url TEXT NOT NULL UNIQUE,
  domain TEXT,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS autopilot_company (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT false,
  cohort TEXT,
  section TEXT,
  payload JSONB NOT NULL,
  imported_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS autopilot_stack_tool (
  name TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  payload JSONB NOT NULL,
  imported_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS autopilot_metric_observation (
  id TEXT PRIMARY KEY,
  company_slug TEXT NOT NULL REFERENCES autopilot_company(slug) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  value NUMERIC,
  currency TEXT,
  precision TEXT,
  display TEXT NOT NULL,
  as_of DATE,
  period_start DATE,
  period_end DATE,
  scope TEXT,
  population TEXT,
  status TEXT NOT NULL,
  source_key TEXT REFERENCES autopilot_source(source_key),
  published_at TIMESTAMPTZ,
  recorded_at TIMESTAMPTZ,
  checked_at TIMESTAMPTZ,
  supersedes TEXT,
  notes TEXT NOT NULL DEFAULT '',
  payload JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS autopilot_pulse_item (
  id TEXT PRIMARY KEY,
  company_slug TEXT,
  published_at TIMESTAMPTZ,
  domain TEXT,
  track TEXT,
  payload JSONB NOT NULL,
  imported_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS autopilot_pulse_item_source (
  pulse_item_id TEXT NOT NULL REFERENCES autopilot_pulse_item(id) ON DELETE CASCADE,
  source_key TEXT REFERENCES autopilot_source(source_key),
  url TEXT NOT NULL,
  points INTEGER,
  comments INTEGER,
  PRIMARY KEY (pulse_item_id, url)
);

CREATE TABLE IF NOT EXISTS autopilot_candidate (
  id TEXT PRIMARY KEY,
  name TEXT,
  status TEXT NOT NULL,
  first_seen_at TIMESTAMPTZ,
  score NUMERIC,
  payload JSONB NOT NULL,
  imported_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS autopilot_edition (
  slug TEXT PRIMARY KEY,
  number INTEGER NOT NULL UNIQUE,
  date DATE NOT NULL,
  title TEXT NOT NULL,
  payload JSONB NOT NULL,
  imported_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS autopilot_metric_company_kind_idx
  ON autopilot_metric_observation (company_slug, kind, as_of DESC);
CREATE INDEX IF NOT EXISTS autopilot_pulse_published_idx
  ON autopilot_pulse_item (published_at DESC);
CREATE INDEX IF NOT EXISTS autopilot_candidate_status_idx
  ON autopilot_candidate (status, score DESC);
