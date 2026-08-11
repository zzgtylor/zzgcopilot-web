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
  defineArrayMember({
    name: 'featureGrid',
    title: '功能亮点网格',
    type: 'object',
    fields: [
      defineField({ name: 'title', title: '区块标题', type: 'string' }),
      defineField({ name: 'columns', title: '每行项目数', type: 'number', initialValue: 3, options: { list: [{ title: '2 列', value: 2 }, { title: '3 列', value: 3 }, { title: '4 列', value: 4 }] } }),
      defineField({ name: 'items', title: '功能亮点', type: 'array', of: [defineArrayMember({ name: 'feature', title: '亮点', type: 'object', fields: [
        defineField({ name: 'title', title: '标题', type: 'string', validation: rule => rule.required() }),
        defineField({ name: 'text', title: '说明', type: 'text', rows: 3 }),
      ] })], validation: rule => rule.required().min(1) }),
    ],
    preview: { select: { title: 'title', subtitle: 'items.0.title' }, prepare: ({ title, subtitle }) => ({ title: title || '功能亮点网格', subtitle }) },
  }),
  defineArrayMember({
    name: 'statsGrid',
    title: '数字统计区',
    type: 'object',
    fields: [
      defineField({ name: 'title', title: '区块标题', type: 'string' }),
      defineField({ name: 'items', title: '统计数字', type: 'array', of: [defineArrayMember({ name: 'stat', title: '统计项', type: 'object', fields: [
        defineField({ name: 'value', title: '数字或结果', type: 'string', validation: rule => rule.required().max(30) }),
        defineField({ name: 'label', title: '说明', type: 'string', validation: rule => rule.required().max(80) }),
      ] })], validation: rule => rule.required().min(1).max(6) }),
    ],
    preview: { select: { title: 'title', subtitle: 'items.0.value' }, prepare: ({ title, subtitle }) => ({ title: title || '数字统计区', subtitle }) },
  }),
  defineArrayMember({
    name: 'testimonialGrid',
    title: '用户评价',
    type: 'object',
    fields: [
      defineField({ name: 'title', title: '区块标题', type: 'string' }),
      defineField({ name: 'items', title: '评价', type: 'array', of: [defineArrayMember({ name: 'testimonial', title: '评价', type: 'object', fields: [
        defineField({ name: 'quote', title: '评价内容', type: 'text', rows: 4, validation: rule => rule.required() }),
        defineField({ name: 'name', title: '姓名', type: 'string', validation: rule => rule.required() }),
        defineField({ name: 'role', title: '身份或公司', type: 'string' }),
      ] })], validation: rule => rule.required().min(1) }),
    ],
    preview: { select: { title: 'title', subtitle: 'items.0.name' }, prepare: ({ title, subtitle }) => ({ title: title || '用户评价', subtitle }) },
  }),
  defineArrayMember({
    name: 'pricingTable',
    title: '价格方案表',
    type: 'object',
    fields: [
      defineField({ name: 'title', title: '区块标题', type: 'string' }),
      defineField({ name: 'plans', title: '方案', type: 'array', of: [defineArrayMember({ name: 'plan', title: '价格方案', type: 'object', fields: [
        defineField({ name: 'name', title: '方案名称', type: 'string', validation: rule => rule.required() }),
        defineField({ name: 'price', title: '价格', type: 'string', validation: rule => rule.required().max(40) }),
        defineField({ name: 'description', title: '说明', type: 'text', rows: 3 }),
        defineField({ name: 'features', title: '包含功能', type: 'array', of: [defineArrayMember({ type: 'string' })] }),
        ...buttonFields(),
      ] })], validation: rule => rule.required().min(1).max(4) }),
    ],
    preview: { select: { title: 'title', subtitle: 'plans.0.name' }, prepare: ({ title, subtitle }) => ({ title: title || '价格方案表', subtitle }) },
  }),
  defineArrayMember({
    name: 'dividerBlock',
    title: '分隔与留白',
    type: 'object',
    fields: [
      defineField({ name: 'spacing', title: '留白大小', type: 'string', initialValue: 'medium', options: { list: [{ title: '小', value: 'small' }, { title: '中', value: 'medium' }, { title: '大', value: 'large' }] } }),
      defineField({ name: 'line', title: '显示分隔线', type: 'boolean', initialValue: true }),
    ],
    preview: { prepare: () => ({ title: '分隔与留白' }) },
  }),
]

export const pageSectionsField = (name = 'sections', title = '页面区块', group?: string) => defineField({
  name,
  title,
  group,
  description: '按顺序添加区块，前台将按照此顺序显示。未添加区块时，网站会保持现有模板与正文显示方式。',
  type: 'array',
  of: pageSectionMembers(),
  options: { sortable: true },
})
