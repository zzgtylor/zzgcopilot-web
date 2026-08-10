import { Box, Button, Card, Flex, Grid, Heading, Stack, Text, useToast } from '@sanity/ui'
import { useClient } from 'sanity'
import { useEffect, useState } from 'react'

type ThemePreset = {
  id: string
  name: string
  description: string
  colors: [string, string, string]
  values: Record<string, string | number>
}

const themes: ThemePreset[] = [
  { id: 'classic', name: '经典教程', description: '当前网站模板。三列教程卡片、稳重蓝色和衬线标题，恢复现有首页外观。', colors: ['#11567f', '#142844', '#f8f9fa'], values: { primaryColor: '#11567f', secondaryColor: '#142844', headerBackgroundColor: '#ffffff', surfaceColor: '#f8f9fa', cardBackgroundColor: '#ffffff', bodyFont: 'system', headingFont: 'serif', contentWidth: 768, homepageMaxWidth: 1480, cardRadius: 6, cardStyle: 'elevated', navigationStyle: 'sticky', cardColumns: 3, cardGap: 24, cardImageHeight: 150 } },
  { id: 'minimal', name: '极简蓝白', description: '现代无衬线排版、四列紧凑卡片和更大留白，适合内容数量较多的网站。', colors: ['#2563eb', '#111827', '#ffffff'], values: { primaryColor: '#2563eb', secondaryColor: '#111827', headerBackgroundColor: '#ffffff', surfaceColor: '#ffffff', cardBackgroundColor: '#ffffff', bodyFont: 'sans', headingFont: 'sans', contentWidth: 800, homepageMaxWidth: 1560, cardRadius: 14, cardStyle: 'bordered', navigationStyle: 'sticky', cardColumns: 4, cardGap: 20, cardImageHeight: 170 } },
  { id: 'editorial', name: '暖色杂志', description: '两列大图卡片、暖色衬线排版，适合长文章、专栏和观点内容。', colors: ['#9a3412', '#3f2a1d', '#fbf7f2'], values: { primaryColor: '#9a3412', secondaryColor: '#3f2a1d', headerBackgroundColor: '#fffdf9', surfaceColor: '#fbf7f2', cardBackgroundColor: '#fffdf9', bodyFont: 'serif', headingFont: 'serif', contentWidth: 720, homepageMaxWidth: 1320, cardRadius: 4, cardStyle: 'flat', navigationStyle: 'static', cardColumns: 2, cardGap: 32, cardImageHeight: 240 } },
  { id: 'forest', name: '森林知识库', description: '三列资源卡片、沉静绿色和清晰无衬线标题，适合课程与知识文档。', colors: ['#047857', '#16352d', '#f4f8f5'], values: { primaryColor: '#047857', secondaryColor: '#16352d', headerBackgroundColor: '#ffffff', surfaceColor: '#f4f8f5', cardBackgroundColor: '#ffffff', bodyFont: 'system', headingFont: 'sans', contentWidth: 820, homepageMaxWidth: 1480, cardRadius: 10, cardStyle: 'bordered', navigationStyle: 'sticky', cardColumns: 3, cardGap: 24, cardImageHeight: 180 } },
]

const colorFields = ['primaryColor', 'secondaryColor', 'headerBackgroundColor', 'surfaceColor', 'cardBackgroundColor']
const templateFields = [...colorFields, 'themePreset', 'bodyFont', 'headingFont', 'contentWidth', 'homepageMaxWidth', 'cardRadius', 'cardStyle', 'navigationStyle', 'cardColumns', 'cardGap', 'cardImageHeight']

const key = () => crypto.randomUUID().replace(/-/g, '').slice(0, 12)
const slug = (prefix: string) => `${prefix}-${Date.now().toString(36)}`
const span = (text: string) => ({ _type: 'span', _key: key(), text, marks: [] })
const block = (text: string, style = 'normal') => ({ _type: 'block', _key: key(), style, markDefs: [], children: [span(text)] })

export function ThemeTemplateCenter() {
  const client = useClient({ apiVersion: '2026-08-09' })
  const toast = useToast()
  const [activeTheme, setActiveTheme] = useState('classic')
  const [busy, setBusy] = useState('')
  const [backup, setBackup] = useState<Record<string, unknown> | null>(null)

  useEffect(() => { client.fetch<{ themePreset?: string; themeBackup?: Record<string, unknown> } | null>('*[_id == "site-settings"][0]{themePreset,themeBackup}').then(value => { setActiveTheme(value?.themePreset || 'classic'); setBackup(value?.themeBackup || null) }).catch(() => undefined) }, [client])

  async function applyTheme(theme: ThemePreset) {
    setBusy(theme.id)
    try {
      const current = await client.fetch<Record<string, unknown> | null>(`*[_id == "site-settings"][0]{${templateFields.join(',')}}`)
      const values = Object.fromEntries(Object.entries(theme.values).map(([field, value]) => colorFields.includes(field) ? [field, { _type: 'color', hex: String(value), alpha: 1 }] : [field, value]))
      const snapshot = { _type: 'themeBackup', ...(current || {}) }
      await client.patch('site-settings').setIfMissing({ _type: 'siteSettings' }).set({ ...values, themePreset: theme.id, themeBackup: snapshot }).commit()
      setBackup(snapshot)
      setActiveTheme(theme.id)
      toast.push({ status: 'success', title: `已应用“${theme.name}”`, description: '颜色、字体、首页宽度、卡片列数和间距已一起更新，可使用“撤销上次更换”。' })
    } catch (error) { toast.push({ status: 'error', title: '主题应用失败', description: error instanceof Error ? error.message : '请稍后重试' }) }
    finally { setBusy('') }
  }

  async function restoreTheme() {
    if (!backup) return
    setBusy('restore')
    try {
      const restored = Object.fromEntries(Object.entries(backup).filter(([field]) => field !== '_type'))
      await client.patch('site-settings').set(restored).unset(['themeBackup']).commit()
      setActiveTheme(typeof restored.themePreset === 'string' ? restored.themePreset : 'classic')
      setBackup(null)
      toast.push({ status: 'success', title: '已撤销上次模板更换', description: '网站已恢复到更换前的模板参数。' })
    } catch (error) { toast.push({ status: 'error', title: '恢复失败', description: error instanceof Error ? error.message : '请稍后重试' }) }
    finally { setBusy('') }
  }

  async function createTemplate(template: 'tutorial' | 'landing' | 'resources') {
    setBusy(template)
    try {
      const document = template === 'tutorial' ? {
        _type: 'post', title: '新教程（请修改标题）', slug: { _type: 'slug', current: slug('new-tutorial') }, excerpt: '用一句话介绍这篇教程能帮助读者解决什么问题。', editorialStage: 'writing', status: 'draft', authorName: 'Tyler', readingTime: 10, accessLevel: 'public', commentsEnabled: true,
        body: [block('教程标题', 'h2'), block('先介绍读者将学到什么，以及开始前需要准备的内容。'), { _type: 'tutorialStep', _key: key(), stepNumber: 1, title: '第一步', text: '在这里填写具体操作。' }, { _type: 'callout', _key: key(), tone: 'tip', title: '提示', text: '补充容易忽略的注意事项。' }, block('总结', 'h2'), block('总结关键步骤，并告诉读者下一步可以做什么。')],
      } : template === 'landing' ? {
        _type: 'page', title: '新着陆页（请修改标题）', slug: { _type: 'slug', current: slug('landing-page') }, excerpt: '用于产品、课程或活动介绍的页面模板。', editorialStage: 'writing', status: 'draft',
        sections: [{ _type: 'hero', _key: key(), eyebrow: '欢迎', title: '用一句有力的话介绍你的内容', text: '补充核心价值、适合人群和读者能够获得的结果。', label: '立即开始', href: '/' }, { _type: 'richTextSection', _key: key(), title: '为什么值得学习', body: [block('在这里介绍主要优势、方法或服务特色。')] }, { _type: 'faq', _key: key(), title: '常见问题', items: [{ _type: 'item', _key: key(), question: '这个内容适合谁？', answer: '在这里填写目标读者和使用场景。' }] }, { _type: 'cta', _key: key(), title: '准备好开始了吗？', text: '用一句话鼓励访问者采取行动。', label: '查看教程', href: '/' }],
      } : {
        _type: 'page', title: '新资源中心（请修改标题）', slug: { _type: 'slug', current: slug('resource-center') }, excerpt: '用于整理下载、工具和教程链接的资源中心。', editorialStage: 'writing', status: 'draft',
        sections: [{ _type: 'hero', _key: key(), eyebrow: '免费资源', title: '把重要资源集中在一个页面', text: '说明这些资源能帮助读者完成什么。', label: '浏览资源', href: '#resources' }, { _type: 'resourceGrid', _key: key(), title: '精选资源', columns: 3, items: [{ _type: 'resource', _key: key(), title: '资源名称', text: '简要介绍资源内容。', label: '查看详情', href: '/' }, { _type: 'resource', _key: key(), title: '第二个资源', text: '简要介绍资源内容。', label: '查看详情', href: '/' }, { _type: 'resource', _key: key(), title: '第三个资源', text: '简要介绍资源内容。', label: '查看详情', href: '/' }] }, { _type: 'cta', _key: key(), title: '没有找到需要的内容？', text: '邀请读者联系你或查看全部教程。', label: '联系我们', href: '/' }],
      }
      const created = await client.create(document)
      toast.push({ status: 'success', title: '模板草稿已创建', description: `文档 ${created.title} 已加入内容列表，不会自动发布。` })
    } catch (error) { toast.push({ status: 'error', title: '模板创建失败', description: error instanceof Error ? error.message : '请稍后重试' }) }
    finally { setBusy('') }
  }

  return <Box padding={5}><Stack space={6}>
    <Stack space={2}><Heading size={3}>主题与模板中心</Heading><Text muted>像 WordPress 一样选择经过验证的外观和模板，但所有包都经过固定字段限制，不执行第三方代码。</Text></Stack>
    <Stack space={4}><Flex align="center" justify="space-between" gap={3} wrap="wrap"><Heading size={2}>网站模板包</Heading><Flex gap={2}><Button as="a" href="/presentation" text="打开网站预览" mode="ghost" /><Button text="撤销上次更换" tone="caution" disabled={!backup || Boolean(busy)} loading={busy === 'restore'} onClick={restoreTheme} /></Flex></Flex><Grid columns={[1, 1, 2]} gap={4}>{themes.map(theme => <Card key={theme.id} padding={4} radius={3} border tone={activeTheme === theme.id ? 'primary' : 'default'}><Stack space={4}><Flex gap={2}>{theme.colors.map(color => <Box key={color} style={{ background: color, width: 48, height: 36, borderRadius: 6, border: '1px solid rgba(0,0,0,.1)' }} />)}</Flex><Stack space={2}><Flex align="center" gap={2}><Heading size={1}>{theme.name}</Heading>{activeTheme === theme.id ? <Text size={1} muted>当前模板</Text> : null}</Flex><Text size={1}>{theme.description}</Text></Stack><Button text={activeTheme === theme.id ? '当前已应用' : '预设并应用'} tone="primary" disabled={activeTheme === theme.id || Boolean(busy)} loading={busy === theme.id} onClick={() => applyTheme(theme)} /></Stack></Card>)}</Grid><Text size={1} muted>更换模板只修改经过审核的布局参数，不覆盖文章、页面、导航或首页可视化区块。</Text></Stack>
    <Stack space={4}><Heading size={2}>内容模板包</Heading><Grid columns={[1, 1, 3]} gap={4}>{[
      ['tutorial', '分步教程', '标题、介绍、操作步骤、提示和总结，适合 Word 教程。'],
      ['landing', '着陆页面', '首屏、图文介绍、常见问题和行动按钮。'],
      ['resources', '资源中心', '首屏、资源卡片网格和联系行动区。'],
    ].map(([id, title, description]) => <Card key={id} padding={4} radius={3} border><Stack space={3}><Heading size={1}>{title}</Heading><Text size={1}>{description}</Text><Button text="安装为新草稿" mode="ghost" tone="primary" disabled={Boolean(busy)} loading={busy === id} onClick={() => createTemplate(id as 'tutorial' | 'landing' | 'resources')} /></Stack></Card>)}</Grid><Text size={1} muted>模板安装只会创建新草稿，不会修改或覆盖现有首页和已发布内容。</Text></Stack>
  </Stack></Box>
}
