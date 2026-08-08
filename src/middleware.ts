import { NextResponse, type NextRequest } from 'next/server'

const SANITY_STUDIO_URL = 'https://zzgcopilot.sanity.studio/'

export default function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    if (pathname.startsWith('/admin') || pathname === '/login' || pathname === '/register') {
        return NextResponse.redirect(SANITY_STUDIO_URL, 307)
    }

    if (pathname.startsWith('/api/admin')) {
        return NextResponse.json({ error: '原 Cloudflare 内容后台已停用，请使用 Sanity Studio。' }, { status: 410 })
    }

    if (pathname === '/sitemap.xml') return NextResponse.rewrite(new URL('/api/sitemap', request.url))

    if (
        pathname === '/word-tutorial' ||
        pathname.startsWith('/word-tutorial/') ||
        pathname === '/tutorials/word' ||
        pathname.startsWith('/tutorials/word/')
    ) {
        return NextResponse.redirect(
            new URL('/tutorials/word-software-complete-guide', request.url),
            308
        )
    }

    if (
        pathname === '/' ||
        pathname === '/tyler-home.html' ||
        pathname === '/index.html' ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/_next') ||
        pathname.startsWith('/uploads') ||
        pathname.startsWith('/tutorials/') ||
        pathname.startsWith('/pages/') ||
        pathname === '/favicon.ico'
        || pathname === '/robots.txt'
    ) {
        return NextResponse.next()
    }

    return NextResponse.rewrite(new URL('/', request.url))
}

export const config = {
    matcher: ['/:path*'],
}
