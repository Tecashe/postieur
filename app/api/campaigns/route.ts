import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { createCampaign, getCampaigns } from '@/lib/actions/campaigns'

export async function GET() {
  try {
    const { orgId } = await auth()
    if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const campaigns = await getCampaigns()
    return NextResponse.json({ campaigns })
  } catch (err) {
    console.error('[campaigns GET]', err)
    return NextResponse.json({ error: 'Failed to load campaigns' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { orgId } = await auth()
    if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req.json() as Record<string, unknown>
    const campaign = await createCampaign(body as Parameters<typeof createCampaign>[0])
    return NextResponse.json({ campaign }, { status: 201 })
  } catch (err) {
    console.error('[campaigns POST]', err)
    const message = err instanceof Error ? err.message : 'Failed to create campaign'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
