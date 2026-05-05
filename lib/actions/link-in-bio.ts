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

export async function getLinkInBioPage() {
  const workspaceId = await getWorkspaceId()
  return prisma.linkInBioPage.findFirst({
    where: { workspaceId },
    include: { links: { orderBy: { sortOrder: 'asc' } } },
  })
}

export async function upsertLinkInBioPage(data: {
  slug: string
  title: string
  bio?: string
  avatarUrl?: string
  themeColor?: string
  isPublished?: boolean
}) {
  const workspaceId = await getWorkspaceId()
  const existing = await prisma.linkInBioPage.findFirst({ where: { workspaceId }, select: { id: true } })
  if (existing) {
    return prisma.linkInBioPage.update({ where: { id: existing.id }, data, include: { links: { orderBy: { sortOrder: 'asc' } } } })
  }
  return prisma.linkInBioPage.create({ data: { workspaceId, ...data }, include: { links: { orderBy: { sortOrder: 'asc' } } } })
}

export async function addLink(data: { pageId: string; title: string; url: string; platform?: string }) {
  const workspaceId = await getWorkspaceId()
  const page = await prisma.linkInBioPage.findFirst({ where: { id: data.pageId, workspaceId } })
  if (!page) throw new Error('Page not found')
  const count = await prisma.linkInBioLink.count({ where: { pageId: data.pageId } })
  return prisma.linkInBioLink.create({ data: { ...data, sortOrder: count } })
}

export async function updateLink(id: string, data: Partial<{ title: string; url: string; platform: string; isActive: boolean; sortOrder: number }>) {
  return prisma.linkInBioLink.update({ where: { id }, data })
}

export async function removeLink(id: string) {
  return prisma.linkInBioLink.delete({ where: { id } })
}

export async function reorderLinks(pageId: string, orderedIds: string[]) {
  const workspaceId = await getWorkspaceId()
  const page = await prisma.linkInBioPage.findFirst({ where: { id: pageId, workspaceId } })
  if (!page) throw new Error('Page not found')
  await Promise.all(orderedIds.map((id, idx) => prisma.linkInBioLink.update({ where: { id }, data: { sortOrder: idx } })))
}
