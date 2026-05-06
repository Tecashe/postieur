import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

// GET /api/posts/[id] — fetch a single post for editing
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId, orgId } = await auth()
  if (!userId || !orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const ws = await prisma.workspace.findUnique({ where: { clerkOrgId: orgId }, select: { id: true } })
  if (!ws) return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })

  const { id } = await params

  const post = await prisma.post.findFirst({
    where: { id, workspaceId: ws.id },
    select: {
      id: true,
      content: true,
      status: true,
      type: true,
      scheduledAt: true,
      mediaUrls: true,
      labels: true,
      threadPosts: true,
      channels: {
        select: {
          channel: { select: { id: true, platform: true, handle: true } },
        },
      },
    },
  })

  if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 })

  return NextResponse.json(post)
}

// PATCH /api/posts/[id] — partial update (used by queue page to unschedule)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId, orgId } = await auth()
  if (!userId || !orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const ws = await prisma.workspace.findUnique({ where: { clerkOrgId: orgId }, select: { id: true } })
  if (!ws) return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })

  const { id } = await params

  const existing = await prisma.post.findFirst({ where: { id, workspaceId: ws.id } })
  if (!existing) return NextResponse.json({ error: 'Post not found' }, { status: 404 })

  const body = await request.json() as { status?: string; scheduledAt?: string | null }

  const allowedStatuses = ['DRAFT', 'SCHEDULED', 'PUBLISHED', 'FAILED']
  if (body.status !== undefined && !allowedStatuses.includes(body.status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const updated = await prisma.post.update({
    where: { id },
    data: {
      ...(body.status !== undefined && { status: body.status as 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'FAILED' }),
      ...(body.scheduledAt !== undefined && { scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null }),
    },
  })

  return NextResponse.json({ success: true, post: { id: updated.id, status: updated.status } })
}
