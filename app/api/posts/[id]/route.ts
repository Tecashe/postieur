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
