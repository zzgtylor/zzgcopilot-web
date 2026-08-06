import { auth } from '@/auth'
import { getDb } from '@/lib/cloudflare-db'

export type AdminRole = 'admin' | 'editor' | 'author' | 'contributor'

export const ALL_ADMIN_ROLES: AdminRole[] = ['admin', 'editor', 'author', 'contributor']

export function canManageAllContent(role: AdminRole) { return role === 'admin' || role === 'editor' }
export function canPublish(role: AdminRole) { return role === 'admin' || role === 'editor' || role === 'author' }
export function canUploadMedia(role: AdminRole) { return role === 'admin' || role === 'editor' || role === 'author' }
export function canModerateComments(role: AdminRole) { return role === 'admin' || role === 'editor' }

export async function requireAdminRole(allowed: AdminRole[] = ALL_ADMIN_ROLES) {
  const session = await auth()
  const role = (session?.user as { role?: string } | undefined)?.role
  const userId = (session?.user as { id?: string } | undefined)?.id
  const authVersion = Number((session?.user as { authVersion?: number } | undefined)?.authVersion || 0)

  if (!session?.user) return { ok: false as const, status: 401, error: '请先登录' }
  if (!role || !allowed.includes(role as AdminRole)) {
    return { ok: false as const, status: 403, error: '没有操作权限' }
  }

  const db = await getDb()
  if (db && userId) {
    const user = await db.prepare('SELECT is_active, auth_version, COALESCE(NULLIF(role_key, \'\'), role) AS effective_role FROM users WHERE id = ?').bind(userId).first<{ is_active: number; auth_version: number; effective_role: string }>()
    if (!user || !Number(user.is_active) || Number(user.auth_version || 0) !== authVersion) {
      return { ok: false as const, status: 401, error: '登录状态已失效，请重新登录' }
    }
    if (!allowed.includes(user.effective_role as AdminRole)) return { ok: false as const, status: 403, error: '没有操作权限' }
    return { ok: true as const, session, role: user.effective_role as AdminRole, userId, db }
  }

  return { ok: true as const, session, role: role as AdminRole, userId: userId || '', db }
}
