import { getDb } from '@/lib/cloudflare-db'
import { ensureSiteSettingsTable, getSiteSettings } from '@/lib/site-settings'

export type HomeBlockType = 'hero' | 'latestPosts' | 'richText' | 'cta'

export type HomeBlock = {
  id: string
  type: HomeBlockType
  visible: boolean
  title?: string
  body?: string
  ctaTitle?: string
  ctaSubtitle?: string
  ctaButtonLabel?: string
  ctaButtonHref?: string
}

const STORAGE_KEY = 'homeBlocks'

function uid() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID().slice(0, 8)
    : Math.random().toString(36).slice(2, 10)
}

async function buildDefaultBlocks(db?: D1Database): Promise<HomeBlock[]> {
  const settings = await getSiteSettings(db)
  return [
    { id: 'hero', type: 'hero', visible: true },
    { id: 'latest-posts', type: 'latestPosts', visible: settings.showLatestTutorials !== 'false' },
  ]
}

function sanitizeBlock(raw: any): HomeBlock | null {
  if (!raw || typeof raw !== 'object') return null
  const type = raw.type as HomeBlockType
  if (!['hero', 'latestPosts', 'richText', 'cta'].includes(type)) return null

  return {
    id: typeof raw.id === 'string' && raw.id ? raw.id : uid(),
    type,
    visible: raw.visible !== false,
    title: typeof raw.title === 'string' ? raw.title.slice(0, 200) : undefined,
    body: typeof raw.body === 'string' ? raw.body.slice(0, 5000) : undefined,
    ctaTitle: typeof raw.ctaTitle === 'string' ? raw.ctaTitle.slice(0, 200) : undefined,
    ctaSubtitle: typeof raw.ctaSubtitle === 'string' ? raw.ctaSubtitle.slice(0, 400) : undefined,
    ctaButtonLabel: typeof raw.ctaButtonLabel === 'string' ? raw.ctaButtonLabel.slice(0, 60) : undefined,
    ctaButtonHref: typeof raw.ctaButtonHref === 'string' ? raw.ctaButtonHref.slice(0, 300) : undefined,
  }
}

export async function getHomeBlocks(db?: D1Database): Promise<HomeBlock[]> {
  const requestDb = db || (await getDb())
  if (!requestDb) return buildDefaultBlocks(db)

  try {
    const row = await requestDb.prepare('SELECT value FROM site_settings WHERE key = ?').bind(STORAGE_KEY).first<{ value: string }>()
    if (!row?.value) return buildDefaultBlocks(requestDb)

    const parsed = JSON.parse(row.value)
    if (!Array.isArray(parsed) || parsed.length === 0) return buildDefaultBlocks(requestDb)

    const blocks = parsed.map(sanitizeBlock).filter((b): b is HomeBlock => b !== null)
    return blocks.length > 0 ? blocks : buildDefaultBlocks(requestDb)
  } catch {
    return buildDefaultBlocks(requestDb)
  }
}

export async function saveHomeBlocks(blocks: HomeBlock[], db?: D1Database): Promise<HomeBlock[]> {
  const requestDb = db || (await getDb())
  if (!requestDb) throw new Error('DB unavailable')

  const sanitized = blocks.map(sanitizeBlock).filter((b): b is HomeBlock => b !== null)

  await ensureSiteSettingsTable(requestDb)
  await requestDb
    .prepare(
      "INSERT INTO site_settings (key, value, updated_at) VALUES (?, ?, datetime('now')) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')"
    )
    .bind(STORAGE_KEY, JSON.stringify(sanitized))
    .run()

  return sanitized
}
