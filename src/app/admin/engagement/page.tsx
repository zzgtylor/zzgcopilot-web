import { headers } from 'next/headers'
import { adminEmail } from '@/lib/admin-auth'
import { platformDb } from '@/lib/platform'

export const dynamic = 'force-dynamic'

export default async function EngagementAdmin() {
  const email = adminEmail(await headers())
  if (!email) return <main className="mx-auto max-w-2xl p-10"><h1 className="text-2xl font-bold">访问未授权</h1><p className="mt-3">请通过 Vercel 访问保护，并使用管理员访问令牌登录。</p></main>
  const db = platformDb()
  if (!db) return <main className="p-10">Neon 数据库尚未连接。</main>
  const [comments, forms, members, views] = await Promise.all([
    db.prepare("SELECT count(*) AS count FROM public_comments WHERE status='pending'").first<{ count: number }>(),
    db.prepare("SELECT count(*) AS count FROM form_submissions WHERE status='new'").first<{ count: number }>(),
    db.prepare("SELECT count(*) AS count FROM members WHERE status='active'").first<{ count: number }>(),
    db.prepare("SELECT coalesce(sum(views),0) AS count FROM analytics_daily WHERE event_date >= date('now','-30 days')").first<{ count: number }>(),
  ])
  const cards = [['待审评论', comments?.count || 0], ['新表单', forms?.count || 0], ['有效会员', members?.count || 0], ['近 30 天浏览', views?.count || 0]]
  return <main className="mx-auto max-w-5xl p-8"><h1 className="text-3xl font-bold">互动与运营</h1><p className="mt-2 text-gray-500">已通过 Vercel 管理员认证：{email}</p><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{cards.map(([label, value]) => <section key={label} className="rounded-xl border border-gray-200 bg-white p-5"><p className="text-sm text-gray-500">{label}</p><strong className="mt-2 block text-3xl">{value}</strong></section>)}</div><p className="mt-8 rounded bg-blue-50 p-4 text-sm text-blue-900">评论审核、表单处理、会员管理和付费订阅接口使用 Neon PostgreSQL 保存；页面和接口运行在 Vercel。</p></main>
}
