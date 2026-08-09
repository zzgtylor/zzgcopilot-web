import { defineField, defineType } from 'sanity'

export const redirectType = defineType({
  name: 'redirect',
  title: '网址重定向',
  type: 'document',
  fields: [
    defineField({ name: 'sourcePath', title: '旧网址路径', description: '例如 /old-page，不要填写域名。', type: 'string', validation: rule => rule.required().regex(/^\/[A-Za-z0-9/_-]*$/).error('必须是以 / 开头的站内路径') }),
    defineField({ name: 'targetPath', title: '新网址或完整 URL', type: 'string', validation: rule => rule.required().custom(value => value && (value.startsWith('/') || /^https?:\/\//.test(value)) ? true : '请填写 / 开头的路径或完整 https:// URL') }),
    defineField({ name: 'statusCode', title: '重定向类型', type: 'number', initialValue: 308, options: { list: [{ title: '永久重定向 308（推荐）', value: 308 }, { title: '临时重定向 307', value: 307 }] }, validation: rule => rule.required() }),
    defineField({ name: 'enabled', title: '启用', type: 'boolean', initialValue: true }),
  ],
  preview: { select: { title: 'sourcePath', subtitle: 'targetPath' } },
})
