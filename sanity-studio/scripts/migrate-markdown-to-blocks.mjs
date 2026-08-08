import { getCliClient } from 'sanity/cli'

const client = getCliClient({ apiVersion: '2026-08-07' })
const documents = await client.fetch('*[_type in ["post", "page"] && defined(content) && length(content) > 0 && (!defined(body) || count(body) == 0)]{_id, content, status}')

function block(key, text, style = 'normal', listItem) {
  return {
    _type: 'block',
    _key: key,
    style,
    markDefs: [],
    children: [{ _type: 'span', _key: `${key}-span`, text, marks: [] }],
    ...(listItem ? { listItem, level: 1 } : {}),
  }
}

function markdownToBlocks(markdown) {
  const result = []
  let sequence = 0
  for (const rawLine of markdown.replace(/\r\n/g, '\n').split('\n')) {
    const line = rawLine.trim()
    if (!line) continue
    const key = `migrated-${String(sequence++).padStart(4, '0')}`
    if (line.startsWith('### ')) result.push(block(key, line.slice(4), 'h3'))
    else if (line.startsWith('## ')) result.push(block(key, line.slice(3), 'h2'))
    else if (/^(?:[-*•])\s*/.test(line)) result.push(block(key, line.replace(/^(?:[-*•])\s*/, ''), 'normal', 'bullet'))
    else result.push(block(key, line))
  }
  return result
}

for (const document of documents) {
  const body = markdownToBlocks(document.content)
  await client.patch(document._id).set({ body, editorialStage: document.status === 'published' ? 'approved' : 'writing' }).commit()
  console.log(`Migrated ${document._id}: ${body.length} block(s)`)
}

console.log(`Portable Text migration complete: ${documents.length} document(s).`)
