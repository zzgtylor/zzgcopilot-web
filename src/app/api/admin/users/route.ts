import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/cloudflare-db'
import { requireAdminRole } from '@/lib/admin-auth'
import { hashPassword } from '@/lib/passwords'

const ROLES = new Set(['admin', 'editor', 'user'])
const noStore = { 'Cache-Control': 'private, no-store, max-age=0' }

function validPassword(password: string) {
  return password.length >= 12 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password)
}

export async function GET() {
  try {
    const access = await requireAdminRole(['admin'])
    if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status })
    const db = await getDb()
    if (!db) return NextResponse.json({ error: '数据库暂时不可用' }, { status: 503 })
    const result = await db.prepare('SELECT id, name, email, role, is_active, email_verified, created_at, updated_at FROM users ORDER BY created_at DESC').all()
    return NextResponse.json({ users: result.results || [], currentUserId: access.userId }, { headers: noStore })
  } catch (error) {
    console.error(JSON.stringify({ message: 'admin users list failed', error: error instanceof Error ? error.message : String(error) }))
    return NextResponse.json({ error: '用户加载失败' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const access = await requireAdminRole(['admin'])
    if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status })
    const db = await getDb()
    if (!db) return NextResponse.json({ error: '数据库暂时不可用' }, { status: 503 })
    const body = await request.json() as { name?: string; email?: string; password?: string; role?: string }
    const name = String(body.name || '').trim().slice(0, 80)
    const email = String(body.email || '').trim().toLowerCase().slice(0, 180)
    const password = String(body.password || '')
    const role = ROLES.has(String(body.role)) ? String(body.role) : 'user'
    if (!name || !/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: '请填写有效姓名和邮箱' }, { status: 400 })
    if (!validPassword(password)) return NextResponse.json({ error: '密码至少12位，并包含大小写字母和数字' }, { status: 400 })
    const existing = await db.prepare('SELECT id FROM users WHERE email = ?').bind(email).first()
    if (existing) return NextResponse.json({ error: '该邮箱已经存在' }, { status: 409 })
    const passwordHash = await hashPassword(password)
    await db.prepare('INSERT INTO users (name, email, password_hash, role, is_active, email_verified) VALUES (?, ?, ?, ?, 1, 1)').bind(name, email, passwordHash, role).run()
    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error(JSON.stringify({ message: 'admin user create failed', error: error instanceof Error ? error.message : String(error) }))
    return NextResponse.json({ error: '创建用户失败' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const access = await requireAdminRole(['admin'])
    if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status })
    const db = await getDb()
    if (!db) return NextResponse.json({ error: '数据库暂时不可用' }, { status: 503 })
    const body = await request.json() as { id?: string; name?: string; role?: string; is_active?: boolean; password?: string }
    const id = String(body.id || '')
    if (!id) return NextResponse.json({ error: '缺少用户 ID' }, { status: 400 })
    const target = await db.prepare('SELECT id, role, is_active FROM users WHERE id = ?').bind(id).first<{ id: string; role: string; is_active: number }>()
    if (!target) return NextResponse.json({ error: '用户不存在' }, { status: 404 })

    const nextRole = body.role === undefined ? target.role : String(body.role)
    const nextActive = body.is_active === undefined ? Boolean(target.is_active) : Boolean(body.is_active)
    if (!ROLES.has(nextRole)) return NextResponse.json({ error: '角色无效' }, { status: 400 })
    if (id === access.userId && (!nextActive || nextRole !== 'admin')) return NextResponse.json({ error: '不能停用自己或移除自己的管理员角色' }, { status: 409 })
    if (target.role === 'admin' && (nextRole !== 'admin' || !nextActive)) {
      const admins = await db.prepare("SELECT COUNT(*) AS count FROM users WHERE role = 'admin' AND is_active = 1").first<{ count: number }>()
      if (Number(admins?.count || 0) <= 1) return NextResponse.json({ error: '必须至少保留一位启用的管理员' }, { status: 409 })
    }

    const requestedPassword = body.password ? String(body.password) : ''
    if (requestedPassword && !validPassword(requestedPassword)) return NextResponse.json({ error: '密码至少12位，并包含大小写字母和数字' }, { status: 400 })

    const name = body.name === undefined ? null : String(body.name).trim().slice(0, 80)
    await db.prepare('UPDATE users SET name = COALESCE(?, name), role = ?, is_active = ?, updated_at = datetime(\'now\') WHERE id = ?').bind(name || null, nextRole, nextActive ? 1 : 0, id).run()
    if (requestedPassword) {
      const passwordHash = await hashPassword(requestedPassword)
      await db.prepare('UPDATE users SET password_hash = ?, updated_at = datetime(\'now\') WHERE id = ?').bind(passwordHash, id).run()
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(JSON.stringify({ message: 'admin user update failed', error: error instanceof Error ? error.message : String(error) }))
    return NextResponse.json({ error: '更新用户失败' }, { status: 500 })
  }
}
