import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { nanoid } from 'nanoid'

async function requireWorkspace() {
  const { userId, orgId } = await auth()
  if (!userId || !orgId) return null
  const ws = await prisma.workspace.findUnique({ where: { clerkOrgId: orgId } })
  return ws ? { userId, workspace: ws } : null
}

export async function GET() {
  const ctx = await requireWorkspace()
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const shortLinks = await prisma.shortLink.findMany({
    where: { workspaceId: ctx.workspace.id },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  return NextResponse.json({ shortLinks })
}

const CreateSchema = z.object({
  originalUrl: z.string().url(),
  postId: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const ctx = await requireWorkspace()
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const data = CreateSchema.safeParse(body)
  if (!data.success) return NextResponse.json({ error: data.error.flatten() }, { status: 400 })

  // Check if we already have a short link for this URL in this workspace
  const existing = await prisma.shortLink.findFirst({
    where: { workspaceId: ctx.workspace.id, originalUrl: data.data.originalUrl },
  })
  if (existing) return NextResponse.json({ shortLink: existing })

  // Generate a unique 7-char slug
  let slug = nanoid(7)
  let collision = await prisma.shortLink.findUnique({ where: { slug } })
  while (collision) {
    slug = nanoid(7)
    collision = await prisma.shortLink.findUnique({ where: { slug } })
  }

  const shortLink = await prisma.shortLink.create({
    data: {
      workspaceId: ctx.workspace.id,
      originalUrl: data.data.originalUrl,
      slug,
      postId: data.data.postId ?? null,
    },
  })

  return NextResponse.json({ shortLink }, { status: 201 })
}
