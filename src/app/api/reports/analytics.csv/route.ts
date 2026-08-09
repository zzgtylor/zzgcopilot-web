import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/admin-auth'
import { buildAnalyticsReport, reportCsv, reportRange } from '@/lib/analytics-report'
import { platformDb } from '@/lib/platform'

export async function GET(request: NextRequest) {
  if (!adminEmail(request.headers)) return NextResponse.json({ error: '访问未授权' }, { status: 403 })
  const db = platformDb()
  if (!db) return NextResponse.json({ error: 'D1 尚未连接' }, { status: 503 })
  const range = reportRange(request.nextUrl.searchParams.get('range'))
  return new NextResponse(reportCsv(await buildAnalyticsReport(db, range)), { headers: { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': `attachment; filename="zzgcopilot-analytics-${range}d.csv"` } })
}
