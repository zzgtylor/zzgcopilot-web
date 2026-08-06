import { NextRequest, NextResponse } from 'next/server'
import { requireAdminRole } from '@/lib/admin-auth'
import { writeAuditLog } from '@/lib/audit'
import { DEFAULT_SITE_SETTINGS, getSiteSettings, saveSiteSettings } from '@/lib/site-settings'

export async function GET() {
  const access = await requireAdminRole(['admin', 'editor'])
  if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status })

  const settings = await getSiteSettings()
  return NextResponse.json({ settings })
}

export async function PUT(request: NextRequest) {
  const access = await requireAdminRole(['admin', 'editor'])
  if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status })

  try {
    const body = (await request.json()) as any
    const settings = await saveSiteSettings(body?.settings || DEFAULT_SITE_SETTINGS)
    if (access.db) await writeAuditLog(access.db, { userId: access.userId, action: 'site.settings_updated', targetType: 'site', summary: '更新站点设置', request })
    return NextResponse.json({ settings })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || '保存失败' }, { status: 500 })
  }
}
