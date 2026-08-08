import { defineField, defineType } from 'sanity'
import { portableTextField } from './portableText'

export const pageType = defineType({
  name: 'page',
  title: '独立页面',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: '页面标题', type: 'string', validation: rule => rule.required().max(120) }),
    defineField({ name: 'slug', title: '链接 Slug', type: 'slug', options: { source: 'title', maxLength: 110 }, validation: rule => rule.required() }),
    defineField({ name: 'excerpt', title: '摘要', type: 'text', rows: 3, validation: rule => rule.max(500) }),
    portableTextField(),
    defineField({ name: 'content', title: '旧版 Markdown 正文', description: '仅用于兼容迁移前的页面。新页面请使用上方可视化正文。', type: 'text', rows: 12, hidden: ({ document }) => Array.isArray(document?.body) && document.body.length > 0 }),
    defineField({ name: 'editorialStage', title: '审核阶段', type: 'string', initialValue: 'writing', options: { list: [{ title: '撰写中', value: 'writing' }, { title: '待审核', value: 'review' }, { title: '已批准', value: 'approved' }] }, validation: rule => rule.required() }),
    defineField({ name: 'reviewerName', title: '审核人', type: 'string', hidden: ({ document }) => document?.editorialStage === 'writing' }),
    defineField({ name: 'reviewNotes', title: '审核意见', type: 'text', rows: 3, hidden: ({ document }) => document?.editorialStage === 'writing' }),
    defineField({ name: 'status', title: '发布状态', type: 'string', initialValue: 'draft', options: { list: [{ title: '草稿', value: 'draft' }, { title: '计划发布', value: 'scheduled' }, { title: '已发布', value: 'published' }] }, validation: rule => rule.required().custom((value, context) => (value === 'published' || value === 'scheduled') && context.document?.editorialStage !== 'approved' ? '只有审核阶段为“已批准”时才能发布或计划发布' : true) }),
    defineField({ name: 'publishedAt', title: '发布时间', description: '选择“计划发布”时，网站会在此时间到达后自动公开。', type: 'datetime', validation: rule => rule.custom((value, context) => context.document?.status === 'scheduled' && !value ? '计划发布必须填写发布时间' : true) }),
    defineField({ name: 'metaTitle', title: 'SEO 标题', type: 'string', validation: rule => rule.max(120) }),
    defineField({ name: 'metaDescription', title: 'SEO 描述', type: 'text', rows: 3, validation: rule => rule.max(180) }),
  ],
  preview: { select: { title: 'title', subtitle: 'status' } },
})
