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

export async function getMessages(opts: { filter?: 'all' | 'unread' | 'archived'; platform?: string; limit?: number } = {}) {
  const workspaceId = await getWorkspaceId()
  const { filter = 'all', platform, limit = 50 } = opts

  return prisma.inboxMessage.findMany({
    where: {
      workspaceId,
      ...(filter === 'unread' ? { isRead: false, isArchived: false } : {}),
      ...(filter === 'archived' ? { isArchived: true } : {}),
      ...(filter === 'all' ? { isArchived: false } : {}),
      ...(platform ? { platform } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}

export async function markRead(id: string) {
  const workspaceId = await getWorkspaceId()
  return prisma.inboxMessage.update({ where: { id, workspaceId }, data: { isRead: true } })
}

export async function markAllRead() {
  const workspaceId = await getWorkspaceId()
  return prisma.inboxMessage.updateMany({ where: { workspaceId, isRead: false }, data: { isRead: true } })
}

export async function archiveMessage(id: string) {
  const workspaceId = await getWorkspaceId()
  return prisma.inboxMessage.update({ where: { id, workspaceId }, data: { isArchived: true } })
}

export async function getUnreadCount() {
  const workspaceId = await getWorkspaceId()
  return prisma.inboxMessage.count({ where: { workspaceId, isRead: false, isArchived: false } })
}

/**
 * replyToMessage
 *
 * Stores the reply text on the InboxMessage record and marks it as read.
 * Platform-level API calls (e.g. posting a LinkedIn comment reply) require
 * per-channel OAuth tokens and are handled separately; here we record the
 * reply so the dashboard always shows what was sent.
 */
export async function replyToMessage(id: string, replyText: string) {
  const workspaceId = await getWorkspaceId()
  if (!replyText.trim()) throw new Error('Reply text is required')
  return prisma.inboxMessage.update({
    where: { id, workspaceId },
    data: {
      replyText: replyText.trim(),
      repliedAt: new Date(),
      isRead: true,
    },
  })
}
