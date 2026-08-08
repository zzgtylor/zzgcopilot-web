import { defineField, defineType } from 'sanity'

export const navigationItemType = defineType({
  name: 'navigationItem',
  title: '导航菜单项',
  type: 'document',
  fields: [
    defineField({ name: 'label', title: '显示名称', type: 'string', validation: rule => rule.required().max(40) }),
    defineField({ name: 'href', title: '链接地址', type: 'string', validation: rule => rule.required() }),
    defineField({ name: 'sortOrder', title: '排序', type: 'number', initialValue: 0, validation: rule => rule.integer().min(0) }),
    defineField({ name: 'isVisible', title: '显示', type: 'boolean', initialValue: true }),
    defineField({ name: 'openNewTab', title: '新窗口打开', type: 'boolean', initialValue: false }),
  ],
  preview: { select: { title: 'label', subtitle: 'href' } },
})
