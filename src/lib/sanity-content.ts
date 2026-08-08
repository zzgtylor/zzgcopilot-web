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

async function query<T>(groq: string, params: Record<string, string> = {}): Promise<T | null> {
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
  const data = await query<SanityResponse[]>(`*[_type == "post" && status == "published"] | order(coalesce(publishedAt, _createdAt) desc)[0...${limit}] ${projection}`)
  return (data || []).map(toPost).filter((post): post is SanityPost => Boolean(post))
}

export async function getSanityPost(slug: string): Promise<SanityPost | null> {
  const data = await query<SanityResponse | null>(`*[_type == "post" && status == "published" && slug.current == $slug][0] ${projection}`, { slug })
  return data ? toPost(data) : null
}

export function sanityIsConfigured(): boolean {
  return Boolean(getConfig())
}
