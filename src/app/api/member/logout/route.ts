import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { platformDb, sha256 } from '@/lib/platform'

export async function POST() {
  const token = (await cookies()).get('zzg_member')?.value
  const db = platformDb()
  if (token && db) await db.prepare('DELETE FROM member_sessions WHERE token_hash=?').bind(await sha256(token)).run()
  const response = NextResponse.redirect(new URL('/account', 'https://zzgcopilot.com'), 303)
  response.cookies.delete('zzg_member')
  return response
}
