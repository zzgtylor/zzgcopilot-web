import { Box, Button, Card, Flex, Grid, Heading, Stack, Text, useToast } from '@sanity/ui'
import { useClient } from 'sanity'
import { useEffect, useState } from 'react'

type ToggleModule = { field: string; title: string; description: string }

const toggleModules: ToggleModule[] = [
  { field: 'breadcrumbsEnabled', title: '返回首页导航', description: '在文章顶部显示清晰的返回入口。' },
  { field: 'shareButtonsEnabled', title: '文章分享', description: '支持系统分享；不支持时自动复制链接。' },
  { field: 'readingProgressEnabled', title: '阅读进度条', description: '在页面顶部显示读者当前阅读进度。' },
  { field: 'backToTopEnabled', title: '返回顶部', description: '长文章滚动后显示快捷返回按钮。' },
  { field: 'relatedPostsEnabled', title: '相关文章', description: '在正文后自动推荐其他已发布文章。' },
  { field: 'authorBoxEnabled', title: '作者介绍框', description: '在正文后显示文章作者与网站署名。' },
  { field: 'newsletterEnabled', title: '邮件订阅行动区', description: '显示可配置标题、说明和订阅链接。' },
  { field: 'commentsEnabled', title: '文章评论', description: '启用评论提交与后台审核队列。' },
  { field: 'analyticsEnabled', title: '隐私友好统计', description: '记录浏览、搜索和转化等站内事件。' },
]

const configuredModules = [
  ['联系表单', '需要先设置 Cloudflare Turnstile 后再启用。', '/structure/site-settings'],
  ['会员与付费内容', '需要邮件服务、Stripe 密钥和 Webhook，后台不会自动填写密钥。', '/structure/site-settings'],
  ['网址重定向', '集中维护旧网址到新网址的 307/308 跳转。', '/structure'],
  ['媒体库与图片', '集中管理图片、裁切、说明、替代文字和 CDN 资源。', '/media'],
]

export function FeatureCenter() {
  const client = useClient({ apiVersion: '2026-08-09' })
  const toast = useToast()
  const [values, setValues] = useState<Record<string, boolean>>({})
  const [busy, setBusy] = useState('')

  useEffect(() => {
    client.fetch<Record<string, boolean> | null>('*[_id == "site-settings"][0]{breadcrumbsEnabled,shareButtonsEnabled,readingProgressEnabled,backToTopEnabled,relatedPostsEnabled,authorBoxEnabled,newsletterEnabled,commentsEnabled,analyticsEnabled}')
      .then(result => setValues({ breadcrumbsEnabled: result?.breadcrumbsEnabled !== false, ...result }))
      .catch(() => undefined)
  }, [client])

  async function toggle(field: string) {
    const enabled = !values[field]
    setBusy(field)
    try {
      await client.patch('site-settings').setIfMissing({ _type: 'siteSettings' }).set({ [field]: enabled }).commit()
      setValues(current => ({ ...current, [field]: enabled }))
      toast.push({ status: 'success', title: enabled ? '模块已启用' : '模块已停用', description: '前台将在缓存刷新后自动更新，无需重新部署。' })
    } catch (error) {
      toast.push({ status: 'error', title: '操作失败', description: error instanceof Error ? error.message : '请稍后重试' })
    } finally { setBusy('') }
  }

  async function installRecommended() {
    const bundle = { breadcrumbsEnabled: true, shareButtonsEnabled: true, readingProgressEnabled: true, backToTopEnabled: true, relatedPostsEnabled: true, authorBoxEnabled: true }
    setBusy('recommended')
    try {
      await client.patch('site-settings').setIfMissing({ _type: 'siteSettings' }).set(bundle).commit()
      setValues(current => ({ ...current, ...bundle }))
      toast.push({ status: 'success', title: '推荐博客功能包已启用', description: '六个无需密钥的文章模块已经安装并立即生效。' })
    } catch (error) {
      toast.push({ status: 'error', title: '功能包安装失败', description: error instanceof Error ? error.message : '请稍后重试' })
    } finally { setBusy('') }
  }

  return <Box padding={5}><Stack space={6}>
    <Stack space={2}><Heading size={3}>网站功能模块中心</Heading><Text muted>像插件一样启用经过审核的模块。模块只修改固定设置，不下载或执行第三方代码。</Text></Stack>
    <Card padding={4} radius={3} border tone="primary"><Flex align="center" justify="space-between" gap={4} wrap="wrap"><Stack space={2}><Heading size={1}>推荐博客功能包</Heading><Text size={1}>一次启用返回导航、分享、阅读进度、返回顶部、相关文章和作者框。</Text></Stack><Button text="一键安装" tone="primary" loading={busy === 'recommended'} disabled={Boolean(busy)} onClick={installRecommended} /></Flex></Card>
    <Grid columns={[1, 1, 2]} gap={4}>{toggleModules.map(module => {
      const enabled = Boolean(values[module.field])
      return <Card key={module.field} padding={4} radius={3} border tone={enabled ? 'positive' : 'default'}><Stack space={3}><Flex align="center" justify="space-between" gap={3}><Heading size={1}>{module.title}</Heading><Text size={1} weight="semibold" tone={enabled ? 'positive' : 'default'}>{enabled ? '已启用' : '未启用'}</Text></Flex><Text size={1}>{module.description}</Text><Button text={enabled ? '停用模块' : '启用模块'} mode={enabled ? 'ghost' : 'default'} tone={enabled ? 'critical' : 'primary'} loading={busy === module.field} disabled={Boolean(busy)} onClick={() => toggle(module.field)} /></Stack></Card>
    })}</Grid>
    <Stack space={4}><Heading size={2}>需要配置的功能</Heading><Grid columns={[1, 1, 2]} gap={4}>{configuredModules.map(([title, description, href]) => <Card key={title} padding={4} radius={3} border><Stack space={3}><Heading size={1}>{title}</Heading><Text size={1}>{description}</Text><Button as="a" href={href} text="打开设置" mode="ghost" tone="primary" /></Stack></Card>)}</Grid></Stack>
  </Stack></Box>
}
