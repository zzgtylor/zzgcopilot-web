import type { MetadataRoute } from 'next'
import { getSanitySitemapEntries } from '@/lib/sanity-content'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = await getSanitySitemapEntries()
  return [
    { url: 'https://zzgcopilot.com', lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    ...entries.map(entry => ({
      url: `https://zzgcopilot.com${entry.path}`,
      lastModified: new Date(entry.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: entry.path.startsWith('/tutorials/') ? 0.8 : 0.6,
    })),
  ]
}
