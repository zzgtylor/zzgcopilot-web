import { getDb } from '@/lib/cloudflare-db'

export type SiteSettings = {
  siteName: string
  navTutorialsLabel: string
  navLoginLabel: string
  navRegisterLabel: string
  heroTitle: string
  heroSubtitle: string
  primaryCtaLabel: string
  primaryCtaHref: string
  secondaryCtaLabel: string
  secondaryCtaHref: string
  latestTitle: string
  emptyTitle: string
  emptyActionLabel: string
  footerText: string
  themeColor: string
  heroTone: 'blue' | 'emerald' | 'slate' | 'rose'
  showRegisterCta: string
  showLatestTutorials: string
  seoDefaultTitle: string
  seoDefaultDescription: string
  seoDefaultOgImage: string
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  siteName: 'ZZGCopilot',
  navTutorialsLabel: '教程',
  navLoginLabel: '登录',
  navRegisterLabel: '注册',
  heroTitle: '学习编程，从这里开始',
  heroSubtitle: '高质量的编程教程、技术文章和实用指南',
  primaryCtaLabel: '浏览教程',
  primaryCtaHref: '/tutorials',
  secondaryCtaLabel: '免费注册',
  secondaryCtaHref: '/register',
  latestTitle: '最新教程',
  emptyTitle: '暂无教程',
  emptyActionLabel: '管理员发布第一篇文章',
  footerText: 'ZZGCopilot. 保留所有权利。',
  themeColor: '#2563eb',
  heroTone: 'blue',
  showRegisterCta: 'true',
  showLatestTutorials: 'true',
  seoDefaultTitle: 'ZZGCopilot - 教程网站',
  seoDefaultDescription: '分享编程教程、技术文章和实用指南',
  seoDefaultOgImage: '',
}

const SETTINGS_KEYS = Object.keys(DEFAULT_SITE_SETTINGS) as Array<keyof SiteSettings>

export async function getRequestDb(): Promise<D1Database | undefined> {
  return getDb()
}

export async function getSiteSettings(db?: D1Database): Promise<SiteSettings> {
  const requestDb = db || (await getRequestDb())
  if (!requestDb) return DEFAULT_SITE_SETTINGS

  try {
    const result = await requestDb.prepare('SELECT key, value FROM site_settings').all<{ key: string; value: string }>()
    const rows = result.results || []
    const fromDb = rows.reduce<Record<string, string>>((acc, row) => {
      acc[row.key] = row.value
      return acc
    }, {})

    return normalizeSiteSettings({
      ...DEFAULT_SITE_SETTINGS,
      ...fromDb,
    })
  } catch {
    return DEFAULT_SITE_SETTINGS
  }
}

export async function saveSiteSettings(settings: Partial<SiteSettings>, db?: D1Database) {
  const requestDb = db || (await getRequestDb())
  if (!requestDb) throw new Error('DB unavailable')

  await ensureSiteSettingsTable(requestDb)
  const normalized = normalizeSiteSettings({
    ...DEFAULT_SITE_SETTINGS,
    ...settings,
  })

  for (const key of SETTINGS_KEYS) {
    await requestDb
      .prepare(
        `INSERT INTO site_settings (key, value, updated_at)
         VALUES (?, ?, datetime('now'))
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')`
      )
      .bind(key, normalized[key])
      .run()
  }

  return normalized
}

export async function ensureSiteSettingsTable(db: D1Database) {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS site_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`
    )
    .run()
}

function normalizeSiteSettings(settings: Record<string, string>): SiteSettings {
  const heroTone = ['blue', 'emerald', 'slate', 'rose'].includes(settings.heroTone)
    ? (settings.heroTone as SiteSettings['heroTone'])
    : DEFAULT_SITE_SETTINGS.heroTone

  return {
    siteName: clean(settings.siteName, DEFAULT_SITE_SETTINGS.siteName),
    navTutorialsLabel: clean(settings.navTutorialsLabel, DEFAULT_SITE_SETTINGS.navTutorialsLabel),
    navLoginLabel: clean(settings.navLoginLabel, DEFAULT_SITE_SETTINGS.navLoginLabel),
    navRegisterLabel: clean(settings.navRegisterLabel, DEFAULT_SITE_SETTINGS.navRegisterLabel),
    heroTitle: clean(settings.heroTitle, DEFAULT_SITE_SETTINGS.heroTitle),
    heroSubtitle: clean(settings.heroSubtitle, DEFAULT_SITE_SETTINGS.heroSubtitle),
    primaryCtaLabel: clean(settings.primaryCtaLabel, DEFAULT_SITE_SETTINGS.primaryCtaLabel),
    primaryCtaHref: cleanPath(settings.primaryCtaHref, DEFAULT_SITE_SETTINGS.primaryCtaHref),
    secondaryCtaLabel: clean(settings.secondaryCtaLabel, DEFAULT_SITE_SETTINGS.secondaryCtaLabel),
    secondaryCtaHref: cleanPath(settings.secondaryCtaHref, DEFAULT_SITE_SETTINGS.secondaryCtaHref),
    latestTitle: clean(settings.latestTitle, DEFAULT_SITE_SETTINGS.latestTitle),
    emptyTitle: clean(settings.emptyTitle, DEFAULT_SITE_SETTINGS.emptyTitle),
    emptyActionLabel: clean(settings.emptyActionLabel, DEFAULT_SITE_SETTINGS.emptyActionLabel),
    footerText: clean(settings.footerText, DEFAULT_SITE_SETTINGS.footerText),
    themeColor: /^#[0-9a-fA-F]{6}$/.test(settings.themeColor)
      ? settings.themeColor
      : DEFAULT_SITE_SETTINGS.themeColor,
    heroTone,
    showRegisterCta: settings.showRegisterCta === 'false' ? 'false' : 'true',
    showLatestTutorials: settings.showLatestTutorials === 'false' ? 'false' : 'true',
  }
}

function clean(value: string | undefined, fallback: string) {
  const trimmed = (value || '').trim()
  return trimmed || fallback
}

function cleanPath(value: string | undefined, fallback: string) {
  const trimmed = (value || '').trim()
  if (!trimmed) return fallback
  if (trimmed.startsWith('/') || trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
    return trimmed
  }
  return fallback
}
