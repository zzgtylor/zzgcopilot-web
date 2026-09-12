import type { MetadataRoute } from 'next'
import { getSanitySitemapEntries } from '@/lib/sanity-content'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = await getSanitySitemapEntries()
  return [
    { url: 'https://zzgcopilot.com', lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: 'https://zzgcopilot.com/tutorials/excel', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    ...entries.filter(entry => entry.path !== '/tutorials/excel').map(entry => ({
      url: `https://zzgcopilot.com${entry.path}`,
      lastModified: new Date(entry.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: entry.path.startsWith('/tutorials/') ? 0.8 : 0.6,
    })),
  ]
}
