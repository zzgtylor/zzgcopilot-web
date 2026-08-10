import { defineArrayMember, defineField } from 'sanity'
import { CustomFieldsInput } from '../components/CustomFieldsInput'

export const customFieldsField = (group = 'custom') => defineField({
  name: 'customFields',
  title: '自定义字段',
  description: '字段由“字段管理”统一创建和配置。',
  type: 'array',
  group,
  components: { input: CustomFieldsInput },
  validation: rule => rule.custom(async (values, context) => {
    const documentType = String(context.document?._type || '')
    if (!documentType) return true
    const required = await context.getClient({ apiVersion: '2026-08-09' }).fetch<Array<{ _id: string; title?: string; fieldType?: string }>>('*[_type == "customFieldDefinition" && enabled != false && required == true && $documentType in appliesTo]{_id,title,fieldType}', { documentType })
    const entries = Array.isArray(values) ? values as Array<Record<string, any>> : []
    const missing = required.filter(definition => {
      const entry = entries.find(item => item.definition?._ref === definition._id)
      if (!entry) return true
      if (definition.fieldType === 'boolean') return typeof entry.valueBoolean !== 'boolean'
      if (definition.fieldType === 'number') return typeof entry.valueNumber !== 'number' || Number.isNaN(entry.valueNumber)
      return typeof entry.valueString !== 'string' || !entry.valueString.trim()
    })
    return missing.length ? `请填写必填字段：${missing.map(item => item.title || item._id).join('、')}` : true
  }),
  of: [defineArrayMember({
    name: 'customFieldValue',
    type: 'object',
    fields: [
      defineField({ name: 'definition', title: '字段定义', type: 'reference', to: [{ type: 'customFieldDefinition' }] }),
      defineField({ name: 'valueString', title: '文字值', type: 'string' }),
      defineField({ name: 'valueNumber', title: '数字值', type: 'number' }),
      defineField({ name: 'valueBoolean', title: '开关值', type: 'boolean' }),
    ],
    preview: { select: { title: 'definition.title', subtitle: 'valueString' } },
  })],
})
