import { NextRequest, NextResponse } from 'next/server'
import { platformDb, requestIp, sha256, validateTurnstile } from '@/lib/platform'

export async function POST(request: NextRequest) {
  const db = platformDb()
  if (!db) return NextResponse.json({ error: '表单服务尚未配置' }, { status: 503 })
  const body = await request.json().catch(() => null) as Record<string, unknown> | null
  const name = String(body?.name || '').trim().slice(0, 80)
  const email = String(body?.email || '').trim().toLowerCase().slice(0, 160)
  const message = String(body?.message || '').trim().slice(0, 8000)
  if (!name || !/^\S+@\S+\.\S+$/.test(email) || message.length < 5) return NextResponse.json({ error: '请完整填写表单' }, { status: 400 })
  if (!await validateTurnstile(String(body?.turnstileToken || ''), requestIp(request))) return NextResponse.json({ error: '安全验证失败或尚未配置' }, { status: 403 })
  const ipHash = await sha256(`${requestIp(request)}:${new Date().toISOString().slice(0, 10)}`)
  await db.prepare('INSERT INTO form_submissions(name,email,message,source_path,ip_hash) VALUES(?,?,?,?,?)').bind(name, email, message, String(body?.sourcePath || '').slice(0, 300), ipHash).run()
  return NextResponse.json({ ok: true, message: '留言已收到。' }, { status: 201 })
}
