import { NextResponse } from 'next/server'
import { getDb } from '@/lib/cloudflare-db'
import { requireAdminRole } from '@/lib/admin-auth'

export async function GET() {
  try {
    const access = await requireAdminRole()
    if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status })
    const db = await getDb()
    if (!db) return NextResponse.json({ error: '数据库暂时不可用' }, { status: 503 })
    const [posts, users, comments, views, media, backup, scheduler, trend] = await Promise.all([
      db.prepare(`SELECT COUNT(*) AS total,
        SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) AS published,
        SUM(CASE WHEN status = 'draft' AND scheduled_at IS NULL THEN 1 ELSE 0 END) AS drafts,
        SUM(CASE WHEN status = 'draft' AND scheduled_at IS NOT NULL THEN 1 ELSE 0 END) AS scheduled,
        SUM(CASE WHEN status = 'archived' THEN 1 ELSE 0 END) AS archived FROM posts`).first<Record<string, number>>(),
      db.prepare('SELECT COUNT(*) AS count FROM users WHERE is_active = 1').first<{ count: number }>(),
      db.prepare('SELECT COUNT(*) AS count FROM comments').first<{ count: number }>(),
      db.prepare("SELECT COALESCE(SUM(view_count), 0) AS count FROM posts WHERE status = 'published'").first<{ count: number }>(),
      db.prepare('SELECT COUNT(*) AS count FROM media WHERE deleted_at IS NULL').first<{ count: number }>(),
      db.prepare("SELECT status, details, created_at FROM system_events WHERE event_type = 'backup' ORDER BY created_at DESC LIMIT 1").first(),
      db.prepare("SELECT status, details, created_at FROM system_events WHERE event_type = 'scheduled_publish' ORDER BY created_at DESC LIMIT 1").first(),
      db.prepare("SELECT view_date, SUM(views) AS views FROM post_daily_views WHERE view_date >= date('now', '-13 days') GROUP BY view_date ORDER BY view_date ASC").all(),
    ])
    return NextResponse.json({
      posts: Number(posts?.total || 0), published: Number(posts?.published || 0), drafts: Number(posts?.drafts || 0),
      scheduled: Number(posts?.scheduled || 0), archived: Number(posts?.archived || 0), users: Number(users?.count || 0),
      comments: Number(comments?.count || 0), views: Number(views?.count || 0), media: Number(media?.count || 0), backup, scheduler, trend: trend.results || [],
    }, { headers: { 'Cache-Control': 'private, no-store, max-age=0' } })
  } catch (error) {
    console.error(JSON.stringify({ message: 'admin stats failed', error: error instanceof Error ? error.message : String(error) }))
    return NextResponse.json({ error: '统计数据加载失败' }, { status: 500 })
  }
}
