import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

async function getWorkspace(orgId: string) {
  return prisma.workspace.findUnique({ where: { clerkOrgId: orgId }, select: { id: true } })
}

export async function GET() {
  const { orgId } = await auth()
  if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const ws = await getWorkspace(orgId)
  if (!ws) return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })

  const signatures = await prisma.signature.findMany({
    where: { workspaceId: ws.id },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    select: { id: true, name: true, content: true, isDefault: true, userId: true, createdAt: true },
  })
  return NextResponse.json({ signatures })
}

export async function POST(request: NextRequest) {
  const { userId, orgId } = await auth()
  if (!userId || !orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const ws = await getWorkspace(orgId)
  if (!ws) return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })

  const body = await request.json() as { name: string; content: string; isDefault?: boolean }
  if (!body.name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  if (!body.content?.trim()) return NextResponse.json({ error: 'Content is required' }, { status: 400 })

  // If setting as default, clear other defaults for this user
  if (body.isDefault) {
    await prisma.signature.updateMany({
      where: { workspaceId: ws.id, userId, isDefault: true },
      data: { isDefault: false },
    })
  }

  const sig = await prisma.signature.create({
    data: {
      workspaceId: ws.id,
      userId,
      name: body.name.trim(),
      content: body.content.trim(),
      isDefault: body.isDefault ?? false,
    },
    select: { id: true, name: true, content: true, isDefault: true, userId: true, createdAt: true },
  })
  return NextResponse.json({ signature: sig }, { status: 201 })
}
