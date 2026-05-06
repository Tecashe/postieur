import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Vercel Cron: runs every 6 hours — protected by CRON_SECRET
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Find published PostChannels with a platformPostId that haven't been synced
  // in the last 6 hours (or ever). Limit 100 per tick.
  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000)

  const postChannels = await prisma.postChannel.findMany({
    where: {
      status: 'PUBLISHED',
      platformPostId: { not: null },
    },
    include: {
      channel: true,
      post: {
        include: { analytics: true },
      },
    },
    orderBy: { publishedAt: 'asc' },
    take: 100,
  })

  // Filter: skip if analytics were synced less than 6h ago
  const toSync = postChannels.filter(pc => {
    if (!pc.post.analytics) return true
    return pc.post.analytics.syncedAt < sixHoursAgo
  })

  let synced = 0
  let errors = 0

  // Group by post so we can upsert once per post after aggregating all channels
  const postMetrics = new Map<string, { likes: number; comments: number; shares: number; impressions: number; reach: number; clicks: number; saves: number }>()

  const initMetrics = () => ({ likes: 0, comments: 0, shares: 0, impressions: 0, reach: 0, clicks: 0, saves: 0 })

  await Promise.allSettled(toSync.map(async (pc) => {
    const { channel, post, platformPostId } = pc
    if (!platformPostId) return

    let metrics = initMetrics()
    let fetched = false

    try {
      switch (channel.platform) {
        // ── Twitter / X ────────────────────────────────────────────────────────
        case 'x':
        case 'twitter': {
          if (!channel.accessToken) break
          const res = await fetch(
            `https://api.twitter.com/2/tweets/${platformPostId}?tweet.fields=public_metrics`,
            { headers: { Authorization: `Bearer ${channel.accessToken}` }, signal: AbortSignal.timeout(8000) }
          )
          if (res.ok) {
            const json = await res.json() as { data?: { public_metrics?: { like_count: number; reply_count: number; retweet_count: number; impression_count: number; bookmark_count: number } } }
            const pm = json.data?.public_metrics
            if (pm) {
              metrics.likes = pm.like_count
              metrics.comments = pm.reply_count
              metrics.shares = pm.retweet_count
              metrics.impressions = pm.impression_count
              metrics.saves = pm.bookmark_count
              fetched = true
            }
          }
          break
        }

        // ── Instagram ──────────────────────────────────────────────────────────
        case 'instagram': {
          const token = (channel.config as Record<string, unknown>)?.pageAccessToken as string | undefined
          if (!token) break
          const res = await fetch(
            `https://graph.facebook.com/v19.0/${platformPostId}?fields=like_count,comments_count&access_token=${token}`,
            { signal: AbortSignal.timeout(8000) }
          )
          if (res.ok) {
            const json = await res.json() as { like_count?: number; comments_count?: number }
            metrics.likes = json.like_count ?? 0
            metrics.comments = json.comments_count ?? 0
            fetched = true
          }
          break
        }

        // ── Facebook ───────────────────────────────────────────────────────────
        case 'facebook': {
          const token = (channel.config as Record<string, unknown>)?.pageAccessToken as string | undefined
          if (!token) break
          const res = await fetch(
            `https://graph.facebook.com/v19.0/${platformPostId}/insights?metric=post_impressions,post_engaged_users,post_reactions_like_total,post_comments,post_shares&period=lifetime&access_token=${token}`,
            { signal: AbortSignal.timeout(8000) }
          )
          if (res.ok) {
            const json = await res.json() as { data?: Array<{ name: string; values?: Array<{ value: number }> }> }
            const get = (name: string) => json.data?.find(d => d.name === name)?.values?.[0]?.value ?? 0
            metrics.impressions = get('post_impressions')
            metrics.reach = get('post_engaged_users')
            metrics.likes = get('post_reactions_like_total')
            metrics.comments = get('post_comments')
            metrics.shares = get('post_shares')
            fetched = true
          }
          break
        }

        // ── YouTube ────────────────────────────────────────────────────────────
        case 'youtube': {
          if (!channel.accessToken) break
          const res = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?id=${platformPostId}&part=statistics`,
            { headers: { Authorization: `Bearer ${channel.accessToken}` }, signal: AbortSignal.timeout(8000) }
          )
          if (res.ok) {
            const json = await res.json() as { items?: Array<{ statistics?: { viewCount?: string; likeCount?: string; commentCount?: string; favoriteCount?: string } }> }
            const stats = json.items?.[0]?.statistics
            if (stats) {
              metrics.impressions = parseInt(stats.viewCount ?? '0', 10)
              metrics.likes = parseInt(stats.likeCount ?? '0', 10)
              metrics.comments = parseInt(stats.commentCount ?? '0', 10)
              metrics.saves = parseInt(stats.favoriteCount ?? '0', 10)
              fetched = true
            }
          }
          break
        }

        // ── Reddit ─────────────────────────────────────────────────────────────
        case 'reddit': {
          if (!channel.accessToken) break
          // platformPostId is the full_name like 't3_abc123' — strip prefix for URL
          const postId = platformPostId.replace(/^t3_/, '')
          const res = await fetch(
            `https://oauth.reddit.com/comments/${postId}?limit=1`,
            {
              headers: {
                Authorization: `Bearer ${channel.accessToken}`,
                'User-Agent': 'Postiz/1.0',
              },
              signal: AbortSignal.timeout(8000),
            }
          )
          if (res.ok) {
            const json = await res.json() as Array<{ data?: { children?: Array<{ data?: { score?: number; num_comments?: number } }> } }>
            const data = json[0]?.data?.children?.[0]?.data
            if (data) {
              metrics.likes = data.score ?? 0
              metrics.comments = data.num_comments ?? 0
              fetched = true
            }
          }
          break
        }

        // ── Bluesky ────────────────────────────────────────────────────────────
        case 'bluesky': {
          // platformPostId is the full AT URI: at://did:plc:.../app.bsky.feed.post/...
          const res = await fetch(
            `https://public.api.bsky.app/xrpc/app.bsky.feed.getPosts?uris=${encodeURIComponent(platformPostId)}`,
            { signal: AbortSignal.timeout(8000) }
          )
          if (res.ok) {
            const json = await res.json() as { posts?: Array<{ likeCount?: number; replyCount?: number; repostCount?: number; quoteCount?: number }> }
            const p = json.posts?.[0]
            if (p) {
              metrics.likes = p.likeCount ?? 0
              metrics.comments = p.replyCount ?? 0
              metrics.shares = (p.repostCount ?? 0) + (p.quoteCount ?? 0)
              fetched = true
            }
          }
          break
        }

        // ── Threads ────────────────────────────────────────────────────────────
        case 'threads': {
          if (!channel.accessToken) break
          const res = await fetch(
            `https://graph.threads.net/v1.0/${platformPostId}/insights?metric=views,likes,replies,reposts,quotes`,
            {
              headers: { Authorization: `Bearer ${channel.accessToken}` },
              signal: AbortSignal.timeout(8000),
            }
          )
          if (res.ok) {
            const json = await res.json() as { data?: Array<{ name: string; values?: Array<{ value: number }> }> }
            const get = (name: string) => json.data?.find(d => d.name === name)?.values?.[0]?.value ?? 0
            metrics.impressions = get('views')
            metrics.likes = get('likes')
            metrics.comments = get('replies')
            metrics.shares = get('reposts') + get('quotes')
            fetched = true
          }
          break
        }

        // LinkedIn, Discord, Telegram — no public metrics API
        default:
          break
      }
    } catch {
      errors++
      return
    }

    if (!fetched) return

    // Aggregate into post-level metrics (sum across channels)
    const existing = postMetrics.get(post.id) ?? initMetrics()
    postMetrics.set(post.id, {
      likes: existing.likes + metrics.likes,
      comments: existing.comments + metrics.comments,
      shares: existing.shares + metrics.shares,
      impressions: existing.impressions + metrics.impressions,
      reach: existing.reach + metrics.reach,
      clicks: existing.clicks + metrics.clicks,
      saves: existing.saves + metrics.saves,
    })
    synced++
  }))

  // Upsert PostAnalytics for each post we collected metrics for
  await Promise.allSettled(
    Array.from(postMetrics.entries()).map(async ([postId, m]) => {
      await prisma.postAnalytics.upsert({
        where: { postId },
        create: { postId, ...m, syncedAt: new Date() },
        update: { ...m, syncedAt: new Date() },
      })
    })
  )

  return NextResponse.json({ synced, errors, posts: postMetrics.size })
}
