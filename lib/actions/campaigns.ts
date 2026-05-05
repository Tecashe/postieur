'use server'

import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import type { CampaignStatus } from '@prisma/client'

async function getWorkspaceId(): Promise<string> {
  const { orgId } = await auth()
  if (!orgId) throw new Error('Not authenticated')
  const ws = await prisma.workspace.findUnique({ where: { clerkOrgId: orgId }, select: { id: true } })
  if (!ws) throw new Error('Workspace not found')
  return ws.id
}

export async function getCampaigns() {
  const workspaceId = await getWorkspaceId()
  const campaigns = await prisma.campaign.findMany({
    where: { workspaceId },
    orderBy: { createdAt: 'desc' },
  })
  // Attach post counts
  const counts = await prisma.post.groupBy({
    by: ['campaignId'],
    where: { workspaceId, campaignId: { not: null } },
    _count: { id: true },
  })
  const countMap = Object.fromEntries(counts.map((c) => [c.campaignId!, c._count.id]))
  return campaigns.map((c) => ({ ...c, postCount: countMap[c.id] ?? 0 }))
}

export async function createCampaign(data: {
  name: string
  description?: string
  status?: CampaignStatus
  startDate?: Date
  endDate?: Date
  platforms?: string[]
  color?: string
}) {
  const workspaceId = await getWorkspaceId()
  return prisma.campaign.create({ data: { workspaceId, ...data } })
}

export async function updateCampaign(
  id: string,
  data: Partial<{
    name: string
    description: string
    status: CampaignStatus
    startDate: Date
    endDate: Date
    platforms: string[]
    color: string
  }>
) {
  const workspaceId = await getWorkspaceId()
  return prisma.campaign.update({ where: { id, workspaceId }, data })
}

export async function deleteCampaign(id: string) {
  const workspaceId = await getWorkspaceId()
  return prisma.campaign.delete({ where: { id, workspaceId } })
}
