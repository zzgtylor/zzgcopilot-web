import { defineArrayMember, defineField, defineType } from 'sanity'

export const postType = defineType({
  name: 'post',
  title: '文章',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: '文章标题', type: 'string', validation: rule => rule.required().max(120) }),
    defineField({ name: 'slug', title: '链接 Slug', type: 'slug', options: { source: 'title', maxLength: 110 }, validation: rule => rule.required() }),
    defineField({ name: 'excerpt', title: '摘要', type: 'text', rows: 3, validation: rule => rule.max(500) }),
    defineField({ name: 'content', title: '正文（支持 Markdown）', type: 'text', rows: 24, validation: rule => rule.required() }),
    defineField({ name: 'coverImageUrl', title: '封面图片地址', type: 'string', description: '可填写现有站内 R2 路径（/uploads/…）或完整图片 URL。' }),
    defineField({ name: 'category', title: '分类', type: 'reference', to: [{ type: 'category' }] }),
    defineField({ name: 'tags', title: '标签', type: 'array', of: [defineArrayMember({ type: 'string' })], options: { layout: 'tags' } }),
    defineField({ name: 'readingTime', title: '预计阅读分钟数', type: 'number', validation: rule => rule.integer().min(1) }),
    defineField({ name: 'authorName', title: '作者名称', type: 'string', initialValue: 'Tyler' }),
    defineField({ name: 'status', title: '发布状态', type: 'string', initialValue: 'draft', options: { list: [{ title: '草稿', value: 'draft' }, { title: '已发布', value: 'published' }] }, validation: rule => rule.required() }),
    defineField({ name: 'publishedAt', title: '发布时间', type: 'datetime' }),
    defineField({ name: 'metaTitle', title: 'SEO 标题', type: 'string', validation: rule => rule.max(120) }),
    defineField({ name: 'metaDescription', title: 'SEO 描述', type: 'text', rows: 3, validation: rule => rule.max(180) }),
    defineField({ name: 'ogImage', title: '社交分享图片 URL', type: 'url' }),
  ],
  preview: { select: { title: 'title', subtitle: 'status' } },
})
