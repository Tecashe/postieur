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

export async function getTemplates() {
  const workspaceId = await getWorkspaceId()
  return prisma.template.findMany({
    where: { workspaceId },
    orderBy: { usageCount: 'desc' },
  })
}

export async function getTemplate(id: string) {
  const workspaceId = await getWorkspaceId()
  return prisma.template.findUnique({ where: { id, workspaceId } })
}

export async function createTemplate(data: {
  name: string
  content: string
  category?: string
  platforms?: string[]
  tags?: string[]
}) {
  const workspaceId = await getWorkspaceId()
  return prisma.template.create({
    data: { workspaceId, ...data, category: data.category ?? 'general' },
  })
}

export async function updateTemplate(
  id: string,
  data: Partial<{ name: string; content: string; category: string; platforms: string[]; tags: string[] }>
) {
  const workspaceId = await getWorkspaceId()
  return prisma.template.update({ where: { id, workspaceId }, data })
}

export async function deleteTemplate(id: string) {
  const workspaceId = await getWorkspaceId()
  return prisma.template.delete({ where: { id, workspaceId } })
}

export async function useTemplate(id: string) {
  const workspaceId = await getWorkspaceId()
  return prisma.template.update({
    where: { id, workspaceId },
    data: { usageCount: { increment: 1 } },
  })
}
