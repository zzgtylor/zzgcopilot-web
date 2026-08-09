import { NextResponse, type NextRequest } from 'next/server'

const SANITY_STUDIO_URL = 'https://zzgcopilot.sanity.studio/'

async function managedRedirect(pathname: string): Promise<{ targetPath: string; statusCode: number } | null> {
    const projectId = process.env.SANITY_PROJECT_ID || 'o9d9rhdt'
    const dataset = process.env.SANITY_DATASET || 'production'
    const url = new URL(`https://${projectId}.api.sanity.io/v2026-08-07/data/query/${dataset}`)
    url.searchParams.set('query', '*[_type == "redirect" && enabled == true && sourcePath == $path][0]{targetPath,statusCode}')
    url.searchParams.set('$path', JSON.stringify(pathname))
    try {
        const response = await fetch(url)
        if (!response.ok) return null
        return (await response.json() as { result?: { targetPath: string; statusCode: number } }).result || null
    } catch { return null }
}

export default async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    if ((pathname.startsWith('/admin') && pathname !== '/admin/engagement') || pathname === '/login' || pathname === '/register') {
        return NextResponse.redirect(SANITY_STUDIO_URL, 307)
    }

    if (pathname.startsWith('/api/admin')) {
        return NextResponse.json({ error: '原 Cloudflare 内容后台已停用，请使用 Sanity Studio。' }, { status: 410 })
    }

    if (pathname === '/sitemap.xml') return NextResponse.rewrite(new URL('/api/sitemap', request.url))

    const redirect = await managedRedirect(pathname)
    if (redirect?.targetPath) return NextResponse.redirect(new URL(redirect.targetPath, request.url), redirect.statusCode === 307 ? 307 : 308)

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
        pathname === '/admin/engagement' ||
        pathname.startsWith('/_next') ||
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
