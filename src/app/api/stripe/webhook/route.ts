import { NextRequest, NextResponse } from 'next/server'
import { platformDb, platformValue } from '@/lib/platform'

function parseSignature(header: string) {
  const values = header.split(',').map(part => part.split('='))
  return { timestamp: values.find(([key]) => key === 't')?.[1] || '', signatures: values.filter(([key]) => key === 'v1').map(([, value]) => value) }
}

async function hmacHex(secret: string, payload: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))
  return Array.from(new Uint8Array(signature)).map(value => value.toString(16).padStart(2, '0')).join('')
}

export async function POST(request: NextRequest) {
  const secret = platformValue('STRIPE_WEBHOOK_SECRET'), db = platformDb(), raw = await request.text()
  if (!secret || !db) return NextResponse.json({ error: 'Stripe webhook 未配置' }, { status: 503 })
  const parsed = parseSignature(request.headers.get('stripe-signature') || '')
  const recent = Math.abs(Date.now() / 1000 - Number(parsed.timestamp)) <= 300
  const expected = parsed.timestamp ? await hmacHex(secret, `${parsed.timestamp}.${raw}`) : ''
  if (!recent || !parsed.signatures.some(value => value === expected)) return NextResponse.json({ error: '签名无效' }, { status: 400 })
  const event = JSON.parse(raw) as { type?: string; data?: { object?: Record<string, unknown> } }
  const object = event.data?.object || {}
  if (event.type === 'checkout.session.completed') {
    const memberId = String(object.client_reference_id || (object.metadata as Record<string, unknown> | undefined)?.member_id || '')
    if (memberId) await db.batch([
      db.prepare("UPDATE members SET stripe_customer_id=?,plan='paid',updated_at=datetime('now') WHERE id=?").bind(String(object.customer || ''), memberId),
      db.prepare("INSERT INTO member_subscriptions(member_id,stripe_subscription_id,status,price_id) VALUES(?,?,?,?) ON CONFLICT(stripe_subscription_id) DO UPDATE SET status=excluded.status,updated_at=datetime('now')").bind(memberId, String(object.subscription || ''), object.payment_status === 'paid' ? 'active' : 'incomplete', null),
    ])
  }
  if (event.type?.startsWith('customer.subscription.')) {
    const status = String(object.status || 'inactive'), subscriptionId = String(object.id || ''), customer = String(object.customer || '')
    const period = typeof object.current_period_end === 'number' ? new Date(object.current_period_end * 1000).toISOString() : null
    await db.prepare("UPDATE member_subscriptions SET status=?,current_period_end=?,updated_at=datetime('now') WHERE stripe_subscription_id=? OR member_id=(SELECT id FROM members WHERE stripe_customer_id=?)").bind(status, period, subscriptionId, customer).run()
  }
  return NextResponse.json({ received: true })
}
