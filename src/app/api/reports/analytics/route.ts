import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/admin-auth'
import { buildAnalyticsReport, reportRange } from '@/lib/analytics-report'
import { platformDb } from '@/lib/platform'

export async function GET(request: NextRequest) {
  if (!adminEmail(request.headers)) return NextResponse.json({ error: '访问未授权' }, { status: 403 })
  const db = platformDb()
  if (!db) return NextResponse.json({ error: 'D1 尚未连接' }, { status: 503 })
  return NextResponse.json(await buildAnalyticsReport(db, reportRange(request.nextUrl.searchParams.get('range'))))
}
