import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_SESSION_COOKIE, createAdminSession, isAllowedAdminEmail } from '@/lib/admin-auth'
import { platformValue } from '@/lib/platform'

export async function POST(request: NextRequest) {
  const form = await request.formData()
  const supplied = String(form.get('token') || '')
  const email = String(form.get('email') || '').trim().toLowerCase()
  const configured = platformValue('ADMIN_ACCESS_TOKEN')
  if (!configured || supplied !== configured || !isAllowedAdminEmail(email)) return NextResponse.redirect(new URL('/admin/login?error=invalid', request.url), 303)
  const session = await createAdminSession(email)
  if (!session) return NextResponse.redirect(new URL('/admin/login?error=invalid', request.url), 303)
  const response = NextResponse.redirect(new URL('/admin/analytics', request.url), 303)
  response.cookies.set(ADMIN_SESSION_COOKIE, session, { httpOnly: true, secure: true, sameSite: 'strict', path: '/', maxAge: 60 * 60 * 8 })
  return response
}
