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

export async function getQueueSlots() {
  const workspaceId = await getWorkspaceId()
  return prisma.queueSlot.findMany({
    where: { workspaceId },
    orderBy: [{ dayOfWeek: 'asc' }, { hour: 'asc' }, { minute: 'asc' }],
  })
}

export async function createQueueSlot(data: { dayOfWeek: number; hour: number; minute?: number; platforms?: string[] }) {
  const workspaceId = await getWorkspaceId()
  return prisma.queueSlot.create({ data: { workspaceId, ...data, minute: data.minute ?? 0 } })
}

export async function updateQueueSlot(id: string, data: Partial<{ dayOfWeek: number; hour: number; minute: number; platforms: string[]; isActive: boolean }>) {
  const workspaceId = await getWorkspaceId()
  return prisma.queueSlot.update({ where: { id, workspaceId }, data })
}

export async function deleteQueueSlot(id: string) {
  const workspaceId = await getWorkspaceId()
  return prisma.queueSlot.delete({ where: { id, workspaceId } })
}
