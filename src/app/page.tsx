// @ts-nocheck
import Link from 'next/link'

export const runtime = 'edge'

export default async function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-900">ZZGCopilot</Link>
          <nav className="flex items-center gap-6">
            <Link href="/tutorials" className="text-sm text-gray-600 hover:text-gray-900">教程</Link>
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">登录</Link>
            <Link href="/register" className="text-sm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">注册</Link>
          </nav>
        </div>
      </header>

      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">学习编程，从这里开始</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">高质量的编程教程、技术文章和实用指南</p>
          <div className="flex gap-4 justify-center">
            <Link href="/tutorials" className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium">浏览教程</Link>
            <Link href="/register" className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-gray-400 transition font-medium">免费注册</Link>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">最新教程</h2>
          <PostsGrid />
        </div>
      </section>

      <footer className="border-t py-8 mt-16">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-400">
          <p>© {new Date().getFullYear()} ZZGCopilot. 保留所有权利。</p>
        </div>
      </footer>
    </div>
  )
}

async function PostsGrid() {
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
        <p className="text-lg mb-4">暂无教程</p>
        <Link href="/admin" className="text-blue-600 hover:underline text-sm">管理员发布第一篇文章</Link>
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
                <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-full">{post.category_name}</span>
              )}
              <h3 className="font-semibold text-gray-900 mt-3 mb-2 group-hover:text-blue-600 transition">{post.title}</h3>
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
