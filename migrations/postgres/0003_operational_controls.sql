CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  actor_email TEXT,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS comment_reports (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  comment_id TEXT NOT NULL REFERENCES public_comments(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  reporter_ip_hash TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  resolved_by TEXT
);

CREATE TABLE IF NOT EXISTS email_send_events (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email_hash TEXT NOT NULL,
  ip_hash TEXT NOT NULL,
  kind TEXT NOT NULL,
  status TEXT NOT NULL,
  provider_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS backup_runs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  kind TEXT NOT NULL,
  status TEXT NOT NULL,
  object_path TEXT,
  checksum TEXT,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comment_reports_queue ON comment_reports(status, created_at);
CREATE INDEX IF NOT EXISTS idx_email_send_events_limits ON email_send_events(kind, email_hash, ip_hash, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_backup_runs_status ON backup_runs(kind, status, created_at DESC);
