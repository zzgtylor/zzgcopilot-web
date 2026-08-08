import { defineField, defineType } from 'sanity'

export const pageType = defineType({
  name: 'page',
  title: '独立页面',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: '页面标题', type: 'string', validation: rule => rule.required().max(120) }),
    defineField({ name: 'slug', title: '链接 Slug', type: 'slug', options: { source: 'title', maxLength: 110 }, validation: rule => rule.required() }),
    defineField({ name: 'excerpt', title: '摘要', type: 'text', rows: 3, validation: rule => rule.max(500) }),
    defineField({ name: 'content', title: '正文（支持 Markdown）', type: 'text', rows: 24, validation: rule => rule.required() }),
    defineField({ name: 'status', title: '发布状态', type: 'string', initialValue: 'draft', options: { list: [{ title: '草稿', value: 'draft' }, { title: '已发布', value: 'published' }] }, validation: rule => rule.required() }),
    defineField({ name: 'publishedAt', title: '发布时间', type: 'datetime' }),
    defineField({ name: 'metaTitle', title: 'SEO 标题', type: 'string', validation: rule => rule.max(120) }),
    defineField({ name: 'metaDescription', title: 'SEO 描述', type: 'text', rows: 3, validation: rule => rule.max(180) }),
  ],
  preview: { select: { title: 'title', subtitle: 'status' } },
})
