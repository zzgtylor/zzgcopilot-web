import { getCloudflareContext } from '@opennextjs/cloudflare'

export type SanityPost = {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  cover_image: string | null
  reading_time: number | null
  created_at: string
  published_at: string | null
  status: 'published'
  view_count: number
  category_name: string | null
  category_slug: string | null
  meta_title: string | null
  meta_description: string | null
  og_image: string | null
  author_name: string | null
  comments_enabled: number
  source: 'sanity'
}

export type SanityNavigationItem = {
  id: string
  label: string
  href: string
  is_visible: number
  open_new_tab: number
}

export type SanityCategory = {
  id: string
  name: string
  slug: string
  description: string
}

export type SanityPage = {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  status: 'published'
  created_at: string
  updated_at: string
  published_at: string | null
  meta_title: string | null
  meta_description: string | null
}

export type PublicSiteSettings = {
  siteName: string
  seoDefaultTitle: string
  seoDefaultDescription: string
  seoDefaultOgImage: string
}

export const DEFAULT_PUBLIC_SITE_SETTINGS: PublicSiteSettings = {
  siteName: 'ZZGCopilot Word 教程',
  seoDefaultTitle: 'ZZGCopilot Word 教程',
  seoDefaultDescription: 'Microsoft Word 从入门到精通教程，覆盖文档编辑、格式排版、样式目录、表格图片、协作审阅与高效办公。',
  seoDefaultOgImage: '',
}

export const DEFAULT_NAVIGATION: SanityNavigationItem[] = [
  { id: 'navigation-home', label: '首页', href: '/', is_visible: 1, open_new_tab: 0 },
  { id: 'navigation-free', label: '免费资源', href: '__latest_tutorial__', is_visible: 1, open_new_tab: 0 },
  { id: 'navigation-tutorial', label: '教程', href: '__latest_tutorial__', is_visible: 1, open_new_tab: 0 },
  { id: 'navigation-template', label: '模板下载', href: '__latest_tutorial__', is_visible: 1, open_new_tab: 0 },
  { id: 'navigation-about', label: '关于我们', href: '__latest_tutorial__', is_visible: 1, open_new_tab: 0 },
]

type SanityConfig = { projectId: string; dataset: string; apiVersion: string }

function valueFromEnvironment(key: string): string {
  const fromProcess = process.env[key]
  if (fromProcess) return fromProcess
  try {
    const value = (getCloudflareContext().env as Record<string, unknown>)[key]
    return typeof value === 'string' ? value : ''
  } catch {
    return ''
  }
}

function getConfig(): SanityConfig | null {
  const projectId = valueFromEnvironment('SANITY_PROJECT_ID')
  if (!projectId) return null
  return {
    projectId,
    dataset: valueFromEnvironment('SANITY_DATASET') || 'production',
    apiVersion: valueFromEnvironment('SANITY_API_VERSION') || '2026-08-07',
  }
}

type SanityResponse = {
  _id: string
  title?: string
  slug?: string
  excerpt?: string
  content?: string
  coverImageUrl?: string
  readingTime?: number
  _createdAt?: string
  publishedAt?: string
  categoryName?: string
  categorySlug?: string
  metaTitle?: string
  metaDescription?: string
  ogImage?: string
  authorName?: string
}

type SanityPageResponse = {
  _id: string
  title?: string
  slug?: string
  excerpt?: string
  content?: string
  _createdAt?: string
  _updatedAt?: string
  publishedAt?: string
  metaTitle?: string
  metaDescription?: string
}

function toPost(item: SanityResponse): SanityPost | null {
  if (!item.title || !item.slug) return null
  return {
    id: item._id,
    title: item.title,
    slug: item.slug,
    excerpt: item.excerpt || '',
    content: item.content || '',
    cover_image: item.coverImageUrl || null,
    reading_time: item.readingTime || null,
    created_at: item._createdAt || new Date(0).toISOString(),
    published_at: item.publishedAt || item._createdAt || null,
    status: 'published',
    view_count: 0,
    category_name: item.categoryName || null,
    category_slug: item.categorySlug || null,
    meta_title: item.metaTitle || null,
    meta_description: item.metaDescription || null,
    og_image: item.ogImage || null,
    author_name: item.authorName || null,
    comments_enabled: 0,
    source: 'sanity',
  }
}

async function query<T>(groq: string, params: Record<string, string | number> = {}): Promise<T | null> {
  const config = getConfig()
  if (!config) return null

  const url = new URL(`https://${config.projectId}.api.sanity.io/v${config.apiVersion}/data/query/${config.dataset}`)
  url.searchParams.set('query', groq)
  for (const [key, value] of Object.entries(params)) url.searchParams.set(`$${key}`, JSON.stringify(value))

  try {
    const response = await fetch(url, { next: { revalidate: 60 } })
    if (!response.ok) return null
    const body = await response.json() as { result?: T }
    return body.result ?? null
  } catch {
    return null
  }
}

const projection = `{
  _id,
  title,
  "slug": slug.current,
  excerpt,
  content,
  "coverImageUrl": coverImageUrl,
  readingTime,
  _createdAt,
  publishedAt,
  "categoryName": category->title,
  "categorySlug": category->slug.current,
  metaTitle,
  metaDescription,
  ogImage,
  authorName
}`

export async function getSanityLatestPosts(limit = 12): Promise<SanityPost[]> {
  return getSanityPublishedPosts({ limit })
}

export async function getSanityPublishedPosts({ limit = 20, offset = 0, category }: { limit?: number; offset?: number; category?: string } = {}): Promise<SanityPost[]> {
  const safeLimit = Math.min(Math.max(Math.floor(limit), 1), 100)
  const safeOffset = Math.max(Math.floor(offset), 0)
  const categoryFilter = category ? ' && category->slug.current == $category' : ''
  const data = await query<SanityResponse[]>(`*[_type == "post" && status == "published"${categoryFilter}] | order(coalesce(publishedAt, _createdAt) desc)[${safeOffset}...${safeOffset + safeLimit}] ${projection}`, category ? { category } : {})
  return (data || []).map(toPost).filter((post): post is SanityPost => Boolean(post))
}

export async function getSanityPost(slug: string): Promise<SanityPost | null> {
  const data = await query<SanityResponse | null>(`*[_type == "post" && status == "published" && slug.current == $slug][0] ${projection}`, { slug })
  return data ? toPost(data) : null
}

export async function getSanityNavigation(): Promise<SanityNavigationItem[]> {
  const data = await query<Array<{ _id: string; label?: string; href?: string; isVisible?: boolean; openNewTab?: boolean }>>(`*[_type == "navigationItem" && isVisible != false] | order(sortOrder asc, _createdAt asc) { _id, label, href, isVisible, openNewTab }`)
  const navigation = (data || [])
    .filter(item => item.label && item.href)
    .map(item => ({ id: item._id, label: item.label!, href: item.href!, is_visible: 1, open_new_tab: item.openNewTab ? 1 : 0 }))
  return navigation.length ? navigation : DEFAULT_NAVIGATION
}

export async function getSanityCategories(): Promise<SanityCategory[]> {
  const data = await query<Array<{ _id: string; title?: string; slug?: string; description?: string }>>(`*[_type == "category" && defined(slug.current)] | order(title asc) { _id, title, "slug": slug.current, description }`)
  return (data || [])
    .filter(item => item.title && item.slug)
    .map(item => ({ id: item._id, name: item.title!, slug: item.slug!, description: item.description || '' }))
}

export async function getSanityPage(slug: string): Promise<SanityPage | null> {
  const item = await query<SanityPageResponse | null>(`*[_type == "page" && status == "published" && slug.current == $slug][0] { _id, title, "slug": slug.current, excerpt, content, _createdAt, _updatedAt, publishedAt, metaTitle, metaDescription }`, { slug })
  if (!item?.title || !item.slug || !item.content) return null
  return {
    id: item._id,
    title: item.title,
    slug: item.slug,
    excerpt: item.excerpt || '',
    content: item.content,
    status: 'published',
    created_at: item._createdAt || new Date(0).toISOString(),
    updated_at: item._updatedAt || item._createdAt || new Date(0).toISOString(),
    published_at: item.publishedAt || item._createdAt || null,
    meta_title: item.metaTitle || null,
    meta_description: item.metaDescription || null,
  }
}

export async function getSanitySiteSettings(): Promise<PublicSiteSettings> {
  const item = await query<Partial<PublicSiteSettings> | null>(`*[_type == "siteSettings"][0] { siteName, seoDefaultTitle, seoDefaultDescription, seoDefaultOgImage }`)
  return {
    siteName: item?.siteName?.trim() || DEFAULT_PUBLIC_SITE_SETTINGS.siteName,
    seoDefaultTitle: item?.seoDefaultTitle?.trim() || DEFAULT_PUBLIC_SITE_SETTINGS.seoDefaultTitle,
    seoDefaultDescription: item?.seoDefaultDescription?.trim() || DEFAULT_PUBLIC_SITE_SETTINGS.seoDefaultDescription,
    seoDefaultOgImage: item?.seoDefaultOgImage?.trim() || '',
  }
}

export async function getSanitySitemapEntries(): Promise<Array<{ path: string; updatedAt: string }>> {
  const data = await query<Array<{ type?: string; slug?: string; updatedAt?: string }>>(`*[_type in ["post", "page"] && status == "published" && defined(slug.current)] | order(_updatedAt desc) { "type": _type, "slug": slug.current, "updatedAt": _updatedAt }`)
  return (data || [])
    .filter(item => item.slug && (item.type === 'post' || item.type === 'page'))
    .map(item => ({ path: item.type === 'post' ? `/tutorials/${encodeURIComponent(item.slug!)}` : `/pages/${encodeURIComponent(item.slug!)}`, updatedAt: item.updatedAt || new Date().toISOString() }))
}

export function sanityIsConfigured(): boolean {
  return Boolean(getConfig())
}
