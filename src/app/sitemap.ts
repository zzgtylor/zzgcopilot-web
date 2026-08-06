import type { MetadataRoute } from 'next'
import { getDb } from '@/lib/cloudflare-db'
import { publishDuePosts } from '@/lib/post-scheduling'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://zzgcopilot.com'
  const fallback: MetadataRoute.Sitemap = [{ url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 }]
  const db = await getDb()
  if (!db) return fallback
  try {
    await publishDuePosts(db)
    const result = await db.prepare("SELECT slug, updated_at, published_at, created_at FROM posts WHERE status = 'published' ORDER BY COALESCE(published_at, created_at) DESC").all<any>()
    return [...fallback, ...(result.results || []).map((post: any) => ({ url: `${base}/tutorials/${post.slug}`, lastModified: new Date(post.updated_at || post.published_at || post.created_at), changeFrequency: 'monthly' as const, priority: 0.8 }))]
  } catch { return fallback }
}
