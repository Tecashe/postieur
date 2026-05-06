'use server'

import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

async function requireWorkspace() {
  const { userId, orgId } = await auth()
  if (!userId) throw new Error('Unauthenticated')
  if (!orgId) throw new Error('No active organization')
  const workspace = await prisma.workspace.findUnique({
    where: { clerkOrgId: orgId },
  })
  if (!workspace) throw new Error('Workspace not found')
  return { userId, workspace }
}

// ── Get Channels ──────────────────────────────────────────────────────────────

export async function getChannels() {
  const { workspace } = await requireWorkspace()
  return prisma.channel.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      platform: true,
      handle: true,
      displayName: true,
      avatarUrl: true,
      isActive: true,
      followers: true,
      tokenExpiry: true,
      createdAt: true,
      // accessToken and refreshToken intentionally excluded — never send tokens to client
    },
  })
}

// ── Connect Channel ───────────────────────────────────────────────────────────

const ConnectChannelSchema = z.object({
  platform: z.string().min(1),
  handle: z.string().min(1),
  displayName: z.string().optional(),
  avatarUrl: z.string().url().optional().nullable(),
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
  tokenExpiry: z.string().datetime().optional().nullable(),
  followers: z.number().int().default(0),
})

export type ConnectChannelInput = z.infer<typeof ConnectChannelSchema>

export async function connectChannel(input: ConnectChannelInput) {
  const { workspace } = await requireWorkspace()
  const data = ConnectChannelSchema.parse(input)

  const channel = await prisma.channel.upsert({
    where: {
      workspaceId_platform_handle: {
        workspaceId: workspace.id,
        platform: data.platform,
        handle: data.handle,
      },
    },
    create: {
      workspaceId: workspace.id,
      platform: data.platform,
      handle: data.handle,
      displayName: data.displayName ?? null,
      avatarUrl: data.avatarUrl ?? null,
      accessToken: data.accessToken ?? null,
      refreshToken: data.refreshToken ?? null,
      tokenExpiry: data.tokenExpiry ? new Date(data.tokenExpiry) : null,
      followers: data.followers,
      isActive: true,
    },
    update: {
      displayName: data.displayName ?? null,
      avatarUrl: data.avatarUrl ?? null,
      accessToken: data.accessToken ?? null,
      refreshToken: data.refreshToken ?? null,
      tokenExpiry: data.tokenExpiry ? new Date(data.tokenExpiry) : null,
      followers: data.followers,
      isActive: true,
    },
  })

  revalidatePath('/dashboard/channels')
  return { success: true, channel }
}

// ── Disconnect Channel ────────────────────────────────────────────────────────

export async function disconnectChannel(channelId: string) {
  const { workspace } = await requireWorkspace()

  const channel = await prisma.channel.findFirst({
    where: { id: channelId, workspaceId: workspace.id },
  })
  if (!channel) throw new Error('Channel not found')

  await prisma.channel.update({
    where: { id: channelId },
    data: { isActive: false, accessToken: null, refreshToken: null },
  })

  revalidatePath('/dashboard/channels')
  return { success: true }
}

// ── Ensure Workspace exists ────────────────────────────────────────────────────
// Called from dashboard layout; creates workspace row if missing

export async function ensureWorkspaceExists(orgId: string, name: string, slug: string) {
  await prisma.workspace.upsert({
    where: { clerkOrgId: orgId },
    create: { clerkOrgId: orgId, name, slug: slug ?? orgId },
    update: { name },
  })
}
