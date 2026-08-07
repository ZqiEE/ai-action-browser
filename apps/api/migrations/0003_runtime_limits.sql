CREATE TABLE IF NOT EXISTS request_rate_limits (
  bucket TEXT NOT NULL,
  client_hash TEXT NOT NULL,
  route_group TEXT NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 0,
  expires_at TEXT NOT NULL,
  PRIMARY KEY (bucket, client_hash, route_group)
);

CREATE INDEX IF NOT EXISTS request_rate_limits_expires_idx
  ON request_rate_limits(expires_at);
