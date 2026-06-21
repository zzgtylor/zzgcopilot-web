import Link from 'next/link'
import { auth } from '@/auth'

async function getStats() {
    try {
          const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
          const session = await auth()
          if (!session) return null
          const res = await fetch(`${baseUrl}/api/admin/stats`, {
                  headers: { Cookie: `next-auth.session-token=` },
                  cache: 'no-store',
          })
          if (res.ok) return await res.json()
    } catch {}
    return null
}

async function getRecentPosts() {
    try {
          const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
          const res = await fetch(`${baseUrl}/api/admin/posts`, { cache: 'no-store' })
          if (res.ok) {
                  const data = await res.json()
                  return (data.posts || []).slice(0, 5)
          }
    } catch {}
    return []
}

export default async function AdminDashboard() {
    const [stats, posts] = await Promise.all([getStats(), getRecentPosts()])

  return (
        <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                      <div>
                                <h1 className="text-2xl font-bold text-gray-900">仪表盘</h1>h1>
                                <p className="text-gray-500 text-sm mt-1">欢迎回来，管理员</p>p>
                      </div>div>
                      <Link
                                  href="/admin/posts/new"
                                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
                                >
                                + 发布文章
                      </Link>Link>
              </div>div>
        
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
                      <StatCard label="文章总数" value={stats?.posts ?? '—'} icon="📝" color="blue" />
                      <StatCard label="用户总数" value={stats?.users ?? '—'} icon="👥" color="green" />
                      <StatCard label="评论总数" value={stats?.comments ?? '—'} icon="💬" color="purple" />
              </div>div>
        
              <div className="bg-white rounded-2xl border">
                      <div className="flex items-center justify-between px-6 py-4 border-b">
                                <h2 className="font-semibold text-gray-900">最近文章</h2>h2>
                                <Link href="/admin/posts" className="text-sm text-blue-600 hover:underline">查看全部</Link>Link>
                      </div>div>
                {posts.length === 0 ? (
                    <div className="py-16 text-center text-gray-400">
                                <p className="mb-4">还没有文章</p>p>
                                <Link href="/admin/posts/new" className="text-blue-600 hover:underline text-sm">发布第一篇文章</Link>Link>
                    </div>div>
                  ) : (
                    <table className="w-full text-sm">
                                <thead>
                                              <tr className="text-left text-xs text-gray-500 border-b">
                                                              <th className="px-6 py-3 font-medium">标题</th>th>
                                                              <th className="px-6 py-3 font-medium">分类</th>th>
                                                              <th className="px-6 py-3 font-medium">状态</th>th>
                                                              <th className="px-6 py-3 font-medium">浏览</th>th>
                                                              <th className="px-6 py-3 font-medium">创建时间</th>th>
                                              </tr>tr>
                                </thead>thead>
                                <tbody className="divide-y">
                                  {posts.map((post: any) => (
                                      <tr key={post.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-3 font-medium text-gray-900 max-w-xs truncate">{post.title}</td>td>
                                                        <td className="px-6 py-3 text-gray-500">{post.category_name || '—'}</td>td>
                                                        <td className="px-6 py-3">
                                                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                                              post.status === 'published' ? 'bg-green-100 text-green-700' :
                                                              post.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                                                              'bg-gray-100 text-gray-600'
                                      }`}>
                                                                              {post.status === 'published' ? '已发布' : post.status === 'draft' ? '草稿' : '已归档'}
                                                                            </span>span>
                                                        </td>td>
                                                        <td className="px-6 py-3 text-gray-500">{post.view_count}</td>td>
                                                        <td className="px-6 py-3 text-gray-400">{post.created_at?.split('T')[0]}</td>td>
                                      </tr>tr>
                                    ))}
                                </tbody>tbody>
                    </table>table>
                      )}
              </div>div>
        </div>div>
      )
}

function StatCard({ label, value, icon, color }: { label: string; value: any; icon: string; color: string }) {
    const colors: Record<string, string> = {
          blue: 'bg-blue-50 text-blue-700',
          green: 'bg-green-50 text-green-700',
          purple: 'bg-purple-50 text-purple-700',
    }
        return (
              <div className="bg-white rounded-2xl border p-5 flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${colors[color]}`}>
                      {icon}
                    </div>div>
                    <div>
                            <p className="text-2xl font-bold text-gray-900">{value}</p>p>
                            <p className="text-sm text-gray-500">{label}</p>p>
                    </div>div>
              </div>div>
            )
}</div>
