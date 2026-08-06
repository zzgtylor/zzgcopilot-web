import { NextRequest, NextResponse } from 'next/server'
import { requireAdminRole } from '@/lib/admin-auth'
import { hashPassword, verifyPassword } from '@/lib/passwords'
import { createRecoveryCodes, createTotpSecret, sha256, verifyTotp } from '@/lib/totp'
import { writeAuditLog } from '@/lib/audit'

const noStore = { 'Cache-Control': 'private, no-store, max-age=0' }

function validPassword(password: string) {
  return password.length >= 12 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password)
}

export async function GET() {
  const access = await requireAdminRole()
  if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status })
  const db = access.db
  if (!db) return NextResponse.json({ error: '数据库暂时不可用' }, { status: 503 })
  const user = await db.prepare('SELECT name, email, two_factor_enabled, last_login_at FROM users WHERE id = ?').bind(access.userId).first()
  const recent = await db.prepare("SELECT action, summary, ip_address, created_at FROM audit_logs WHERE user_id = ? AND action LIKE 'auth.%' ORDER BY created_at DESC LIMIT 12").bind(access.userId).all()
  return NextResponse.json({ user, recent: recent.results || [] }, { headers: noStore })
}

export async function POST(request: NextRequest) {
  const access = await requireAdminRole()
  if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status })
  const db = access.db
  if (!db) return NextResponse.json({ error: '数据库暂时不可用' }, { status: 503 })
  const body = await request.json() as { action?: string; currentPassword?: string; newPassword?: string; code?: string }
  const user = await db.prepare('SELECT email, password_hash, two_factor_secret, two_factor_enabled FROM users WHERE id = ?').bind(access.userId).first<{ email: string; password_hash: string; two_factor_secret?: string; two_factor_enabled: number }>()
  if (!user) return NextResponse.json({ error: '用户不存在' }, { status: 404 })

  if (body.action === 'changePassword') {
    if (!await verifyPassword(String(body.currentPassword || ''), user.password_hash)) return NextResponse.json({ error: '当前密码不正确' }, { status: 400 })
    if (!validPassword(String(body.newPassword || ''))) return NextResponse.json({ error: '新密码至少12位，并包含大小写字母和数字' }, { status: 400 })
    const passwordHash = await hashPassword(String(body.newPassword))
    await db.prepare("UPDATE users SET password_hash = ?, auth_version = auth_version + 1, updated_at = datetime('now') WHERE id = ?").bind(passwordHash, access.userId).run()
    await writeAuditLog(db, { userId: access.userId, action: 'auth.password_changed', targetType: 'user', targetId: access.userId, summary: '修改了本人密码并退出其他会话', request })
    return NextResponse.json({ success: true, signOut: true })
  }

  if (body.action === 'begin2fa') {
    const secret = createTotpSecret()
    await db.prepare('UPDATE users SET two_factor_secret = ?, two_factor_enabled = 0 WHERE id = ?').bind(secret, access.userId).run()
    const uri = `otpauth://totp/ZZGCopilot:${encodeURIComponent(user.email)}?secret=${secret}&issuer=ZZGCopilot&algorithm=SHA1&digits=6&period=30`
    return NextResponse.json({ secret, uri })
  }

  if (body.action === 'enable2fa') {
    if (!user.two_factor_secret || !await verifyTotp(user.two_factor_secret, String(body.code || ''))) return NextResponse.json({ error: '验证码不正确' }, { status: 400 })
    const recoveryCodes = createRecoveryCodes()
    const hashes = await Promise.all(recoveryCodes.map(code => sha256(code.toUpperCase())))
    await db.prepare("UPDATE users SET two_factor_enabled = 1, recovery_codes = ?, auth_version = auth_version + 1, updated_at = datetime('now') WHERE id = ?").bind(JSON.stringify(hashes), access.userId).run()
    await writeAuditLog(db, { userId: access.userId, action: 'auth.2fa_enabled', targetType: 'user', targetId: access.userId, summary: '启用了两步验证', request })
    return NextResponse.json({ success: true, recoveryCodes, signOut: true })
  }

  if (body.action === 'disable2fa') {
    if (!await verifyPassword(String(body.currentPassword || ''), user.password_hash)) return NextResponse.json({ error: '当前密码不正确' }, { status: 400 })
    if (!user.two_factor_secret || !await verifyTotp(user.two_factor_secret, String(body.code || ''))) return NextResponse.json({ error: '验证码不正确' }, { status: 400 })
    await db.prepare("UPDATE users SET two_factor_enabled = 0, two_factor_secret = NULL, recovery_codes = '[]', auth_version = auth_version + 1, updated_at = datetime('now') WHERE id = ?").bind(access.userId).run()
    await writeAuditLog(db, { userId: access.userId, action: 'auth.2fa_disabled', targetType: 'user', targetId: access.userId, summary: '关闭了两步验证', request })
    return NextResponse.json({ success: true, signOut: true })
  }

  if (body.action === 'revokeSessions') {
    await db.prepare("UPDATE users SET auth_version = auth_version + 1, updated_at = datetime('now') WHERE id = ?").bind(access.userId).run()
    await writeAuditLog(db, { userId: access.userId, action: 'auth.sessions_revoked', targetType: 'user', targetId: access.userId, summary: '退出了全部登录会话', request })
    return NextResponse.json({ success: true, signOut: true })
  }
  return NextResponse.json({ error: '操作无效' }, { status: 400 })
}
