import { NextResponse } from 'next/server'
import { getDb } from '@/lib/cloudflare-db'
import { publishDuePosts } from '@/lib/post-scheduling'
import { requireAdminRole } from '@/lib/admin-auth'

export async function GET() {
  const access = await requireAdminRole()
  if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status })
  const db = await getDb()
  if (!db) return NextResponse.json({ error: '数据库暂时不可用' }, { status: 503 })
  await publishDuePosts(db)
  const [missingCover, missingDescription, missingCategory, scheduled] = await Promise.all([
    db.prepare("SELECT COUNT(*) AS count FROM posts WHERE status = 'published' AND (cover_image IS NULL OR cover_image = '')").first<any>(),
    db.prepare("SELECT COUNT(*) AS count FROM posts WHERE status = 'published' AND (meta_description IS NULL OR meta_description = '')").first<any>(),
    db.prepare("SELECT COUNT(*) AS count FROM posts WHERE status = 'published' AND category_id IS NULL").first<any>(),
    db.prepare("SELECT COUNT(*) AS count FROM posts WHERE status = 'draft' AND scheduled_at IS NOT NULL AND scheduled_at > datetime('now')").first<any>(),
  ])
  const count = (value: any) => value?.count || 0
  return NextResponse.json({ checks: [
    { key: 'cover', label: '缺少封面', count: count(missingCover), hint: '首页卡片会使用默认图片。', href: '/admin/posts?quality=cover' },
    { key: 'description', label: '缺少 SEO 描述', count: count(missingDescription), hint: '搜索结果会改用文章摘要或站点默认描述。', href: '/admin/posts?quality=description' },
    { key: 'category', label: '未设置分类', count: count(missingCategory), hint: '建议为文章设置分类，便于读者浏览。', href: '/admin/posts?quality=category' },
    { key: 'scheduled', label: '等待定时发布', count: count(scheduled), hint: '由每分钟定时任务准时公开。', href: '/admin/posts?status=scheduled' },
  ] }, { headers: { 'Cache-Control': 'private, no-store, max-age=0' } })
}
