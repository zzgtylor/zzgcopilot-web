import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

test('homepage retains the existing visual shell while reading navigation from Sanity', () => {
  const home = read('src/app/page.tsx')
  assert.match(home, /Tyler博客/)
  assert.match(home, /getSanityNavigation/)
  assert.match(home, /bg-\[#f8f9fa\]/)
})

test('all public content routes use Sanity-only readers', () => {
  assert.match(read('src/app/tutorials/[slug]/page.tsx'), /getSanityPost/)
  assert.match(read('src/app/pages/[slug]/page.tsx'), /getSanityPage/)
  assert.match(read('src/app/api/posts/route.ts'), /getSanityPublishedPosts/)
  assert.match(read('src/app/api/sitemap/route.ts'), /getSanitySitemapEntries/)
  assert.doesNotMatch(read('src/lib/sanity-content.ts'), /view_count|comments_enabled|getDb|getR2/)
})

test('legacy admin and account entry points are retired in favor of Sanity Studio', () => {
  const middleware = read('src/middleware.ts')
  assert.match(middleware, /SANITY_STUDIO_URL/)
  assert.match(middleware, /pathname\.startsWith\('\/admin'\)/)
  assert.match(middleware, /pathname === '\/login'/)
  assert.match(middleware, /pathname\.startsWith\('\/api\/admin'\)/)
  assert.match(middleware, /status: 410/)
  assert.doesNotMatch(middleware, /pathname\.startsWith\('\/uploads'\)/)
})

test('Sanity schemas own posts, settings, and image assets', () => {
  const post = read('sanity-studio/schemaTypes/postType.ts')
  const settings = read('sanity-studio/schemaTypes/siteSettingsType.ts')
  assert.match(post, /name: 'coverImage'/)
  assert.match(post, /type: 'image'/)
  assert.match(settings, /name: 'defaultCoverImage'/)
  assert.match(settings, /type: 'image'/)
})

test('recovery backups include published Sanity documents and image binaries', () => {
  const backup = read('scripts/backup-cloudflare.sh')
  assert.match(backup, /export-sanity-content\.mjs/)
  assert.match(backup, /backup-sanity-assets\.mjs/)
  assert.match(read('scripts/backup-sanity-assets.mjs'), /cdn\.sanity\.io/)
})
