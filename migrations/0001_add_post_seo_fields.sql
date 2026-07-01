-- Migration: add per-post SEO fields
-- Applied directly to production via Cloudflare D1 MCP on 2026-06-30.
-- Kept here so other environments / fresh clones can reach the same schema:
-- wrangler d1 execute zzgcopilot-db --file=migrations/0001_add_post_seo_fields.sql

ALTER TABLE posts ADD COLUMN meta_title TEXT;
ALTER TABLE posts ADD COLUMN meta_description TEXT;
ALTER TABLE posts ADD COLUMN og_image TEXT;
