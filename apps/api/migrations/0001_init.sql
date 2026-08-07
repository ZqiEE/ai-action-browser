PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS providers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT NOT NULL UNIQUE,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS offers (
  id TEXT PRIMARY KEY,
  provider_id TEXT NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price REAL NOT NULL,
  currency TEXT NOT NULL,
  availability TEXT NOT NULL,
  delivery_text TEXT NOT NULL,
  returns_text TEXT NOT NULL,
  warranty_text TEXT NOT NULL,
  prepare_url TEXT NOT NULL,
  source_url TEXT NOT NULL,
  evidence_json TEXT NOT NULL DEFAULT '{}',
  retrieved_at TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (provider_id) REFERENCES providers(id)
);

CREATE INDEX IF NOT EXISTS offers_category_active_idx
  ON offers(category, active, price);

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  mode TEXT NOT NULL,
  query TEXT NOT NULL,
  category TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS outcomes (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL,
  offer_id TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  attribution_token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL,
  amount REAL NOT NULL,
  currency TEXT NOT NULL,
  user_confirmed INTEGER NOT NULL DEFAULT 0,
  handoff_url TEXT NOT NULL,
  completion_evidence TEXT,
  reversal_deadline TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (task_id) REFERENCES tasks(id),
  FOREIGN KEY (offer_id) REFERENCES offers(id),
  FOREIGN KEY (provider_id) REFERENCES providers(id)
);

CREATE INDEX IF NOT EXISTS outcomes_attribution_idx
  ON outcomes(attribution_token);

CREATE TABLE IF NOT EXISTS outcome_events (
  id TEXT PRIMARY KEY,
  outcome_id TEXT NOT NULL,
  provider_event_id TEXT,
  status TEXT NOT NULL,
  evidence_json TEXT NOT NULL DEFAULT '{}',
  occurred_at TEXT NOT NULL,
  received_at TEXT NOT NULL,
  FOREIGN KEY (outcome_id) REFERENCES outcomes(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS outcome_events_provider_event_idx
  ON outcome_events(provider_event_id)
  WHERE provider_event_id IS NOT NULL;
