import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { addLink, getLinkInBioPage, removeLink, reorderLinks, updateLink, upsertLinkInBioPage } from '@/lib/actions/link-in-bio'

export async function GET() {
  const { orgId } = await auth()
  if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const page = await getLinkInBioPage()
  return NextResponse.json({ page })
}

export async function POST(req: NextRequest) {
  const { orgId } = await auth()
  if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { action, ...data } = body

  if (action === 'upsert') {
    const page = await upsertLinkInBioPage(data)
    return NextResponse.json({ page })
  }
  if (action === 'add-link') {
    const link = await addLink(data)
    return NextResponse.json({ link }, { status: 201 })
  }
  if (action === 'update-link') {
    const { id, ...linkData } = data
    const link = await updateLink(id, linkData)
    return NextResponse.json({ link })
  }
  if (action === 'remove-link') {
    await removeLink(data.id)
    return NextResponse.json({ success: true })
  }
  if (action === 'reorder') {
    await reorderLinks(data.pageId, data.orderedIds)
    return NextResponse.json({ success: true })
  }
  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
