import { defineArrayMember, defineField } from 'sanity'

export const portableTextField = () => defineField({
  name: 'body',
  title: '可视化正文',
  description: '像 WordPress 一样插入标题、列表、图片、表格、提示框、步骤和下载按钮。',
  type: 'array',
  validation: rule => rule.custom((value, context) => {
    const legacyContent = context.document?.content
    return (Array.isArray(value) && value.length > 0) || (typeof legacyContent === 'string' && legacyContent.trim())
      ? true
      : '正文不能为空'
  }),
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        { title: '正文', value: 'normal' },
        { title: '二级标题', value: 'h2' },
        { title: '三级标题', value: 'h3' },
        { title: '引用', value: 'blockquote' },
      ],
      lists: [
        { title: '项目符号', value: 'bullet' },
        { title: '编号列表', value: 'number' },
      ],
      marks: {
        decorators: [
          { title: '粗体', value: 'strong' },
          { title: '斜体', value: 'em' },
          { title: '行内代码', value: 'code' },
        ],
        annotations: [
          {
            name: 'link',
            title: '链接',
            type: 'object',
            fields: [
              defineField({ name: 'href', title: '网址', type: 'url', validation: rule => rule.required().uri({ allowRelative: true, scheme: ['http', 'https', 'mailto', 'tel'] }) }),
              defineField({ name: 'openNewTab', title: '新窗口打开', type: 'boolean', initialValue: false }),
            ],
          },
        ],
      },
    }),
    defineArrayMember({
      name: 'image',
      title: '正文图片',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({ name: 'alt', title: '图片替代文字', type: 'string', validation: rule => rule.required() }),
        defineField({ name: 'caption', title: '图片说明', type: 'string' }),
      ],
    }),
    defineArrayMember({
      name: 'callout',
      title: '提示框',
      type: 'object',
      fields: [
        defineField({ name: 'tone', title: '类型', type: 'string', initialValue: 'tip', options: { list: [{ title: '技巧', value: 'tip' }, { title: '注意', value: 'warning' }, { title: '重点', value: 'important' }] } }),
        defineField({ name: 'title', title: '标题', type: 'string' }),
        defineField({ name: 'text', title: '内容', type: 'text', rows: 4, validation: rule => rule.required() }),
      ],
      preview: { select: { title: 'title', subtitle: 'text' }, prepare: ({ title, subtitle }) => ({ title: title || '提示框', subtitle }) },
    }),
    defineArrayMember({
      name: 'tutorialStep',
      title: '操作步骤',
      type: 'object',
      fields: [
        defineField({ name: 'stepNumber', title: '步骤编号', type: 'number', validation: rule => rule.required().integer().min(1) }),
        defineField({ name: 'title', title: '步骤标题', type: 'string', validation: rule => rule.required() }),
        defineField({ name: 'text', title: '步骤说明', type: 'text', rows: 4, validation: rule => rule.required() }),
      ],
      preview: { select: { title: 'title', step: 'stepNumber' }, prepare: ({ title, step }) => ({ title: `第 ${step || '?'} 步 · ${title || ''}` }) },
    }),
    defineArrayMember({
      name: 'table',
      title: '表格',
      type: 'object',
      fields: [
        defineField({ name: 'caption', title: '表格标题', type: 'string' }),
        defineField({
          name: 'rows',
          title: '表格行',
          type: 'array',
          of: [defineArrayMember({ name: 'row', type: 'object', fields: [defineField({ name: 'cells', title: '单元格', type: 'array', of: [defineArrayMember({ type: 'string' })], validation: rule => rule.required().min(1) })] })],
          validation: rule => rule.required().min(1),
        }),
      ],
      preview: { select: { title: 'caption' }, prepare: ({ title }) => ({ title: title || '表格' }) },
    }),
    defineArrayMember({
      name: 'download',
      title: '下载按钮',
      type: 'object',
      fields: [
        defineField({ name: 'label', title: '按钮文字', type: 'string', validation: rule => rule.required() }),
        defineField({ name: 'file', title: '上传文件', type: 'file' }),
        defineField({ name: 'externalUrl', title: '或填写外部链接', type: 'url' }),
      ],
      preview: { select: { title: 'label' } },
    }),
  ],
})
