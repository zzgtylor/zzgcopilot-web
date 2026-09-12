import { getSanitySitemapEntries } from '@/lib/sanity-content'

function escapeXml(value: string) {
  return value.replace(/[<>&'\"]/g, (char) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[char] || char))
}

export async function GET() {
  const base = 'https://zzgcopilot.com'
  const entries = await getSanitySitemapEntries()
  const today = new Date().toISOString().slice(0, 10)
  const urls = [
    { loc: base, lastmod: today, priority: '1.0' },
    { loc: `${base}/tutorials/excel`, lastmod: today, priority: '0.9' },
    ...entries
      .filter(entry => entry.path !== '/tutorials/excel')
      .map(entry => ({ loc: `${base}${entry.path}`, lastmod: entry.updatedAt.slice(0, 10), priority: entry.path.startsWith('/tutorials/') ? '0.8' : '0.6' })),
  ]
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((url) => `  <url><loc>${escapeXml(url.loc)}</loc><lastmod>${url.lastmod}</lastmod><changefreq>weekly</changefreq><priority>${url.priority}</priority></url>`).join('\n')}\n</urlset>`
  return new Response(body, { headers: { 'content-type': 'application/xml; charset=utf-8', 'cache-control': 'public, max-age=300' } })
}
