import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyApiKey } from '@/lib/api-key-auth'

async function resolveWorkspaceId(req: NextRequest): Promise<string | null> {
  const apiKey = req.headers.get('authorization')
  if (apiKey) return verifyApiKey(apiKey)
  const { orgId } = await auth()
  if (!orgId) return null
  const ws = await prisma.workspace.findUnique({ where: { clerkOrgId: orgId }, select: { id: true } })
  return ws?.id ?? null
}

export async function GET(req: NextRequest) {
  const workspaceId = await resolveWorkspaceId(req)
  if (!workspaceId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const channels = await prisma.channel.findMany({
    where: { workspaceId, isActive: true },
    select: { id: true, platform: true, handle: true, displayName: true, avatarUrl: true, followers: true },
  })
  return NextResponse.json({ channels })
}
