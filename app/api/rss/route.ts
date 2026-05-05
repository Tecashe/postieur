import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { createRssFeed, deleteRssFeed, getRssFeeds, updateRssFeed } from '@/lib/actions/rss'

export async function GET() {
  const { orgId } = await auth()
  if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const feeds = await getRssFeeds()
  return NextResponse.json({ feeds })
}

export async function POST(req: NextRequest) {
  const { orgId } = await auth()
  if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const feed = await createRssFeed(body)
  return NextResponse.json({ feed }, { status: 201 })
}
