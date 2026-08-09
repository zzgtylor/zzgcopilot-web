import { defineArrayMember, defineField } from 'sanity'
import { portableTextMembers } from './portableText'

const buttonFields = () => [
  defineField({ name: 'label', title: '按钮文字', type: 'string', validation: rule => rule.required() }),
  defineField({ name: 'href', title: '按钮链接', type: 'url', validation: rule => rule.required().uri({ allowRelative: true, scheme: ['http', 'https', 'mailto', 'tel'] }) }),
]

export const pageSectionMembers = () => [
  defineArrayMember({
    name: 'hero',
    title: '横幅首屏',
    type: 'object',
    fields: [
      defineField({ name: 'eyebrow', title: '小标题', type: 'string' }),
      defineField({ name: 'title', title: '主标题', type: 'string', validation: rule => rule.required().max(120) }),
      defineField({ name: 'text', title: '说明文字', type: 'text', rows: 3 }),
      defineField({ name: 'image', title: '背景或配图', type: 'image', options: { hotspot: true } }),
      ...buttonFields(),
    ],
    preview: { select: { title: 'title', subtitle: 'text', media: 'image' } },
  }),
  defineArrayMember({
    name: 'richTextSection',
    title: '图文内容区',
    type: 'object',
    fields: [
      defineField({ name: 'title', title: '区块标题', type: 'string' }),
      defineField({ name: 'body', title: '内容', type: 'array', of: portableTextMembers(), validation: rule => rule.required().min(1) }),
    ],
    preview: { select: { title: 'title' }, prepare: ({ title }) => ({ title: title || '图文内容区' }) },
  }),
  defineArrayMember({
    name: 'splitContent',
    title: '图文双栏',
    type: 'object',
    fields: [
      defineField({ name: 'title', title: '标题', type: 'string', validation: rule => rule.required() }),
      defineField({ name: 'text', title: '说明', type: 'text', rows: 5 }),
      defineField({ name: 'image', title: '图片', type: 'image', options: { hotspot: true }, validation: rule => rule.required() }),
      defineField({ name: 'imageAlt', title: '图片替代文字', type: 'string', validation: rule => rule.required() }),
      defineField({ name: 'reverse', title: '图片显示在左侧', type: 'boolean', initialValue: false }),
      ...buttonFields(),
    ],
    preview: { select: { title: 'title', subtitle: 'text', media: 'image' } },
  }),
  defineArrayMember({
    name: 'cta',
    title: '行动号召',
    type: 'object',
    fields: [
      defineField({ name: 'eyebrow', title: '小标题', type: 'string' }),
      defineField({ name: 'title', title: '标题', type: 'string', validation: rule => rule.required() }),
      defineField({ name: 'text', title: '说明', type: 'text', rows: 3 }),
      ...buttonFields(),
    ],
    preview: { select: { title: 'title', subtitle: 'text' } },
  }),
  defineArrayMember({
    name: 'faq',
    title: '常见问题',
    type: 'object',
    fields: [
      defineField({ name: 'title', title: '区块标题', type: 'string', initialValue: '常见问题' }),
      defineField({
        name: 'items',
        title: '问题与答案',
        type: 'array',
        of: [defineArrayMember({ name: 'item', title: '问题', type: 'object', fields: [defineField({ name: 'question', title: '问题', type: 'string', validation: rule => rule.required() }), defineField({ name: 'answer', title: '答案', type: 'text', rows: 4, validation: rule => rule.required() })] })],
        validation: rule => rule.required().min(1),
      }),
    ],
    preview: { select: { title: 'title', subtitle: 'items.0.question' } },
  }),
  defineArrayMember({
    name: 'resourceGrid',
    title: '资源卡片网格',
    type: 'object',
    fields: [
      defineField({ name: 'title', title: '区块标题', type: 'string' }),
      defineField({ name: 'columns', title: '每行卡片数', type: 'number', initialValue: 3, options: { list: [{ title: '2 列', value: 2 }, { title: '3 列', value: 3 }] } }),
      defineField({
        name: 'items',
        title: '资源卡片',
        type: 'array',
        of: [defineArrayMember({ name: 'resource', title: '资源', type: 'object', fields: [
          defineField({ name: 'title', title: '标题', type: 'string', validation: rule => rule.required() }),
          defineField({ name: 'text', title: '说明', type: 'text', rows: 3 }),
          defineField({ name: 'image', title: '图片', type: 'image', options: { hotspot: true } }),
          ...buttonFields(),
        ] })],
        validation: rule => rule.required().min(1),
      }),
    ],
    preview: { select: { title: 'title', subtitle: 'items.0.title' }, prepare: ({ title, subtitle }) => ({ title: title || '资源卡片网格', subtitle }) },
  }),
]

export const pageSectionsField = (name = 'sections', title = '页面区块') => defineField({
  name,
  title,
  description: '按顺序添加区块，前台将按照此顺序显示。未添加区块时，网站会保持现有模板与正文显示方式。',
  type: 'array',
  of: pageSectionMembers(),
  options: { sortable: true },
})
