import { defineField, defineType } from 'sanity'
import { pageSectionsField } from './pageSections'
import { portableTextField } from './portableText'
import { seoFields } from './seoFields'

const canApprove = (roles: Array<{ name?: string; title?: string }> = []) => roles.some(role => ['administrator', 'editor', 'developer'].includes((role.name || role.title || '').toLowerCase()))
const approvedForNonApprover = ({ document, currentUser }: { document?: Record<string, unknown>; currentUser?: { roles?: Array<{ name?: string; title?: string }> } | null }) => document?.editorialStage === 'approved' && !canApprove(currentUser?.roles)

export const pageType = defineType({
  name: 'page',
  title: '独立页面',
  type: 'document',
  readOnly: approvedForNonApprover,
  groups: [{ name: 'content', title: '内容', default: true }, { name: 'publishing', title: '发布与审核' }, { name: 'seo', title: 'SEO' }],
  fields: [
    defineField({ name: 'title', title: '页面标题', type: 'string', validation: rule => rule.required().max(120) }),
    defineField({ name: 'slug', title: '链接 Slug', type: 'slug', options: { source: 'title', maxLength: 110 }, validation: rule => rule.required() }),
    defineField({ name: 'excerpt', title: '摘要', type: 'text', rows: 3, validation: rule => rule.max(500) }),
    portableTextField(),
    pageSectionsField(),
    defineField({ name: 'content', title: '旧版 Markdown 正文', description: '仅用于兼容迁移前的页面。新页面请使用上方可视化正文。', type: 'text', rows: 12, hidden: ({ document }) => Array.isArray(document?.body) && document.body.length > 0 }),
    defineField({ name: 'editorialStage', title: '审核阶段', description: '请使用页面底部的“提交审核 / 批准内容 / 退回修改”按钮推进流程。', type: 'string', initialValue: 'writing', readOnly: true, options: { list: [{ title: '撰写中', value: 'writing' }, { title: '待审核', value: 'review' }, { title: '已批准', value: 'approved' }] }, validation: rule => rule.required() }),
    defineField({ name: 'reviewerName', title: '审核人', type: 'string', readOnly: true, hidden: ({ document }) => document?.editorialStage === 'writing' }),
    defineField({ name: 'approvedAt', title: '批准时间', type: 'datetime', readOnly: true, hidden: ({ document }) => document?.editorialStage !== 'approved' }),
    defineField({ name: 'reviewNotes', title: '审核意见', type: 'text', rows: 3, hidden: ({ document }) => document?.editorialStage === 'writing', readOnly: ({ currentUser }) => !canApprove(currentUser?.roles) }),
    defineField({ name: 'status', title: '发布状态', description: '计划发布时间到达后会自动出现在网站；无需重新部署。', type: 'string', initialValue: 'draft', options: { list: [{ title: '草稿', value: 'draft' }, { title: '计划发布', value: 'scheduled' }, { title: '已发布', value: 'published' }] }, validation: rule => rule.required().custom((value, context) => (value === 'published' || value === 'scheduled') && context.document?.editorialStage !== 'approved' ? '只有审核阶段为“已批准”时才能发布或计划发布' : true) }),
    defineField({ name: 'publishedAt', title: '发布时间', description: '计划发布必须设置未来时间；到期后内容会自动公开。', type: 'datetime', validation: rule => rule.custom((value, context) => {
      if (context.document?.status === 'scheduled' && !value) return '计划发布必须填写发布时间'
      if (context.document?.status === 'published' && value && Date.parse(String(value)) > Date.now()) return '未来时间请使用“计划发布”，不能标记为“已发布”'
      return true
    }).custom((value, context) => context.document?.status === 'scheduled' && value && Date.parse(String(value)) <= Date.now() ? '该时间已经到达，内容当前已在网站公开；建议将状态改为“已发布”' : true).warning() }),
    defineField({ name: 'expiresAt', title: '下线时间（可选）', description: '到达此时间后，网站和站点地图会自动隐藏页面。', type: 'datetime', validation: rule => rule.custom((value, context) => !value || !context.document?.publishedAt || Date.parse(String(value)) > Date.parse(String(context.document.publishedAt)) ? true : '下线时间必须晚于发布时间') }),
    ...seoFields,
  ],
  preview: { select: { title: 'title', subtitle: 'status' } },
})
