import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

test('admin content APIs require an authenticated CMS role', () => {
  for (const route of ['src/app/api/admin/posts/route.ts', 'src/app/api/upload/route.ts']) {
    assert.match(read(route), /requireAdminRole\(\)/)
  }
})

test('user management is restricted to administrators', () => {
  assert.match(read('src/app/api/admin/users/route.ts'), /requireAdminRole\(\['admin'\]\)/)
})

test('public registration is closed unless explicitly enabled', () => {
  assert.match(read('src/app/api/register/route.ts'), /PUBLIC_REGISTRATION_ENABLED !== 'true'/)
})

test('schema contains no seeded administrator credentials', () => {
  const schema = read('schema.sql')
  assert.doesNotMatch(schema, /Seed admin user/i)
  assert.doesNotMatch(schema, /INSERT OR IGNORE INTO users/)
})

test('unsafe SVG uploads and insecure random fallbacks are not accepted', () => {
  const upload = read('src/app/api/upload/route.ts')
  assert.doesNotMatch(upload, /image\/svg\+xml/)
  assert.doesNotMatch(upload, /Math\.random/)
  assert.match(upload, /detectedMime/)
})

test('scheduled publishing has an independent cron worker', () => {
  const config = read('wrangler.publisher.jsonc')
  const worker = read('workers/publisher/index.ts')
  assert.match(config, /"crons": \["\* \* \* \* \*"\]/)
  assert.match(worker, /async scheduled/)
})

test('security center and audit log require authenticated admin access', () => {
  assert.match(read('src/app/api/admin/security/route.ts'), /requireAdminRole\(\)/)
  assert.match(read('src/app/api/admin/audit/route.ts'), /requireAdminRole\(\['admin'\]\)/)
  assert.match(read('src/lib/totp.ts'), /crypto\.getRandomValues/)
  assert.doesNotMatch(read('src/lib/totp.ts'), /Math\.random/)
})

test('media library supports checksums, pagination, and duplicate detection', () => {
  const upload = read('src/app/api/upload/route.ts')
  assert.match(upload, /checksum/)
  assert.match(upload, /pageSize/)
  assert.match(upload, /duplicates/)
  assert.match(read('migrations/0002_editor_security_audit_media.sql'), /CREATE TABLE IF NOT EXISTS audit_logs/)
})

test('article editor uses structured blocks and content transfer stays private', () => {
  assert.match(read('src/components/admin/PostEditor.tsx'), /StructuredEditor/)
  assert.doesNotMatch(read('src/components/admin/PostEditor.tsx'), /execCommand/)
  assert.match(read('src/app/api/admin/content-transfer/route.ts'), /requireAdminRole\(\['admin', 'editor'\]\)/)
})

test('editorial workflow enforces ownership and review capabilities', () => {
  const auth = read('src/lib/admin-auth.ts')
  const posts = read('src/app/api/admin/posts/route.ts')
  assert.match(auth, /'author' \| 'contributor'/)
  assert.match(posts, /review_status/)
  assert.match(posts, /只能编辑自己的文章/)
  assert.match(posts, /只有管理员或编辑可以审核文章/)
})

test('comments and site health have restricted admin APIs', () => {
  assert.match(read('src/app/api/admin/comments/route.ts'), /requireAdminRole\(\['admin', 'editor'\]\)/)
  assert.match(read('src/app/api/admin/site-health/route.ts'), /requireAdminRole\(\['admin', 'editor'\]\)/)
})

test('remaining WordPress-style core content tools are authenticated and persisted', () => {
  const cms = read('src/app/api/admin/cms/route.ts')
  const migration = read('migrations/0004_wordpress_remaining_core.sql')
  assert.match(cms, /requireAdminRole\(\['admin', 'editor'\]\)/)
  assert.match(cms, /D1PreparedStatement/)
  assert.match(migration, /CREATE TABLE IF NOT EXISTS pages/)
  assert.match(migration, /CREATE TABLE IF NOT EXISTS navigation_items/)
  assert.match(migration, /CREATE TABLE IF NOT EXISTS content_templates/)
  assert.match(read('src/app/api/admin/profile/route.ts'), /requireAdminRole\(\)/)
  assert.match(read('src/app/api/admin/posts/route.ts'), /post\.duplicate/)
  assert.match(read('src/app/api/admin/posts/route.ts'), /delete_permanent/)
})

test('homepage keeps its established design while navigation is served by Sanity', () => {
  const home = read('src/app/page.tsx')
  assert.match(home, /Tyler博客/)
  assert.match(home, /getSanityNavigation/)
  assert.match(home, /__latest_tutorial__/)
  assert.match(home, /bg-\[#f8f9fa\]/)
})

test('public content routes use Sanity and the retired Cloudflare admin redirects to Studio', () => {
  assert.match(read('src/app/tutorials/[slug]/page.tsx'), /getSanityPost/)
  assert.match(read('src/app/pages/[slug]/page.tsx'), /getSanityPage/)
  assert.match(read('src/app/api/posts/route.ts'), /getSanityPublishedPosts/)
  assert.match(read('src/app/api/sitemap/route.ts'), /getSanitySitemapEntries/)
  const middleware = read('src/middleware.ts')
  assert.match(middleware, /SANITY_STUDIO_URL/)
  assert.match(middleware, /pathname\.startsWith\('\/api\/admin'\)/)
})

test('public article and independent page routes are not rewritten to the homepage', () => {
  const middleware = read('src/middleware.ts')
  assert.match(middleware, /pathname\.startsWith\('\/tutorials\/'\)/)
  assert.match(middleware, /pathname\.startsWith\('\/pages\/'\)/)
})
