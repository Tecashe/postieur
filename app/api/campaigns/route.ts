import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { createCampaign, deleteCampaign, getCampaigns, updateCampaign } from '@/lib/actions/campaigns'

export async function GET() {
  const { orgId } = await auth()
  if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const campaigns = await getCampaigns()
  return NextResponse.json({ campaigns })
}

export async function POST(req: NextRequest) {
  const { orgId } = await auth()
  if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const campaign = await createCampaign(body)
  return NextResponse.json({ campaign }, { status: 201 })
}
