import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

async function requireSet(id: string) {
  const { userId, orgId } = await auth()
  if (!userId || !orgId) return null
  const ws = await prisma.workspace.findUnique({ where: { clerkOrgId: orgId } })
  if (!ws) return null
  const set = await prisma.channelSet.findFirst({ where: { id, workspaceId: ws.id } })
  return set ? { userId, workspace: ws, set } : null
}

const UpdateSchema = z.object({
  name: z.string().min(1).max(60).optional(),
  description: z.string().max(200).optional().nullable(),
  color: z.string().optional().nullable(),
  channelIds: z.array(z.string()).optional(),
  platformSettings: z.record(z.record(z.string())).optional(),
})

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ctx = await requireSet(id)
  if (!ctx) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const data = UpdateSchema.safeParse(body)
  if (!data.success) return NextResponse.json({ error: data.error.flatten() }, { status: 400 })

  const updated = await prisma.channelSet.update({
    where: { id },
    data: {
      ...(data.data.name !== undefined && { name: data.data.name }),
      ...(data.data.description !== undefined && { description: data.data.description }),
      ...(data.data.color !== undefined && { color: data.data.color }),
      ...(data.data.channelIds !== undefined && { channelIds: data.data.channelIds }),
      ...(data.data.platformSettings !== undefined && { platformSettings: data.data.platformSettings }),
    },
  })

  return NextResponse.json({ set: updated })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ctx = await requireSet(id)
  if (!ctx) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.channelSet.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
