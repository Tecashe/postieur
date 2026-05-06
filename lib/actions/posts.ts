'use server'

import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// ── Helper: resolve workspace from Clerk org ──────────────────────────────────

async function requireWorkspace() {
  const { userId, orgId, sessionClaims } = await auth()
  if (!userId) throw new Error('Unauthenticated')
  if (!orgId) throw new Error('No active organization')

  const workspace = await prisma.workspace.findUnique({
    where: { clerkOrgId: orgId },
  })
  if (!workspace) {
    throw new Error('Workspace not found. Please refresh the page.')
  }
  const role = (sessionClaims?.['org_role'] as string | undefined) ?? 'org:member'
  return { userId, workspace, role }
}

// ── Create Post ───────────────────────────────────────────────────────────────

const CreatePostSchema = z.object({
  content: z.string().min(1).max(5000),
  type: z.enum(['POST', 'THREAD', 'CAROUSEL', 'REEL', 'STORY', 'ARTICLE']).default('POST'),
  status: z.enum(['DRAFT', 'SCHEDULED']).default('DRAFT'),
  scheduledAt: z.string().datetime().optional().nullable(),
  mediaUrls: z.array(z.string().url()).default([]),
  threadPosts: z.array(z.string()).default([]),
  labels: z.array(z.string()).default([]),
  crossPostDelayMinutes: z.number().int().min(0).default(0),
  channelIds: z.array(z.string()).default([]),
  recycleEnabled: z.boolean().default(false),
  recycleIntervalDays: z.number().int().min(1).optional(),
  platformSettings: z.record(z.record(z.string())).default({}),
  platformContents: z.record(z.string()).default({}),
  firstComment: z.string().max(2000).optional().nullable(),
  firstCommentDelayMins: z.number().int().min(0).max(60).default(0),
  channelSetId: z.string().optional().nullable(),
})

export type CreatePostInput = z.infer<typeof CreatePostSchema>

export async function createPost(input: CreatePostInput) {
  const { userId, workspace, role } = await requireWorkspace()
  const data = CreatePostSchema.parse(input)

  // Approval gate: if workspace requires approval AND the user is a content editor,
  // override status to PENDING_APPROVAL instead of SCHEDULED
  let effectiveStatus = data.status
  if (
    workspace.requireApproval &&
    role === 'org:content_editor' &&
    data.status === 'SCHEDULED'
  ) {
    effectiveStatus = 'PENDING_APPROVAL' as typeof data.status
  }

  // Fetch channel platforms so we can key platformSettings correctly (keyed by platform name)
  const channelRows = data.channelIds.length > 0
    ? await prisma.channel.findMany({
        where: { id: { in: data.channelIds }, workspaceId: workspace.id },
        select: { id: true, platform: true },
      })
    : []
  const channelPlatformMap = Object.fromEntries(channelRows.map(c => [c.id, c.platform]))

  const post = await prisma.post.create({
    data: {
      workspaceId: workspace.id,
      content: data.content,
      type: data.type,
      status: effectiveStatus,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
      mediaUrls: data.mediaUrls,
      threadPosts: data.threadPosts,
      labels: data.labels,
      crossPostDelayMinutes: data.crossPostDelayMinutes,
      recycleEnabled: data.recycleEnabled,
      recycleIntervalDays: data.recycleIntervalDays ?? null,
      recycleNextAt: data.recycleEnabled && data.recycleIntervalDays
        ? new Date(Date.now() + data.recycleIntervalDays * 86400_000)
        : null,
      platformContents: data.platformContents,
      firstComment: data.firstComment ?? null,
      firstCommentDelayMins: data.firstCommentDelayMins,
      channelSetId: data.channelSetId ?? null,
      createdById: userId,
      channels: data.channelIds.length > 0 ? {
        create: data.channelIds.map(channelId => ({
          channelId,
          // PostChannel status mirrors post status for the channel link
          status: effectiveStatus === 'SCHEDULED' ? 'SCHEDULED' : 'DRAFT',
          config: data.platformSettings[channelPlatformMap[channelId] ?? ''] ?? {},
        })),
      } : undefined,
    },
    include: { channels: { include: { channel: true } } },
  })

  revalidatePath('/dashboard/calendar')
  revalidatePath('/dashboard/queue')
  revalidatePath('/dashboard')

  // If pending approval, let the caller know so compose can show the right toast
  return { success: true, post, pendingApproval: effectiveStatus === ('PENDING_APPROVAL' as string) }
}

// ── Get Posts ─────────────────────────────────────────────────────────────────

export async function getPosts(options?: {
  status?: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'FAILED'
  limit?: number
  offset?: number
}) {
  const { workspace } = await requireWorkspace()

  const posts = await prisma.post.findMany({
    where: {
      workspaceId: workspace.id,
      ...(options?.status ? { status: options.status } : {}),
    },
    include: {
      channels: { include: { channel: true } },
      analytics: true,
    },
    orderBy: { scheduledAt: 'asc' },
    take: options?.limit ?? 100,
    skip: options?.offset ?? 0,
  })

  return posts
}

// ── Update Post ───────────────────────────────────────────────────────────────

export async function updatePost(
  postId: string,
  input: Partial<CreatePostInput>,
) {
  const { workspace } = await requireWorkspace()
  const data = CreatePostSchema.partial().parse(input)

  // Verify ownership
  const existing = await prisma.post.findFirst({
    where: { id: postId, workspaceId: workspace.id },
  })
  if (!existing) throw new Error('Post not found')

  const post = await prisma.post.update({
    where: { id: postId },
    data: {
      ...(data.content !== undefined && { content: data.content }),
      ...(data.type !== undefined && { type: data.type }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.scheduledAt !== undefined && {
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
      }),
      ...(data.mediaUrls !== undefined && { mediaUrls: data.mediaUrls }),
      ...(data.threadPosts !== undefined && { threadPosts: data.threadPosts }),
      ...(data.labels !== undefined && { labels: data.labels }),
      ...(data.crossPostDelayMinutes !== undefined && {
        crossPostDelayMinutes: data.crossPostDelayMinutes,
      }),
    },
  })

  revalidatePath('/dashboard/calendar')
  revalidatePath('/dashboard/queue')
  return { success: true, post }
}

// ── Delete Post ───────────────────────────────────────────────────────────────

export async function deletePost(postId: string) {
  const { workspace } = await requireWorkspace()

  const existing = await prisma.post.findFirst({
    where: { id: postId, workspaceId: workspace.id },
  })
  if (!existing) throw new Error('Post not found')

  await prisma.post.delete({ where: { id: postId } })

  revalidatePath('/dashboard/calendar')
  revalidatePath('/dashboard/queue')
  revalidatePath('/dashboard')
  return { success: true }
}

// ── Reschedule Post ───────────────────────────────────────────────────────────

export async function reschedulePost(postId: string, newDate: Date) {
  const { workspace } = await requireWorkspace()

  const existing = await prisma.post.findFirst({
    where: { id: postId, workspaceId: workspace.id },
  })
  if (!existing) throw new Error('Post not found')

  const post = await prisma.post.update({
    where: { id: postId },
    data: { scheduledAt: newDate, status: 'SCHEDULED' },
  })

  revalidatePath('/dashboard/calendar')
  return { success: true, post }
}

// ── Get Dashboard Stats ────────────────────────────────────────────────────────

export async function getDashboardStats() {
  const { workspace } = await requireWorkspace()

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const [totalPosts, scheduled, published, failed, scheduledPosts, channels, recentAnalytics, recentPublished] = await Promise.all([
    prisma.post.count({ where: { workspaceId: workspace.id } }),
    prisma.post.count({ where: { workspaceId: workspace.id, status: 'SCHEDULED' } }),
    prisma.post.count({ where: { workspaceId: workspace.id, status: 'PUBLISHED' } }),
    prisma.post.count({ where: { workspaceId: workspace.id, status: 'FAILED' } }),
    prisma.post.findMany({
      where: { workspaceId: workspace.id, status: 'SCHEDULED' },
      include: { channels: { include: { channel: true } } },
      orderBy: { scheduledAt: 'asc' },
      take: 6,
    }),
    prisma.channel.findMany({
      where: { workspaceId: workspace.id, isActive: true },
      orderBy: { createdAt: 'desc' },
      take: 8,
    }),
    // Analytics for last 30 days
    prisma.postAnalytics.findMany({
      where: { post: { workspaceId: workspace.id, publishedAt: { gte: thirtyDaysAgo } } },
      include: { post: { select: { publishedAt: true } } },
    }),
    // Recent published posts for activity feed
    prisma.post.findMany({
      where: { workspaceId: workspace.id, status: 'PUBLISHED' },
      include: { channels: { include: { channel: true } } },
      orderBy: { publishedAt: 'desc' },
      take: 5,
    }),
  ])

  // 7-day trend buckets (Mon–Sun labels)
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const weekBuckets = new Map<string, { eng: number; reach: number }>()
  // Initialise past 7 days
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    weekBuckets.set(dayNames[d.getDay()], { eng: 0, reach: 0 })
  }
  for (const a of recentAnalytics) {
    if (!a.post.publishedAt) continue
    const diff = Date.now() - new Date(a.post.publishedAt).getTime()
    if (diff > 7 * 24 * 60 * 60 * 1000) continue
    const key = dayNames[new Date(a.post.publishedAt).getDay()]
    const existing = weekBuckets.get(key) ?? { eng: 0, reach: 0 }
    weekBuckets.set(key, {
      eng: existing.eng + (a.likes ?? 0) + (a.comments ?? 0) + (a.shares ?? 0),
      reach: existing.reach + (a.reach ?? 0),
    })
  }
  const weekData = Array.from(weekBuckets.entries()).map(([day, v]) => ({ day, ...v }))

  // 30-day totals
  const totalReach = recentAnalytics.reduce((sum, a) => sum + (a.reach ?? 0), 0)
  const totalEngagement = recentAnalytics.reduce((sum, a) => sum + (a.likes ?? 0) + (a.comments ?? 0) + (a.shares ?? 0), 0)

  // Activity feed
  const activity = recentPublished.map(p => ({
    id: p.id,
    content: p.content,
    platform: p.channels[0]?.channel.platform ?? 'x',
    publishedAt: p.publishedAt?.toISOString() ?? p.createdAt.toISOString(),
  }))

  return { totalPosts, scheduled, published, failed, scheduledPosts, channels, weekData, totalReach, totalEngagement, activity }
}
