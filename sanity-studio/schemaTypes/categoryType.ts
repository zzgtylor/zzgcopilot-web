import { defineField, defineType } from 'sanity'

export const categoryType = defineType({
  name: 'category',
  title: '分类',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: '分类名称', type: 'string', validation: rule => rule.required() }),
    defineField({ name: 'slug', title: '链接 Slug', type: 'slug', options: { source: 'title', maxLength: 96 }, validation: rule => rule.required() }),
    defineField({ name: 'description', title: '描述', type: 'text', rows: 3 }),
  ],
})
