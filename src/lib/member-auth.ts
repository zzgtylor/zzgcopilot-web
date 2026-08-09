import { cookies } from 'next/headers'
import { platformDb, sha256 } from './platform'

export type Member = { id: string; email: string; name: string | null; plan: string; status: string }

export async function currentMember(): Promise<Member | null> {
  const token = (await cookies()).get('zzg_member')?.value
  const db = platformDb()
  if (!token || !db) return null
  return await db.prepare("SELECT m.id,m.email,m.name,m.plan,m.status FROM member_sessions s JOIN members m ON m.id=s.member_id WHERE s.token_hash=? AND s.expires_at>datetime('now') AND m.status='active'").bind(await sha256(token)).first<Member>()
}

export function randomToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  return Array.from(bytes).map(value => value.toString(16).padStart(2, '0')).join('')
}
