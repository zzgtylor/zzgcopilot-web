// @ts-nocheck
import Link from 'next/link'
import { getSiteSettings } from '@/lib/site-settings'
import { getHomeBlocks } from '@/lib/home-blocks'

const heroToneClasses = {
  blue: 'bg-blue-50',
  emerald: 'bg-emerald-50',
  slate: 'bg-slate-50',
  rose: 'bg-rose-50',
}

export default async function HomePage() {
  const settings = await getSiteSettings()
  const blocks = await getHomeBlocks()
  const themeStyle = { backgroundColor: settings.themeColor }
  const themeTextStyle = { color: settings.themeColor }
  const showRegisterCta = settings.showRegisterCta === 'true'

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b sticky top-0 bg-white z-10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg" style={themeTextStyle}>{settings.siteName}</Link>
          <nav className="flex items-center gap-6">
            <Link href="/tutorials" className="text-sm text-gray-600 hover:text-gray-900">{settings.navTutorialsLabel}</Link>
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">{settings.navLoginLabel}</Link>
            {showRegisterCta && (
              <Link href="/register" className="text-sm px-4 py-1.5 rounded-lg text-white transition" style={themeStyle}>
                {settings.navRegisterLabel}
              </Link>
            )}
          </nav>
        </div>
      </header>

      {blocks.filter((b) => b.visible).map((block) => (
        <HomeBlockRenderer
          key={block.id}
          block={block}
          settings={settings}
          themeStyle={themeStyle}
          themeTextStyle={themeTextStyle}
          showRegisterCta={showRegisterCta}
        />
      ))}

      <footer className="border-t py-8 mt-16">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-400">
          {settings.footerText}
        </div>
      </footer>
    </div>
  )
}

function HomeBlockRenderer({ block, settings, themeStyle, themeTextStyle, showRegisterCta }: any) {
  switch (block.type) {
    case 'hero':
      return (
        <section className={`${heroToneClasses[settings.heroTone]} py-20`}>
          <div className="max-w-6xl mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">{settings.heroTitle}</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">{settings.heroSubtitle}</p>
            <div className="flex gap-4 justify-center">
              <Link href={settings.primaryCtaHref} className="px-8 py-3 text-white rounded-xl transition font-medium" style={themeStyle}>
                {settings.primaryCtaLabel}
              </Link>
              {showRegisterCta && (
                <Link href={settings.secondaryCtaHref} className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-gray-400 transition font-medium">
                  {settings.secondaryCtaLabel}
                </Link>
              )}
            </div>
          </div>
        </section>
      )
    case 'latestPosts':
      return (
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">{settings.latestTitle}</h2>
            <PostsGrid settings={settings} themeTextStyle={themeTextStyle} />
          </div>
        </section>
      )
    case 'richText':
      return (
        <section className="py-16 border-t">
          <div className="max-w-3xl mx-auto px-4">
            {block.title && <h2 className="text-2xl font-bold text-gray-900 mb-4">{block.title}</h2>}
            {block.body && <p className="text-gray-600 leading-relaxed whitespace-pre-line">{block.body}</p>}
          </div>
        </section>
      )
    case 'cta':
      return (
        <section className="py-16" style={{ backgroundColor: `${settings.themeColor}10` }}>
          <div className="max-w-3xl mx-auto px-4 text-center">
            {block.ctaTitle && <h2 className="text-3xl font-bold text-gray-900 mb-3">{block.ctaTitle}</h2>}
            {block.ctaSubtitle && <p className="text-gray-600 mb-6">{block.ctaSubtitle}</p>}
            {block.ctaButtonLabel && (
              <Link href={block.ctaButtonHref || '#'} className="inline-block px-8 py-3 text-white rounded-xl font-medium" style={themeStyle}>
                {block.ctaButtonLabel}
              </Link>
            )}
          </div>
        </section>
      )
    default:
      return null
  }
}

async function PostsGrid({ settings, themeTextStyle }: any) {
  let posts: any[] = []
  try {
    const { getDb } = await import('@/lib/cloudflare-db')
    const db = await getDb()
    if (db) {
      const result = await db.prepare(
        'SELECT id, title, slug, excerpt, cover_image, view_count, reading_time, published_at, created_at FROM posts WHERE status = \'published\' ORDER BY published_at DESC, created_at DESC LIMIT 6'
      ).all()
      posts = result.results || []
    }
  } catch {}

  if (!posts.length) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400 mb-4">{settings.emptyTitle}</p>
        <Link href="/admin/posts/new" className="text-sm font-medium" style={themeTextStyle}>
          {settings.emptyActionLabel} →
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post) => (
        <Link key={post.id} href={`/tutorials/${post.slug}`} className="group block rounded-2xl border hover:border-gray-300 overflow-hidden transition">
          {post.cover_image && (
            <div className="aspect-video overflow-hidden bg-gray-100">
              <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
            </div>
          )}
          <div className="p-5">
            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition line-clamp-2">{post.title}</h3>
            {post.excerpt && <p className="text-sm text-gray-500 mt-2 line-clamp-2">{post.excerpt}</p>}
            <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
              <span>{post.view_count ?? 0} 次阅读</span>
              {post.reading_time > 0 && <span>{post.reading_time} 分钟</span>}
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
    }
