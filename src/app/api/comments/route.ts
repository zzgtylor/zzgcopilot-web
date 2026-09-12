import { NextRequest, NextResponse } from 'next/server'
import { requestIp, sha256, validateTurnstile } from '@/lib/platform'
import { postgresConfigured, sql, sqlOne, execute } from '@/lib/postgres'
import { auditEvent, identityHash } from '@/lib/operational'

export async function GET(request: NextRequest) {
  if (!postgresConfigured()) return NextResponse.json({ comments: [] })
  const contentId = request.nextUrl.searchParams.get('contentId')?.slice(0, 200)
  if (!contentId) return NextResponse.json({ comments: [] })
  const result = await sql('SELECT id, author_name, body, parent_id, created_at FROM public_comments WHERE content_id = $1 AND status = $2 ORDER BY created_at ASC LIMIT 200', [contentId, 'approved'])
  return NextResponse.json({ comments: result })
}

export async function POST(request: NextRequest) {
  if (!postgresConfigured()) return NextResponse.json({ error: '评论服务尚未配置' }, { status: 503 })
  const body = await request.json().catch(() => null) as Record<string, unknown> | null
  const name = String(body?.name || '').trim().slice(0, 80)
  const email = String(body?.email || '').trim().toLowerCase().slice(0, 160)
  const message = String(body?.body || '').trim().slice(0, 4000)
  const contentId = String(body?.contentId || '').slice(0, 200)
  const slug = String(body?.slug || '').slice(0, 160)
  if (!name || !/^\S+@\S+\.\S+$/.test(email) || message.length < 2 || !contentId) return NextResponse.json({ error: '请完整填写姓名、邮箱和评论' }, { status: 400 })
  if (!await validateTurnstile(String(body?.turnstileToken || ''), requestIp(request))) return NextResponse.json({ error: '安全验证失败或尚未配置' }, { status: 403 })
  const ipHash = await sha256(`${requestIp(request)}:${new Date().toISOString().slice(0, 10)}`)
  const recent = await sqlOne<{ count: number }>('SELECT count(*)::int AS count FROM public_comments WHERE ip_hash = $1 AND created_at > NOW() - INTERVAL \'10 minutes\'', [ipHash])
  if ((recent?.count || 0) >= 5) return NextResponse.json({ error: '提交过于频繁，请稍后再试' }, { status: 429 })
  const inserted = await sqlOne<{ id: string }>('INSERT INTO public_comments(content_id,content_slug,author_name,author_email,body,status,parent_id,ip_hash) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id', [contentId, slug, name, email, message, 'pending', body?.parentId || null, ipHash])
  if (inserted) await auditEvent({ action: 'comment_submitted', targetType: 'comment', targetId: inserted.id, metadata: { contentId, slug }, ipHash: identityHash(requestIp(request)) })
  await execute('INSERT INTO analytics_events(event_type, path) VALUES ($1,$2)', ['comment_submit', `/tutorials/${slug}`])
  return NextResponse.json({ ok: true, message: '评论已提交，审核后显示。' }, { status: 201 })
}
