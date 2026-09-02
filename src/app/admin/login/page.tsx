export const dynamic = 'force-dynamic'

export default function AdminLoginPage() {
  return <main className="mx-auto max-w-md px-6 py-16"><p className="text-sm text-gray-500">ZZGCopilot 管理员</p><h1 className="mt-2 text-3xl font-bold">登录后台</h1><p className="mt-3 text-sm text-gray-600">请先通过 Vercel 项目访问保护，再输入管理员访问令牌。登录会话有效期为 8 小时。</p><form className="mt-7 space-y-4" action="/api/admin/login" method="post"><label className="block text-sm font-medium" htmlFor="token">管理员访问令牌</label><input id="token" name="token" type="password" required autoComplete="current-password" className="w-full rounded-lg border border-gray-300 px-3 py-2" /><button className="rounded-lg bg-[var(--site-primary)] px-4 py-2 text-white">登录</button></form></main>
}
