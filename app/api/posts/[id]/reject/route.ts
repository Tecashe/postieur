import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

// PATCH /api/posts/[id]/reject  — reject a pending post with a note (admin+)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId, orgId, sessionClaims } = await auth()
  if (!userId || !orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const role = (sessionClaims?.['org_role'] as string | undefined) ?? ''
  if (!['org:owner', 'org:admin'].includes(role)) {
    return NextResponse.json({ error: 'Only admins and owners can reject posts' }, { status: 403 })
  }

  const ws = await prisma.workspace.findUnique({ where: { clerkOrgId: orgId }, select: { id: true } })
  if (!ws) return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })

  const { id } = await params
  const body = await request.json() as { note?: string }

  const post = await prisma.post.findFirst({
    where: { id, workspaceId: ws.id, status: 'PENDING_APPROVAL' },
  })
  if (!post) return NextResponse.json({ error: 'Post not found or not pending approval' }, { status: 404 })

  const updated = await prisma.post.update({
    where: { id },
    data: {
      status: 'DRAFT',
      approvedById: userId,
      approvedAt: new Date(),
      approvalNote: body.note?.trim() ?? null,
    },
    select: { id: true, status: true, approvalNote: true },
  })

  return NextResponse.json(updated)
}
