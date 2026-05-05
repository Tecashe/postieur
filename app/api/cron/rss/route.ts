import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import Parser from 'rss-parser'

const parser = new Parser()

function verifyCron(req: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return true
  return req.headers.get('authorization') === `Bearer ${secret}`
}

export async function GET(req: Request) {
  if (!verifyCron(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const feeds = await prisma.rssFeed.findMany({ where: { isEnabled: true } })
  const results: { feedId: string; created: number; error?: string }[] = []

  for (const feed of feeds) {
    try {
      const parsed = await parser.parseURL(feed.url)
      const items = parsed.items?.slice(0, 10) ?? []
      let created = 0

      for (const item of items) {
        const externalId = item.guid ?? item.link ?? item.title
        if (!externalId) continue

        // Deduplicate: skip if we already created a post with this content+workspaceId combo
        const exists = await prisma.post.findFirst({
          where: { workspaceId: feed.workspaceId, content: { startsWith: item.title ?? '' } },
        })
        if (exists) continue

        const content = `${item.title ?? ''}\n\n${item.contentSnippet ?? item.content ?? ''}\n\n${item.link ?? ''}`.trim()
        await prisma.post.create({
          data: {
            workspaceId: feed.workspaceId,
            content,
            type: 'POST',
            status: feed.autoPublishChannelIds.length > 0 ? 'SCHEDULED' : 'DRAFT',
            scheduledAt: feed.autoPublishChannelIds.length > 0 ? new Date(Date.now() + 5 * 60_000) : undefined,
            channels: feed.autoPublishChannelIds.length > 0
              ? { create: feed.autoPublishChannelIds.map((id) => ({ channelId: id })) }
              : undefined,
          },
        })
        created++
      }

      await prisma.rssFeed.update({
        where: { id: feed.id },
        data: { lastFetchedAt: new Date(), lastError: null, postsCreated: { increment: created } },
      })
      results.push({ feedId: feed.id, created })
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err)
      await prisma.rssFeed.update({ where: { id: feed.id }, data: { lastError: error } })
      results.push({ feedId: feed.id, created: 0, error })
    }
  }

  return NextResponse.json({ processed: feeds.length, results })
}
