import { defineField, defineType } from 'sanity'

export const customFieldDefinitionType = defineType({
  name: 'customFieldDefinition',
  title: '自定义字段',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: '后台显示名称', type: 'string', validation: rule => rule.required().max(80) }),
    defineField({ name: 'fieldKey', title: '字段标识', description: '使用英文、数字和下划线，例如 software_version。创建后建议不要修改。', type: 'string', validation: rule => rule.required().regex(/^[a-z][a-z0-9_]*$/, { name: '字段标识' }) }),
    defineField({ name: 'fieldType', title: '字段类型', type: 'string', initialValue: 'text', options: { list: [{ title: '单行文字', value: 'text' }, { title: '多行文字', value: 'longText' }, { title: '数字', value: 'number' }, { title: '开关', value: 'boolean' }, { title: '日期', value: 'date' }, { title: '网址', value: 'url' }, { title: '下拉选项', value: 'select' }, { title: '图片或文件网址', value: 'media' }, { title: '内容引用或 Slug', value: 'reference' }] }, validation: rule => rule.required() }),
    defineField({ name: 'appliesTo', title: '用于哪些内容', type: 'array', of: [{ type: 'string' }], initialValue: ['post'], options: { list: [{ title: '文章', value: 'post' }, { title: '独立页面', value: 'page' }], layout: 'grid' }, validation: rule => rule.required().min(1) }),
    defineField({ name: 'helpText', title: '填写说明', type: 'string', validation: rule => rule.max(160) }),
    defineField({ name: 'required', title: '必填字段', type: 'boolean', initialValue: false }),
    defineField({ name: 'defaultValue', title: '默认值', type: 'string' }),
    defineField({ name: 'options', title: '下拉选项', type: 'array', of: [{ type: 'string' }], options: { layout: 'tags' }, hidden: ({ document }) => document?.fieldType !== 'select', validation: rule => rule.custom((value, context) => context.document?.fieldType !== 'select' || (Array.isArray(value) && value.length > 0) ? true : '下拉字段至少需要一个选项') }),
    defineField({ name: 'displayOnPage', title: '在前台显示', type: 'boolean', initialValue: true }),
    defineField({ name: 'placement', title: '前台显示位置', type: 'string', initialValue: 'afterContent', options: { list: [{ title: '正文前', value: 'beforeContent' }, { title: '正文后', value: 'afterContent' }] }, hidden: ({ document }) => document?.displayOnPage === false }),
    defineField({ name: 'sortOrder', title: '排序数字', type: 'number', initialValue: 100 }),
    defineField({ name: 'enabled', title: '启用字段', type: 'boolean', initialValue: true }),
  ],
  preview: { select: { title: 'title', subtitle: 'fieldType' } },
})
