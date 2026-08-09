import { NextRequest, NextResponse } from 'next/server'
import { currentMember } from '@/lib/member-auth'
import { platformDb, platformValue } from '@/lib/platform'
import { getSanityPost } from '@/lib/sanity-content'
import { recordAnalyticsEvent, requestAnalyticsContext } from '@/lib/analytics'

export async function POST(request: NextRequest) {
  const member = await currentMember(), secret = platformValue('STRIPE_SECRET_KEY')
  if (!member) return NextResponse.json({ error: '请先登录会员账户' }, { status: 401 })
  if (!secret) return NextResponse.json({ error: 'Stripe 尚未配置' }, { status: 503 })
  const { slug } = await request.json().catch(() => ({ slug: '' })) as { slug?: string }
  const post = slug ? await getSanityPost(slug) : null
  if (!post?.stripe_price_id || post.access_level !== 'paid') return NextResponse.json({ error: '该内容没有有效价格' }, { status: 400 })
  const form = new URLSearchParams({ mode: 'subscription', 'line_items[0][price]': post.stripe_price_id, 'line_items[0][quantity]': '1', client_reference_id: member.id, customer_email: member.email, success_url: `https://zzgcopilot.com/tutorials/${post.slug}?payment=success`, cancel_url: `https://zzgcopilot.com/tutorials/${post.slug}?payment=cancelled`, 'metadata[member_id]': member.id })
  const response = await fetch('https://api.stripe.com/v1/checkout/sessions', { method: 'POST', headers: { authorization: `Bearer ${secret}`, 'content-type': 'application/x-www-form-urlencoded' }, body: form })
  const result = await response.json() as { url?: string; error?: { message?: string } }
  const db = platformDb()
  if (result.url && db) await recordAnalyticsEvent(db, { type: 'checkout_start', path: `/tutorials/${post.slug}`, label: post.title, ...(await requestAnalyticsContext(request)) })
  return result.url ? NextResponse.json({ url: result.url }) : NextResponse.json({ error: result.error?.message || '无法创建付款页面' }, { status: 502 })
}
