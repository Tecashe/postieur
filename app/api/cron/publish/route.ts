import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Vercel Cron: runs every minute — protected by CRON_SECRET env var
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()

  try {
    // Find all posts due for publishing (status=SCHEDULED, scheduledAt <= now)
    const duePosts = await prisma.post.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledAt: { lte: now },
      },
      include: {
        channels: { include: { channel: true } },
        workspace: true,
      },
      take: 50, // process at most 50 per tick to avoid timeout
    })

    if (duePosts.length === 0) {
      return NextResponse.json({ processed: 0, message: 'No posts due' })
    }

    const results: Array<{ id: string; status: 'PUBLISHED' | 'FAILED'; error?: string }> = []

    for (const post of duePosts) {
      // Mark as PUBLISHING first (idempotent guard)
      await prisma.post.update({
        where: { id: post.id },
        data: { status: 'PUBLISHING' },
      })

      try {
        // TODO: Call real platform APIs here (Twitter/X, LinkedIn, Instagram, etc.)
        // For each channel attached to the post, call the respective OAuth API.
        // For now we mark as PUBLISHED and record publishedAt.
        // Real implementation would look like:
        //   const token = post.channels[0]?.channel.accessToken
        //   await publishToTwitter(token, post.content)

        await prisma.post.update({
          where: { id: post.id },
          data: {
            status: 'PUBLISHED',
            publishedAt: now,
          },
        })

        // Create stub analytics record so the analytics page has something to aggregate
        await prisma.postAnalytics.upsert({
          where: { postId: post.id },
          create: {
            postId: post.id,
            likes: 0, comments: 0, shares: 0, impressions: 0, clicks: 0, saves: 0, reach: 0,
          },
          update: {},
        })

        results.push({ id: post.id, status: 'PUBLISHED' })
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        await prisma.post.update({
          where: { id: post.id },
          data: { status: 'FAILED' },
        })
        results.push({ id: post.id, status: 'FAILED', error: message })
      }
    }

    const published = results.filter(r => r.status === 'PUBLISHED').length
    const failed = results.filter(r => r.status === 'FAILED').length

    console.log(`[cron/publish] Processed ${duePosts.length}: ${published} published, ${failed} failed`)

    return NextResponse.json({ processed: duePosts.length, published, failed, results })
  } catch (err) {
    console.error('[cron/publish] Fatal error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
