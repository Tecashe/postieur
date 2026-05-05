import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { archiveMessage, getMessages, markAllRead, markRead } from '@/lib/actions/inbox'

export async function GET(req: NextRequest) {
  const { orgId } = await auth()
  if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const url = new URL(req.url)
  const filter = (url.searchParams.get('filter') ?? 'all') as 'all' | 'unread' | 'archived'
  const platform = url.searchParams.get('platform') ?? undefined
  const limit = Number(url.searchParams.get('limit') ?? '50')
  const messages = await getMessages({ filter, platform, limit })
  return NextResponse.json({ messages })
}

export async function PATCH(req: NextRequest) {
  const { orgId } = await auth()
  if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { action, id } = await req.json()
  if (action === 'mark-read' && id) { await markRead(id); return NextResponse.json({ success: true }) }
  if (action === 'mark-all-read') { await markAllRead(); return NextResponse.json({ success: true }) }
  if (action === 'archive' && id) { await archiveMessage(id); return NextResponse.json({ success: true }) }
  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
