import { Box, Button, Card, Flex, Grid, Heading, Stack, Text } from '@sanity/ui'
import { useClient } from 'sanity'
import { useCallback, useEffect, useState } from 'react'

type RemoteStatus = { sanity?: boolean; turnstile?: boolean; stripe?: boolean; memberEmail?: boolean; adminAccess?: boolean }
type PublicSettings = { turnstileSiteKey?: string; newsletterHref?: string; paidContentEnabled?: boolean; membershipEnabled?: boolean; contactFormEnabled?: boolean }
type State = 'connected' | 'partial' | 'missing'

const labels: Record<State, { text: string; tone: 'positive' | 'caution' | 'critical' }> = {
  connected: { text: '已连接', tone: 'positive' },
  partial: { text: '配置不完整', tone: 'caution' },
  missing: { text: '未配置', tone: 'critical' },
}

export function ServiceConnectionCenter() {
  const client = useClient({ apiVersion: '2026-08-09' })
  const [remote, setRemote] = useState<RemoteStatus>({})
  const [settings, setSettings] = useState<PublicSettings>({})
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    setBusy(true)
    setError('')
    try {
      const [response, siteSettings] = await Promise.all([
        fetch('https://zzgcopilot.com/api/integrations/status', { cache: 'no-store' }),
        client.fetch<PublicSettings | null>('*[_id == "site-settings"][0]{turnstileSiteKey,newsletterHref,paidContentEnabled,membershipEnabled,contactFormEnabled}'),
      ])
      if (!response.ok) throw new Error(`网站检查接口返回 ${response.status}`)
      const result = await response.json() as { services?: RemoteStatus }
      setRemote(result.services || {})
      setSettings(siteSettings || {})
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '连接检查失败')
    } finally {
      setBusy(false)
    }
  }, [client])

  useEffect(() => { void refresh() }, [refresh])

  const services: Array<{ title: string; description: string; state: State }> = [
    { title: 'Sanity 内容数据库', description: '文章、页面、媒体、主题和后台配置。', state: remote.sanity ? 'connected' : 'missing' },
    { title: 'Cloudflare Turnstile', description: '保护评论、联系表单和登录请求。', state: remote.turnstile && settings.turnstileSiteKey ? 'connected' : remote.turnstile || settings.turnstileSiteKey ? 'partial' : 'missing' },
    { title: 'Stripe 支付', description: '付费内容和订阅结账。', state: remote.stripe ? 'connected' : settings.paidContentEnabled ? 'partial' : 'missing' },
    { title: '会员邮件', description: 'Resend 登录邮件和会员通知。', state: remote.memberEmail ? 'connected' : settings.membershipEnabled ? 'partial' : 'missing' },
    { title: '邮件订阅链接', description: '连接外部邮件营销表单或订阅页面。', state: settings.newsletterHref ? 'connected' : 'missing' },
    { title: 'Cloudflare Access', description: '保护管理报表和内部管理页面。', state: remote.adminAccess ? 'connected' : 'missing' },
  ]

  return <Box padding={5}><Stack space={6}>
    <Flex align="center" justify="space-between" gap={4} wrap="wrap"><Stack space={2}><Heading size={3}>服务连接</Heading><Text muted>集中检查内容、支付、邮件、防滥用和后台访问配置。这里只显示是否就绪，永远不读取或展示密钥内容。</Text></Stack><Button text="重新检查" tone="primary" loading={busy} disabled={busy} onClick={() => void refresh()} /></Flex>
    {error ? <Card padding={4} radius={3} tone="critical"><Text>检查失败：{error}</Text></Card> : null}
    <Grid columns={[1, 1, 2]} gap={4}>{services.map(service => { const status = labels[service.state]; return <Card key={service.title} padding={4} radius={3} border><Stack space={3}><Flex align="center" justify="space-between" gap={3}><Heading size={1}>{service.title}</Heading><Text size={1} weight="semibold" tone={status.tone}>{status.text}</Text></Flex><Text size={1} muted>{service.description}</Text></Stack></Card> })}</Grid>
    <Card padding={4} radius={3} border><Flex align="center" justify="space-between" gap={4} wrap="wrap"><Stack space={2}><Heading size={1}>配置入口</Heading><Text size={1} muted>公开字段在网站设置中编辑；服务器密钥继续保存在 Cloudflare 环境变量中。</Text></Stack><Flex gap={2} wrap="wrap"><Button as="a" href="/structure/site-settings" text="网站设置" mode="ghost" /><Button as="a" href="https://dash.cloudflare.com/" target="_blank" text="Cloudflare 控制台" tone="primary" /></Flex></Flex></Card>
  </Stack></Box>
}
