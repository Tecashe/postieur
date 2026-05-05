import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateApiKey, hashApiKey } from '@/lib/api-key-auth'

async function getWorkspaceId(): Promise<string | null> {
  const { orgId } = await auth()
  if (!orgId) return null
  const ws = await prisma.workspace.findUnique({ where: { clerkOrgId: orgId }, select: { id: true } })
  return ws?.id ?? null
}

// GET /api/api-keys — list keys
export async function GET() {
  const workspaceId = await getWorkspaceId()
  if (!workspaceId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const keys = await prisma.apiKey.findMany({
    where: { workspaceId },
    select: { id: true, name: true, prefix: true, scopes: true, status: true, lastUsedAt: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ keys })
}

// POST /api/api-keys — create key
export async function POST(req: NextRequest) {
  const workspaceId = await getWorkspaceId()
  if (!workspaceId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { name, scopes } = await req.json()
  if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 })

  const { raw, prefix, hash } = generateApiKey()
  await prisma.apiKey.create({ data: { workspaceId, name, keyHash: hash, prefix, scopes: scopes ?? [] } })
  // Return raw key ONCE — never stored
  return NextResponse.json({ raw, prefix, name }, { status: 201 })
}
