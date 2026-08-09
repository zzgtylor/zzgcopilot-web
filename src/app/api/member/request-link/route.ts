import { NextRequest, NextResponse } from 'next/server'
import { platformDb, platformValue, requestIp, validateTurnstile, sha256 } from '@/lib/platform'
import { randomToken } from '@/lib/member-auth'

export async function POST(request: NextRequest) {
  const db = platformDb(), apiKey = platformValue('RESEND_API_KEY'), from = platformValue('MEMBER_FROM_EMAIL')
  if (!db || !apiKey || !from) return NextResponse.json({ error: '会员邮件服务尚未配置' }, { status: 503 })
  const body = await request.json().catch(() => null) as Record<string, unknown> | null
  const email = String(body?.email || '').trim().toLowerCase().slice(0, 160)
  if (!/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: '邮箱格式不正确' }, { status: 400 })
  if (!await validateTurnstile(String(body?.turnstileToken || ''), requestIp(request))) return NextResponse.json({ error: '安全验证失败' }, { status: 403 })
  await db.prepare("INSERT INTO members(email) VALUES(?) ON CONFLICT(email) DO UPDATE SET updated_at=datetime('now')").bind(email).run()
  const member = await db.prepare('SELECT id FROM members WHERE email=?').bind(email).first<{ id: string }>()
  if (!member) return NextResponse.json({ error: '无法建立会员记录' }, { status: 500 })
  const token = randomToken()
  await db.prepare("INSERT INTO member_login_tokens(member_id,token_hash,expires_at) VALUES(?,?,datetime('now','+15 minutes'))").bind(member.id, await sha256(token)).run()
  const verifyUrl = `https://zzgcopilot.com/api/member/verify?token=${encodeURIComponent(token)}`
  const sent = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' }, body: JSON.stringify({ from, to: [email], subject: '登录 ZZGCopilot', html: `<p>点击下面的链接登录，15 分钟内有效：</p><p><a href="${verifyUrl}">登录 ZZGCopilot</a></p>` }) })
  if (!sent.ok) return NextResponse.json({ error: '登录邮件发送失败' }, { status: 502 })
  return NextResponse.json({ ok: true, message: '登录链接已发送到邮箱。' })
}
