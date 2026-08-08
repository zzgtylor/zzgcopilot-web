import { getCliClient } from 'sanity/cli'

const client = getCliClient({ apiVersion: '2026-08-07' })

await client.patch('site-settings').set({
  homepageBrandName: 'Tyler博客',
  homepageSectionTitle: '最新教程',
  homepageSearchPlaceholder: '搜索教程…',
  homepageCtaLabel: '从零开始学习 →',
  homepageFooterBrand: 'Tyler博客',
  homepageFooterNote: '本站内容独立编写整理，非 Microsoft 官方文档',
}).commit()

console.log('Homepage settings initialized in Sanity.')
