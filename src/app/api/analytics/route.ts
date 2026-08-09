import { NextRequest, NextResponse } from 'next/server'
import { platformDb } from '@/lib/platform'

export async function POST(request: NextRequest) {
  const db = platformDb()
  if (!db) return new NextResponse(null, { status: 204 })
  const body = await request.json().catch(() => null) as { path?: string } | null
  const path = String(body?.path || '').slice(0, 300)
  if (!path.startsWith('/') || path.startsWith('/admin') || path.startsWith('/api')) return new NextResponse(null, { status: 204 })
  await db.prepare("INSERT INTO analytics_daily(event_date,path,views) VALUES(date('now'),?,1) ON CONFLICT(event_date,path) DO UPDATE SET views=views+1").bind(path).run()
  return new NextResponse(null, { status: 204 })
}
