import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getHomeBlocks, saveHomeBlocks } from '@/lib/home-blocks'

function canEditSite(session: any) {
  const role = session?.user?.role
  return role === 'admin' || role === 'editor'
}

export async function GET() {
  const session = await auth()
  if (!canEditSite(session)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const blocks = await getHomeBlocks()
  return NextResponse.json({ blocks })
}

export async function PUT(request: NextRequest) {
  const session = await auth()
  if (!canEditSite(session)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = (await request.json()) as any
    if (!Array.isArray(body?.blocks)) {
      return NextResponse.json({ error: '区块数据格式不正确' }, { status: 400 })
    }
    const blocks = await saveHomeBlocks(body.blocks)
    return NextResponse.json({ blocks })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || '保存失败' }, { status: 500 })
  }
}
