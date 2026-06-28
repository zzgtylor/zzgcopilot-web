// @ts-nocheck
import Link from 'next/link'
import { getSiteSettings } from '@/lib/site-settings'

const heroToneClasses = {
  blue: 'bg-blue-50',
  emerald: 'bg-emerald-50',
  slate: 'bg-slate-100',
  rose: 'bg-rose-50',
}


export default async function HomePage() {
  const settings = await getSiteSettings()
  const themeStyle = { backgroundColor: settings.themeColor }
  const themeTextStyle = { color: settings.themeColor }
  const showRegisterCta = settings.showRegisterCta === 'true'
  const showLatestTutorials = settings.showLatestTutorials === 'true'

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-900">{settings.siteName}</Link>
          <nav className="flex items-center gap-6">
            <Link href="/tutorials" className="text-sm text-gray-600 hover:text-gray-900">{settings.navTutorialsLabel}</Link>
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">{settings.navLoginLabel}</Link>
            {showRegisterCta && (
              <Link href="/register" className="text-sm px-4 py-2 text-white rounded-lg transition" style={themeStyle}>
                {settings.navRegisterLabel}
              </Link>
            )}
          </nav>
        </div>
      </header>

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

      {showLatestTutorials && (
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">{settings.latestTitle}</h2>
            <PostsGrid settings={settings} themeTextStyle={themeTextStyle} />
          </div>
        </section>
      )}

      <footer className="border-t py-8 mt-16">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-400">
          <p>© {new Date().getFullYear()} {settings.footerText}</p>
        </div>
      </footer>
    </div>
  )
}

async function PostsGrid({ settings, themeTextStyle }: any) {
  let posts: any[] = []
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/posts?limit=12`, { next: { revalidate: 60 } })
    if (res.ok) {
      const data = await res.json()
      posts = data.posts || []
    }
  } catch {}

  if (posts.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-lg mb-4">{settings.emptyTitle}</p>
        <Link href="/admin" className="hover:underline text-sm" style={themeTextStyle}>{settings.emptyActionLabel}</Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post: any) => (
        <Link key={post.id} href={`/tutorials/${post.slug}`} className="group">
          <article className="border rounded-2xl overflow-hidden hover:shadow-lg transition">
            {post.cover_image && (
              <img src={post.cover_image} alt={post.title} className="w-full aspect-video object-cover" />
            )}
            <div className="p-5">
              {post.category_name && (
                <span className="text-xs font-medium bg-gray-50 px-2 py-1 rounded-full" style={themeTextStyle}>{post.category_name}</span>
              )}
              <h3 className="font-semibold text-gray-900 mt-3 mb-2 transition">{post.title}</h3>
              {post.excerpt && <p className="text-sm text-gray-500">{post.excerpt}</p>}
              <div className="flex items-center gap-3 mt-4 text-xs text-gray-400">
                <span>{post.author_name}</span>
                <span>·</span>
                <span>{post.view_count} 浏览</span>
              </div>
            </div>
          </article>
        </Link>
      ))}
    </div>
  )
}
