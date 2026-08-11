import { NextResponse } from 'next/server'
import { platformValue } from '@/lib/platform'

const allowedOrigin = 'https://zzgcopilot.sanity.studio'

function headers(request: Request) {
  const origin = request.headers.get('origin')
  return {
    'Access-Control-Allow-Origin': origin === allowedOrigin ? origin : 'https://zzgcopilot.com',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'no-store',
    Vary: 'Origin',
  }
}

export async function GET(request: Request) {
  const status = {
    sanity: Boolean(platformValue('NEXT_PUBLIC_SANITY_PROJECT_ID') || platformValue('SANITY_PROJECT_ID')),
    turnstile: Boolean(platformValue('TURNSTILE_SECRET_KEY')),
    stripe: Boolean(platformValue('STRIPE_SECRET_KEY') && platformValue('STRIPE_WEBHOOK_SECRET')),
    memberEmail: Boolean(platformValue('RESEND_API_KEY') && platformValue('MEMBER_FROM_EMAIL')),
    adminAccess: Boolean(platformValue('ADMIN_ALLOWED_EMAILS')),
  }
  return NextResponse.json({ ok: true, checkedAt: new Date().toISOString(), services: status }, { headers: headers(request) })
}

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: headers(request) })
}
