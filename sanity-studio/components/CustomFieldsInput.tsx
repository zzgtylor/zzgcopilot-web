import { Box, Card, Stack, Text } from '@sanity/ui'
import { set, unset, useClient, useFormValue, type ArrayOfObjectsInputProps } from 'sanity'
import { useEffect, useState } from 'react'

type Definition = { _id: string; title?: string; fieldKey?: string; fieldType?: string; helpText?: string; required?: boolean; defaultValue?: string; options?: string[] }
type FieldValue = { _type: 'customFieldValue'; _key: string; definition: { _type: 'reference'; _ref: string }; valueString?: string; valueNumber?: number; valueBoolean?: boolean }
const inputStyle = { width: '100%', border: '1px solid #d9d9df', borderRadius: 6, padding: '9px 10px', font: 'inherit', background: 'white' }
const key = () => crypto.randomUUID().replace(/-/g, '').slice(0, 12)

export function CustomFieldsInput(props: ArrayOfObjectsInputProps) {
  const client = useClient({ apiVersion: '2026-08-09' })
  const documentType = String(useFormValue(['_type']) || '')
  const [definitions, setDefinitions] = useState<Definition[]>([])
  const values = (Array.isArray(props.value) ? props.value : []) as unknown as FieldValue[]

  useEffect(() => {
    if (!documentType) return
    client.fetch<Definition[]>('*[_type == "customFieldDefinition" && enabled != false && $documentType in appliesTo] | order(sortOrder asc, title asc){_id,title,fieldKey,fieldType,helpText,required,defaultValue,options}', { documentType }).then(setDefinitions).catch(() => setDefinitions([]))
  }, [client, documentType])

  function update(definition: Definition, rawValue: string | number | boolean) {
    const field = definition.fieldType === 'number' ? 'valueNumber' : definition.fieldType === 'boolean' ? 'valueBoolean' : 'valueString'
    const existing = values.find(item => item.definition?._ref === definition._id)
    const item: FieldValue = { _type: 'customFieldValue', _key: existing?._key || key(), definition: { _type: 'reference', _ref: definition._id }, [field]: rawValue }
    const next = existing ? values.map(value => value._key === existing._key ? item : value) : [...values, item]
    props.onChange(next.length ? set(next) : unset())
  }

  if (!definitions.length) return <Card padding={4} radius={2} border><Text muted>当前内容类型还没有自定义字段。请先前往“字段管理”创建字段。</Text></Card>

  return <Stack space={4}>{definitions.map(definition => {
    const current = values.find(item => item.definition?._ref === definition._id)
    const type = definition.fieldType || 'text'
    const stringValue = current?.valueString ?? definition.defaultValue ?? ''
    return <Card key={definition._id} padding={4} radius={2} border><Stack space={2}><Text size={1} weight="semibold">{definition.title || definition.fieldKey}{definition.required ? ' *' : ''}</Text>{definition.helpText ? <Text size={1} muted>{definition.helpText}</Text> : null}
      {type === 'boolean' ? <label><input type="checkbox" checked={current?.valueBoolean ?? definition.defaultValue === 'true'} onChange={event => update(definition, event.currentTarget.checked)} /> <Text size={1}>启用</Text></label>
        : type === 'longText' ? <textarea rows={4} value={stringValue} required={definition.required} onChange={event => update(definition, event.currentTarget.value)} style={{ ...inputStyle, resize: 'vertical' }} />
          : type === 'select' ? <select value={stringValue} required={definition.required} onChange={event => update(definition, event.currentTarget.value)} style={inputStyle}><option value="">请选择</option>{(definition.options || []).map(option => <option key={option} value={option}>{option}</option>)}</select>
            : <input type={type === 'number' ? 'number' : type === 'date' ? 'date' : type === 'url' || type === 'media' ? 'url' : 'text'} value={type === 'number' ? current?.valueNumber ?? definition.defaultValue ?? '' : stringValue} required={definition.required} onChange={event => update(definition, type === 'number' ? Number(event.currentTarget.value) : event.currentTarget.value)} style={inputStyle} />}
    </Stack></Card>
  })}</Stack>
}
