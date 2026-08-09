import { headers } from 'next/headers'
import { platformDb, platformValue } from '@/lib/platform'

export const dynamic = 'force-dynamic'

export default async function EngagementAdmin() {
  const email = (await headers()).get('cf-access-authenticated-user-email') || ''
  const allowed = platformValue('ADMIN_ALLOWED_EMAILS').split(',').map(value => value.trim().toLowerCase()).filter(Boolean)
  if (!email || !allowed.includes(email.toLowerCase())) return <main className="mx-auto max-w-2xl p-10"><h1 className="text-2xl font-bold">访问未授权</h1><p className="mt-3">请先用 Cloudflare Access 保护此路径，并配置 ADMIN_ALLOWED_EMAILS。</p></main>
  const db = platformDb()
  if (!db) return <main className="p-10">D1 尚未连接。</main>
  const [comments, forms, members, views] = await Promise.all([
    db.prepare("SELECT count(*) AS count FROM public_comments WHERE status='pending'").first<{ count: number }>(),
    db.prepare("SELECT count(*) AS count FROM form_submissions WHERE status='new'").first<{ count: number }>(),
    db.prepare("SELECT count(*) AS count FROM members WHERE status='active'").first<{ count: number }>(),
    db.prepare("SELECT coalesce(sum(views),0) AS count FROM analytics_daily WHERE event_date >= date('now','-30 days')").first<{ count: number }>(),
  ])
  const cards = [['待审评论', comments?.count || 0], ['新表单', forms?.count || 0], ['有效会员', members?.count || 0], ['近 30 天浏览', views?.count || 0]]
  return <main className="mx-auto max-w-5xl p-8"><h1 className="text-3xl font-bold">互动与运营</h1><p className="mt-2 text-gray-500">已通过 Cloudflare Access 验证：{email}</p><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{cards.map(([label, value]) => <section key={label} className="rounded-xl border border-gray-200 bg-white p-5"><p className="text-sm text-gray-500">{label}</p><strong className="mt-2 block text-3xl">{value}</strong></section>)}</div><p className="mt-8 rounded bg-blue-50 p-4 text-sm text-blue-900">评论审核、表单处理、会员管理和付费订阅接口已使用独立 D1 表保存；正式启用前还需在 Cloudflare 配置 Access、Turnstile、邮件和 Stripe 密钥。</p></main>
}
