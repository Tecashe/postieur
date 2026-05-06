import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

async function getWorkspaceId(orgId: string): Promise<string | null> {
  const ws = await prisma.workspace.findUnique({ where: { clerkOrgId: orgId }, select: { id: true } })
  return ws?.id ?? null
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId, orgId } = await auth()
  if (!userId || !orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const workspaceId = await getWorkspaceId(orgId)
  if (!workspaceId) return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })

  const { id } = await params
  const body = await request.json() as { name?: string; content?: string; isDefault?: boolean }

  // Verify ownership: user must be the creator or an admin
  const sig = await prisma.signature.findFirst({ where: { id, workspaceId } })
  if (!sig) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (body.isDefault) {
    await prisma.signature.updateMany({
      where: { workspaceId, userId, isDefault: true },
      data: { isDefault: false },
    })
  }

  const updated = await prisma.signature.update({
    where: { id },
    data: {
      ...(body.name !== undefined ? { name: body.name.trim() } : {}),
      ...(body.content !== undefined ? { content: body.content.trim() } : {}),
      ...(body.isDefault !== undefined ? { isDefault: body.isDefault } : {}),
    },
    select: { id: true, name: true, content: true, isDefault: true },
  })
  return NextResponse.json({ signature: updated })
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { orgId } = await auth()
  if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const workspaceId = await getWorkspaceId(orgId)
  if (!workspaceId) return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })

  const { id } = await params
  const sig = await prisma.signature.findFirst({ where: { id, workspaceId } })
  if (!sig) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.signature.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
