import { NextRequest, NextResponse } from 'next/server'
import { platformDb, requestIp, sha256, validateTurnstile } from '@/lib/platform'
import { recordAnalyticsEvent, requestAnalyticsContext } from '@/lib/analytics'

export async function GET(request: NextRequest) {
  const db = platformDb()
  const contentId = request.nextUrl.searchParams.get('contentId')?.slice(0, 200)
  if (!db || !contentId) return NextResponse.json({ comments: [] })
  const result = await db.prepare('SELECT id, author_name, body, parent_id, created_at FROM public_comments WHERE content_id = ? AND status = ? ORDER BY created_at ASC LIMIT 200').bind(contentId, 'approved').all()
  return NextResponse.json({ comments: result.results || [] })
}

export async function POST(request: NextRequest) {
  const db = platformDb()
  if (!db) return NextResponse.json({ error: '评论服务尚未配置' }, { status: 503 })
  const body = await request.json().catch(() => null) as Record<string, unknown> | null
  const name = String(body?.name || '').trim().slice(0, 80)
  const email = String(body?.email || '').trim().toLowerCase().slice(0, 160)
  const message = String(body?.body || '').trim().slice(0, 4000)
  const contentId = String(body?.contentId || '').slice(0, 200)
  const slug = String(body?.slug || '').slice(0, 160)
  if (!name || !/^\S+@\S+\.\S+$/.test(email) || message.length < 2 || !contentId) return NextResponse.json({ error: '请完整填写姓名、邮箱和评论' }, { status: 400 })
  if (!await validateTurnstile(String(body?.turnstileToken || ''), requestIp(request))) return NextResponse.json({ error: '安全验证失败或尚未配置' }, { status: 403 })
  const ipHash = await sha256(`${requestIp(request)}:${new Date().toISOString().slice(0, 10)}`)
  const recent = await db.prepare("SELECT count(*) AS count FROM public_comments WHERE ip_hash = ? AND created_at > datetime('now','-10 minutes')").bind(ipHash).first<{ count: number }>()
  if ((recent?.count || 0) >= 5) return NextResponse.json({ error: '提交过于频繁，请稍后再试' }, { status: 429 })
  await db.prepare('INSERT INTO public_comments(content_id,content_slug,author_name,author_email,body,status,parent_id,ip_hash) VALUES(?,?,?,?,?,?,?,?)').bind(contentId, slug, name, email, message, 'pending', body?.parentId || null, ipHash).run()
  await recordAnalyticsEvent(db, { type: 'comment_submit', path: `/tutorials/${slug}`, ...(await requestAnalyticsContext(request)) })
  return NextResponse.json({ ok: true, message: '评论已提交，审核后显示。' }, { status: 201 })
}
