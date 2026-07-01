import Link from 'next/link'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const session = await auth()
    if (!session?.user) redirect('/login?callbackUrl=/admin')
    const role = (session.user as any).role
    if (role !== 'admin' && role !== 'editor') redirect('/')

  return (
        <div className="min-h-screen bg-gray-50">
              <aside className="fixed top-0 left-0 h-full w-56 bg-gray-900 text-white flex flex-col z-20">
                      <div className="px-6 py-5 border-b border-gray-700">
                                <Link href="/" className="text-lg font-bold text-white">ZZGCopilot</Link>
                                <p className="text-xs text-gray-400 mt-0.5">管理后台</p>
                      </div>
                      <nav className="flex-1 px-3 py-4 space-y-1">
                                <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white text-sm transition">
                                            <span>📊</span> 仪表盘
                                </Link>
                                <Link href="/admin/site-settings" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white text-sm transition">
                                            <span>🎛️</span> 站点设置
                                </Link>
                                <Link href="/admin/posts" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white text-sm transition">
                                            <span>📝</span> 文章管理
                                </Link>
                                <Link href="/admin/posts/new" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white text-sm transition">
                                            <span>✏️</span> 发布文章
                                </Link>
                                <Link href="/admin/media" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white text-sm transition">
                                  <span>🖼️</span> 媒体库
                                </Link>
                        {role === 'admin' && (
                      <Link href="/admin/users" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white text-sm transition">
                                    <span>👥</span> 用户管理
                      </Link>
                                )}
                      </nav>
                      <div className="px-4 py-4 border-t border-gray-700">
                                <p className="text-xs text-gray-400 truncate">{session.user.email}</p>
                                <form action="/api/auth/signout" method="POST">
                                <button type="submit" className="mt-2 text-xs text-gray-400 hover:text-white transition">退出登录</button>
                              </form>
                      </div>
              </aside>
              <main className="ml-56 min-h-screen">
                      {children}
              </main>
      </div>
  )
}
