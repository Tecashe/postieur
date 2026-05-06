import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { fireWebhooks } from '@/lib/webhook-delivery'
import { publish } from '@/lib/publishers'
import type { PublisherPost, PublisherChannel, PostChannelConfig } from '@/lib/publishers'

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

    const results: Array<{
      id: string
      status: 'PUBLISHED' | 'FAILED' | 'PARTIAL'
      channelResults: Array<{ channelId: string; platform: string; success: boolean; error?: string; externalId?: string }>
    }> = []

    for (const post of duePosts) {
      // Mark as PUBLISHING (idempotent guard against double-fire)
      await prisma.post.update({
        where: { id: post.id },
        data: { status: 'PUBLISHING' },
      })

      const publisherPost: PublisherPost = {
        id: post.id,
        content: post.content,
        type: post.type,
        mediaUrls: post.mediaUrls,
        threadPosts: post.threadPosts.length > 1 ? post.threadPosts : [post.content],
      }

      const channelResults: Array<{
        channelId: string
        platform: string
        success: boolean
        error?: string
        externalId?: string
      }> = []

      for (const postChannel of post.channels) {
        const ch = postChannel.channel

        // Skip channels with no access token
        if (!ch.accessToken) {
          await prisma.postChannel.update({
            where: { id: postChannel.id },
            data: { status: 'FAILED', failReason: 'Channel has no access token. Reconnect it.' },
          })
          channelResults.push({ channelId: ch.id, platform: ch.platform, success: false, error: 'No access token' })
          continue
        }

        const publisherChannel: PublisherChannel = {
          id: ch.id,
          platform: ch.platform,
          accessToken: ch.accessToken,
          refreshToken: ch.refreshToken ?? null,
          tokenExpiry: ch.tokenExpiry ?? null,
          handle: ch.handle,
          displayName: ch.displayName ?? null,
          config: (ch.config ?? {}) as Record<string, unknown>,
        }

        const channelConfig = (postChannel.config ?? {}) as PostChannelConfig

        const result = await publish(publisherPost, publisherChannel, channelConfig)

        // Update PostChannel record with per-channel result
        await prisma.postChannel.update({
          where: { id: postChannel.id },
          data: {
            status: result.success ? 'PUBLISHED' : 'FAILED',
            platformPostId: result.externalId ?? null,
            publishedAt: result.success ? now : null,
            failReason: result.error ?? null,
          },
        })

        channelResults.push({
          channelId: ch.id,
          platform: ch.platform,
          success: result.success,
          error: result.error,
          externalId: result.externalId,
        })
      }

      const anySuccess = channelResults.some((r) => r.success)
      const allFailed = channelResults.length > 0 && channelResults.every((r) => !r.success)
      const postStatus = allFailed ? 'FAILED' : 'PUBLISHED'

      await prisma.post.update({
        where: { id: post.id },
        data: { status: postStatus, publishedAt: anySuccess ? now : null },
      })

      // Upsert analytics stub so the analytics page has something to aggregate
      await prisma.postAnalytics.upsert({
        where: { postId: post.id },
        create: {
          postId: post.id,
          likes: 0, comments: 0, shares: 0, impressions: 0, clicks: 0, saves: 0, reach: 0,
        },
        update: {},
      })

      const webhookEvent = anySuccess ? 'post.published' : 'post.failed'
      await fireWebhooks(post.workspaceId, webhookEvent, {
        postId: post.id,
        status: postStatus,
        publishedAt: now.toISOString(),
        channelResults,
      }).catch(() => {})

      results.push({
        id: post.id,
        status: allFailed ? 'FAILED' : anySuccess && channelResults.some((r) => !r.success) ? 'PARTIAL' : 'PUBLISHED',
        channelResults,
      })
    }

    const published = results.filter((r) => r.status === 'PUBLISHED').length
    const partial = results.filter((r) => r.status === 'PARTIAL').length
    const failed = results.filter((r) => r.status === 'FAILED').length

    console.log(`[cron/publish] Processed ${duePosts.length}: ${published} published, ${partial} partial, ${failed} failed`)

    return NextResponse.json({ processed: duePosts.length, published, partial, failed, results })
  } catch (err) {
    console.error('[cron/publish] Fatal error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
