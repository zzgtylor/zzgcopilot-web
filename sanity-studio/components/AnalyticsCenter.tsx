import { Box, Button, Card, Heading, Stack, Text } from '@sanity/ui'

export function AnalyticsCenter() {
  const analyticsUrl = 'https://zzgcopilot-web-52s.pages.dev/admin/analytics'
  return <Box padding={4}><Stack space={4}><Heading size={3}>网站数据报表</Heading><Text muted>浏览量、热门内容、搜索词、来源、地区、设备、会员、转化和订阅收入。报表由 Cloudflare Access 保护。</Text><Card border radius={3} overflow="hidden"><iframe title="ZZGCopilot 数据报表" src={analyticsUrl} style={{ width: '100%', height: '72vh', border: 0, background: '#f9fafb' }} /></Card><Button as="a" href={analyticsUrl} target="_blank" text="在新窗口打开完整报表" tone="primary" /></Stack></Box>
}
