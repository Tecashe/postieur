import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

async function requireAdminWorkspace(orgId: string, sessionClaims: Record<string, unknown> | null) {
  const role = (sessionClaims?.['org_role'] as string | undefined) ?? ''
  if (!['org:owner', 'org:admin'].includes(role)) {
    return { error: 'Only admins and owners can approve posts', status: 403 }
  }
  const ws = await prisma.workspace.findUnique({ where: { clerkOrgId: orgId }, select: { id: true } })
  if (!ws) return { error: 'Workspace not found', status: 404 }
  return { workspaceId: ws.id }
}

// PATCH /api/posts/[id]/approve  — approve a pending post (admin+)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId, orgId, sessionClaims } = await auth()
  if (!userId || !orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const result = await requireAdminWorkspace(orgId, sessionClaims as Record<string, unknown>)
  if ('error' in result) return NextResponse.json({ error: result.error }, { status: result.status })

  const { id } = await params

  const post = await prisma.post.findFirst({
    where: { id, workspaceId: result.workspaceId, status: 'PENDING_APPROVAL' },
  })
  if (!post) return NextResponse.json({ error: 'Post not found or not pending approval' }, { status: 404 })

  const updated = await prisma.post.update({
    where: { id },
    data: {
      status: 'SCHEDULED',
      approvedById: userId,
      approvedAt: new Date(),
      approvalNote: null,
    },
    select: { id: true, status: true, approvedById: true, approvedAt: true },
  })

  return NextResponse.json(updated)
}
