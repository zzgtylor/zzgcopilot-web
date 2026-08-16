CREATE INDEX IF NOT EXISTS idx_analytics_events_visitor_created
  ON analytics_events(visitor_hash, created_at);
