import assert from 'node:assert/strict'

const base = (process.env.PREVIEW_BASE_URL || '').replace(/\/$/, '')
if (!base) throw new Error('PREVIEW_BASE_URL is required for Preview acceptance tests')

async function request(path, init) {
  const response = await fetch(`${base}${path}`, init)
  assert.notEqual(response.status, 500, `${path} returned 500`)
  return response
}

const home = await request('/')
assert.equal(home.status, 200)
assert.match(await home.text(), /ZZGCopilot|教程|Microsoft|登录/i)
assert.equal((await request('/api/integrations/status')).status, 200)
assert.equal((await request('/api/comments?contentId=preview-smoke')).status, 200)
assert.equal((await request('/api/cron/health')).status, 401)
const login = await request('/api/member/request-link', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: 'preview-invalid@example.com' }) })
assert.ok([400, 403, 503].includes(login.status), `unexpected login status ${login.status}`)
const comment = await request('/api/comments', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: 'Preview', email: 'preview-invalid@example.com', body: 'smoke', contentId: 'preview-smoke' }) })
assert.ok([400, 403, 503].includes(comment.status), `unexpected comment status ${comment.status}`)
const upload = await request('/api/uploads', { method: 'POST', body: new FormData() })
assert.equal(upload.status, 403, `upload endpoint must reject unauthenticated Preview requests, got ${upload.status}`)
console.log(`Preview acceptance passed against ${base}`)
