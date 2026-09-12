import { NextRequest, NextResponse } from 'next/server'
import { platformValue, requestIp, validateTurnstile, sha256 } from '@/lib/platform'
import { postgresConfigured, sqlOne, execute } from '@/lib/postgres'
import { auditEvent, identityHash } from '@/lib/operational'
import { randomToken } from '@/lib/member-auth'

export async function POST(request: NextRequest) {
  const apiKey = platformValue('RESEND_API_KEY'), from = platformValue('MEMBER_FROM_EMAIL')
  if (!postgresConfigured() || !apiKey || !from) return NextResponse.json({ error: '会员邮件服务尚未配置' }, { status: 503 })
  const body = await request.json().catch(() => null) as Record<string, unknown> | null
  const email = String(body?.email || '').trim().toLowerCase().slice(0, 160)
  if (!/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: '邮箱格式不正确' }, { status: 400 })
  if (!await validateTurnstile(String(body?.turnstileToken || ''), requestIp(request))) return NextResponse.json({ error: '安全验证失败' }, { status: 403 })
  const emailHash = identityHash(email), ipHash = identityHash(requestIp(request))
  const recent = await sqlOne<{ email_count: number; ip_count: number }>('SELECT count(*) FILTER (WHERE email_hash=$1)::int AS email_count, count(*) FILTER (WHERE ip_hash=$2)::int AS ip_count FROM email_send_events WHERE kind=\'member_login\' AND created_at > NOW() - INTERVAL \'15 minutes\'', [emailHash, ipHash])
  if ((recent?.email_count || 0) >= 3 || (recent?.ip_count || 0) >= 10) return NextResponse.json({ error: '邮件请求过于频繁，请稍后再试' }, { status: 429 })
  const existing = await sqlOne<{ id: string }>('SELECT id FROM members WHERE email=$1', [email])
  await execute('INSERT INTO members(email) VALUES($1) ON CONFLICT(email) DO UPDATE SET updated_at=NOW()', [email])
  const member = await sqlOne<{ id: string }>('SELECT id FROM members WHERE email=$1', [email])
  if (!member) return NextResponse.json({ error: '无法建立会员记录' }, { status: 500 })
  const token = randomToken()
  await execute("INSERT INTO member_login_tokens(member_id,token_hash,expires_at) VALUES($1,$2,NOW()+INTERVAL '15 minutes')", [member.id, await sha256(token)])
  const verifyUrl = `https://zzgcopilot.com/api/member/verify?token=${encodeURIComponent(token)}`
  let sent: Response
  let providerId: string | null = null
  try { sent = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' }, body: JSON.stringify({ from, to: [email], subject: '登录 ZZGCopilot', html: `<p>点击下面的链接登录，15 分钟内有效：</p><p><a href="${verifyUrl}">登录 ZZGCopilot</a></p>` }) })
    const result = await sent.clone().json().catch(() => ({})) as { id?: string }
    providerId = result.id || null
  } catch { sent = new Response(null, { status: 502 }) }
  await execute('INSERT INTO email_send_events(email_hash,ip_hash,kind,status,provider_id) VALUES($1,$2,$3,$4,$5)', [emailHash, ipHash, 'member_login', sent.ok ? 'sent' : 'failed', providerId])
  await auditEvent({ action: 'member_login_email_requested', targetType: 'member', targetId: member.id, metadata: { status: sent.ok ? 'sent' : 'failed' }, ipHash })
  if (!sent.ok) return NextResponse.json({ error: '登录邮件发送失败' }, { status: 502 })
  return NextResponse.json({ ok: true, message: '登录链接已发送到邮箱。' })
}
