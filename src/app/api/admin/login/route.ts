import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_SESSION_COOKIE } from '@/lib/admin-auth'
import { platformValue, sha256 } from '@/lib/platform'

export async function POST(request: NextRequest) {
  const form = await request.formData()
  const supplied = String(form.get('token') || '')
  const configured = platformValue('ADMIN_ACCESS_TOKEN')
  if (!configured || supplied !== configured) return NextResponse.redirect(new URL('/admin/login?error=invalid', request.url), 303)
  const response = NextResponse.redirect(new URL('/admin/analytics', request.url), 303)
  response.cookies.set(ADMIN_SESSION_COOKIE, await sha256(configured), { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 8 })
  return response
}
