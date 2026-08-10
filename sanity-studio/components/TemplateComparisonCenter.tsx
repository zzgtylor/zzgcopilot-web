import { Box, Button, Card, Flex, Heading, Stack, Text } from '@sanity/ui'
import { useClient } from 'sanity'
import { useEffect, useMemo, useState } from 'react'

const templates = [
  { id: 'classic', name: '经典教程', changes: ['三列文章卡片', '蓝色品牌色', '衬线标题', '150px 卡片图片'] },
  { id: 'minimal', name: '极简蓝白', changes: ['四列紧凑卡片', '现代无衬线字体', '14px 圆角', '白色页面背景'] },
  { id: 'editorial', name: '暖色杂志', changes: ['两列大图卡片', '暖色衬线排版', '静态导航', '240px 卡片图片'] },
  { id: 'forest', name: '森林知识库', changes: ['三列资源卡片', '绿色品牌色', '无衬线标题', '边框卡片'] },
]
const devices = { desktop: { label: '桌面', width: '100%' }, tablet: { label: '平板', width: '768px' }, mobile: { label: '手机', width: '390px' } }
const selectStyle = { border: '1px solid #d9d9df', borderRadius: 6, padding: '9px 10px', font: 'inherit', background: 'white' }

export function TemplateComparisonCenter() {
  const client = useClient({ apiVersion: '2026-08-09' })
  const [template, setTemplate] = useState('minimal')
  const [device, setDevice] = useState<keyof typeof devices>('desktop')
  const [articlePath, setArticlePath] = useState('')
  const [page, setPage] = useState('home')
  useEffect(() => { client.fetch<string | null>('*[_type == "post" && defined(slug.current)] | order(coalesce(publishedAt,_createdAt) desc)[0].slug.current').then(slug => setArticlePath(slug ? `/tutorials/${slug}` : '')).catch(() => undefined) }, [client])
  const path = page === 'article' && articlePath ? articlePath : '/'
  const separator = path.includes('?') ? '&' : '?'
  const candidate = `https://zzgcopilot.com${path}${separator}templatePreview=${template}`
  const current = `https://zzgcopilot.com${path}`
  const selected = useMemo(() => templates.find(item => item.id === template) || templates[0], [template])
  const frameStyle = { width: devices[device].width, height: 660, border: 0, background: 'white', display: 'block', margin: '0 auto' }

  return <Box padding={4}><Stack space={4}>
    <Flex align="center" justify="space-between" gap={4} wrap="wrap"><Stack space={2}><Heading size={3}>模板前后对比</Heading><Text muted>左侧始终显示当前正式网站，右侧只预览候选模板，不会修改线上设置。</Text></Stack><Flex gap={2} wrap="wrap"><select aria-label="候选模板" value={template} onChange={event => setTemplate(event.currentTarget.value)} style={selectStyle}>{templates.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select><select aria-label="预览页面" value={page} onChange={event => setPage(event.currentTarget.value)} style={selectStyle}><option value="home">首页</option><option value="article" disabled={!articlePath}>最新文章页</option></select>{Object.entries(devices).map(([id, item]) => <Button key={id} text={item.label} mode={device === id ? 'default' : 'ghost'} tone={device === id ? 'primary' : 'default'} onClick={() => setDevice(id as keyof typeof devices)} />)}<Button as="a" href="/themes" text="前往应用模板" tone="primary" /></Flex></Flex>
    <Card padding={3} radius={3} border><Flex gap={3} wrap="wrap"><Text size={1} weight="semibold">候选模板变化：</Text>{selected.changes.map(change => <Text key={change} size={1} muted>• {change}</Text>)}</Flex></Card>
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 12 }}><Card radius={3} border style={{ overflow: 'auto', background: '#e9eaed' }}><Box padding={3}><Heading size={1}>当前网站</Heading></Box><iframe key={`${current}-${device}`} src={current} title="当前网站模板" style={frameStyle} /></Card><Card radius={3} border style={{ overflow: 'auto', background: '#e9eaed' }}><Box padding={3}><Heading size={1}>候选：{selected.name}</Heading></Box><iframe key={`${candidate}-${device}`} src={candidate} title={`候选模板 ${selected.name}`} style={frameStyle} /></Card></div>
  </Stack></Box>
}
