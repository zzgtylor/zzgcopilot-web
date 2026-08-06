import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { authConfig } from './auth.config'
import { getDb } from '@/lib/cloudflare-db'
import { verifyPassword } from '@/lib/passwords'
import { sha256, verifyTotp } from '@/lib/totp'
import { writeAuditLog } from '@/lib/audit'

const MAX_FAILED_LOGINS = 5
const LOCK_MINUTES = 15

async function loginAttemptKey(email: string, request?: Request) {
    const ip = request?.headers.get('cf-connecting-ip') || request?.headers.get('x-forwarded-for') || 'unknown'
    const data = new TextEncoder().encode(`${email}|${ip.split(',')[0].trim()}`)
    const digest = await crypto.subtle.digest('SHA-256', data)
    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

async function isLoginLocked(db: D1Database, key: string) {
    const attempt = await db.prepare('SELECT locked_until FROM auth_attempts WHERE key = ?').bind(key).first<{ locked_until?: string }>()
    return Boolean(attempt?.locked_until && new Date(`${attempt.locked_until}Z`).getTime() > Date.now())
}

async function recordLoginFailure(db: D1Database, key: string) {
    const current = await db.prepare('SELECT failed_count, first_failed_at FROM auth_attempts WHERE key = ?').bind(key).first<{ failed_count: number; first_failed_at: string }>()
    const firstAt = current?.first_failed_at ? new Date(`${current.first_failed_at}Z`).getTime() : 0
    const stillInWindow = firstAt > Date.now() - LOCK_MINUTES * 60_000
    const failedCount = stillInWindow ? Number(current?.failed_count || 0) + 1 : 1
    const lockedUntil = failedCount >= MAX_FAILED_LOGINS ? new Date(Date.now() + LOCK_MINUTES * 60_000).toISOString() : null
    await db.prepare(
        `INSERT INTO auth_attempts (key, failed_count, first_failed_at, locked_until, updated_at)
         VALUES (?, ?, datetime('now'), ?, datetime('now'))
         ON CONFLICT(key) DO UPDATE SET failed_count = excluded.failed_count,
           first_failed_at = CASE WHEN ? THEN auth_attempts.first_failed_at ELSE datetime('now') END,
           locked_until = excluded.locked_until, updated_at = datetime('now')`
    ).bind(key, failedCount, lockedUntil, stillInWindow ? 1 : 0).run()
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    providers: [
          Credentials({
                  name: 'credentials',
                  credentials: {
                            email: { label: 'Email', type: 'email' },
                            password: { label: 'Password', type: 'password' },
                            otp: { label: 'Two-factor code', type: 'text' },
                  },
                  async authorize(credentials, request) {
                            if (!credentials?.email || !credentials?.password) return null
                            const email = String(credentials.email).toLowerCase().trim()
                            const password = String(credentials.password)

                    try {
                                const db = await getDb()
                                if (!db) {
                                              console.error('D1 binding not available')
                                              return null
                                }

                              const attemptKey = await loginAttemptKey(email, request)
                              if (await isLoginLocked(db, attemptKey)) return null

                              const user = await db
                                  .prepare('SELECT * FROM users WHERE email = ?')
                                  .bind(email)
                                  .first<any>()

                              if (!user || user.is_active === 0 || user.is_active === '0') {
                                  await recordLoginFailure(db, attemptKey)
                                  return null
                              }

                              const isValid = await verifyPassword(
                                            password,
                                            String(user.password_hash || '')
                                          )
                                if (!isValid) {
                                    await recordLoginFailure(db, attemptKey)
                                    return null
                                }

                              if (Number(user.two_factor_enabled)) {
                                  const otp = String(credentials.otp || '').trim().toUpperCase()
                                  let secondFactorValid = await verifyTotp(String(user.two_factor_secret || ''), otp)
                                  if (!secondFactorValid && otp) {
                                      const recoveryHashes = (() => { try { return JSON.parse(String(user.recovery_codes || '[]')) as string[] } catch { return [] } })()
                                      const recoveryHash = await sha256(otp)
                                      const recoveryIndex = recoveryHashes.indexOf(recoveryHash)
                                      if (recoveryIndex >= 0) {
                                          recoveryHashes.splice(recoveryIndex, 1)
                                          await db.prepare('UPDATE users SET recovery_codes = ? WHERE id = ?').bind(JSON.stringify(recoveryHashes), user.id).run()
                                          secondFactorValid = true
                                      }
                                  }
                                  if (!secondFactorValid) {
                                      await recordLoginFailure(db, attemptKey)
                                      return null
                                  }
                              }

                              await db.prepare('DELETE FROM auth_attempts WHERE key = ?').bind(attemptKey).run()
                              await db.prepare("UPDATE users SET last_login_at = datetime('now') WHERE id = ?").bind(user.id).run()
                              await writeAuditLog(db, { userId: String(user.id), action: 'auth.login', targetType: 'user', targetId: String(user.id), summary: '账号登录成功', request })

                              return {
                                            id: String(user.id),
                                            email: user.email,
                                            name: user.name,
                                            role: user.role,
                                            authVersion: Number(user.auth_version || 0),
                              }
                    } catch (e) {
                                console.error('Auth error:', e)
                                return null
                    }
                  },
          }),
        ],
})
