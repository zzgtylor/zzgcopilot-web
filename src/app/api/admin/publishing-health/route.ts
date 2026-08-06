import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getDb } from '@/lib/cloudflare-db'
import { publishDuePosts } from '@/lib/post-scheduling'

export async function GET() {
  const session = await auth()
  const role = (session?.user as any)?.role
  if (role !== 'admin' && role !== 'editor') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const db = await getDb()
  if (!db) return NextResponse.json({ checks: [] })
  await publishDuePosts(db)
  const [missingCover, missingDescription, missingCategory, scheduled] = await Promise.all([
    db.prepare("SELECT COUNT(*) AS count FROM posts WHERE status = 'published' AND (cover_image IS NULL OR cover_image = '')").first<any>(),
    db.prepare("SELECT COUNT(*) AS count FROM posts WHERE status = 'published' AND (meta_description IS NULL OR meta_description = '')").first<any>(),
    db.prepare("SELECT COUNT(*) AS count FROM posts WHERE status = 'published' AND category_id IS NULL").first<any>(),
    db.prepare("SELECT COUNT(*) AS count FROM posts WHERE status = 'draft' AND scheduled_at IS NOT NULL AND scheduled_at > datetime('now')").first<any>(),
  ])
  const count = (value: any) => value?.count || 0
  return NextResponse.json({ checks: [
    { key: 'cover', label: '缺少封面', count: count(missingCover), hint: '首页卡片会使用默认图片。' },
    { key: 'description', label: '缺少 SEO 描述', count: count(missingDescription), hint: '搜索结果会改用文章摘要或站点默认描述。' },
    { key: 'category', label: '未设置分类', count: count(missingCategory), hint: '建议为文章设置分类，便于读者浏览。' },
    { key: 'scheduled', label: '等待定时发布', count: count(scheduled), hint: '到设定时间后会自动公开。' },
  ] })
}
