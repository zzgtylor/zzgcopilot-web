import { currentMember } from '@/lib/member-auth'
import { getSanitySiteSettings } from '@/lib/sanity-content'
import { MemberLoginForm } from '@/components/MemberLoginForm'

export const dynamic = 'force-dynamic'

export default async function AccountPage() {
  const [member, settings] = await Promise.all([currentMember(), getSanitySiteSettings()])
  return <main className="mx-auto max-w-xl px-6 py-14"><h1 className="text-3xl font-bold">会员账户</h1>{!settings.membershipEnabled ? <p className="mt-4 rounded bg-amber-50 p-4">会员功能尚未由管理员启用。</p> : member ? <section className="mt-6 rounded-xl border p-6"><p>已登录：{member.email}</p><p className="mt-2">方案：{member.plan}</p><form action="/api/member/logout" method="post"><button className="mt-5 rounded border px-4 py-2">退出登录</button></form></section> : <MemberLoginForm siteKey={settings.turnstileSiteKey}/>}</main>
}
