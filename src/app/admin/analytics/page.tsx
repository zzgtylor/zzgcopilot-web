import { headers } from 'next/headers'
import Link from 'next/link'
import { adminEmail } from '@/lib/admin-auth'
import { buildAnalyticsReport, reportRange, type MetricRow } from '@/lib/analytics-report'
import { platformDb } from '@/lib/platform'

export const dynamic = 'force-dynamic'

function Ranking({ title, rows }: { title: string; rows: MetricRow[] }) {
  const max = Math.max(1, ...rows.map(row => Number(row.value)))
  return <section className="rounded-xl border border-gray-200 bg-white p-5"><h2 className="font-bold">{title}</h2><div className="mt-4 space-y-3">{rows.length ? rows.map(row => <div key={row.label}><div className="flex justify-between gap-3 text-sm"><span className="truncate">{row.label}</span><strong>{Number(row.value).toLocaleString()}</strong></div><div className="mt-1 h-2 overflow-hidden rounded bg-gray-100"><div className="h-full rounded bg-[var(--site-primary)]" style={{ width: `${Math.max(3, Number(row.value) / max * 100)}%` }} /></div></div>) : <p className="text-sm text-gray-400">暂无数据</p>}</div></section>
}

export default async function AnalyticsAdmin({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const requestHeaders = await headers(), email = adminEmail(requestHeaders)
  if (!email) return <main className="mx-auto max-w-2xl p-10"><h1 className="text-2xl font-bold">访问未授权</h1><p className="mt-3">请通过 Cloudflare Access 登录管理员邮箱。</p></main>
  const db = platformDb()
  if (!db) return <main className="p-10">D1 尚未连接。</main>
  const range = reportRange((await searchParams).range || null), report = await buildAnalyticsReport(db, range)
  const maxTrend = Math.max(1, ...report.trends.map(row => Number(row.views)))
  const summary = [
    ['浏览量', report.summary.views], ['访客（日去重）', report.summary.visitors], ['搜索次数', report.summary.searches], ['转化事件', report.summary.conversions], ['新会员', report.summary.members], ['订阅收入', `${(report.summary.revenueCents / 100).toFixed(2)} ${report.summary.currency}`],
  ]
  return <main className="min-h-screen bg-gray-50 px-5 py-8 text-gray-900"><div className="mx-auto max-w-7xl"><header className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm text-gray-500">管理员：{email}</p><h1 className="mt-1 text-3xl font-bold">网站数据报表</h1></div><div className="flex flex-wrap gap-2">{[1, 7, 30, 90, 365].map(value => <Link key={value} href={`/admin/analytics?range=${value}`} className={value === range ? 'rounded bg-[var(--site-primary)] px-3 py-2 text-sm text-white' : 'rounded border bg-white px-3 py-2 text-sm'}>{value === 1 ? '今天' : `${value} 天`}</Link>)}<a href={`/api/reports/analytics.csv?range=${range}`} className="rounded border bg-white px-3 py-2 text-sm">导出 CSV</a></div></header>
    <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">{summary.map(([label, value]) => <section key={label} className="rounded-xl border border-gray-200 bg-white p-4"><p className="text-sm text-gray-500">{label}</p><strong className="mt-2 block text-2xl">{typeof value === 'number' ? value.toLocaleString() : value}</strong></section>)}</div>
    <section className="mt-6 rounded-xl border border-gray-200 bg-white p-5"><h2 className="font-bold">浏览趋势</h2><div className="mt-5 flex h-48 items-end gap-1 overflow-x-auto" aria-label="每日浏览量趋势">{report.trends.map(row => <div key={row.date} className="group flex min-w-2 flex-1 flex-col items-center justify-end" title={`${row.date}: ${row.views} 浏览 / ${row.visitors} 访客`}><div className="w-full min-w-2 rounded-t bg-[var(--site-primary)]" style={{ height: `${Math.max(row.views ? 4 : 1, row.views / maxTrend * 100)}%` }} /><span className="mt-2 hidden text-[10px] text-gray-400 lg:block">{row.date.slice(5)}</span></div>)}</div></section>
    <div className="mt-6 grid gap-5 lg:grid-cols-2"><Ranking title="热门页面" rows={report.topPages}/><Ranking title="搜索关键词" rows={report.searches}/><Ranking title="访问来源" rows={report.referrers}/><Ranking title="国家和地区" rows={report.countries}/><Ranking title="设备类型" rows={report.devices}/><Ranking title="业务事件" rows={report.events}/></div>
    <p className="mt-6 rounded-lg bg-blue-50 p-4 text-sm text-blue-900">报表使用每日单向哈希进行访客去重，不保存原始 IP。Cloudflare Web Analytics 可在 Cloudflare 控制台查看 Core Web Vitals、浏览器和操作系统等边缘指标。</p></div></main>
}
