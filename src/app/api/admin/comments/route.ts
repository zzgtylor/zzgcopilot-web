import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { adminEmail } from '@/lib/admin-auth'
import { postgresConfigured, sql, sqlOne, execute } from '@/lib/postgres'
import { auditEvent } from '@/lib/operational'

async function actor() { return adminEmail(await headers()) }

export async function GET() {
  const email = await actor()
  if (!email) return NextResponse.json({ error: '访问未授权' }, { status: 403 })
  if (!postgresConfigured()) return NextResponse.json({ error: '数据库未配置' }, { status: 503 })
  const rows = await sql('SELECT c.id, c.content_id, c.content_slug, c.author_name, c.body, c.status, c.created_at, count(r.id)::int AS report_count FROM public_comments c LEFT JOIN comment_reports r ON r.comment_id=c.id AND r.status=\'open\' WHERE c.status=\'pending\' OR r.id IS NOT NULL GROUP BY c.id ORDER BY c.created_at ASC LIMIT 100')
  return NextResponse.json({ comments: rows })
}

export async function PATCH(request: NextRequest) {
  const email = await actor()
  if (!email) return NextResponse.json({ error: '访问未授权' }, { status: 403 })
  const body = await request.json().catch(() => null) as Record<string, unknown> | null
  const id = String(body?.id || '')
  const status = String(body?.status || '')
  if (!id || !['approved', 'spam', 'trash'].includes(status)) return NextResponse.json({ error: '无效的审核操作' }, { status: 400 })
  const updated = await sqlOne<{ id: string }>('UPDATE public_comments SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING id', [status, id])
  if (!updated) return NextResponse.json({ error: '评论不存在' }, { status: 404 })
  await execute('UPDATE comment_reports SET status=\'resolved\', resolved_at=NOW(), resolved_by=$1 WHERE comment_id=$2 AND status=\'open\'', [email, id])
  await auditEvent({ actorEmail: email, action: 'comment_moderated', targetType: 'comment', targetId: id, metadata: { status, note: String(body?.moderationNote || '').slice(0, 500) } })
  return NextResponse.json({ ok: true })
}
