import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/posts/reorder
 *
 * Persists a drag-reorder of the queue by swapping scheduledAt timestamps.
 *
 * Strategy: pull the scheduledAt values of all affected posts, sort them
 * ascending (preserving the existing time slots), then assign them to the
 * posts in the caller-supplied order. This means the earliest slot always
 * goes to the post the user placed first — which is exactly what users expect.
 *
 * Body: { orderedIds: string[] }   — full new order, SCHEDULED posts only
 * Returns: { success: true, updatedCount: number }
 */
export async function POST(req: NextRequest) {
  const { userId, orgId } = await auth()
  if (!userId || !orgId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const workspace = await prisma.workspace.findUnique({
    where: { clerkOrgId: orgId },
    select: { id: true },
  })
  if (!workspace) {
    return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
  }

  const body = await req.json() as { orderedIds?: unknown }
  const orderedIds = body.orderedIds

  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    return NextResponse.json({ error: 'orderedIds must be a non-empty array' }, { status: 400 })
  }

  if (orderedIds.some(id => typeof id !== 'string')) {
    return NextResponse.json({ error: 'All orderedIds must be strings' }, { status: 400 })
  }

  // Load all posts — verify ownership and that they are SCHEDULED
  const posts = await prisma.post.findMany({
    where: {
      id: { in: orderedIds as string[] },
      workspaceId: workspace.id,
      status: 'SCHEDULED',
    },
    select: { id: true, scheduledAt: true },
  })

  // All IDs must resolve (ownership + status guard)
  if (posts.length !== orderedIds.length) {
    const foundIds = new Set(posts.map(p => p.id))
    const missing = (orderedIds as string[]).filter(id => !foundIds.has(id))
    return NextResponse.json(
      { error: `Some posts were not found, not scheduled, or do not belong to this workspace`, missing },
      { status: 422 }
    )
  }

  // Collect the scheduledAt timestamps in ascending order (the existing time slots).
  // Posts without a scheduledAt are pushed to the end to avoid null spreading.
  const sortedTimestamps = posts
    .map(p => p.scheduledAt)
    .sort((a, b) => {
      if (a === null && b === null) return 0
      if (a === null) return 1
      if (b === null) return -1
      return a.getTime() - b.getTime()
    })

  // Assign timestamps to posts in the caller-supplied order
  const updates = (orderedIds as string[]).map((id, idx) => ({
    id,
    scheduledAt: sortedTimestamps[idx],
  }))

  // Batch update in a transaction
  await prisma.$transaction(
    updates.map(({ id, scheduledAt }) =>
      prisma.post.update({
        where: { id },
        data: { scheduledAt },
      })
    )
  )

  return NextResponse.json({ success: true, updatedCount: updates.length })
}
