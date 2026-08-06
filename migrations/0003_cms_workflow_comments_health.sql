-- WordPress-like roles, editorial review workflow, and comment moderation metadata.
ALTER TABLE users ADD COLUMN role_key TEXT NOT NULL DEFAULT '';
ALTER TABLE posts ADD COLUMN review_status TEXT NOT NULL DEFAULT 'none';
ALTER TABLE posts ADD COLUMN review_note TEXT NOT NULL DEFAULT '';
ALTER TABLE comments ADD COLUMN moderation_note TEXT NOT NULL DEFAULT '';

UPDATE users SET role_key = role WHERE role_key = '';

CREATE INDEX IF NOT EXISTS idx_users_role_key ON users(role_key, is_active);
CREATE INDEX IF NOT EXISTS idx_posts_review ON posts(review_status, updated_at);
CREATE INDEX IF NOT EXISTS idx_posts_author_status ON posts(author_id, status, updated_at);
CREATE INDEX IF NOT EXISTS idx_comments_moderation ON comments(is_approved, created_at);
