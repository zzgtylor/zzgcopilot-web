import { getCloudflareContext } from '@opennextjs/cloudflare'
import { cookies } from 'next/headers'
import { perspectiveCookieName } from '@sanity/preview-url-secret/constants'

export type SanityPost = {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  body: Array<Record<string, unknown>>
  cover_image: string | null
  reading_time: number | null
  created_at: string
  published_at: string | null
  status: 'published'
  category_name: string | null
  category_slug: string | null
  meta_title: string | null
  meta_description: string | null
  og_image: string | null
  author_name: string | null
  canonical_url: string | null
  no_index: boolean
  schema_type: string
  comments_enabled: boolean
  access_level: 'public' | 'member' | 'paid'
  teaser: string
  stripe_price_id: string | null
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
  body: Array<Record<string, unknown>>
  sections: Array<Record<string, unknown>>
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
  defaultCoverImageUrl: string
  homepageBrandName: string
  homepageSectionTitle: string
  homepageSearchPlaceholder: string
  homepageCtaLabel: string
  homepageFooterBrand: string
  homepageFooterNote: string
  showDefaultLatestPosts: boolean
  homepageSections: Array<Record<string, unknown>>
  canonicalBaseUrl: string
  organizationName: string
  twitterHandle: string
  primaryColor: string
  secondaryColor: string
  bodyFont: string
  headingFont: string
  contentWidth: number
  cardRadius: number
  imageQuality: number
  analyticsEnabled: boolean
  commentsEnabled: boolean
  commentsRequireApproval: boolean
  contactFormEnabled: boolean
  membershipEnabled: boolean
  paidContentEnabled: boolean
  turnstileSiteKey: string
}

export const DEFAULT_PUBLIC_SITE_SETTINGS: PublicSiteSettings = {
  siteName: 'ZZGCopilot Word 教程',
  seoDefaultTitle: 'ZZGCopilot Word 教程',
  seoDefaultDescription: 'Microsoft Word 从入门到精通教程，覆盖文档编辑、格式排版、样式目录、表格图片、协作审阅与高效办公。',
  seoDefaultOgImage: '',
  defaultCoverImageUrl: '',
  homepageBrandName: 'Tyler博客',
  homepageSectionTitle: '最新教程',
  homepageSearchPlaceholder: '搜索教程…',
  homepageCtaLabel: '从零开始学习 →',
  homepageFooterBrand: 'Tyler博客',
  homepageFooterNote: '本站内容独立编写整理，非 Microsoft 官方文档',
  showDefaultLatestPosts: true,
  homepageSections: [],
  canonicalBaseUrl: 'https://zzgcopilot.com',
  organizationName: 'Tyler博客',
  twitterHandle: '',
  primaryColor: '#11567f',
  secondaryColor: '#142844',
  bodyFont: 'system',
  headingFont: 'serif',
  contentWidth: 768,
  cardRadius: 6,
  imageQuality: 82,
  analyticsEnabled: false,
  commentsEnabled: false,
  commentsRequireApproval: true,
  contactFormEnabled: false,
  membershipEnabled: false,
  paidContentEnabled: false,
  turnstileSiteKey: '',
}

export const DEFAULT_NAVIGATION: SanityNavigationItem[] = [
  { id: 'navigation-home', label: '首页', href: '/', is_visible: 1, open_new_tab: 0 },
  { id: 'navigation-free', label: '免费资源', href: '__latest_tutorial__', is_visible: 1, open_new_tab: 0 },
  { id: 'navigation-tutorial', label: '教程', href: '__latest_tutorial__', is_visible: 1, open_new_tab: 0 },
  { id: 'navigation-template', label: '模板下载', href: '__latest_tutorial__', is_visible: 1, open_new_tab: 0 },
  { id: 'navigation-about', label: '关于我们', href: '__latest_tutorial__', is_visible: 1, open_new_tab: 0 },
]

export type SanityConfig = { projectId: string; dataset: string; apiVersion: string; token: string }

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

export function getSanityConfig(): SanityConfig | null {
  const projectId = valueFromEnvironment('SANITY_PROJECT_ID')
  if (!projectId) return null
  return {
    projectId,
    dataset: valueFromEnvironment('SANITY_DATASET') || 'production',
    apiVersion: valueFromEnvironment('SANITY_API_VERSION') || '2026-08-07',
    token: valueFromEnvironment('SANITY_API_READ_TOKEN'),
  }
}

type SanityResponse = {
  _id: string
  title?: string
  slug?: string
  excerpt?: string
  content?: string
  body?: Array<Record<string, unknown>>
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
  canonicalUrl?: string
  noIndex?: boolean
  schemaType?: string
  commentsEnabled?: boolean
  accessLevel?: 'public' | 'member' | 'paid'
  teaser?: string
  stripePriceId?: string
}

type SanityPageResponse = {
  _id: string
  title?: string
  slug?: string
  excerpt?: string
  content?: string
  body?: Array<Record<string, unknown>>
  sections?: Array<Record<string, unknown>>
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
    body: item.body || [],
    cover_image: item.coverImageUrl || null,
    reading_time: item.readingTime || null,
    created_at: item._createdAt || new Date(0).toISOString(),
    published_at: item.publishedAt || item._createdAt || null,
    status: 'published',
    category_name: item.categoryName || null,
    category_slug: item.categorySlug || null,
    meta_title: item.metaTitle || null,
    meta_description: item.metaDescription || null,
    og_image: item.ogImage || null,
    author_name: item.authorName || null,
    canonical_url: item.canonicalUrl || null,
    no_index: Boolean(item.noIndex),
    schema_type: item.schemaType || 'Article',
    comments_enabled: item.commentsEnabled !== false,
    access_level: item.accessLevel || 'public',
    teaser: item.teaser || '',
    stripe_price_id: item.stripePriceId || null,
    source: 'sanity',
  }
}

async function isDraftPreview(): Promise<boolean> {
  try {
    return Boolean((await cookies()).get(perspectiveCookieName)?.value)
  } catch {
    return false
  }
}

async function query<T>(groq: string, params: Record<string, string | number> = {}): Promise<T | null> {
  const config = getSanityConfig()
  if (!config) return null
  const preview = await isDraftPreview()
  if (preview && !config.token) return null

  const url = new URL(`https://${config.projectId}.api.sanity.io/v${config.apiVersion}/data/query/${config.dataset}`)
  url.searchParams.set('query', groq)
  url.searchParams.set('perspective', preview ? 'drafts' : 'published')
  for (const [key, value] of Object.entries(params)) url.searchParams.set(`$${key}`, JSON.stringify(value))

  try {
    const response = await fetch(url, preview
      ? { cache: 'no-store', headers: { authorization: `Bearer ${config.token}` } }
      : { next: { revalidate: 60 } })
    if (!response.ok) return null
    const body = await response.json() as { result?: T }
    return body.result ?? null
  } catch {
    return null
  }
}

const portableProjection = `{
    ...,
    _type == "image" => { ..., "url": asset->url },
    _type == "download" => { ..., "fileUrl": file.asset->url }
  }`

const sectionProjection = `{
    ...,
    "imageUrl": image.asset->url,
    items[]{ ..., "imageUrl": image.asset->url },
    body[]${portableProjection}
  }`

const projection = `{
  _id,
  title,
  "slug": slug.current,
  excerpt,
  content,
  body[]${portableProjection},
  "coverImageUrl": coalesce(coverImage.asset->url, coverImageUrl),
  readingTime,
  _createdAt,
  publishedAt,
  "categoryName": category->title,
  "categorySlug": category->slug.current,
  metaTitle,
  metaDescription,
  ogImage,
  authorName
  ,canonicalUrl
  ,noIndex
  ,schemaType
  ,commentsEnabled
  ,accessLevel
  ,teaser
  ,stripePriceId
}`

export async function getSanityLatestPosts(limit = 12): Promise<SanityPost[]> {
  return getSanityPublishedPosts({ limit })
}

const publicVisibility = '(status == "published" || (status == "scheduled" && dateTime(publishedAt) <= dateTime(now()))) && (!defined(expiresAt) || dateTime(expiresAt) > dateTime(now()))'

function searchPattern(search?: string): string {
  return (search || '').trim().replace(/[?*\\]/g, '').slice(0, 80)
}

export async function getSanityPublishedPosts({ limit = 20, offset = 0, category, search }: { limit?: number; offset?: number; category?: string; search?: string } = {}): Promise<SanityPost[]> {
  const safeLimit = Math.min(Math.max(Math.floor(limit), 1), 100)
  const safeOffset = Math.max(Math.floor(offset), 0)
  const preview = await isDraftPreview()
  const categoryFilter = category ? ' && category->slug.current == $category' : ''
  const cleanedSearch = searchPattern(search)
  const searchFilter = cleanedSearch ? ' && (title match $search || excerpt match $search || pt::text(body) match $search || content match $search)' : ''
  const params: Record<string, string> = {}
  if (category) params.category = category
  if (cleanedSearch) params.search = `*${cleanedSearch}*`
  const visibility = preview ? 'true' : publicVisibility
  const data = await query<SanityResponse[]>(`*[_type == "post" && ${visibility}${categoryFilter}${searchFilter}] | order(coalesce(publishedAt, _createdAt) desc)[${safeOffset}...${safeOffset + safeLimit}] ${projection}`, params)
  return (data || []).map(toPost).filter((post): post is SanityPost => Boolean(post))
}

export async function getSanityPublishedPostCount({ category, search }: { category?: string; search?: string } = {}): Promise<number> {
  const preview = await isDraftPreview()
  const categoryFilter = category ? ' && category->slug.current == $category' : ''
  const cleanedSearch = searchPattern(search)
  const searchFilter = cleanedSearch ? ' && (title match $search || excerpt match $search || pt::text(body) match $search || content match $search)' : ''
  const params: Record<string, string> = {}
  if (category) params.category = category
  if (cleanedSearch) params.search = `*${cleanedSearch}*`
  return await query<number>(`count(*[_type == "post" && ${preview ? 'true' : publicVisibility}${categoryFilter}${searchFilter}])`, params) || 0
}

export async function getSanityPost(slug: string): Promise<SanityPost | null> {
  const preview = await isDraftPreview()
  const data = await query<SanityResponse | null>(`*[_type == "post" && ${preview ? 'true' : publicVisibility} && slug.current == $slug][0] ${projection}`, { slug })
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
  const preview = await isDraftPreview()
  const item = await query<SanityPageResponse | null>(`*[_type == "page" && ${preview ? 'true' : publicVisibility} && slug.current == $slug][0] { _id, title, "slug": slug.current, excerpt, content, body[]${portableProjection}, sections[]${sectionProjection}, _createdAt, _updatedAt, publishedAt, metaTitle, metaDescription }`, { slug })
  if (!item?.title || !item.slug || (!item.content && !item.body?.length && !item.sections?.length)) return null
  return {
    id: item._id,
    title: item.title,
    slug: item.slug,
    excerpt: item.excerpt || '',
    content: item.content || '',
    body: item.body || [],
    sections: item.sections || [],
    status: 'published',
    created_at: item._createdAt || new Date(0).toISOString(),
    updated_at: item._updatedAt || item._createdAt || new Date(0).toISOString(),
    published_at: item.publishedAt || item._createdAt || null,
    meta_title: item.metaTitle || null,
    meta_description: item.metaDescription || null,
  }
}

export async function getSanitySiteSettings(): Promise<PublicSiteSettings> {
  const item = await query<Partial<PublicSiteSettings> & { primaryColor?: { hex?: string }; secondaryColor?: { hex?: string } } | null>(`*[_id == "site-settings"][0] { siteName, seoDefaultTitle, seoDefaultDescription, seoDefaultOgImage, "defaultCoverImageUrl": defaultCoverImage.asset->url, homepageBrandName, homepageSectionTitle, homepageSearchPlaceholder, homepageCtaLabel, homepageFooterBrand, homepageFooterNote, showDefaultLatestPosts, homepageSections[]${sectionProjection}, canonicalBaseUrl, organizationName, twitterHandle, primaryColor, secondaryColor, bodyFont, headingFont, contentWidth, cardRadius, imageQuality, analyticsEnabled, commentsEnabled, commentsRequireApproval, contactFormEnabled, membershipEnabled, paidContentEnabled, turnstileSiteKey }`)
  return {
    siteName: item?.siteName?.trim() || DEFAULT_PUBLIC_SITE_SETTINGS.siteName,
    seoDefaultTitle: item?.seoDefaultTitle?.trim() || DEFAULT_PUBLIC_SITE_SETTINGS.seoDefaultTitle,
    seoDefaultDescription: item?.seoDefaultDescription?.trim() || DEFAULT_PUBLIC_SITE_SETTINGS.seoDefaultDescription,
    seoDefaultOgImage: item?.seoDefaultOgImage?.trim() || '',
    defaultCoverImageUrl: item?.defaultCoverImageUrl?.trim() || '',
    homepageBrandName: item?.homepageBrandName?.trim() || DEFAULT_PUBLIC_SITE_SETTINGS.homepageBrandName,
    homepageSectionTitle: item?.homepageSectionTitle?.trim() || DEFAULT_PUBLIC_SITE_SETTINGS.homepageSectionTitle,
    homepageSearchPlaceholder: item?.homepageSearchPlaceholder?.trim() || DEFAULT_PUBLIC_SITE_SETTINGS.homepageSearchPlaceholder,
    homepageCtaLabel: item?.homepageCtaLabel?.trim() || DEFAULT_PUBLIC_SITE_SETTINGS.homepageCtaLabel,
    homepageFooterBrand: item?.homepageFooterBrand?.trim() || DEFAULT_PUBLIC_SITE_SETTINGS.homepageFooterBrand,
    homepageFooterNote: item?.homepageFooterNote?.trim() || DEFAULT_PUBLIC_SITE_SETTINGS.homepageFooterNote,
    showDefaultLatestPosts: item?.showDefaultLatestPosts !== false,
    homepageSections: Array.isArray(item?.homepageSections) ? item.homepageSections : [],
    canonicalBaseUrl: item?.canonicalBaseUrl?.trim() || DEFAULT_PUBLIC_SITE_SETTINGS.canonicalBaseUrl,
    organizationName: item?.organizationName?.trim() || DEFAULT_PUBLIC_SITE_SETTINGS.organizationName,
    twitterHandle: item?.twitterHandle?.trim() || '',
    primaryColor: item?.primaryColor?.hex || DEFAULT_PUBLIC_SITE_SETTINGS.primaryColor,
    secondaryColor: item?.secondaryColor?.hex || DEFAULT_PUBLIC_SITE_SETTINGS.secondaryColor,
    bodyFont: item?.bodyFont || DEFAULT_PUBLIC_SITE_SETTINGS.bodyFont,
    headingFont: item?.headingFont || DEFAULT_PUBLIC_SITE_SETTINGS.headingFont,
    contentWidth: item?.contentWidth || DEFAULT_PUBLIC_SITE_SETTINGS.contentWidth,
    cardRadius: item?.cardRadius ?? DEFAULT_PUBLIC_SITE_SETTINGS.cardRadius,
    imageQuality: item?.imageQuality || DEFAULT_PUBLIC_SITE_SETTINGS.imageQuality,
    analyticsEnabled: item?.analyticsEnabled === true,
    commentsEnabled: item?.commentsEnabled === true,
    commentsRequireApproval: item?.commentsRequireApproval !== false,
    contactFormEnabled: item?.contactFormEnabled === true,
    membershipEnabled: item?.membershipEnabled === true,
    paidContentEnabled: item?.paidContentEnabled === true,
    turnstileSiteKey: item?.turnstileSiteKey?.trim() || '',
  }
}

export async function getSanityRedirect(path: string): Promise<{ target: string; status: 307 | 308 } | null> {
  const item = await query<{ targetPath?: string; statusCode?: number } | null>(`*[_type == "redirect" && enabled == true && sourcePath == $path][0] { targetPath, statusCode }`, { path })
  if (!item?.targetPath) return null
  return { target: item.targetPath, status: item.statusCode === 307 ? 307 : 308 }
}

export async function getSanitySitemapEntries(): Promise<Array<{ path: string; updatedAt: string }>> {
  const data = await query<Array<{ type?: string; slug?: string; updatedAt?: string }>>(`*[_type in ["post", "page"] && ${publicVisibility} && defined(slug.current)] | order(_updatedAt desc) { "type": _type, "slug": slug.current, "updatedAt": _updatedAt }`)
  return (data || [])
    .filter(item => item.slug && (item.type === 'post' || item.type === 'page'))
    .map(item => ({ path: item.type === 'post' ? `/tutorials/${encodeURIComponent(item.slug!)}` : `/pages/${encodeURIComponent(item.slug!)}`, updatedAt: item.updatedAt || new Date().toISOString() }))
}

export function sanityIsConfigured(): boolean {
  return Boolean(getSanityConfig())
}
