import { Suspense } from 'react'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import CalendarClient from './calendar-client'
import type { Post } from '@/lib/types'

async function getCalendarPosts(): Promise<Post[]> {
  const { orgId } = await auth()
  if (!orgId) return []

  const workspace = await prisma.workspace.findUnique({
    where: { clerkOrgId: orgId },
    select: { id: true },
  })
  if (!workspace) return []

  const dbPosts = await prisma.post.findMany({
    where: { workspaceId: workspace.id },
    include: {
      channels: { include: { channel: true } },
      analytics: true,
    },
    orderBy: { scheduledAt: 'asc' },
    take: 200,
  })

  return dbPosts.map(p => ({
    id: p.id,
    content: p.content,
    platforms: p.channels.map(pc => pc.channel.platform) as Post['platforms'],
    scheduledAt: p.scheduledAt ?? new Date(),
    status: p.status.toLowerCase() as Post['status'],
    mediaUrls: p.mediaUrls,
    engagement: p.analytics ? {
      likes: p.analytics.likes,
      comments: p.analytics.comments,
      shares: p.analytics.shares,
      impressions: p.analytics.impressions,
    } : undefined,
  }))
}

export default async function CalendarPage() {
  const initialPosts = await getCalendarPosts()
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-muted/20" />}>
      <CalendarClient initialPosts={initialPosts} />
    </Suspense>
  )
}
