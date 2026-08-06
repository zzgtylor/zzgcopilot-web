import { NextRequest, NextResponse } from 'next/server'
import { requireAdminRole } from '@/lib/admin-auth'
import { writeAuditLog } from '@/lib/audit'

const statusValue: Record<string, number> = { approved: 1, pending: 0, spam: -1, trash: -2 }
const noStore = { 'Cache-Control': 'private, no-store, max-age=0' }

export async function GET(request: NextRequest) {
  const access = await requireAdminRole(['admin', 'editor'])
  if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status })
  if (!access.db) return NextResponse.json({ error: '数据库暂时不可用' }, { status: 503 })
  const params = new URL(request.url).searchParams
  const page = Math.max(1, Number(params.get('page')) || 1)
  const pageSize = Math.min(100, Math.max(10, Number(params.get('pageSize')) || 30))
  const status = params.get('status') || 'pending'
  const query = (params.get('q') || '').trim().slice(0, 100)
  const conditions: string[] = []; const bindings: unknown[] = []
  if (status !== 'all' && Object.hasOwn(statusValue, status)) { conditions.push('c.is_approved = ?'); bindings.push(statusValue[status]) }
  if (query) { conditions.push('(c.content LIKE ? OR u.name LIKE ? OR u.email LIKE ? OR p.title LIKE ?)'); const term = `%${query}%`; bindings.push(term, term, term, term) }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
  const [count, rows, totals] = await Promise.all([
    access.db.prepare(`SELECT COUNT(*) AS total FROM comments c LEFT JOIN users u ON c.author_id = u.id LEFT JOIN posts p ON c.post_id = p.id ${where}`).bind(...bindings).first<{ total: number }>(),
    access.db.prepare(`SELECT c.id, c.content, c.is_approved, c.moderation_note, c.created_at, p.id AS post_id, p.title AS post_title, p.slug AS post_slug, u.name AS author_name, u.email AS author_email FROM comments c LEFT JOIN users u ON c.author_id = u.id LEFT JOIN posts p ON c.post_id = p.id ${where} ORDER BY c.created_at DESC LIMIT ? OFFSET ?`).bind(...bindings, pageSize, (page - 1) * pageSize).all(),
    access.db.prepare(`SELECT SUM(CASE WHEN is_approved = 0 THEN 1 ELSE 0 END) AS pending, SUM(CASE WHEN is_approved = 1 THEN 1 ELSE 0 END) AS approved, SUM(CASE WHEN is_approved = -1 THEN 1 ELSE 0 END) AS spam, SUM(CASE WHEN is_approved = -2 THEN 1 ELSE 0 END) AS trash FROM comments`).first(),
  ])
  return NextResponse.json({ comments: rows.results || [], total: Number(count?.total || 0), page, pageSize, totals }, { headers: noStore })
}

export async function PATCH(request: NextRequest) {
  const access = await requireAdminRole(['admin', 'editor'])
  if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status })
  if (!access.db) return NextResponse.json({ error: '数据库暂时不可用' }, { status: 503 })
  const body = await request.json() as { ids?: string[]; action?: string; note?: string }
  const ids = [...new Set((body.ids || []).filter(Boolean))].slice(0, 100)
  if (!ids.length || !body.action || !Object.hasOwn(statusValue, body.action)) return NextResponse.json({ error: '请求无效' }, { status: 400 })
  const placeholders = ids.map(() => '?').join(',')
  await access.db.prepare(`UPDATE comments SET is_approved = ?, moderation_note = ?, updated_at = datetime('now') WHERE id IN (${placeholders})`).bind(statusValue[body.action], String(body.note || '').slice(0, 300), ...ids).run()
  await writeAuditLog(access.db, { userId: access.userId, action: `comment.bulk_${body.action}`, targetType: 'comment', summary: `批量审核 ${ids.length} 条评论`, metadata: { ids }, request })
  return NextResponse.json({ success: true, count: ids.length })
}

export async function DELETE(request: NextRequest) {
  const access = await requireAdminRole(['admin'])
  if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status })
  if (!access.db) return NextResponse.json({ error: '数据库暂时不可用' }, { status: 503 })
  const ids = [...new Set(new URL(request.url).searchParams.getAll('id').filter(Boolean))].slice(0, 100)
  if (!ids.length) return NextResponse.json({ error: '缺少评论 ID' }, { status: 400 })
  const placeholders = ids.map(() => '?').join(',')
  await access.db.prepare(`DELETE FROM comments WHERE is_approved = -2 AND id IN (${placeholders})`).bind(...ids).run()
  await writeAuditLog(access.db, { userId: access.userId, action: 'comment.delete_permanent', targetType: 'comment', summary: `永久删除 ${ids.length} 条回收站评论`, metadata: { ids }, request })
  return NextResponse.json({ success: true })
}
