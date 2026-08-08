import { readFile, writeFile } from 'node:fs/promises'

const [inputPath, outputPath] = process.argv.slice(2)
if (!inputPath || !outputPath) throw new Error('Usage: node scripts/create-sanity-import.mjs <d1-json> <sanity-ndjson>')

const raw = JSON.parse(await readFile(inputPath, 'utf8'))
const post = raw?.[0]?.results?.[0]
if (!post?.slug || !post?.title || !post?.content) throw new Error('Expected one published D1 post')

const slug = String(post.slug)
const categorySlug = String(post.category_slug || 'uncategorized')
const categoryTitle = String(post.category_name || '未分类')
const asDateTime = (value) => {
  if (!value) return undefined
  const text = String(value)
  return text.includes('T') ? text : `${text.replace(' ', 'T')}Z`
}
const tags = (() => {
  try { return Array.isArray(post.tags) ? post.tags : JSON.parse(post.tags || '[]') } catch { return [] }
})()

const category = {
  _id: `category-${categorySlug}`,
  _type: 'category',
  title: categoryTitle,
  slug: { _type: 'slug', current: categorySlug },
}
const sanityPost = {
  _id: `post-${slug}`,
  _type: 'post',
  title: String(post.title),
  slug: { _type: 'slug', current: slug },
  excerpt: String(post.excerpt || ''),
  content: String(post.content),
  coverImageUrl: post.cover_image || undefined,
  readingTime: Number(post.reading_time) || undefined,
  category: { _type: 'reference', _ref: category._id },
  tags: Array.isArray(tags) ? tags.filter(Boolean).map(String) : [],
  authorName: 'Tyler',
  status: 'published',
  publishedAt: asDateTime(post.published_at || post.created_at),
  metaTitle: post.meta_title || undefined,
  metaDescription: post.meta_description || undefined,
  ogImage: post.og_image || undefined,
}

await writeFile(outputPath, `${JSON.stringify(category)}\n${JSON.stringify(sanityPost)}\n`)
