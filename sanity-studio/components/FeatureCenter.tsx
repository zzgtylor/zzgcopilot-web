import { Box, Button, Card, Grid, Heading, Stack, Text } from '@sanity/ui'

const features = [
  ['可视化区块编辑', '页面、首页和文章已支持区块、实时预览与拖放排序。', '/structure'],
  ['SEO 助手', '文章和页面编辑器内提供评分、搜索预览、Canonical、Schema 和 noindex。', '/structure'],
  ['媒体库与图片', '集中管理图片，支持热点裁切、说明、替代文字和 CDN 优化。', '/media'],
  ['评论与表单', 'D1 已准备审核队列和表单收件箱；在站点设置中启用。', 'https://zzgcopilot.com/admin/engagement'],
  ['访问统计', 'D1 隐私友好日统计已准备；在站点设置中启用。', 'https://zzgcopilot.com/admin/engagement'],
  ['会员与付费内容', '会员和 Stripe 数据结构已准备；配置邮件与 Stripe 密钥后启用。', 'https://zzgcopilot.com/admin/engagement'],
  ['网址重定向', '在内容结构中维护旧网址到新网址的 307/308 跳转。', '/structure'],
  ['发布工作流', '草稿、审核、批准、定时发布、自动下线和版本历史。', '/structure'],
]

export function FeatureCenter() {
  return <Box padding={5}><Stack space={5}><Heading size={3}>网站功能中心</Heading><Text muted>内容、设计、SEO、互动和商业化集中管理。功能开关位于“站点与首页设置”。</Text><Grid columns={[1, 1, 2]} gap={4}>{features.map(([title, description, href]) => <Card key={title} padding={4} radius={3} border><Stack space={3}><Heading size={1}>{title}</Heading><Text size={1}>{description}</Text><Button as="a" href={href} target={href.startsWith('http') ? '_blank' : undefined} text="打开" mode="ghost" tone="primary" /></Stack></Card>)}</Grid></Stack></Box>
}
