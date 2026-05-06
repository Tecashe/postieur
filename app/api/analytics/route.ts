import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { orgId } = await auth()
    if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const workspace = await prisma.workspace.findFirst({ where: { clerkOrgId: orgId } })
    if (!workspace) return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') ?? '30d'

    const days = period === '7d' ? 7 : period === '90d' ? 90 : 30
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    // Aggregate PostAnalytics joined to Posts joined to channels
    const analytics = await prisma.postAnalytics.findMany({
      where: {
        post: {
          workspaceId: workspace.id,
          publishedAt: { gte: since },
        },
      },
      include: {
        post: {
          include: {
            channels: { include: { channel: true } },
          },
        },
      },
    })

    // KPI totals
    const totals = analytics.reduce((acc: { impressions: number; engagement: number; comments: number; likes: number; shares: number; reach: number }, a) => ({
      impressions: acc.impressions + (a.impressions ?? 0),
      engagement: acc.engagement + (a.likes ?? 0) + (a.comments ?? 0) + (a.shares ?? 0),
      comments: acc.comments + (a.comments ?? 0),
      likes: acc.likes + (a.likes ?? 0),
      shares: acc.shares + (a.shares ?? 0),
      reach: acc.reach + (a.reach ?? 0),
    }), { impressions: 0, engagement: 0, comments: 0, likes: 0, shares: 0, reach: 0 })

    // Per-platform aggregation
    const platformMap = new Map<string, { posts: number; impressions: number; engagement: number; followers: number }>()
    for (const a of analytics) {
      for (const pc of a.post.channels) {
        const p = pc.channel.platform
        const existing = platformMap.get(p) ?? { posts: 0, impressions: 0, engagement: 0, followers: pc.channel.followers }
        platformMap.set(p, {
          posts: existing.posts + 1,
          impressions: existing.impressions + (a.impressions ?? 0),
          engagement: existing.engagement + (a.likes ?? 0) + (a.comments ?? 0) + (a.shares ?? 0),
          followers: pc.channel.followers,
        })
      }
    }
    const platformStats = Array.from(platformMap.entries()).map(([platform, stats]) => ({
      platform,
      ...stats,
      followerGrowth: 0, // real growth would need historical snapshots
    }))

    // Engagement heatmap (day x hour)
    const heatmap: Array<{ dayOfWeek: number; hour: number; value: number }> = []
    for (const a of analytics) {
      if (!a.post.publishedAt) continue
      const d = new Date(a.post.publishedAt)
      const dayOfWeek = d.getDay()
      const hour = d.getHours()
      const existing = heatmap.find(h => h.dayOfWeek === dayOfWeek && h.hour === hour)
      const eng = (a.likes ?? 0) + (a.comments ?? 0) + (a.shares ?? 0)
      if (existing) {
        existing.value += eng
      } else {
        heatmap.push({ dayOfWeek, hour, value: eng })
      }
    }

    // Best times (sort heatmap by value, dedupe by platform — platform-agnostic without platform ingestion)
    const bestTimes = heatmap
      .sort((a, b) => b.value - a.value)
      .slice(0, 6)
      .map(h => ({ ...h, day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][h.dayOfWeek] }))

    // Daily/weekly trend data
    const trendBuckets = new Map<string, { impressions: number; engagement: number }>()
    for (const a of analytics) {
      if (!a.post.publishedAt) continue
      let label: string
      if (days <= 7) {
        label = new Date(a.post.publishedAt).toLocaleDateString('en', { weekday: 'short' })
      } else if (days <= 30) {
        label = `D${Math.ceil((Date.now() - new Date(a.post.publishedAt).getTime()) / (24 * 60 * 60 * 1000))}`
      } else {
        label = `W${Math.ceil((Date.now() - new Date(a.post.publishedAt).getTime()) / (7 * 24 * 60 * 60 * 1000))}`
      }
      const existing = trendBuckets.get(label) ?? { impressions: 0, engagement: 0 }
      trendBuckets.set(label, {
        impressions: existing.impressions + (a.impressions ?? 0),
        engagement: existing.engagement + (a.likes ?? 0) + (a.comments ?? 0) + (a.shares ?? 0),
      })
    }
    const trendData = Array.from(trendBuckets.entries()).map(([date, v]) => ({ date, ...v, followers: 0 }))

    // Top performing posts
    const topPosts = analytics
      .sort((a, b) => {
        const engA = (a.likes ?? 0) + (a.comments ?? 0) + (a.shares ?? 0)
        const engB = (b.likes ?? 0) + (b.comments ?? 0) + (b.shares ?? 0)
        return engB - engA
      })
      .slice(0, 10)
      .map(a => ({
        id: a.postId,
        content: (a.post as { content?: string }).content ?? '',
        platforms: a.post.channels.map(pc => pc.channel.platform),
        publishedAt: a.post.publishedAt?.toISOString() ?? null,
        likes: a.likes ?? 0,
        comments: a.comments ?? 0,
        shares: a.shares ?? 0,
        impressions: a.impressions ?? 0,
        reach: a.reach ?? 0,
        engagement: (a.likes ?? 0) + (a.comments ?? 0) + (a.shares ?? 0),
      }))

    return NextResponse.json({ totals, platformStats, heatmap, bestTimes, trendData, topPosts, hasData: analytics.length > 0 })
  } catch (err) {
    console.error('[GET /api/analytics]', err)
    return NextResponse.json({ totals: null, platformStats: [], heatmap: [], bestTimes: [], trendData: [], hasData: false })
  }
}
