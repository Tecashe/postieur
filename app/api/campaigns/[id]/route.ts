import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { deleteCampaign, updateCampaign } from '@/lib/actions/campaigns'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { orgId } = await auth()
    if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = await params
    const body = await req.json() as Parameters<typeof updateCampaign>[1]
    const campaign = await updateCampaign(id, body)
    return NextResponse.json({ campaign })
  } catch (err) {
    console.error('[campaigns PUT]', err)
    const message = err instanceof Error ? err.message : 'Failed to update campaign'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { orgId } = await auth()
    if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = await params
    await deleteCampaign(id)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[campaigns DELETE]', err)
    const message = err instanceof Error ? err.message : 'Failed to delete campaign'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

