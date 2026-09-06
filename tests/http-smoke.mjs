import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'

const port = process.env.SMOKE_PORT || '3199'
const baseUrl = process.env.SMOKE_BASE_URL || `http://127.0.0.1:${port}`
const server = process.env.SMOKE_BASE_URL ? null : spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', port], { stdio: 'ignore' })

async function waitForServer() {
  const deadline = Date.now() + 30_000
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseUrl}/robots.txt`)
      if (response.ok) return
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 250))
  }
  throw new Error(`Smoke server did not start at ${baseUrl}`)
}

async function check(path, expectedStatus = 200) {
  const response = await fetch(`${baseUrl}${path}`)
  assert.equal(response.status, expectedStatus, `${path} returned ${response.status}`)
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff', `${path} missing nosniff`) 
  assert.equal(response.headers.get('x-frame-options'), 'SAMEORIGIN', `${path} missing frame policy`)
  assert.equal(response.headers.get('referrer-policy'), 'strict-origin-when-cross-origin', `${path} missing referrer policy`)
  return response
}

try {
  await waitForServer()
  const home = await check('/')
  assert.match(await home.text(), /ZZGCopilot|教程|Microsoft|登录/i)
  await check('/robots.txt')
  await check('/sitemap.xml')
  await check('/api/integrations/status')
  await check('/api/cron/health', 401)
  console.log(`HTTP smoke tests passed against ${baseUrl}`)
} finally {
  if (server) server.kill('SIGTERM')
}
