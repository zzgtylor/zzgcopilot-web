import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

test('admin content APIs require an admin/editor role', () => {
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
  assert.match(read('src/app/api/admin/content-transfer/route.ts'), /requireAdminRole\(\)/)
})
