-- ZZGCopilot Database Schema for Cloudflare D1
-- Run: wrangler d1 execute zzgcopilot-db --file=schema.sql

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  email_verified INTEGER DEFAULT 0,
  password_hash TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('user', 'admin', 'editor')),
  is_active INTEGER DEFAULT 1,
  bio TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Tutorial categories
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Tutorials/Articles
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image TEXT,
  author_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'published', 'archived')),
  is_featured INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  reading_time INTEGER DEFAULT 0,
  tags TEXT DEFAULT '[]',
  published_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Comments
CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_id TEXT REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_approved INTEGER DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Bookmarks / Favorites
CREATE TABLE IF NOT EXISTS bookmarks (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, post_id)
);

-- Likes
CREATE TABLE IF NOT EXISTS likes (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, post_id)
);

-- Media files (stored in R2, metadata in D1)
CREATE TABLE IF NOT EXISTS media (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  r2_key TEXT NOT NULL UNIQUE,
  mime_type TEXT NOT NULL,
  size INTEGER NOT NULL,
  width INTEGER,
  height INTEGER,
  uploaded_by TEXT NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Site copy and safe UI controls for non-technical editors
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category_id);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_author ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_post ON bookmarks(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_post ON likes(post_id);

-- Seed admin user (password: Admin@123456 - change in production!)
INSERT OR IGNORE INTO users (id, name, email, password_hash, role) 
VALUES (
  'admin-user-001',
  'Admin',
  'admin@zzgcopilot.com',
  'pbkdf2:100000:e80f0c266ff2c78b950252edeb44cd1e:5ebad26386b846da73245270eafe49eceacb61bcbfe17692cede4c3771fc44fe',
  'admin'
);

-- Seed default categories
INSERT OR IGNORE INTO categories (name, slug, description, sort_order) VALUES
  ('入门教程', 'getting-started', '适合初学者的基础教程', 1),
  ('进阶技巧', 'advanced', '深入讲解的进阶内容', 2),
  ('实战项目', 'projects', '真实项目案例分析', 3),
  ('工具推荐', 'tools', '开发工具和资源推荐', 4);

-- Default editable site settings
INSERT OR IGNORE INTO site_settings (key, value) VALUES
  ('siteName', 'ZZGCopilot'),
  ('navTutorialsLabel', '教程'),
  ('navLoginLabel', '登录'),
  ('navRegisterLabel', '注册'),
  ('heroTitle', '学习编程，从这里开始'),
  ('heroSubtitle', '高质量的编程教程、技术文章和实用指南'),
  ('primaryCtaLabel', '浏览教程'),
  ('primaryCtaHref', '/tutorials'),
  ('secondaryCtaLabel', '免费注册'),
  ('secondaryCtaHref', '/register'),
  ('latestTitle', '最新教程'),
  ('emptyTitle', '暂无教程'),
  ('emptyActionLabel', '管理员发布第一篇文章'),
  ('footerText', 'ZZGCopilot. 保留所有权利。'),
  ('themeColor', '#2563eb'),
  ('heroTone', 'blue'),
  ('showRegisterCta', 'true'),
  ('showLatestTutorials', 'true');
