'use server'

import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// ── Helper: resolve workspace from Clerk org ──────────────────────────────────

async function requireWorkspace() {
  const { userId, orgId } = await auth()
  if (!userId) throw new Error('Unauthenticated')
  if (!orgId) throw new Error('No active organization')

  const workspace = await prisma.workspace.findUnique({
    where: { clerkOrgId: orgId },
  })
  // Auto-create workspace row if org exists in Clerk but not yet in DB
  // (happens for orgs created before the webhook was configured)
  if (!workspace) {
    throw new Error('Workspace not found. Please refresh the page.')
  }
  return { userId, workspace }
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
})

export type CreatePostInput = z.infer<typeof CreatePostSchema>

export async function createPost(input: CreatePostInput) {
  const { userId, workspace } = await requireWorkspace()
  const data = CreatePostSchema.parse(input)

  const post = await prisma.post.create({
    data: {
      workspaceId: workspace.id,
      content: data.content,
      type: data.type,
      status: data.status,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
      mediaUrls: data.mediaUrls,
      threadPosts: data.threadPosts,
      labels: data.labels,
      crossPostDelayMinutes: data.crossPostDelayMinutes,
      createdById: userId,
      channels: data.channelIds.length > 0 ? {
        create: data.channelIds.map(channelId => ({
          channelId,
          status: data.status === 'SCHEDULED' ? 'SCHEDULED' : 'DRAFT',
        })),
      } : undefined,
    },
    include: { channels: { include: { channel: true } } },
  })

  revalidatePath('/dashboard/calendar')
  revalidatePath('/dashboard/queue')
  revalidatePath('/dashboard')
  return { success: true, post }
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

  const [totalPosts, scheduled, published, failed, scheduledPosts, channels] = await Promise.all([
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
  ])

  return { totalPosts, scheduled, published, failed, scheduledPosts, channels }
}
