import { readFile } from 'node:fs/promises'
import { basename, resolve } from 'node:path'
import { getCliClient } from 'sanity/cli'

const inputPath = process.argv[2]
if (!inputPath) {
  throw new Error('Usage: sanity exec scripts/import-word-tutorial-html.mjs --with-user-token -- <html-path>')
}

const client = getCliClient({ apiVersion: '2026-08-07' })
const sourcePath = resolve(inputPath)
const source = await readFile(sourcePath, 'utf8')

function bundledJson(type) {
  const match = source.match(new RegExp(`<script[^>]+type=["']${type}["'][^>]*>([\\s\\S]*?)<\\/script>`, 'i'))
  if (!match) throw new Error(`The attached file does not contain ${type}`)
  return JSON.parse(match[1].trim())
}

const html = bundledJson('__bundler/template')
const manifest = bundledJson('__bundler/manifest')
const sectionIds = ['ch1', 'ch-ribbon', ...Array.from({ length: 12 }, (_, index) => `ch${index + 2}`), 'faq', 'kit']

function sectionById(id) {
  const startPattern = new RegExp(`<section[^>]+id=["']${id}["'][^>]*>`, 'i')
  const startMatch = startPattern.exec(html)
  if (!startMatch) return ''
  const start = startMatch.index
  const next = html.indexOf('<section', start + startMatch[0].length)
  return html.slice(start, next < 0 ? html.length : next)
}

const tutorialHtml = sectionIds.map(sectionById).filter(Boolean).join('\n')
if (!tutorialHtml) throw new Error('No Word tutorial sections were found in the attached HTML')

function decodeEntities(value) {
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
}

function textContent(value) {
  return decodeEntities(
    value
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
      .replace(/[ \t\r\f\v]+/g, ' ')
      .replace(/ *\n */g, '\n')
      .trim(),
  )
}

function key(prefix, index) {
  return `${prefix}-${String(index).padStart(4, '0')}`
}

function block(style, text, index, listItem) {
  return {
    _key: key('block', index),
    _type: 'block',
    style,
    markDefs: [],
    children: [{ _key: key('span', index), _type: 'span', marks: [], text }],
    ...(listItem ? { listItem, level: 1 } : {}),
  }
}

const imageIds = [...new Set([...tutorialHtml.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)].map(match => match[1]))]
const imageReferences = new Map()

for (const [index, imageId] of imageIds.entries()) {
  const entry = manifest[imageId]
  if (!entry?.data || !entry?.mime?.startsWith('image/')) continue
  const extension = entry.mime.split('/')[1].replace('jpeg', 'jpg')
  const filename = `word-tutorial-${String(index + 1).padStart(2, '0')}-${imageId}.${extension}`
  const existing = await client.fetch(
    '*[_type == "sanity.imageAsset" && originalFilename == $filename][0]{_id}',
    { filename },
  )
  const asset = existing || await client.assets.upload('image', Buffer.from(entry.data, 'base64'), {
    filename,
    contentType: entry.mime,
  })
  imageReferences.set(imageId, { _type: 'reference', _ref: asset._id })
  console.log(`Image ${index + 1}/${imageIds.length}: ${existing ? 'reused' : 'uploaded'} ${filename}`)
}

const body = []
const tokenPattern = /<(h2|h3|h4|p|li|img)\b([^>]*)>([\s\S]*?)<\/\1>|<img\b([^>]*)\/?>/gi
let token
let index = 0

while ((token = tokenPattern.exec(tutorialHtml))) {
  const tag = (token[1] || 'img').toLowerCase()
  const attributes = token[2] || token[4] || ''
  const inner = token[3] || ''
  index += 1

  if (tag === 'img') {
    const src = attributes.match(/\bsrc=["']([^"']+)["']/i)?.[1]
    const asset = src ? imageReferences.get(src) : null
    if (!asset) continue
    const alt = decodeEntities(attributes.match(/\balt=["']([^"']*)["']/i)?.[1] || 'Word 教程操作截图')
    body.push({ _key: key('image', index), _type: 'image', asset, alt })
    continue
  }

  const text = textContent(inner)
  if (!text || text.length < 2) continue
  const style = ['h2', 'h3', 'h4'].includes(tag) ? tag : 'normal'
  body.push(block(style, text, index, tag === 'li' ? 'bullet' : undefined))
}

if (body.length < 20) throw new Error(`Only ${body.length} content blocks were parsed; import stopped for safety`)

const firstImageReference = imageReferences.values().next().value
const now = new Date().toISOString()
const categoryId = 'category-word-tutorials'
const postId = 'post-word-software-complete-guide'

await client.createIfNotExists({
  _id: categoryId,
  _type: 'category',
  title: 'Word 教程',
  slug: { _type: 'slug', current: 'word-tutorials' },
  description: 'Microsoft Word 从入门到进阶的完整教程。',
})

const post = {
  _id: postId,
  _type: 'post',
  title: 'Word 办公软件攻略解析',
  slug: { _type: 'slug', current: 'word-software-complete-guide' },
  excerpt: '从认识界面、排版与图片表格，到长文档、打印和效率技巧，系统掌握 Word。',
  body,
  category: { _type: 'reference', _ref: categoryId },
  tags: ['Word', '办公软件', '排版', '入门教程'],
  readingTime: Math.max(20, Math.ceil(textContent(tutorialHtml).length / 500)),
  authorName: 'Tyler',
  editorialStage: 'approved',
  reviewerName: 'Tyler',
  approvedAt: now,
  status: 'published',
  publishedAt: '2026-08-06T00:00:00.000Z',
  metaTitle: 'Word 办公软件完整教程 | Tyler博客',
  metaDescription: 'Word 从入门到进阶完整中文教程，涵盖界面、格式、排版、图片、表格、长文档、打印与效率技巧。',
  schemaType: 'TechArticle',
  noIndex: false,
  accessLevel: 'public',
  ...(firstImageReference ? { coverImage: { _type: 'image', asset: firstImageReference } } : {}),
}

await client.createOrReplace(post)

await client.transaction()
  .createOrReplace({ _id: 'navigation-home', _type: 'navigationItem', label: '首页', href: '/', sortOrder: 10, isVisible: true, openNewTab: false })
  .createOrReplace({ _id: 'navigation-tutorial', _type: 'navigationItem', label: '教程', href: '/#latest-tutorials', sortOrder: 20, isVisible: true, openNewTab: false })
  .createOrReplace({ _id: 'navigation-about', _type: 'navigationItem', label: '关于', href: '/#site-footer', sortOrder: 30, isVisible: true, openNewTab: false })
  .patch('navigation-free', patch => patch.set({ isVisible: false }))
  .patch('navigation-template', patch => patch.set({ isVisible: false }))
  .commit()

await client.createIfNotExists({ _id: 'site-settings', _type: 'siteSettings', siteName: 'Tyler博客' })
await client.patch('site-settings').set({
  siteName: 'Tyler博客',
  seoDefaultTitle: 'Tyler博客｜软件与互联网技术教程',
  seoDefaultDescription: '记录软件、互联网技术与效率工具的实用中文教程。',
  homepageBrandName: 'Tyler博客',
  homepageSectionTitle: '最新教程',
  homepageSearchPlaceholder: '搜索教程…',
  showHomepageHero: true,
  homepageHeroEyebrow: '',
  homepageHeroTitle: '记录技术，\n也记录生活。',
  homepageHeroDescription: '',
  showHeaderSearch: true,
  showHeaderCta: false,
  showFooter: true,
  showDefaultLatestPosts: true,
  postsPerPage: 8,
  homepageMaxWidth: 1248,
  cardColumns: 4,
  cardGap: 24,
  cardImageHeight: 190,
  homepageFooterBrand: 'Tyler博客',
  homepageFooterNote: '记录技术，也记录生活。',
  canonicalBaseUrl: 'https://zzgcopilot.com',
  organizationName: 'Tyler博客',
  primaryColor: { _type: 'color', hex: '#1f52ad', alpha: 1 },
  secondaryColor: { _type: 'color', hex: '#182533', alpha: 1 },
  headerBackgroundColor: { _type: 'color', hex: '#ffffff', alpha: 1 },
  surfaceColor: { _type: 'color', hex: '#faf8f3', alpha: 1 },
  cardBackgroundColor: { _type: 'color', hex: '#ffffff', alpha: 1 },
  cardRadius: 18,
}).commit()

console.log(JSON.stringify({
  source: basename(sourcePath),
  postId,
  blocks: body.length,
  images: imageReferences.size,
  status: 'published',
}, null, 2))
