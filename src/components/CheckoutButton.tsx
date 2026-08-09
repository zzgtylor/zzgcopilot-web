'use client'
import { useState } from 'react'

export function CheckoutButton({ slug }: { slug: string }) {
  const [message, setMessage] = useState('')
  async function checkout() { const response = await fetch('/api/stripe/checkout', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug }) }); const result = await response.json() as { url?: string; error?: string }; if (result.url) location.href = result.url; else setMessage(result.error || '无法付款') }
  return <div className="mt-5"><button onClick={checkout} className="rounded bg-[var(--site-primary)] px-5 py-2.5 text-white">订阅并阅读</button>{message && <p className="mt-2 text-sm text-red-700">{message}</p>}</div>
}
