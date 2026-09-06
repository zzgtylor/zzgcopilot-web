import { NextRequest, NextResponse } from 'next/server'
import { requestIp, sha256, validateTurnstile } from '@/lib/platform'
import { postgresConfigured, sqlOne, execute } from '@/lib/postgres'
import { auditEvent, identityHash } from '@/lib/operational'

export async function POST(request: NextRequest) {
  if (!postgresConfigured()) return NextResponse.json({ error: '评论服务尚未配置' }, { status: 503 })
  const body = await request.json().catch(() => null) as Record<string, unknown> | null
  const commentId = String(body?.commentId || '').slice(0, 80)
  const reason = String(body?.reason || '').trim().slice(0, 200)
  if (!commentId || reason.length < 2) return NextResponse.json({ error: '请提供评论和举报原因' }, { status: 400 })
  if (!await validateTurnstile(String(body?.turnstileToken || ''), requestIp(request))) return NextResponse.json({ error: '安全验证失败' }, { status: 403 })
  const reporterIpHash = await sha256(`${requestIp(request)}:${new Date().toISOString().slice(0, 10)}`)
  const recent = await sqlOne<{ count: number }>('SELECT count(*)::int AS count FROM comment_reports WHERE reporter_ip_hash=$1 AND created_at > NOW() - INTERVAL \'1 hour\'', [reporterIpHash])
  if ((recent?.count || 0) >= 10) return NextResponse.json({ error: '举报操作过于频繁' }, { status: 429 })
  const comment = await sqlOne<{ id: string }>('SELECT id FROM public_comments WHERE id=$1', [commentId])
  if (!comment) return NextResponse.json({ error: '评论不存在' }, { status: 404 })
  await execute('INSERT INTO comment_reports(comment_id, reason, reporter_ip_hash) VALUES ($1,$2,$3)', [commentId, reason, reporterIpHash])
  await auditEvent({ action: 'comment_reported', targetType: 'comment', targetId: commentId, metadata: { reason }, ipHash: identityHash(requestIp(request)) })
  return NextResponse.json({ ok: true, message: '举报已提交，管理员会进行处理。' }, { status: 201 })
}
