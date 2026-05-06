'use server'

import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import type { AutoActionTrigger, AutoActionType } from '@prisma/client'

async function getWorkspaceId(): Promise<string> {
  const { orgId } = await auth()
  if (!orgId) throw new Error('Not authenticated')
  const ws = await prisma.workspace.findUnique({ where: { clerkOrgId: orgId }, select: { id: true } })
  if (!ws) throw new Error('Workspace not found')
  return ws.id
}

export async function getAutoActions() {
  const workspaceId = await getWorkspaceId()
  return prisma.autoAction.findMany({ where: { workspaceId }, orderBy: { createdAt: 'desc' } })
}

export async function createAutoAction(data: {
  name: string
  triggerType: AutoActionTrigger
  triggerValue?: string
  actionType: AutoActionType
  channelIds?: string[]
  config?: Record<string, unknown>
  isEnabled?: boolean
}) {
  const workspaceId = await getWorkspaceId()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return prisma.autoAction.create({ data: { workspaceId, ...(data as any) } })
}

export async function updateAutoAction(id: string, data: Partial<{ name: string; isEnabled: boolean; triggerType: AutoActionTrigger; triggerValue: string; actionType: AutoActionType; channelIds: string[]; config: Record<string, unknown> }>) {
  const workspaceId = await getWorkspaceId()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return prisma.autoAction.update({ where: { id, workspaceId }, data: data as any })
}

export async function deleteAutoAction(id: string) {
  const workspaceId = await getWorkspaceId()
  return prisma.autoAction.delete({ where: { id, workspaceId } })
}
