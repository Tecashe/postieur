import { auth } from '@clerk/nextjs/server'
import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50 MB
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif',
  'video/mp4', 'video/quicktime', 'video/webm',
]

export async function POST(req: Request) {
  const { userId, orgId } = await auth()
  if (!userId || !orgId) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
  }

  const workspace = await prisma.workspace.findUnique({
    where: { clerkOrgId: orgId },
  })
  if (!workspace) {
    return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'File type not allowed' }, { status: 400 })
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'File exceeds 50 MB limit' }, { status: 400 })
  }

  // Upload to Vercel Blob
  const blob = await put(`media/${workspace.id}/${Date.now()}-${file.name}`, file, {
    access: 'public',
  })

  const mediaType = file.type.startsWith('video/') ? 'VIDEO'
    : file.type === 'image/gif' ? 'GIF'
    : 'IMAGE'

  // Save to DB
  const mediaItem = await prisma.mediaItem.create({
    data: {
      workspaceId: workspace.id,
      url: blob.url,
      filename: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
      type: mediaType,
      uploadedById: userId,
    },
  })

  return NextResponse.json({ url: blob.url, id: mediaItem.id })
}

export async function GET(req: Request) {
  const { userId, orgId } = await auth()
  if (!userId || !orgId) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
  }

  const workspace = await prisma.workspace.findUnique({
    where: { clerkOrgId: orgId },
  })
  if (!workspace) {
    return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
  }

  const { searchParams } = new URL(req.url)
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100)
  const offset = parseInt(searchParams.get('offset') ?? '0')

  const items = await prisma.mediaItem.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
  })

  return NextResponse.json({ items })
}
