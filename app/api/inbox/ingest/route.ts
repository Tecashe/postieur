import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

// POST /api/inbox/ingest — receives incoming comments/mentions from platform webhooks
// Platforms sign with HMAC-SHA256 using INBOX_WEBHOOK_SECRET
export async function POST(req: NextRequest) {
  const body = await req.text()
  const secret = process.env.INBOX_WEBHOOK_SECRET
  if (secret) {
    const sig = req.headers.get('x-signature-sha256') ?? req.headers.get('x-hub-signature-256') ?? ''
    const expected = `sha256=${crypto.createHmac('sha256', secret).update(body).digest('hex')}`
    if (sig !== expected) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let payload: Record<string, unknown>
  try { payload = JSON.parse(body) } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { workspaceId, platform, type, authorId, authorName, authorAvatar, content, postContent, externalId, channelId } = payload as Record<string, string>
  if (!workspaceId || !platform || !authorName || !content) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const message = await prisma.inboxMessage.upsert({
    where: { workspaceId_platform_externalId: { workspaceId, platform, externalId: externalId ?? `manual_${Date.now()}` } },
    create: { workspaceId, platform, type: (type as 'COMMENT' | 'MENTION' | 'DM' | 'REPLY') ?? 'COMMENT', authorId, authorName, authorAvatar, content, postContent, externalId: externalId ?? `manual_${Date.now()}`, channelId },
    update: { content },
  })

  return NextResponse.json({ message }, { status: 201 })
}
