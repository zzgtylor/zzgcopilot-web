import { Box, Button, Card, Grid, Heading, Stack, Text, useToast } from '@sanity/ui'
import { useClient } from 'sanity'
import { useState } from 'react'

type ModelId = 'tutorial' | 'course' | 'review' | 'landing' | 'resources' | 'faq'
const models: Array<{ id: ModelId; title: string; description: string }> = [
  { id: 'tutorial', title: '分步教程', description: '介绍、操作步骤、提示和总结。' },
  { id: 'course', title: '课程章节', description: '学习目标、课程内容、练习和下一步。' },
  { id: 'review', title: '产品评测', description: '快速结论、优缺点、对比表和购买建议。' },
  { id: 'landing', title: '着陆页面', description: '首屏、价值介绍、常见问题和行动按钮。' },
  { id: 'resources', title: '资源中心', description: '资源卡片网格、下载入口和联系行动区。' },
  { id: 'faq', title: '常见问题页面', description: '集中管理问题答案和帮助入口。' },
]

const key = () => crypto.randomUUID().replace(/-/g, '').slice(0, 12)
const slug = (prefix: string) => `${prefix}-${Date.now().toString(36)}`
const span = (text: string) => ({ _type: 'span', _key: key(), text, marks: [] })
const block = (text: string, style = 'normal') => ({ _type: 'block', _key: key(), style, markDefs: [], children: [span(text)] })

function postBase(title: string, prefix: string, excerpt: string, body: Array<Record<string, unknown>>) {
  return { _type: 'post', title, slug: { _type: 'slug', current: slug(prefix) }, excerpt, editorialStage: 'writing', status: 'draft', authorName: 'Tyler', readingTime: 10, accessLevel: 'public', commentsEnabled: true, body }
}

function pageBase(title: string, prefix: string, excerpt: string, sections: Array<Record<string, unknown>>) {
  return { _type: 'page', title, slug: { _type: 'slug', current: slug(prefix) }, excerpt, editorialStage: 'writing', status: 'draft', sections }
}

function documentFor(model: ModelId) {
  if (model === 'tutorial') return postBase('新教程（请修改标题）', 'tutorial', '说明这篇教程能帮助读者解决什么问题。', [block('你将学到什么', 'h2'), block('介绍学习目标和准备工作。'), { _type: 'tutorialStep', _key: key(), stepNumber: 1, title: '第一步', text: '填写具体操作。' }, { _type: 'callout', _key: key(), tone: 'tip', title: '提示', text: '补充注意事项。' }, block('总结', 'h2'), block('总结关键步骤。')])
  if (model === 'course') return postBase('新课程章节（请修改标题）', 'course', '说明本章节的学习目标和预计完成时间。', [block('学习目标', 'h2'), block('列出完成本章后能够掌握的能力。'), block('课程内容', 'h2'), { _type: 'tutorialStep', _key: key(), stepNumber: 1, title: '核心练习', text: '填写练习步骤和预期结果。' }, block('课后练习', 'h2'), block('提供一个可以独立完成的任务。')])
  if (model === 'review') return postBase('新产品评测（请修改标题）', 'review', '一句话概括产品适合谁以及核心结论。', [block('快速结论', 'h2'), { _type: 'callout', _key: key(), tone: 'important', title: '结论', text: '填写推荐或不推荐的主要理由。' }, block('优点与不足', 'h2'), block('分别说明优势、限制和适用场景。'), { _type: 'table', _key: key(), caption: '关键指标对比', rows: [{ _type: 'row', _key: key(), cells: ['项目', '表现'] }, { _type: 'row', _key: key(), cells: ['易用性', '请填写'] }] }, block('购买建议', 'h2'), block('说明不同用户应该如何选择。')])
  if (model === 'landing') return pageBase('新着陆页（请修改标题）', 'landing', '用于产品、课程或活动介绍的页面。', [{ _type: 'hero', _key: key(), eyebrow: '欢迎', title: '用一句有力的话介绍你的内容', text: '补充核心价值、适合人群和读者能获得的结果。', label: '立即开始', href: '/' }, { _type: 'richTextSection', _key: key(), title: '为什么值得了解', body: [block('在这里介绍主要优势。')] }, { _type: 'cta', _key: key(), title: '准备好开始了吗？', text: '鼓励访问者采取行动。', label: '查看教程', href: '/' }])
  if (model === 'resources') return pageBase('新资源中心（请修改标题）', 'resources', '用于整理下载、工具和教程链接。', [{ _type: 'hero', _key: key(), eyebrow: '免费资源', title: '把重要资源集中在一个页面', text: '说明这些资源能帮助读者完成什么。', label: '浏览资源', href: '#resources' }, { _type: 'resourceGrid', _key: key(), title: '精选资源', columns: 3, items: [{ _type: 'resource', _key: key(), title: '资源名称', text: '简要介绍资源内容。', label: '查看详情', href: '/' }] }])
  return pageBase('新常见问题页面（请修改标题）', 'faq', '集中回答访问者最常见的问题。', [{ _type: 'hero', _key: key(), eyebrow: '帮助中心', title: '常见问题', text: '快速找到问题答案。', label: '返回首页', href: '/' }, { _type: 'faq', _key: key(), title: '常见问题', items: [{ _type: 'item', _key: key(), question: '请填写问题', answer: '请填写清晰、完整的答案。' }] }])
}

export function ContentModelCenter() {
  const client = useClient({ apiVersion: '2026-08-09' })
  const toast = useToast()
  const [busy, setBusy] = useState('')

  async function install(model: ModelId) {
    setBusy(model)
    try {
      const created = await client.create(documentFor(model))
      toast.push({ status: 'success', title: '内容模板已创建', description: `${created.title} 已作为草稿加入内容列表，不会自动公开。` })
    } catch (error) { toast.push({ status: 'error', title: '创建失败', description: error instanceof Error ? error.message : '请稍后重试' }) }
    finally { setBusy('') }
  }

  return <Box padding={5}><Stack space={6}><Stack space={2}><Heading size={3}>内容模型模板库</Heading><Text muted>选择用途即可生成结构完整的草稿，不需要自己设计字段。模板只使用网站已经支持的安全内容区块。</Text></Stack><Grid columns={[1, 1, 3]} gap={4}>{models.map(model => <Card key={model.id} padding={4} radius={3} border><Stack space={3}><Heading size={1}>{model.title}</Heading><Text size={1}>{model.description}</Text><Button text="创建草稿" tone="primary" mode="ghost" disabled={Boolean(busy)} loading={busy === model.id} onClick={() => install(model.id)} /></Stack></Card>)}</Grid><Text size={1} muted>创建后可像普通文章或页面一样编辑、预览、提交审核和发布。</Text></Stack></Box>
}
