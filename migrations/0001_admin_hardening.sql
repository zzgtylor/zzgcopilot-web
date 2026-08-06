-- Security, media recovery, and operational status additions.
CREATE TABLE IF NOT EXISTS auth_attempts (
  key TEXT PRIMARY KEY,
  failed_count INTEGER NOT NULL DEFAULT 0,
  first_failed_at TEXT NOT NULL DEFAULT (datetime('now')),
  locked_until TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

ALTER TABLE media ADD COLUMN deleted_at TEXT;
ALTER TABLE media ADD COLUMN source_url TEXT;

CREATE TABLE IF NOT EXISTS system_events (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  event_type TEXT NOT NULL,
  status TEXT NOT NULL,
  details TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS post_daily_views (
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  view_date TEXT NOT NULL,
  views INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (post_id, view_date)
);

CREATE INDEX IF NOT EXISTS idx_media_deleted ON media(deleted_at);
CREATE INDEX IF NOT EXISTS idx_system_events_type_created ON system_events(event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_daily_views_date ON post_daily_views(view_date);
