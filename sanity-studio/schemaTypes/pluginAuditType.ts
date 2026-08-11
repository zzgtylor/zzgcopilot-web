import { defineField, defineType } from 'sanity'

export const pluginAuditType = defineType({
  name: 'pluginAudit',
  title: '插件操作日志',
  type: 'document',
  fields: [
    defineField({ name: 'pluginId', title: '插件 ID', type: 'string', readOnly: true }),
    defineField({ name: 'pluginTitle', title: '插件名称', type: 'string', readOnly: true }),
    defineField({ name: 'action', title: '操作', type: 'string', readOnly: true }),
    defineField({ name: 'previousStatus', title: '操作前状态', type: 'string', readOnly: true }),
    defineField({ name: 'nextStatus', title: '操作后状态', type: 'string', readOnly: true }),
    defineField({ name: 'version', title: '版本', type: 'string', readOnly: true }),
    defineField({ name: 'actorName', title: '操作人', type: 'string', readOnly: true }),
    defineField({ name: 'occurredAt', title: '操作时间', type: 'datetime', readOnly: true }),
  ],
  preview: { select: { title: 'pluginTitle', action: 'action', occurredAt: 'occurredAt' }, prepare: ({ title, action, occurredAt }) => ({ title: `${title || '插件'} · ${action || '操作'}`, subtitle: occurredAt }) },
})
