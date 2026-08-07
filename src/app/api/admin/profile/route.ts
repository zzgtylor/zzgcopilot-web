import { NextRequest, NextResponse } from 'next/server'
import { requireAdminRole } from '@/lib/admin-auth'
import { writeAuditLog } from '@/lib/audit'

export async function GET() {
  const access = await requireAdminRole()
  if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status })
  if (!access.db) return NextResponse.json({ error: '数据库暂时不可用' }, { status: 503 })
  const profile = await access.db.prepare('SELECT name, email, avatar_url, bio FROM users WHERE id=?').bind(access.userId).first()
  return NextResponse.json({ profile }, { headers: { 'Cache-Control': 'private, no-store, max-age=0' } })
}

export async function PATCH(request: NextRequest) {
  const access = await requireAdminRole()
  if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status })
  if (!access.db) return NextResponse.json({ error: '数据库暂时不可用' }, { status: 503 })
  const body = (await request.json()) as Record<string, unknown>
  const name = String(body.name || '').trim().slice(0, 100); const bio = String(body.bio || '').trim().slice(0, 1000); const avatar = String(body.avatar_url || '').trim().slice(0, 500)
  if (!name) return NextResponse.json({ error: '显示名称不能为空' }, { status: 400 })
  if (avatar && !(avatar.startsWith('/') || avatar.startsWith('https://'))) return NextResponse.json({ error: '头像链接无效' }, { status: 400 })
  await access.db.prepare("UPDATE users SET name=?, bio=?, avatar_url=?, updated_at=datetime('now') WHERE id=?").bind(name, bio, avatar || null, access.userId).run()
  await writeAuditLog(access.db, { userId: access.userId, action: 'profile.update', targetType: 'user', targetId: access.userId, summary: '更新个人资料', request })
  return NextResponse.json({ success: true })
}
