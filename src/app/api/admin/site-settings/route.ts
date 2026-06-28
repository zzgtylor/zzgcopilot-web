import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { DEFAULT_SITE_SETTINGS, getSiteSettings, saveSiteSettings } from '@/lib/site-settings'

function canEditSite(session: any) {
  const role = session?.user?.role
  return role === 'admin' || role === 'editor'
}

export async function GET() {
  const session = await auth()
  if (!canEditSite(session)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const settings = await getSiteSettings()
  return NextResponse.json({ settings })
}

export async function PUT(request: NextRequest) {
  const session = await auth()
  if (!canEditSite(session)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = (await request.json()) as any
    const settings = await saveSiteSettings(body?.settings || DEFAULT_SITE_SETTINGS)
    return NextResponse.json({ settings })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || '保存失败' }, { status: 500 })
  }
}
