import { getDb } from '@/lib/cloudflare-db'
import { publishDuePosts } from '@/lib/post-scheduling'

function escapeXml(value: string) {
  return value.replace(/[<>&'\"]/g, (char) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[char] || char))
}

export async function GET() {
  const base = 'https://zzgcopilot.com'
  let urls = [{ loc: base, lastmod: new Date().toISOString().slice(0, 10), priority: '1.0' }]
  try {
    const db = await getDb()
    if (db) {
      await publishDuePosts(db)
      const result = await db.prepare("SELECT slug, updated_at, published_at, created_at FROM posts WHERE status = 'published' ORDER BY COALESCE(published_at, created_at) DESC").all<any>()
      urls = [...urls, ...(result.results || []).map((post: any) => ({ loc: `${base}/tutorials/${encodeURIComponent(post.slug)}`, lastmod: String(post.updated_at || post.published_at || post.created_at).slice(0, 10), priority: '0.8' }))]
    }
  } catch {}
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((url) => `  <url><loc>${escapeXml(url.loc)}</loc><lastmod>${url.lastmod}</lastmod><changefreq>weekly</changefreq><priority>${url.priority}</priority></url>`).join('\n')}\n</urlset>`
  return new Response(body, { headers: { 'content-type': 'application/xml; charset=utf-8', 'cache-control': 'public, max-age=300' } })
}
