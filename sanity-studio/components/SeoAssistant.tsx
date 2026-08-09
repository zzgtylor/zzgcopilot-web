import { Badge, Box, Card, Flex, Heading, Stack, Text } from '@sanity/ui'
import { useFormValue } from 'sanity'

function Check({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return <Flex align="center" gap={2}><Badge tone={ok ? 'positive' : 'caution'}>{ok ? '通过' : '改进'}</Badge><Text size={1}>{children}</Text></Flex>
}

export function SeoAssistant() {
  const title = String(useFormValue(['metaTitle']) || useFormValue(['title']) || '')
  const description = String(useFormValue(['metaDescription']) || useFormValue(['excerpt']) || '')
  const keyword = String(useFormValue(['focusKeyword']) || '')
  const slug = (useFormValue(['slug', 'current']) as string | undefined) || ''
  const hasImage = Boolean(useFormValue(['ogImage']) || useFormValue(['coverImage', 'asset']))
  const score = [title.length >= 20 && title.length <= 60, description.length >= 70 && description.length <= 160, Boolean(slug), hasImage, Boolean(keyword) && title.toLowerCase().includes(keyword.toLowerCase())].filter(Boolean).length * 20

  return <Box padding={4}><Stack space={4}>
    <Heading size={2}>SEO 检查：{score}/100</Heading>
    <Card padding={4} radius={2} border><Stack space={3}>
      <Check ok={title.length >= 20 && title.length <= 60}>标题 {title.length} 字符（建议 20–60）</Check>
      <Check ok={description.length >= 70 && description.length <= 160}>描述 {description.length} 字符（建议 70–160）</Check>
      <Check ok={Boolean(slug)}>已设置固定链接 Slug</Check>
      <Check ok={hasImage}>已设置封面或社交分享图</Check>
      <Check ok={Boolean(keyword) && title.toLowerCase().includes(keyword.toLowerCase())}>焦点关键词出现在标题中</Check>
    </Stack></Card>
    <Card padding={4} radius={2} tone="primary"><Stack space={2}><Text weight="semibold">Google 搜索预览</Text><Text size={2}>{title || '请填写标题'}</Text><Text size={1} muted>zzgcopilot.com/{slug || '页面链接'}</Text><Text size={1}>{description || '请填写 SEO 描述。'}</Text></Stack></Card>
  </Stack></Box>
}
