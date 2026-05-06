import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

async function requireWorkspace() {
  const { userId, orgId } = await auth()
  if (!userId || !orgId) return null
  const ws = await prisma.workspace.findUnique({ where: { clerkOrgId: orgId } })
  return ws ? { userId, workspace: ws } : null
}

export async function GET() {
  const ctx = await requireWorkspace()
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sets = await prisma.channelSet.findMany({
    where: { workspaceId: ctx.workspace.id },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ sets })
}

const CreateSchema = z.object({
  name: z.string().min(1).max(60),
  description: z.string().max(200).optional(),
  color: z.string().optional(),
  channelIds: z.array(z.string()).default([]),
  platformSettings: z.record(z.record(z.string())).default({}),
})

export async function POST(req: NextRequest) {
  const ctx = await requireWorkspace()
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const data = CreateSchema.safeParse(body)
  if (!data.success) return NextResponse.json({ error: data.error.flatten() }, { status: 400 })

  // Verify channels belong to workspace
  const channels = await prisma.channel.findMany({
    where: { id: { in: data.data.channelIds }, workspaceId: ctx.workspace.id },
    select: { id: true },
  })
  const validIds = channels.map(c => c.id)

  const set = await prisma.channelSet.create({
    data: {
      workspaceId: ctx.workspace.id,
      name: data.data.name,
      description: data.data.description ?? null,
      color: data.data.color ?? null,
      channelIds: validIds,
      platformSettings: data.data.platformSettings,
    },
  })

  return NextResponse.json({ set }, { status: 201 })
}
