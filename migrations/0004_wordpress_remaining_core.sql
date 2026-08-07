ALTER TABLE posts ADD COLUMN comments_enabled INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS pages (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  excerpt TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'published', 'archived')),
  author_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  meta_title TEXT,
  meta_description TEXT,
  published_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS navigation_items (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  label TEXT NOT NULL,
  href TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible INTEGER NOT NULL DEFAULT 1,
  open_new_tab INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS content_templates (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_pages_status ON pages(status, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_navigation_order ON navigation_items(sort_order);
CREATE INDEX IF NOT EXISTS idx_content_templates_updated ON content_templates(updated_at DESC);

INSERT INTO navigation_items (label, href, sort_order, is_visible) SELECT '首页', '/', 0, 1
WHERE NOT EXISTS (SELECT 1 FROM navigation_items);
INSERT INTO navigation_items (label, href, sort_order, is_visible) SELECT '免费资源', '__latest_tutorial__', 1, 1
WHERE (SELECT COUNT(*) FROM navigation_items) = 1;
INSERT INTO navigation_items (label, href, sort_order, is_visible) SELECT '教程', '__latest_tutorial__', 2, 1
WHERE (SELECT COUNT(*) FROM navigation_items) = 2;
INSERT INTO navigation_items (label, href, sort_order, is_visible) SELECT '模板下载', '__latest_tutorial__', 3, 1
WHERE (SELECT COUNT(*) FROM navigation_items) = 3;
INSERT INTO navigation_items (label, href, sort_order, is_visible) SELECT '关于我们', '__latest_tutorial__', 4, 1
WHERE (SELECT COUNT(*) FROM navigation_items) = 4;

INSERT OR IGNORE INTO site_settings (key, value) VALUES
  ('commentsDefault', 'false'),
  ('commentsRequireApproval', 'true');
