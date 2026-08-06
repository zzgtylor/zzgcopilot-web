import Link from 'next/link' 
import { redirect } from 'next/navigation'
import { requireAdminRole } from '@/lib/admin-auth'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const access = await requireAdminRole()
    if (!access.ok) redirect('/login?callbackUrl=/admin')
    const session = access.session
    const role = access.role

  return (
        <div className="min-h-screen bg-gray-50">
              <aside className="fixed left-0 top-0 z-20 hidden h-full w-56 flex-col bg-gray-900 text-white md:flex">
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
                                <Link href="/admin/tools" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white text-sm transition">
                                  <span>📦</span> 导入与导出
                                </Link>
                                <Link href="/admin/security" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white text-sm transition">
                                  <span>🔐</span> 账号安全
                                </Link>
                        {role === 'admin' && (
                          <Link href="/admin/categories" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white text-sm transition">
                                    <span>🏷️</span> 分类管理
                          </Link>
                        )}
                        {role === 'admin' && (
                      <Link href="/admin/users" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white text-sm transition">
                                    <span>👥</span> 用户管理
                      </Link>
                                )}
                        {role === 'admin' && (
                          <Link href="/admin/audit" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white text-sm transition">
                            <span>📜</span> 操作日志
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
              <div className="sticky top-0 z-20 border-b bg-gray-900 px-4 py-3 text-white md:hidden"><div className="flex items-center justify-between"><Link href="/admin" className="font-bold">ZZGCopilot 后台</Link><span className="max-w-[45%] truncate text-xs text-gray-300">{session.user.email}</span></div><nav className="mt-3 flex gap-2 overflow-x-auto pb-1 text-xs"><Link href="/admin" className="whitespace-nowrap rounded bg-gray-800 px-3 py-2">仪表盘</Link><Link href="/admin/posts" className="whitespace-nowrap rounded bg-gray-800 px-3 py-2">文章</Link><Link href="/admin/posts/new" className="whitespace-nowrap rounded bg-gray-800 px-3 py-2">写文章</Link><Link href="/admin/media" className="whitespace-nowrap rounded bg-gray-800 px-3 py-2">媒体</Link><Link href="/admin/tools" className="whitespace-nowrap rounded bg-gray-800 px-3 py-2">导入导出</Link><Link href="/admin/security" className="whitespace-nowrap rounded bg-gray-800 px-3 py-2">安全</Link>{role === 'admin' && <Link href="/admin/users" className="whitespace-nowrap rounded bg-gray-800 px-3 py-2">用户</Link>}</nav></div>
              <main className="min-h-screen md:ml-56">
                      {children}
              </main>
      </div>
  )
}
