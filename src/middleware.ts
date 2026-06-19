import { auth } from './auth'
import { NextResponse } from 'next/server'

export default auth(function middleware(req) {
  const token = req.auth
  const path = req.nextUrl.pathname

  // Admin-only routes
  if (path.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    const role = (token.user as any)?.role
    if (role !== 'admin' && role !== 'editor') {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/admin/:path*'],
}
