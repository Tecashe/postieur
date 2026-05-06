import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

async function getWorkspace(orgId: string) {
  return prisma.workspace.findUnique({ where: { clerkOrgId: orgId } })
}

export async function GET() {
  const { orgId } = await auth()
  if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const ws = await getWorkspace(orgId)
  if (!ws) return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
  return NextResponse.json({
    requireApproval: ws.requireApproval,
    timezone: ws.timezone,
    dateFormat: ws.dateFormat,
    weekStartsOn: ws.weekStartsOn,
  })
}

export async function PUT(request: NextRequest) {
  const { orgId, sessionClaims } = await auth()
  if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Only admins/owners may change workspace settings
  const role = (sessionClaims?.['org_role'] as string | undefined) ?? ''
  if (!['org:owner', 'org:admin'].includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json() as {
    requireApproval?: boolean
    timezone?: string
    dateFormat?: string
    weekStartsOn?: number
  }

  const ws = await getWorkspace(orgId)
  if (!ws) return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })

  const updated = await prisma.workspace.update({
    where: { id: ws.id },
    data: {
      ...(body.requireApproval !== undefined ? { requireApproval: body.requireApproval } : {}),
      ...(body.timezone !== undefined ? { timezone: body.timezone } : {}),
      ...(body.dateFormat !== undefined ? { dateFormat: body.dateFormat } : {}),
      ...(body.weekStartsOn !== undefined ? { weekStartsOn: body.weekStartsOn } : {}),
    },
    select: { requireApproval: true, timezone: true, dateFormat: true, weekStartsOn: true },
  })
  return NextResponse.json(updated)
}
