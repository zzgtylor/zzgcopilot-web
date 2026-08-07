import { NextResponse } from 'next/server'
import { requireAdminRole } from '@/lib/admin-auth'
import { getR2 } from '@/lib/cloudflare-r2'

type Check = { key: string; label: string; status: 'good' | 'warning' | 'critical'; detail: string; href?: string }
const ageHours = (value?: string) => value ? (Date.now() - new Date(value.endsWith('Z') ? value : `${value}Z`).getTime()) / 3_600_000 : Infinity

export async function GET() {
  const access = await requireAdminRole(['admin', 'editor'])
  if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status })
  if (!access.db) return NextResponse.json({ error: '数据库暂时不可用' }, { status: 503 })
  try {
    const r2 = await getR2()
    const [dbProbe, scheduler, backup, admins, twoFactor, pendingPosts, pendingComments, missingAlt, overdue, pages, navigation, r2Probe] = await Promise.all([
      access.db.prepare('SELECT 1 AS ok').first(),
      access.db.prepare("SELECT status, details, created_at FROM system_events WHERE event_type = 'scheduled_publish' ORDER BY created_at DESC LIMIT 1").first<{ status: string; details?: string; created_at: string }>(),
      access.db.prepare("SELECT status, details, created_at FROM system_events WHERE event_type = 'backup' ORDER BY created_at DESC LIMIT 1").first<{ status: string; details?: string; created_at: string }>(),
      access.db.prepare("SELECT COUNT(*) AS count FROM users WHERE is_active = 1 AND COALESCE(NULLIF(role_key, ''), role) = 'admin'").first<{ count: number }>(),
      access.db.prepare("SELECT COUNT(*) AS count FROM users WHERE is_active = 1 AND COALESCE(NULLIF(role_key, ''), role) = 'admin' AND two_factor_enabled = 1").first<{ count: number }>(),
      access.db.prepare("SELECT COUNT(*) AS count FROM posts WHERE review_status = 'pending'").first<{ count: number }>(),
      access.db.prepare('SELECT COUNT(*) AS count FROM comments WHERE is_approved = 0').first<{ count: number }>(),
      access.db.prepare("SELECT COUNT(*) AS count FROM media WHERE deleted_at IS NULL AND (alt_text IS NULL OR trim(alt_text) = '')").first<{ count: number }>(),
      access.db.prepare("SELECT COUNT(*) AS count FROM posts WHERE status = 'draft' AND scheduled_at IS NOT NULL AND scheduled_at <= datetime('now')").first<{ count: number }>(),
      access.db.prepare("SELECT COUNT(*) AS count FROM pages WHERE status = 'published'").first<{ count: number }>(),
      access.db.prepare("SELECT COUNT(*) AS count FROM navigation_items WHERE is_visible = 1").first<{ count: number }>(),
      r2 ? r2.list({ limit: 1 }).then(() => true).catch(() => false) : Promise.resolve(false),
    ])
    const checks: Check[] = [
      { key: 'database', label: 'D1 数据库', status: dbProbe ? 'good' : 'critical', detail: dbProbe ? '数据库读写连接正常' : '数据库连接失败' },
      { key: 'r2', label: 'R2 媒体存储', status: r2Probe ? 'good' : 'critical', detail: r2Probe ? '媒体存储连接正常' : 'R2 未绑定或无法访问' },
      { key: 'scheduler', label: '定时发布任务', status: scheduler?.status === 'success' && ageHours(scheduler.created_at) < 0.1 ? 'good' : 'critical', detail: scheduler?.created_at ? `最近运行：${scheduler.created_at.replace('T', ' ').slice(0, 19)}` : '没有找到运行记录' },
      { key: 'overdue', label: '逾期定时文章', status: Number(overdue?.count || 0) ? 'critical' : 'good', detail: Number(overdue?.count || 0) ? `${overdue?.count} 篇未按时发布` : '没有逾期文章', href: '/admin/posts?status=scheduled' },
      { key: 'backup', label: '可恢复备份', status: backup?.status === 'success' && ageHours(backup.created_at) < 40 * 24 ? 'good' : 'warning', detail: backup?.created_at ? `最近备份：${backup.created_at.replace('T', ' ').slice(0, 19)}` : '没有找到成功备份记录' },
      { key: 'admin', label: '管理员保护', status: Number(admins?.count || 0) >= 1 ? 'good' : 'critical', detail: `${Number(admins?.count || 0)} 位启用管理员` },
      { key: '2fa', label: '管理员双重验证', status: Number(twoFactor?.count || 0) >= Number(admins?.count || 0) ? 'good' : 'warning', detail: `${Number(twoFactor?.count || 0)} / ${Number(admins?.count || 0)} 位管理员已启用`, href: '/admin/security' },
      { key: 'reviews', label: '待审核文章', status: Number(pendingPosts?.count || 0) ? 'warning' : 'good', detail: `${Number(pendingPosts?.count || 0)} 篇等待审核`, href: '/admin/posts?status=pending' },
      { key: 'comments', label: '待审核评论', status: Number(pendingComments?.count || 0) ? 'warning' : 'good', detail: `${Number(pendingComments?.count || 0)} 条等待审核`, href: '/admin/comments' },
      { key: 'alt', label: '图片无障碍说明', status: Number(missingAlt?.count || 0) ? 'warning' : 'good', detail: `${Number(missingAlt?.count || 0)} 张图片缺少替代文字`, href: '/admin/media' },
      { key: 'pages', label: '独立页面', status: 'good', detail: `${Number(pages?.count || 0)} 个已发布页面`, href: '/admin/pages' },
      { key: 'navigation', label: '首页导航', status: Number(navigation?.count || 0) ? 'good' : 'critical', detail: Number(navigation?.count || 0) ? `${navigation?.count} 个可见菜单项` : '没有可见菜单项，首页将使用安全默认值', href: '/admin/navigation' },
    ]
    return NextResponse.json({ checks, summary: { critical: checks.filter(c => c.status === 'critical').length, warning: checks.filter(c => c.status === 'warning').length, good: checks.filter(c => c.status === 'good').length } }, { headers: { 'Cache-Control': 'private, no-store, max-age=0' } })
  } catch (error) {
    console.error(JSON.stringify({ message: 'site health failed', error: error instanceof Error ? error.message : String(error) }))
    return NextResponse.json({ error: '站点健康检查失败' }, { status: 500 })
  }
}
