import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

test('homepage retains the existing visual shell while reading navigation from Sanity', () => {
  const home = read('src/app/page.tsx')
  assert.match(home, /getSanityNavigation/)
  assert.match(home, /getSanitySiteSettings/)
  assert.match(home, /bg-\[#f8f9fa\]/)
  assert.match(home, /settings\.homepageSectionTitle/)
  assert.match(home, /settings\.homepageCtaLabel/)
  assert.match(home, /getSanityPublishedPostCount/)
  assert.match(home, /name="q"/)
  assert.match(home, /pageHref/)
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
  assert.match(post, /portableTextField/)
  assert.match(post, /value: 'scheduled'/)
  assert.match(post, /name: 'editorialStage'/)
  assert.match(settings, /name: 'defaultCoverImage'/)
  assert.match(settings, /type: 'image'/)
  assert.match(settings, /name: 'homepageSectionTitle'/)
  assert.match(settings, /name: 'homepageFooterNote'/)
})

test('WordPress-style editing tools include media, preview, scheduling, and review queues', () => {
  const config = read('sanity-studio/sanity.config.ts')
  const structure = read('sanity-studio/structure.ts')
  const portableText = read('sanity-studio/schemaTypes/portableText.ts')
  const publicContent = read('src/lib/sanity-content.ts')
  assert.match(config, /media\(/)
  assert.match(config, /presentationTool/)
  assert.match(config, /SubmitForReviewAction/)
  assert.match(structure, /ContentPreview/)
  assert.match(structure, /待审核/)
  assert.match(structure, /计划发布/)
  assert.match(portableText, /提示框/)
  assert.match(portableText, /操作步骤/)
  assert.match(portableText, /下载按钮/)
  assert.match(publicContent, /status == "scheduled"/)
  assert.match(publicContent, /dateTime\(publishedAt\) <= dateTime\(now\(\)\)/)
  assert.match(publicContent, /expiresAt/)
  assert.match(read('sanity-studio/actions/editorialActions.tsx'), /hasApprovalRole/)
  assert.match(read('src/app/api/draft-mode/enable/route.ts'), /validatePreviewUrl/)
})

test('recovery backups include drafts, published documents, and image binaries', () => {
  const backup = read('scripts/backup-cloudflare.sh')
  assert.match(backup, /export-sanity-content\.mjs/)
  assert.match(backup, /backup-sanity-assets\.mjs/)
  assert.match(read('scripts/backup-sanity-assets.mjs'), /cdn\.sanity\.io/)
  assert.match(read('scripts/backup-sanity-assets.mjs'), /bodyAssets/)
  assert.match(read('scripts/export-sanity-content.mjs'), /perspective', 'raw'/)
  assert.match(read('scripts/export-sanity-content.mjs'), /SANITY_AUTH_TOKEN/)
  assert.match(read('.github/workflows/monthly-cloudflare-backup.yml'), /SANITY_BACKUP_TOKEN/)
})
