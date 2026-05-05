'use server'

import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

async function getWorkspaceId(): Promise<string> {
  const { orgId } = await auth()
  if (!orgId) throw new Error('Not authenticated')
  const ws = await prisma.workspace.findUnique({ where: { clerkOrgId: orgId }, select: { id: true } })
  if (!ws) throw new Error('Workspace not found')
  return ws.id
}

export async function getRssFeeds() {
  const workspaceId = await getWorkspaceId()
  return prisma.rssFeed.findMany({ where: { workspaceId }, orderBy: { createdAt: 'desc' } })
}

export async function createRssFeed(data: {
  name: string
  url: string
  isEnabled?: boolean
  checkIntervalHours?: number
  autoPublishChannelIds?: string[]
}) {
  const workspaceId = await getWorkspaceId()
  return prisma.rssFeed.create({ data: { workspaceId, ...data } })
}

export async function updateRssFeed(
  id: string,
  data: Partial<{ name: string; url: string; isEnabled: boolean; checkIntervalHours: number; autoPublishChannelIds: string[] }>
) {
  const workspaceId = await getWorkspaceId()
  return prisma.rssFeed.update({ where: { id, workspaceId }, data })
}

export async function deleteRssFeed(id: string) {
  const workspaceId = await getWorkspaceId()
  return prisma.rssFeed.delete({ where: { id, workspaceId } })
}
