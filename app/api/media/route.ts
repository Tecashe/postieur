import { auth } from '@clerk/nextjs/server'
import { put } from '@vercel/blob'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50 MB
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif',
  'video/mp4', 'video/quicktime', 'video/webm',
]

export async function POST(req: NextRequest) {
  const { userId, orgId } = await auth()
  if (!userId || !orgId) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
  }

  const workspace = await prisma.workspace.findUnique({ where: { clerkOrgId: orgId } })
  if (!workspace) return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })

  const contentType = req.headers.get('content-type') ?? ''

  // ── Folder management (application/json body) ─────────────────────────────
  if (contentType.includes('application/json')) {
    const body = await req.json() as { action?: string; folder?: string; id?: string; newFolder?: string }
    if (body.action === 'move' && body.id) {
      await prisma.mediaItem.update({
        where: { id: body.id, workspaceId: workspace.id },
        data: { folder: body.newFolder ?? null },
      })
      return NextResponse.json({ success: true })
    }
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  }

  // ── File upload (multipart/form-data) ─────────────────────────────────────
  const formData = await req.formData()
  const folder = (formData.get('folder') as string | null) ?? null

  // Support multiple files uploaded in one request
  const files = formData.getAll('file') as File[]
  if (files.length === 0) return NextResponse.json({ error: 'No files provided' }, { status: 400 })

  const results: Array<{ url: string; id: string; filename: string; sizeBytes: number; type: string; mimeType: string; folder: string | null; createdAt: string }> = []

  for (const file of files) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: `File type not allowed: ${file.type}` }, { status: 400 })
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: `File too large: ${file.name}` }, { status: 400 })
    }

    const blob = await put(`media/${workspace.id}/${Date.now()}-${file.name}`, file, { access: 'public' })

    const mediaType = file.type.startsWith('video/') ? 'VIDEO' as const
      : file.type === 'image/gif' ? 'GIF' as const
      : 'IMAGE' as const

    const mediaItem = await prisma.mediaItem.create({
      data: {
        workspaceId: workspace.id,
        url: blob.url,
        filename: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
        type: mediaType,
        folder,
        uploadedById: userId,
      },
    })

    results.push({
      url: mediaItem.url,
      id: mediaItem.id,
      filename: mediaItem.filename,
      sizeBytes: mediaItem.sizeBytes,
      type: mediaItem.type,
      mimeType: mediaItem.mimeType,
      folder: mediaItem.folder,
      createdAt: mediaItem.createdAt.toISOString(),
    })
  }

  return NextResponse.json({ items: results, item: results[0] })
}

export async function GET(req: NextRequest) {
  const { userId, orgId } = await auth()
  if (!userId || !orgId) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })

  const workspace = await prisma.workspace.findUnique({ where: { clerkOrgId: orgId } })
  if (!workspace) return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })

  const { searchParams } = new URL(req.url)
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '100'), 200)
  const offset = parseInt(searchParams.get('offset') ?? '0')
  const folder = searchParams.get('folder') // null = all, 'root' = no folder

  const items = await prisma.mediaItem.findMany({
    where: {
      workspaceId: workspace.id,
      ...(folder === 'root' ? { folder: null } : folder ? { folder } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
    select: {
      id: true, url: true, filename: true, mimeType: true, sizeBytes: true,
      type: true, width: true, height: true, duration: true, folder: true, createdAt: true,
    },
  })

  // Derive folder list from existing items
  const rawFolders = await prisma.mediaItem.findMany({
    where: { workspaceId: workspace.id, folder: { not: null } },
    distinct: ['folder'],
    select: { folder: true },
  })
  const folders = rawFolders.map(f => f.folder).filter(Boolean) as string[]

  return NextResponse.json({ items, folders })
}

