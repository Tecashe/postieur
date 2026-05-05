import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

async function getWorkspaceId(): Promise<string | null> {
  const { orgId } = await auth()
  if (!orgId) return null
  const ws = await prisma.workspace.findUnique({ where: { clerkOrgId: orgId }, select: { id: true } })
  return ws?.id ?? null
}

export async function GET() {
  const workspaceId = await getWorkspaceId()
  if (!workspaceId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const webhooks = await prisma.webhookEndpoint.findMany({
    where: { workspaceId },
    select: { id: true, name: true, url: true, events: true, isActive: true, successCount: true, failureCount: true, lastTriggeredAt: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ webhooks })
}

export async function POST(req: NextRequest) {
  const workspaceId = await getWorkspaceId()
  if (!workspaceId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { name, url, events } = await req.json()
  if (!name || !url) return NextResponse.json({ error: 'name and url required' }, { status: 400 })
  const secret = crypto.randomBytes(24).toString('hex')
  const webhook = await prisma.webhookEndpoint.create({
    data: { workspaceId, name, url, events: events ?? [], secret },
    select: { id: true, name: true, url: true, events: true, isActive: true, secret: true, createdAt: true },
  })
  return NextResponse.json({ webhook }, { status: 201 })
}
