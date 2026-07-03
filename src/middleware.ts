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

    if (
        pathname.startsWith('/api') ||
        pathname.startsWith('/_next') ||
        pathname.startsWith('/uploads') ||
        pathname === '/support.js' ||
        pathname === '/Word教程网站.dc.html' ||
        pathname === '/.thumbnail' ||
        pathname === '/favicon.ico'
    ) {
        return NextResponse.next()
    }

    return NextResponse.rewrite(new URL('/Word教程网站.dc.html', request.url))
}

export const config = {
    matcher: ['/:path*'],
}
