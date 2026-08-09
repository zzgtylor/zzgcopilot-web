import { requestIp, sha256 } from './platform'

export const ANALYTICS_EVENT_TYPES = ['page_view', 'search', 'cta_click', 'download', 'external_click', 'comment_submit', 'form_submit', 'member_register', 'member_login', 'checkout_start', 'subscription_started'] as const
export type AnalyticsEventType = typeof ANALYTICS_EVENT_TYPES[number]

function cleanPath(value: string): string {
  try {
    const url = new URL(value, 'https://zzgcopilot.com')
    return url.pathname.slice(0, 300) || '/'
  } catch { return '/' }
}

function cleanLabel(value?: string): string | null {
  return value ? value.replace(/[\r\n\t]/g, ' ').trim().slice(0, 120) || null : null
}

function deviceFromUserAgent(userAgent: string): string {
  if (/tablet|ipad/i.test(userAgent)) return 'tablet'
  if (/mobile|iphone|android/i.test(userAgent)) return 'mobile'
  return 'desktop'
}

function referrerHost(value: string): string | null {
  try { const host = new URL(value).hostname.replace(/^www\./, '').slice(0, 120); return host === 'zzgcopilot.com' ? null : host }
  catch { return null }
}

export async function requestAnalyticsContext(request: Request) {
  const date = new Date().toISOString().slice(0, 10)
  const rawIdentity = `${requestIp(request)}|${request.headers.get('user-agent') || ''}|${date}|zzgcopilot-analytics-v1`
  return {
    visitorHash: await sha256(rawIdentity),
    referrer: referrerHost(request.headers.get('referer') || ''),
    country: (request.headers.get('cf-ipcountry') || 'XX').slice(0, 2).toUpperCase(),
    device: deviceFromUserAgent(request.headers.get('user-agent') || ''),
  }
}

export async function recordAnalyticsEvent(db: D1Database, event: { type: AnalyticsEventType; path?: string; label?: string; visitorHash?: string | null; referrer?: string | null; country?: string | null; device?: string | null; valueCents?: number; currency?: string | null }) {
  const path = cleanPath(event.path || '/')
  await db.prepare('INSERT INTO analytics_events(event_type,path,label,visitor_hash,referrer_host,country,device,value_cents,currency) VALUES(?,?,?,?,?,?,?,?,?)')
    .bind(event.type, path, cleanLabel(event.label), event.visitorHash || null, event.referrer || null, event.country || null, event.device || null, Math.max(0, Math.floor(event.valueCents || 0)), event.currency?.toUpperCase().slice(0, 3) || null).run()
  if (event.type === 'page_view') {
    await db.batch([
      db.prepare("INSERT INTO analytics_daily(event_date,path,views) VALUES(date('now'),?,1) ON CONFLICT(event_date,path) DO UPDATE SET views=views+1").bind(path),
      db.prepare("INSERT OR IGNORE INTO analytics_daily_visitors(event_date,path,visitor_hash) VALUES(date('now'),?,?)").bind(path, event.visitorHash || 'anonymous'),
    ])
  }
}
