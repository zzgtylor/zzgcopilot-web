import Link from 'next/link'
import { redirect } from 'next/navigation'
import { canManageAllContent, canUploadMedia, requireAdminRole } from '@/lib/admin-auth'

type NavItem = { href: string; label: string; icon: string; show?: boolean }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const access = await requireAdminRole()
  if (!access.ok) redirect('/login?callbackUrl=/admin')
  const { role, session } = access
  const managesAll = canManageAllContent(role)
  const items: NavItem[] = [
    { href: '/admin', label: '仪表盘', icon: '📊' },
    { href: '/admin/posts', label: '文章管理', icon: '📝' },
    { href: '/admin/posts/new', label: role === 'contributor' ? '撰写投稿' : '发布文章', icon: '✏️' },
    { href: '/admin/comments', label: '评论审核', icon: '💬', show: managesAll },
    { href: '/admin/media', label: '媒体库', icon: '🖼️', show: canUploadMedia(role) },
    { href: '/admin/site-settings', label: '站点设置', icon: '🎛️', show: managesAll },
    { href: '/admin/site-health', label: '站点健康', icon: '🩺', show: managesAll },
    { href: '/admin/categories', label: '分类管理', icon: '🏷️', show: managesAll },
    { href: '/admin/tools', label: '导入与导出', icon: '📦', show: managesAll },
    { href: '/admin/security', label: '账号安全', icon: '🔐' },
    { href: '/admin/users', label: '用户管理', icon: '👥', show: role === 'admin' },
    { href: '/admin/audit', label: '操作日志', icon: '📜', show: role === 'admin' },
  ].filter(item => item.show !== false)

  return <div className="min-h-screen bg-gray-50">
    <aside className="fixed left-0 top-0 z-20 hidden h-full w-56 flex-col bg-gray-900 text-white md:flex">
      <div className="border-b border-gray-700 px-6 py-5"><Link href="/" className="text-lg font-bold text-white">ZZGCopilot</Link><p className="mt-0.5 text-xs text-gray-400">管理后台 · {role}</p></div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">{items.map(item => <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 transition hover:bg-gray-800 hover:text-white"><span>{item.icon}</span>{item.label}</Link>)}</nav>
      <div className="border-t border-gray-700 px-4 py-4"><p className="truncate text-xs text-gray-400">{session.user.email}</p><form action="/api/auth/signout" method="POST"><button type="submit" className="mt-2 text-xs text-gray-400 transition hover:text-white">退出登录</button></form></div>
    </aside>
    <div className="sticky top-0 z-20 border-b bg-gray-900 px-4 py-3 text-white md:hidden"><div className="flex items-center justify-between"><Link href="/admin" className="font-bold">ZZGCopilot 后台</Link><span className="max-w-[45%] truncate text-xs text-gray-300">{session.user.email}</span></div><nav className="mt-3 flex gap-2 overflow-x-auto pb-1 text-xs">{items.map(item => <Link key={item.href} href={item.href} className="whitespace-nowrap rounded bg-gray-800 px-3 py-2">{item.label}</Link>)}</nav></div>
    <main className="min-h-screen md:ml-56">{children}</main>
  </div>
}
