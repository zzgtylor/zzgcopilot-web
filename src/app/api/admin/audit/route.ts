import { NextRequest, NextResponse } from 'next/server'
import { requireAdminRole } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  const access = await requireAdminRole(['admin'])
  if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status })
  const db = access.db
  if (!db) return NextResponse.json({ error: '数据库暂时不可用' }, { status: 503 })
  const params = new URL(request.url).searchParams
  const page = Math.max(1, Number(params.get('page')) || 1)
  const pageSize = Math.min(100, Math.max(10, Number(params.get('pageSize')) || 30))
  const query = String(params.get('q') || '').trim().slice(0, 80)
  const condition = query ? 'WHERE a.summary LIKE ? OR a.action LIKE ? OR u.email LIKE ?' : ''
  const bindings = query ? [`%${query}%`, `%${query}%`, `%${query}%`] : []
  const [count, rows] = await Promise.all([
    db.prepare(`SELECT COUNT(*) AS total FROM audit_logs a LEFT JOIN users u ON a.user_id = u.id ${condition}`).bind(...bindings).first<{ total: number }>(),
    db.prepare(`SELECT a.id, a.action, a.target_type, a.target_id, a.summary, a.metadata, a.ip_address, a.created_at, u.name AS user_name, u.email AS user_email FROM audit_logs a LEFT JOIN users u ON a.user_id = u.id ${condition} ORDER BY a.created_at DESC LIMIT ? OFFSET ?`).bind(...bindings, pageSize, (page - 1) * pageSize).all(),
  ])
  return NextResponse.json({ logs: rows.results || [], total: Number(count?.total || 0), page, pageSize }, { headers: { 'Cache-Control': 'private, no-store' } })
}
