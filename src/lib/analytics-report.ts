export type MetricRow = { label: string; value: number }
export type TrendRow = { date: string; views: number; visitors: number }
export type AnalyticsReport = {
  range: number
  summary: { views: number; visitors: number; searches: number; conversions: number; members: number; revenueCents: number; currency: string }
  trends: TrendRow[]
  topPages: MetricRow[]
  searches: MetricRow[]
  referrers: MetricRow[]
  countries: MetricRow[]
  devices: MetricRow[]
  events: MetricRow[]
}

export function reportRange(value: string | null): number {
  const range = Number(value || 30)
  return [1, 7, 30, 90, 365].includes(range) ? range : 30
}

async function rows<T>(statement: D1PreparedStatement): Promise<T[]> {
  const result = await statement.all<T>()
  return (result.results || []) as T[]
}

export async function buildAnalyticsReport(db: D1Database, range: number): Promise<AnalyticsReport> {
  const modifier = `-${Math.max(0, range - 1)} days`
  const [summary, trends, topPages, searches, referrers, countries, devices, events] = await Promise.all([
    db.prepare(`SELECT
      (SELECT coalesce(sum(views),0) FROM analytics_daily WHERE event_date>=date('now',?)) AS views,
      (SELECT count(DISTINCT event_date||':'||visitor_hash) FROM analytics_daily_visitors WHERE event_date>=date('now',?)) AS visitors,
      (SELECT count(*) FROM analytics_events WHERE event_date>=date('now',?) AND event_type='search') AS searches,
      (SELECT count(*) FROM analytics_events WHERE event_date>=date('now',?) AND event_type IN ('comment_submit','form_submit','member_register','subscription_started')) AS conversions,
      (SELECT count(*) FROM members WHERE date(created_at)>=date('now',?)) AS members,
      (SELECT coalesce(sum(value_cents),0) FROM analytics_events WHERE event_date>=date('now',?) AND event_type='subscription_started') AS revenueCents,
      (SELECT coalesce(max(currency),'USD') FROM analytics_events WHERE event_date>=date('now',?) AND event_type='subscription_started') AS currency`).bind(modifier, modifier, modifier, modifier, modifier, modifier, modifier).first<{ views: number; visitors: number; searches: number; conversions: number; members: number; revenueCents: number; currency: string }>(),
    rows<TrendRow>(db.prepare(`WITH RECURSIVE dates(date) AS (SELECT date('now',?) UNION ALL SELECT date(date,'+1 day') FROM dates WHERE date<date('now')) SELECT dates.date,coalesce((SELECT sum(views) FROM analytics_daily WHERE event_date=dates.date),0) AS views,coalesce((SELECT count(DISTINCT visitor_hash) FROM analytics_daily_visitors WHERE event_date=dates.date),0) AS visitors FROM dates ORDER BY dates.date`).bind(modifier)),
    rows<MetricRow>(db.prepare(`SELECT path AS label,sum(views) AS value FROM analytics_daily WHERE event_date>=date('now',?) GROUP BY path ORDER BY value DESC LIMIT 10`).bind(modifier)),
    rows<MetricRow>(db.prepare(`SELECT label,count(*) AS value FROM analytics_events WHERE event_date>=date('now',?) AND event_type='search' AND label IS NOT NULL GROUP BY label ORDER BY value DESC LIMIT 10`).bind(modifier)),
    rows<MetricRow>(db.prepare(`SELECT coalesce(referrer_host,'直接访问') AS label,count(*) AS value FROM analytics_events WHERE event_date>=date('now',?) AND event_type='page_view' GROUP BY referrer_host ORDER BY value DESC LIMIT 10`).bind(modifier)),
    rows<MetricRow>(db.prepare(`SELECT coalesce(country,'XX') AS label,count(*) AS value FROM analytics_events WHERE event_date>=date('now',?) AND event_type='page_view' GROUP BY country ORDER BY value DESC LIMIT 10`).bind(modifier)),
    rows<MetricRow>(db.prepare(`SELECT coalesce(device,'unknown') AS label,count(*) AS value FROM analytics_events WHERE event_date>=date('now',?) AND event_type='page_view' GROUP BY device ORDER BY value DESC`).bind(modifier)),
    rows<MetricRow>(db.prepare(`SELECT event_type AS label,count(*) AS value FROM analytics_events WHERE event_date>=date('now',?) GROUP BY event_type ORDER BY value DESC`).bind(modifier)),
  ])
  return { range, summary: summary || { views: 0, visitors: 0, searches: 0, conversions: 0, members: 0, revenueCents: 0, currency: 'USD' }, trends, topPages, searches, referrers, countries, devices, events }
}

export function reportCsv(report: AnalyticsReport): string {
  const escape = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`
  const sections: Array<[string, MetricRow[]]> = [['热门页面', report.topPages], ['搜索词', report.searches], ['来源', report.referrers], ['国家地区', report.countries], ['设备', report.devices], ['事件', report.events]]
  const lines = ['报表,标签,数值']
  for (const [section, data] of sections) for (const row of data) lines.push([escape(section), escape(row.label), row.value].join(','))
  lines.push('', '日期,浏览量,访客（日去重）')
  for (const row of report.trends) lines.push([row.date, row.views, row.visitors].join(','))
  return `\uFEFF${lines.join('\n')}`
}
