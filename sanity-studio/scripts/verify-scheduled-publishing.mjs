import { getCliClient } from 'sanity/cli'

const client = getCliClient({ apiVersion: '2026-08-07' })
const id = `scheduled-verification-${Date.now()}`
const endpoint = new URL(`https://${client.config().projectId}.api.sanity.io/v2026-08-07/data/query/${client.config().dataset}`)

async function publicCount() {
  endpoint.searchParams.set('query', 'count(*[_id == $id && (status == "published" || (status == "scheduled" && dateTime(publishedAt) <= dateTime(now())))])')
  endpoint.searchParams.set('$id', JSON.stringify(id))
  const response = await fetch(endpoint)
  if (!response.ok) throw new Error(`Public scheduling check failed: ${response.status}`)
  return (await response.json()).result
}

try {
  await client.create({
    _id: id,
    _type: 'post',
    title: '定时发布验证',
    slug: { _type: 'slug', current: id },
    body: [{ _type: 'block', _key: 'body', style: 'normal', markDefs: [], children: [{ _type: 'span', _key: 'span', text: '验证内容', marks: [] }] }],
    editorialStage: 'approved',
    status: 'scheduled',
    publishedAt: new Date(Date.now() + 86_400_000).toISOString(),
  })
  const beforeSchedule = await publicCount()
  await client.patch(id).set({ publishedAt: new Date(Date.now() - 86_400_000).toISOString() }).commit()
  const afterSchedule = await publicCount()
  if (beforeSchedule !== 0 || afterSchedule !== 1) throw new Error(`Scheduling verification failed: future=${beforeSchedule}, past=${afterSchedule}`)
  console.log('Scheduled publishing verified: future content hidden, due content public.')
} finally {
  await client.delete(id)
}
