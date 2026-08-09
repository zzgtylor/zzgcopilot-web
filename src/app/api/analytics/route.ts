import { NextRequest, NextResponse } from 'next/server'
import { platformDb } from '@/lib/platform'
import { ANALYTICS_EVENT_TYPES, recordAnalyticsEvent, requestAnalyticsContext, type AnalyticsEventType } from '@/lib/analytics'

export async function POST(request: NextRequest) {
  const db = platformDb()
  if (!db) return new NextResponse(null, { status: 204 })
  const body = await request.json().catch(() => null) as { path?: string; type?: string; label?: string } | null
  const path = String(body?.path || '').slice(0, 300)
  if (!path.startsWith('/') || path.startsWith('/admin') || path.startsWith('/api')) return new NextResponse(null, { status: 204 })
  const type = String(body?.type || 'page_view') as AnalyticsEventType
  if (!ANALYTICS_EVENT_TYPES.includes(type)) return new NextResponse(null, { status: 204 })
  const context = await requestAnalyticsContext(request)
  const recent = await db.prepare("SELECT count(*) AS count FROM analytics_events WHERE visitor_hash=? AND created_at>datetime('now','-10 minutes')").bind(context.visitorHash).first<{ count: number }>()
  if ((recent?.count || 0) >= 120) return new NextResponse(null, { status: 429 })
  await recordAnalyticsEvent(db, { type, path, label: String(body?.label || ''), ...context })
  if (Math.random() < 0.01) await db.prepare("DELETE FROM analytics_events WHERE created_at<datetime('now','-400 days')").run()
  return new NextResponse(null, { status: 204 })
}
