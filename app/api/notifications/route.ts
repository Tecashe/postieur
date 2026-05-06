import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

async function getContext() {
  const { userId, orgId } = await auth()
  if (!userId || !orgId) return null
  const workspace = await prisma.workspace.findUnique({ where: { clerkOrgId: orgId }, select: { id: true } })
  if (!workspace) return null
  return { userId, workspaceId: workspace.id }
}

// GET /api/notifications?limit=20&unreadOnly=true
export async function GET(request: NextRequest) {
  const ctx = await getContext()
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 50)
  const unreadOnly = searchParams.get('unreadOnly') === 'true'

  const where = {
    workspaceId: ctx.workspaceId,
    userId: ctx.userId,
    ...(unreadOnly ? { isRead: false } : {}),
  }

  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    }),
    prisma.notification.count({
      where: { workspaceId: ctx.workspaceId, userId: ctx.userId, isRead: false },
    }),
  ])

  return NextResponse.json({ notifications, unreadCount })
}

// POST /api/notifications/mark-read — mark all read
export async function PUT(request: NextRequest) {
  const ctx = await getContext()
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => ({})) as { ids?: string[] }

  if (body.ids?.length) {
    await prisma.notification.updateMany({
      where: { id: { in: body.ids }, workspaceId: ctx.workspaceId, userId: ctx.userId },
      data: { isRead: true },
    })
  } else {
    // Mark all read
    await prisma.notification.updateMany({
      where: { workspaceId: ctx.workspaceId, userId: ctx.userId, isRead: false },
      data: { isRead: true },
    })
  }

  return NextResponse.json({ ok: true })
}
