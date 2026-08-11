import { Box, Button, Card, Flex, Heading, Stack, Text, useToast } from '@sanity/ui'
import { useClient } from 'sanity'
import { useEffect, useMemo, useState } from 'react'

type Section = Record<string, any>
type PageOption = { _id: string; title?: string; slug?: string }

const blockCatalog = [
  { category: '基础布局', blocks: [{ type: 'hero', title: '横幅首屏' }, { type: 'richTextSection', title: '图文内容区' }, { type: 'splitContent', title: '图文双栏' }, { type: 'dividerBlock', title: '分隔与留白' }] },
  { category: '内容展示', blocks: [{ type: 'resourceGrid', title: '资源卡片网格' }, { type: 'featureGrid', title: '功能亮点网格' }, { type: 'statsGrid', title: '数字统计区' }, { type: 'testimonialGrid', title: '用户评价' }] },
  { category: '转化互动', blocks: [{ type: 'cta', title: '行动号召' }, { type: 'faq', title: '常见问题' }, { type: 'pricingTable', title: '价格方案表' }] },
]
const sectionNames: Record<string, string> = Object.fromEntries(blockCatalog.flatMap(group => group.blocks.map(block => [block.type, block.title])))
const key = () => crypto.randomUUID().replace(/-/g, '').slice(0, 12)
const span = (value: string) => ({ _type: 'span', _key: key(), text: value, marks: [] })
const body = (value: string) => [{ _type: 'block', _key: key(), style: 'normal', markDefs: [], children: [span(value)] }]

function newSection(type: string): Section {
  if (type === 'hero') return { _type: 'hero', _key: key(), eyebrow: '欢迎', title: '新的横幅标题', text: '在右侧修改说明文字。', label: '了解更多', href: '/' }
  if (type === 'richTextSection') return { _type: 'richTextSection', _key: key(), title: '新的内容区', body: body('请在普通内容编辑器中完善这一区块的富文本内容。') }
  if (type === 'splitContent') return { _type: 'splitContent', _key: key(), title: '图文双栏标题', text: '请在完整内容编辑器中上传图片。', imageAlt: '内容配图', reverse: false, label: '了解更多', href: '/' }
  if (type === 'cta') return { _type: 'cta', _key: key(), eyebrow: '下一步', title: '准备好开始了吗？', text: '在这里填写行动说明。', label: '立即开始', href: '/' }
  if (type === 'faq') return { _type: 'faq', _key: key(), title: '常见问题', items: [{ _type: 'item', _key: key(), question: '请填写问题', answer: '请填写答案。' }] }
  if (type === 'resourceGrid') return { _type: 'resourceGrid', _key: key(), title: '精选资源', columns: 3, items: [{ _type: 'resource', _key: key(), title: '资源名称', text: '资源说明', label: '查看详情', href: '/' }] }
  if (type === 'featureGrid') return { _type: 'featureGrid', _key: key(), title: '功能亮点', columns: 3, items: [{ _type: 'feature', _key: key(), title: '亮点标题', text: '亮点说明' }] }
  if (type === 'statsGrid') return { _type: 'statsGrid', _key: key(), title: '关键数字', items: [{ _type: 'stat', _key: key(), value: '100+', label: '教程内容' }] }
  if (type === 'testimonialGrid') return { _type: 'testimonialGrid', _key: key(), title: '用户评价', items: [{ _type: 'testimonial', _key: key(), quote: '请填写真实的用户评价。', name: '用户姓名', role: '身份或公司' }] }
  if (type === 'pricingTable') return { _type: 'pricingTable', _key: key(), title: '选择适合你的方案', plans: [{ _type: 'plan', _key: key(), name: '基础方案', price: '免费', description: '方案说明', features: ['包含功能'], label: '立即开始', href: '/' }] }
  return { _type: 'dividerBlock', _key: key(), spacing: 'medium', line: true }
}

const inputStyle = { width: '100%', border: '1px solid #d9d9df', borderRadius: 6, padding: '9px 10px', font: 'inherit', background: 'white' }

export function PageDesignerCenter() {
  const client = useClient({ apiVersion: '2026-08-09' })
  const toast = useToast()
  const [pages, setPages] = useState<PageOption[]>([])
  const [target, setTarget] = useState('homepage')
  const [sections, setSections] = useState<Section[]>([])
  const [selectedKey, setSelectedKey] = useState('')
  const [draggedKey, setDraggedKey] = useState('')
  const [busy, setBusy] = useState(false)
  const selected = useMemo(() => sections.find(item => item._key === selectedKey) || null, [sections, selectedKey])

  useEffect(() => { client.fetch<PageOption[]>('*[_type == "page"] | order(title asc){_id,title,"slug":slug.current}').then(setPages).catch(() => undefined) }, [client])
  useEffect(() => {
    setSelectedKey('')
    const query = target === 'homepage' ? '*[_id == "site-settings"][0].homepageSections' : '*[_id == $id][0].sections'
    client.fetch<Section[] | null>(query, target === 'homepage' ? {} : { id: target }).then(value => setSections(Array.isArray(value) ? value : [])).catch(() => setSections([]))
  }, [client, target])

  function add(type: string) {
    const section = newSection(type)
    setSections(current => [...current, section])
    setSelectedKey(section._key)
  }

  function update(field: string, value: unknown) {
    setSections(current => current.map(item => item._key === selectedKey ? { ...item, [field]: value } : item))
  }

  function duplicate(section: Section) {
    const copy = { ...structuredClone(section), _key: key(), title: `${section.title || sectionNames[section._type] || '区块'}（副本）` }
    const index = sections.findIndex(item => item._key === section._key)
    setSections(current => [...current.slice(0, index + 1), copy, ...current.slice(index + 1)])
    setSelectedKey(copy._key)
  }

  function remove(section: Section) {
    setSections(current => current.filter(item => item._key !== section._key))
    if (selectedKey === section._key) setSelectedKey('')
  }

  function move(section: Section, direction: -1 | 1) {
    setSections(current => {
      const index = current.findIndex(item => item._key === section._key)
      const targetIndex = index + direction
      if (index < 0 || targetIndex < 0 || targetIndex >= current.length) return current
      const next = [...current]
      ;[next[index], next[targetIndex]] = [next[targetIndex], next[index]]
      return next
    })
  }

  function drop(beforeKey: string) {
    if (!draggedKey || draggedKey === beforeKey) return
    setSections(current => {
      const moving = current.find(item => item._key === draggedKey)
      if (!moving) return current
      const remaining = current.filter(item => item._key !== draggedKey)
      const index = remaining.findIndex(item => item._key === beforeKey)
      return [...remaining.slice(0, index), moving, ...remaining.slice(index)]
    })
    setDraggedKey('')
  }

  async function save() {
    setBusy(true)
    try {
      const documentId = target === 'homepage' ? 'site-settings' : target
      const field = target === 'homepage' ? 'homepageSections' : 'sections'
      await client.patch(documentId).setIfMissing({ _type: target === 'homepage' ? 'siteSettings' : 'page' }).set({ [field]: sections }).commit()
      toast.push({ status: 'success', title: '页面布局已保存', description: target === 'homepage' ? '首页将在缓存刷新后更新。' : '页面区块顺序和设置已更新。' })
    } catch (error) { toast.push({ status: 'error', title: '保存失败', description: error instanceof Error ? error.message : '请稍后重试' }) }
    finally { setBusy(false) }
  }

  return <Box padding={4}><Stack space={4}>
    <Flex align="center" justify="space-between" gap={4} wrap="wrap"><Stack space={2}><Heading size={3}>整页拖拽设计器</Heading><Text muted>从左侧添加安全区块，在画布中拖拽排序，在右侧修改属性。</Text></Stack><Flex gap={2}><select aria-label="选择页面" value={target} onChange={event => setTarget(event.currentTarget.value)} style={{ ...inputStyle, minWidth: 220 }}><option value="homepage">网站首页</option>{pages.map(page => <option key={page._id} value={page._id}>{page.title || page.slug || page._id}</option>)}</select><Button text="保存并应用" tone="primary" loading={busy} disabled={busy} onClick={save} /></Flex></Flex>
    <div style={{ display: 'grid', gridTemplateColumns: '220px minmax(380px, 1fr) 290px', gap: 16, alignItems: 'start' }}>
      <Card padding={4} radius={3} border><Stack space={4}><Heading size={1}>区块市场</Heading>{blockCatalog.map(group => <Stack key={group.category} space={2}><Text size={1} weight="semibold" muted>{group.category}</Text>{group.blocks.map(block => <Button key={block.type} text={`＋ ${block.title}`} mode="ghost" onClick={() => add(block.type)} />)}</Stack>)}<Text size={1} muted>区块经过兼容性审核。图片、富文本和列表细节可保存后在普通内容编辑器继续完善。</Text></Stack></Card>
          <Card padding={4} radius={3} border><Stack space={3}><Flex justify="space-between"><Heading size={1}>页面画布</Heading><Text size={1} muted>{sections.length} 个区块</Text></Flex>{sections.length ? sections.map(section => <Card key={section._key} draggable onDragStart={() => setDraggedKey(section._key)} onDragOver={event => event.preventDefault()} onDrop={() => drop(section._key)} onClick={() => setSelectedKey(section._key)} padding={4} radius={2} border tone={selectedKey === section._key ? 'primary' : 'default'} style={{ cursor: 'grab', opacity: section.hidden ? .5 : 1 }}><Stack space={3}><Flex align="center" justify="space-between" gap={3}><Text weight="semibold">⋮⋮ {sectionNames[section._type] || section._type}</Text><Text size={1} muted>{section.hidden ? '已隐藏' : '拖拽排序'}</Text></Flex><Heading size={1}>{section.title || section.eyebrow || '未命名区块'}</Heading>{section.text ? <Text size={1}>{String(section.text).slice(0, 120)}</Text> : null}<Flex gap={2} wrap="wrap"><Button text="上移" mode="bleed" onClick={event => { event.stopPropagation(); move(section, -1) }} /><Button text="下移" mode="bleed" onClick={event => { event.stopPropagation(); move(section, 1) }} /><Button text="复制" mode="bleed" onClick={event => { event.stopPropagation(); duplicate(section) }} /><Button text={section.hidden ? '显示' : '隐藏'} mode="bleed" onClick={event => { event.stopPropagation(); setSelectedKey(section._key); setSections(current => current.map(item => item._key === section._key ? { ...item, hidden: !item.hidden } : item)) }} /><Button text="删除" tone="critical" mode="bleed" onClick={event => { event.stopPropagation(); remove(section) }} /></Flex></Stack></Card>) : <Card padding={5} tone="transparent"><Text muted>页面还没有区块，请从左侧添加。</Text></Card>}</Stack></Card>
      <Card padding={4} radius={3} border><Stack space={3}><Heading size={1}>区块属性</Heading>{selected ? <>{['eyebrow', 'title', 'text', 'label', 'href'].map(field => Object.hasOwn(selected, field) || ['title', 'text'].includes(field) ? <label key={field}><Text size={1} weight="semibold">{{ eyebrow: '小标题', title: '标题', text: '说明文字', label: '按钮文字', href: '按钮链接' }[field]}</Text>{field === 'text' ? <textarea value={String(selected[field] || '')} onChange={event => update(field, event.currentTarget.value)} rows={4} style={{ ...inputStyle, marginTop: 6, resize: 'vertical' }} /> : <input value={String(selected[field] || '')} onChange={event => update(field, event.currentTarget.value)} style={{ ...inputStyle, marginTop: 6 }} />}</label> : null)}{selected._type === 'resourceGrid' || selected._type === 'featureGrid' ? <label><Text size={1} weight="semibold">每行卡片数</Text><select value={Number(selected.columns) || 3} onChange={event => update('columns', Number(event.currentTarget.value))} style={{ ...inputStyle, marginTop: 6 }}><option value={2}>2 列</option><option value={3}>3 列</option>{selected._type === 'featureGrid' ? <option value={4}>4 列</option> : null}</select></label> : null}{selected._type === 'dividerBlock' ? <><label><Text size={1} weight="semibold">留白大小</Text><select value={String(selected.spacing || 'medium')} onChange={event => update('spacing', event.currentTarget.value)} style={{ ...inputStyle, marginTop: 6 }}><option value="small">小</option><option value="medium">中</option><option value="large">大</option></select></label><Button text={selected.line ? '隐藏分隔线' : '显示分隔线'} mode="ghost" onClick={() => update('line', !selected.line)} /></> : null}<Button as="a" href={target === 'homepage' ? '/structure/site-settings' : `/structure/page;${target}`} text="打开完整内容编辑器" mode="ghost" /></> : <Text muted>点击画布中的区块后编辑属性。</Text>}</Stack></Card>
    </div>
  </Stack></Box>
}
