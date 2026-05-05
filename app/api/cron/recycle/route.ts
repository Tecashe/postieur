import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function verifyCron(req: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return true
  return req.headers.get('authorization') === `Bearer ${secret}`
}

export async function GET(req: Request) {
  if (!verifyCron(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const now = new Date()
  const recyclablePosts = await prisma.post.findMany({
    where: { recycleEnabled: true, recycleNextAt: { lte: now }, status: 'PUBLISHED' },
    include: { channels: { select: { channelId: true } } },
  })

  let recycled = 0
  for (const post of recyclablePosts) {
    const nextAt = new Date(now.getTime() + (post.recycleIntervalDays ?? 7) * 86400_000)
    await prisma.$transaction([
      // Create a new scheduled post as a recycle
      prisma.post.create({
        data: {
          workspaceId: post.workspaceId,
          content: post.content,
          type: post.type,
          status: 'SCHEDULED',
          scheduledAt: new Date(now.getTime() + 60_000), // 1 min from now
          mediaUrls: post.mediaUrls,
          labels: post.labels,
          recycleEnabled: true,
          recycleIntervalDays: post.recycleIntervalDays,
          recycleNextAt: nextAt,
          recycleSourceId: post.id,
          channels: {
            create: post.channels.map((c) => ({ channelId: c.channelId })),
          },
        },
      }),
      // Update source post's next recycle time
      prisma.post.update({
        where: { id: post.id },
        data: { recycleNextAt: nextAt },
      }),
    ])
    recycled++
  }

  return NextResponse.json({ processed: recyclablePosts.length, recycled })
}
