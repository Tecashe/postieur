import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyApiKey } from '@/lib/api-key-auth'

async function resolveWorkspaceId(req: NextRequest): Promise<string | null> {
  const apiKey = req.headers.get('authorization')
  if (apiKey) return verifyApiKey(apiKey)
  const { orgId } = await auth()
  if (!orgId) return null
  const ws = await prisma.workspace.findUnique({ where: { clerkOrgId: orgId }, select: { id: true } })
  return ws?.id ?? null
}

export async function GET(req: NextRequest) {
  const workspaceId = await resolveWorkspaceId(req)
  if (!workspaceId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const url = new URL(req.url)
  const days = Number(url.searchParams.get('days') ?? '30')
  const since = new Date(Date.now() - days * 86400_000)
  const analytics = await prisma.postAnalytics.findMany({
    where: { post: { workspaceId, publishedAt: { gte: since } } },
    include: { post: { select: { publishedAt: true, content: true } } },
  })
  const totals = analytics.reduce(
    (acc: { impressions: number; likes: number; comments: number; shares: number; clicks: number; reach: number }, a) => ({
      impressions: acc.impressions + a.impressions,
      likes: acc.likes + a.likes,
      comments: acc.comments + a.comments,
      shares: acc.shares + a.shares,
      clicks: acc.clicks + a.clicks,
      reach: acc.reach + a.reach,
    }),
    { impressions: 0, likes: 0, comments: 0, shares: 0, clicks: 0, reach: 0 }
  )
  return NextResponse.json({ totals, postCount: analytics.length, period: `${days}d` })
}
