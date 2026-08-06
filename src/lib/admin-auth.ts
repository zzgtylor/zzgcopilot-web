import { auth } from '@/auth'

export type AdminRole = 'admin' | 'editor'

export async function requireAdminRole(allowed: AdminRole[] = ['admin', 'editor']) {
  const session = await auth()
  const role = (session?.user as { role?: string } | undefined)?.role
  const userId = (session?.user as { id?: string } | undefined)?.id

  if (!session?.user) return { ok: false as const, status: 401, error: '请先登录' }
  if (!role || !allowed.includes(role as AdminRole)) {
    return { ok: false as const, status: 403, error: '没有操作权限' }
  }

  return { ok: true as const, session, role: role as AdminRole, userId: userId || '' }
}

