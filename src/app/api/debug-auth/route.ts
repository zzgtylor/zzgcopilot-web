import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/cloudflare-db'
import { verifyPassword } from '@/lib/passwords'

const DEBUG_TOKEN = 'debug-zzgcopilot-20260630-7f3b3a9d'

export async function GET(request: NextRequest) {
  if (request.nextUrl.searchParams.get('token') !== DEBUG_TOKEN) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  try {
    const db = await getDb()
    if (!db) return NextResponse.json({ dbAvailable: false })

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
