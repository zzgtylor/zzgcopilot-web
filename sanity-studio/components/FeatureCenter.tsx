import { Box, Button, Card, Flex, Grid, Heading, Stack, Text, useToast } from '@sanity/ui'
import { useClient, useCurrentUser } from 'sanity'
import { useEffect, useMemo, useState } from 'react'

type PluginStatus = 'uninstalled' | 'inactive' | 'active'
type Installation = { _key: string; _type: 'pluginInstallation'; pluginId: string; version: string; status: 'inactive' | 'active'; installedAt: string; updatedAt: string }
type PluginSpec = { id: string; field: string; title: string; description: string; category: string; version: string; permissions: string[]; configKey?: string }

const plugins: PluginSpec[] = [
  { id: 'breadcrumbs', field: 'breadcrumbsEnabled', title: '返回首页导航', description: '在文章顶部显示清晰的返回入口。', category: '导航', version: '1.1.0', permissions: ['读取站点设置'] },
  { id: 'sharing', field: 'shareButtonsEnabled', title: '文章分享', description: '支持系统分享；不支持时自动复制链接。', category: '互动', version: '1.2.0', permissions: ['读取当前网址'] },
  { id: 'reading-progress', field: 'readingProgressEnabled', title: '阅读进度条', description: '在页面顶部显示当前阅读进度。', category: '阅读', version: '1.0.0', permissions: ['读取滚动位置'] },
  { id: 'back-to-top', field: 'backToTopEnabled', title: '返回顶部', description: '长文章滚动后显示快捷返回按钮。', category: '导航', version: '1.0.0', permissions: ['读取滚动位置'] },
  { id: 'related-posts', field: 'relatedPostsEnabled', title: '相关文章', description: '在正文后推荐其他已发布文章。', category: '内容', version: '1.1.0', permissions: ['读取已发布文章'] },
  { id: 'author-box', field: 'authorBoxEnabled', title: '作者介绍框', description: '在正文后显示作者和网站署名。', category: '内容', version: '1.0.0', permissions: ['读取作者名称'] },
  { id: 'newsletter', field: 'newsletterEnabled', title: '邮件订阅行动区', description: '显示可配置标题、说明和订阅链接。', category: '营销', version: '1.1.0', permissions: ['读取订阅链接'], configKey: 'newsletterHref' },
  { id: 'comments', field: 'commentsEnabled', title: '文章评论', description: '启用评论提交和后台审核队列。', category: '互动', version: '1.2.0', permissions: ['写入评论数据'] },
  { id: 'analytics', field: 'analyticsEnabled', title: '隐私友好统计', description: '记录浏览、搜索和转化等站内事件。', category: '统计', version: '1.1.0', permissions: ['写入匿名统计'] },
]

const categories = ['全部', ...Array.from(new Set(plugins.map(plugin => plugin.category)))]
const key = () => crypto.randomUUID().replace(/-/g, '').slice(0, 12)
const inputStyle = { border: '1px solid #d9d9df', borderRadius: 6, padding: '9px 10px', font: 'inherit', background: 'white' }

export function FeatureCenter() {
  const client = useClient({ apiVersion: '2026-08-09' })
  const currentUser = useCurrentUser()
  const toast = useToast()
  const [values, setValues] = useState<Record<string, unknown>>({})
  const [installations, setInstallations] = useState<Installation[]>([])
  const [busy, setBusy] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('全部')
  const roles = currentUser?.roles?.map(role => (role.name || '').toLowerCase()) || []
  const canManage = roles.some(role => ['administrator', 'editor', 'developer'].includes(role))

  useEffect(() => {
    client.fetch<Record<string, unknown> | null>('*[_id == "site-settings"][0]{breadcrumbsEnabled,shareButtonsEnabled,readingProgressEnabled,backToTopEnabled,relatedPostsEnabled,authorBoxEnabled,newsletterEnabled,newsletterHref,commentsEnabled,analyticsEnabled,pluginInstallations}')
      .then(result => { const data = result || {}; setValues({ breadcrumbsEnabled: data.breadcrumbsEnabled !== false, ...data }); setInstallations(Array.isArray(data.pluginInstallations) ? data.pluginInstallations as Installation[] : []) })
      .catch(() => undefined)
  }, [client])

  const visiblePlugins = useMemo(() => plugins.filter(plugin => (category === '全部' || plugin.category === category) && `${plugin.title}${plugin.description}`.toLowerCase().includes(search.trim().toLowerCase())), [category, search])
  const installationFor = (plugin: PluginSpec) => installations.find(item => item.pluginId === plugin.id)
  const statusFor = (plugin: PluginSpec): PluginStatus => installationFor(plugin)?.status || (values[plugin.field] === true ? 'active' : 'uninstalled')
  const configReady = (plugin: PluginSpec) => !plugin.configKey || Boolean(values[plugin.configKey])

  async function audit(plugin: PluginSpec, action: string, previousStatus: PluginStatus, nextStatus: PluginStatus) {
    await client.create({ _type: 'pluginAudit', pluginId: plugin.id, pluginTitle: plugin.title, action, previousStatus, nextStatus, version: plugin.version, actorName: currentUser?.name || currentUser?.email || '管理员', occurredAt: new Date().toISOString() })
  }

  async function change(plugin: PluginSpec, nextStatus: PluginStatus, action: string) {
    if (!canManage) return
    if (nextStatus === 'active' && !configReady(plugin)) {
      toast.push({ status: 'warning', title: '请先完成插件配置', description: '该插件缺少必要设置，已阻止启用。' })
      return
    }
    const previousStatus = statusFor(plugin)
    setBusy(plugin.id)
    try {
      const now = new Date().toISOString()
      const existing = installationFor(plugin)
      const nextInstallations = nextStatus === 'uninstalled'
        ? installations.filter(item => item.pluginId !== plugin.id)
        : [...installations.filter(item => item.pluginId !== plugin.id), { _key: existing?._key || key(), _type: 'pluginInstallation' as const, pluginId: plugin.id, version: plugin.version, status: nextStatus, installedAt: existing?.installedAt || now, updatedAt: now }]
      await client.patch('site-settings').setIfMissing({ _type: 'siteSettings' }).set({ pluginInstallations: nextInstallations, [plugin.field]: nextStatus === 'active' }).commit()
      await audit(plugin, action, previousStatus, nextStatus)
      setInstallations(nextInstallations)
      setValues(current => ({ ...current, [plugin.field]: nextStatus === 'active' }))
      toast.push({ status: 'success', title: `${plugin.title}：${action}完成`, description: nextStatus === 'active' ? '插件已启用并将在前台生效。' : nextStatus === 'inactive' ? '插件保留配置但已停止运行。' : '插件已卸载，相关内容数据仍保留。' })
    } catch (error) { toast.push({ status: 'error', title: '插件操作失败', description: error instanceof Error ? error.message : '请稍后重试' }) }
    finally { setBusy('') }
  }

  async function rollbackLast() {
    if (!canManage) return
    setBusy('rollback')
    try {
      const latest = await client.fetch<{ pluginId?: string; previousStatus?: PluginStatus } | null>('*[_type == "pluginAudit"] | order(occurredAt desc)[0]{pluginId,previousStatus}')
      const plugin = plugins.find(item => item.id === latest?.pluginId)
      if (!plugin || !latest?.previousStatus) throw new Error('没有可回滚的插件操作')
      setBusy('')
      await change(plugin, latest.previousStatus, '回滚')
    } catch (error) { toast.push({ status: 'error', title: '回滚失败', description: error instanceof Error ? error.message : '没有可回滚操作' }); setBusy('') }
  }

  async function installRecommended() {
    if (!canManage) return
    const selected = plugins.filter(plugin => ['breadcrumbs', 'sharing', 'reading-progress', 'back-to-top', 'related-posts', 'author-box'].includes(plugin.id))
    setBusy('recommended')
    try {
      const now = new Date().toISOString()
      let nextInstallations = [...installations]
      const settings: Record<string, unknown> = {}
      for (const plugin of selected) {
        const existing = nextInstallations.find(item => item.pluginId === plugin.id)
        nextInstallations = [...nextInstallations.filter(item => item.pluginId !== plugin.id), { _key: existing?._key || key(), _type: 'pluginInstallation', pluginId: plugin.id, version: plugin.version, status: 'active', installedAt: existing?.installedAt || now, updatedAt: now }]
        settings[plugin.field] = true
      }
      await client.patch('site-settings').setIfMissing({ _type: 'siteSettings' }).set({ ...settings, pluginInstallations: nextInstallations }).commit()
      await Promise.all(selected.map(plugin => audit(plugin, '安装并启用', statusFor(plugin), 'active')))
      setInstallations(nextInstallations)
      setValues(current => ({ ...current, ...settings }))
      toast.push({ status: 'success', title: '推荐博客插件包已安装', description: '六个安全插件已安装、启用并记录操作日志。' })
    } catch (error) { toast.push({ status: 'error', title: '插件包安装失败', description: error instanceof Error ? error.message : '请稍后重试' }) }
    finally { setBusy('') }
  }

  return <Box padding={5}><Stack space={6}>
    <Flex align="center" justify="space-between" gap={4} wrap="wrap"><Stack space={2}><Heading size={3}>受控插件市场</Heading><Text muted>安装经过审核的插件，支持版本、权限、停用、卸载、日志和回滚，不执行第三方任意代码。</Text></Stack><Flex gap={2}><Button as="a" href="/structure/pluginAudit" text="操作日志" mode="ghost" /><Button text="回滚上次操作" tone="caution" loading={busy === 'rollback'} disabled={!canManage || Boolean(busy)} onClick={rollbackLast} /></Flex></Flex>
    {!canManage ? <Card padding={4} radius={3} tone="caution"><Text>当前账户可以浏览插件，但只有管理员、编辑或开发者角色可以安装和更改插件。</Text></Card> : null}
    <Card padding={4} radius={3} border tone="primary"><Flex align="center" justify="space-between" gap={4} wrap="wrap"><Stack space={2}><Heading size={1}>推荐博客功能包</Heading><Text size={1}>一次安装并启用导航、分享、阅读进度、返回顶部、相关文章和作者框。</Text></Stack><Button text="一键安装并启用" tone="primary" loading={busy === 'recommended'} disabled={!canManage || Boolean(busy)} onClick={installRecommended} /></Flex></Card>
    <Flex gap={2} wrap="wrap"><input type="search" placeholder="搜索插件…" value={search} onChange={event => setSearch(event.currentTarget.value)} style={{ ...inputStyle, minWidth: 240 }} /><select value={category} onChange={event => setCategory(event.currentTarget.value)} style={inputStyle}>{categories.map(item => <option key={item}>{item}</option>)}</select></Flex>
    <Grid columns={[1, 1, 2]} gap={4}>{visiblePlugins.map(plugin => {
      const status = statusFor(plugin)
      const installation = installationFor(plugin)
      const needsUpdate = Boolean(installation && installation.version !== plugin.version)
      const ready = configReady(plugin)
      return <Card key={plugin.id} padding={4} radius={3} border tone={status === 'active' ? 'positive' : 'default'}><Stack space={3}><Flex align="center" justify="space-between" gap={3}><Stack space={1}><Heading size={1}>{plugin.title}</Heading><Text size={1} muted>{plugin.category} · v{plugin.version}</Text></Stack><Text size={1} weight="semibold" tone={status === 'active' ? 'positive' : status === 'inactive' ? 'caution' : 'default'}>{status === 'active' ? '已启用' : status === 'inactive' ? '已安装' : '未安装'}</Text></Flex><Text size={1}>{plugin.description}</Text><Text size={1} muted>权限：{plugin.permissions.join('、')}</Text>{!ready ? <Text size={1} tone="caution">配置不完整，安装后暂时不能启用。</Text> : <Text size={1} tone="positive">健康检查：可以运行</Text>}<Flex gap={2} wrap="wrap">{status === 'uninstalled' ? <Button text="安装并启用" tone="primary" disabled={!canManage || Boolean(busy) || !ready} loading={busy === plugin.id} onClick={() => change(plugin, 'active', '安装并启用')} /> : status === 'active' ? <Button text="停用" tone="caution" disabled={!canManage || Boolean(busy)} loading={busy === plugin.id} onClick={() => change(plugin, 'inactive', '停用')} /> : <Button text="启用" tone="primary" disabled={!canManage || Boolean(busy) || !ready} loading={busy === plugin.id} onClick={() => change(plugin, 'active', '启用')} />}{needsUpdate ? <Button text="更新版本" mode="ghost" disabled={!canManage || Boolean(busy)} onClick={() => change(plugin, status, '更新')} /> : null}{status !== 'uninstalled' ? <Button text="卸载" mode="ghost" tone="critical" disabled={!canManage || Boolean(busy)} onClick={() => change(plugin, 'uninstalled', '卸载')} /> : null}</Flex></Stack></Card>
    })}</Grid>
    <Card padding={4} radius={3} border><Flex align="center" justify="space-between" gap={3} wrap="wrap"><Stack space={2}><Heading size={1}>需要账户或密钥的服务</Heading><Text size={1}>Stripe、会员邮件、Turnstile 和外部统计请在“服务连接”中检查配置状态。</Text></Stack><Button as="a" href="/connections" text="打开服务连接" tone="primary" mode="ghost" /></Flex></Card>
  </Stack></Box>
}
