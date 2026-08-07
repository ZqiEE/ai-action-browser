ALTER TABLE providers
  ADD COLUMN credential_version INTEGER NOT NULL DEFAULT 1;

ALTER TABLE outcome_events
  ADD COLUMN provider_id TEXT;

UPDATE outcome_events
   SET provider_id = (
     SELECT outcomes.provider_id
       FROM outcomes
      WHERE outcomes.id = outcome_events.outcome_id
   )
 WHERE provider_id IS NULL;

DROP INDEX IF EXISTS outcome_events_provider_event_idx;

CREATE UNIQUE INDEX IF NOT EXISTS outcome_events_provider_event_idx
  ON outcome_events(provider_id, provider_event_id)
  WHERE provider_event_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS outcome_events_provider_idx
  ON outcome_events(provider_id, received_at);
