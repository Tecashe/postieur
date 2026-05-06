import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

const VALID_TYPES = [
  'POST_PUBLISHED', 'POST_FAILED', 'NEW_COMMENT', 'NEW_MENTION',
  'WEEKLY_REPORT', 'TEAM_ACTIVITY', 'QUEUE_EMPTY',
] as const

type NotifType = typeof VALID_TYPES[number]

async function getWorkspaceId(orgId: string): Promise<string | null> {
  const ws = await prisma.workspace.findUnique({ where: { clerkOrgId: orgId }, select: { id: true } })
  return ws?.id ?? null
}

export async function GET() {
  const { userId, orgId } = await auth()
  if (!userId || !orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const workspaceId = await getWorkspaceId(orgId)
  if (!workspaceId) return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })

  const rows = await prisma.notificationPreference.findMany({
    where: { workspaceId, userId },
  })

  // Fill in defaults for any type not yet in DB (default = both enabled)
  const result = VALID_TYPES.map(type => {
    const row = rows.find(r => r.type === type)
    return {
      type,
      emailEnabled: row?.emailEnabled ?? true,
      inAppEnabled: row?.inAppEnabled ?? true,
    }
  })

  return NextResponse.json({ prefs: result })
}

export async function PUT(request: NextRequest) {
  const { userId, orgId } = await auth()
  if (!userId || !orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const workspaceId = await getWorkspaceId(orgId)
  if (!workspaceId) return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })

  const body = await request.json() as { type: string; emailEnabled: boolean; inAppEnabled: boolean }

  if (!VALID_TYPES.includes(body.type as NotifType)) {
    return NextResponse.json({ error: 'Invalid notification type' }, { status: 400 })
  }

  const pref = await prisma.notificationPreference.upsert({
    where: { workspaceId_userId_type: { workspaceId, userId, type: body.type } },
    update: { emailEnabled: body.emailEnabled, inAppEnabled: body.inAppEnabled },
    create: { workspaceId, userId, type: body.type, emailEnabled: body.emailEnabled, inAppEnabled: body.inAppEnabled },
  })

  return NextResponse.json(pref)
}
