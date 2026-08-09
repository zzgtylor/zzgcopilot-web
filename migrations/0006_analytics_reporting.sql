CREATE TABLE IF NOT EXISTS analytics_daily_visitors (
  event_date TEXT NOT NULL,
  path TEXT NOT NULL,
  visitor_hash TEXT NOT NULL,
  PRIMARY KEY(event_date, path, visitor_hash)
);

CREATE TABLE IF NOT EXISTS analytics_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_date TEXT NOT NULL DEFAULT (date('now')),
  event_type TEXT NOT NULL,
  path TEXT NOT NULL DEFAULT '/',
  label TEXT,
  visitor_hash TEXT,
  referrer_host TEXT,
  country TEXT,
  device TEXT,
  value_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_date_type ON analytics_events(event_date, event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_date_path ON analytics_events(event_date, path);
CREATE INDEX IF NOT EXISTS idx_analytics_events_referrer ON analytics_events(event_date, referrer_host);
CREATE INDEX IF NOT EXISTS idx_analytics_events_country ON analytics_events(event_date, country);
CREATE INDEX IF NOT EXISTS idx_analytics_visitors_date ON analytics_daily_visitors(event_date, visitor_hash);

PRAGMA optimize;
