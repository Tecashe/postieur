import { auth } from '@clerk/nextjs/server'
import { del } from '@vercel/blob'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId, orgId } = await auth()
  if (!userId || !orgId) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })

  const { id } = await params

  const workspace = await prisma.workspace.findUnique({
    where: { clerkOrgId: orgId },
    select: { id: true },
  })
  if (!workspace) return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })

  const item = await prisma.mediaItem.findUnique({
    where: { id, workspaceId: workspace.id },
    select: { id: true, url: true },
  })
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Delete from Vercel Blob (fire-and-forget — don't fail if blob is already gone)
  try {
    await del(item.url)
  } catch {
    // blob may already be deleted or URL doesn't match Blob store — that's fine
  }

  await prisma.mediaItem.delete({ where: { id } })

  return NextResponse.json({ success: true })
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId, orgId } = await auth()
  if (!userId || !orgId) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })

  const { id } = await params

  const workspace = await prisma.workspace.findUnique({
    where: { clerkOrgId: orgId },
    select: { id: true },
  })
  if (!workspace) return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })

  const item = await prisma.mediaItem.findUnique({
    where: { id, workspaceId: workspace.id },
  })
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json(item)
}
