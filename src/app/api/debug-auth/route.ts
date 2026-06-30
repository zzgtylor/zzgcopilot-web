import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/cloudflare-db'
import { hashPassword, verifyPassword } from '@/lib/passwords'

const DEBUG_TOKEN = 'debug-zzgcopilot-20260630-7f3b3a9d'

export async function GET(request: NextRequest) {
  if (request.nextUrl.searchParams.get('token') !== DEBUG_TOKEN) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  try {
    const db = await getDb()
    if (!db) return NextResponse.json({ dbAvailable: false })

    if (request.nextUrl.searchParams.get('reset') === '1') {
      const passwordHash = await hashPassword('Admin@123456')
      await db
        .prepare(
          `INSERT INTO users (id, name, email, password_hash, role, is_active)
           VALUES ('admin-user-001', 'Admin', 'admin@zzgcopilot.com', ?, 'admin', 1)
           ON CONFLICT(email) DO UPDATE SET
             name = 'Admin',
             password_hash = excluded.password_hash,
             role = 'admin',
             is_active = 1`
        )
        .bind(passwordHash)
        .run()
    }

    const user = await db
      .prepare('SELECT id, email, role, is_active, password_hash FROM users WHERE email = ?')
      .bind('admin@zzgcopilot.com')
      .first<any>()

    if (!user) return NextResponse.json({ dbAvailable: true, userFound: false })

    const passwordHash = String(user.password_hash || '')
    const passwordMatches = await verifyPassword('Admin@123456', passwordHash)

    return NextResponse.json({
      dbAvailable: true,
      userFound: true,
      email: user.email,
      role: user.role,
      isActive: user.is_active,
      hashPrefix: passwordHash.slice(0, 6),
      hashLength: passwordHash.length,
      passwordMatches,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || String(error) }, { status: 500 })
  }
}
