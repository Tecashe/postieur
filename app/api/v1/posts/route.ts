import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyApiKey } from '@/lib/api-key-auth'

async function resolveWorkspaceId(req: NextRequest): Promise<string | null> {
  // Try API key first
  const apiKey = req.headers.get('authorization')
  if (apiKey) return verifyApiKey(apiKey)
  // Fall back to Clerk session
  const { orgId } = await auth()
  if (!orgId) return null
  const ws = await prisma.workspace.findUnique({ where: { clerkOrgId: orgId }, select: { id: true } })
  return ws?.id ?? null
}

export async function GET(req: NextRequest) {
  const workspaceId = await resolveWorkspaceId(req)
  if (!workspaceId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const url = new URL(req.url)
  const status = url.searchParams.get('status') ?? undefined
  const limit = Number(url.searchParams.get('limit') ?? '50')
  const posts = await prisma.post.findMany({
    where: { workspaceId, ...(status ? { status: status as never } : {}) },
    orderBy: { createdAt: 'desc' },
    take: Math.min(limit, 100),
    include: { channels: { include: { channel: { select: { id: true, platform: true, handle: true } } } } },
  })
  return NextResponse.json({ posts })
}

export async function POST(req: NextRequest) {
  const workspaceId = await resolveWorkspaceId(req)
  if (!workspaceId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { content, scheduledAt, channelIds, type } = await req.json()
  if (!content) return NextResponse.json({ error: 'content required' }, { status: 400 })
  const post = await prisma.post.create({
    data: {
      workspaceId,
      content,
      type: type ?? 'POST',
      status: scheduledAt ? 'SCHEDULED' : 'DRAFT',
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      channels: channelIds?.length
        ? { create: (channelIds as string[]).map((id: string) => ({ channelId: id })) }
        : undefined,
    },
  })
  return NextResponse.json({ post }, { status: 201 })
}
