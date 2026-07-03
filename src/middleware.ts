import NextAuth from 'next-auth'
import { NextResponse, type NextRequest } from 'next/server'
import { authConfig } from './auth.config'

// Use the Edge-compatible config (no Credentials provider / crypto / jose)
// so the middleware can run in the Edge Runtime without bundling Node.js APIs.
// Route protection is handled by the `authorized` callback in auth.config.ts.
const authMiddleware = NextAuth(authConfig).auth

export default function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    if (pathname.startsWith('/admin')) return authMiddleware(request)

    return NextResponse.next()
}

export const config = {
    matcher: ['/:path*'],
}
