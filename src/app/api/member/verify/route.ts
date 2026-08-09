import { NextRequest, NextResponse } from 'next/server'
import { platformDb, sha256 } from '@/lib/platform'
import { randomToken } from '@/lib/member-auth'
import { recordAnalyticsEvent, requestAnalyticsContext } from '@/lib/analytics'

export async function GET(request: NextRequest) {
  const db = platformDb(), token = request.nextUrl.searchParams.get('token') || ''
  if (!db || token.length < 32) return NextResponse.redirect(new URL('/account?error=invalid', request.url))
  const record = await db.prepare("SELECT id,member_id FROM member_login_tokens WHERE token_hash=? AND used_at IS NULL AND expires_at>datetime('now')").bind(await sha256(token)).first<{ id: string; member_id: string }>()
  if (!record) return NextResponse.redirect(new URL('/account?error=expired', request.url))
  const session = randomToken()
  await db.batch([
    db.prepare("UPDATE member_login_tokens SET used_at=datetime('now') WHERE id=?").bind(record.id),
    db.prepare("INSERT INTO member_sessions(member_id,token_hash,expires_at) VALUES(?,?,datetime('now','+30 days'))").bind(record.member_id, await sha256(session)),
    db.prepare("UPDATE members SET last_login_at=datetime('now'),updated_at=datetime('now') WHERE id=?").bind(record.member_id),
  ])
  await recordAnalyticsEvent(db, { type: 'member_login', path: '/account', ...(await requestAnalyticsContext(request)) })
  const response = NextResponse.redirect(new URL('/account', request.url))
  response.cookies.set('zzg_member', session, { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 30 })
  return response
}
