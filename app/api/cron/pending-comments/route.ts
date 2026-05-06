import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Vercel Cron: runs every minute — fires due pending comments (first comments)
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()

  try {
    const due = await prisma.pendingComment.findMany({
      where: { status: 'PENDING', fireAt: { lte: now } },
      include: {
        post: { include: { workspace: true } },
      },
      take: 50,
    })

    if (due.length === 0) {
      return NextResponse.json({ processed: 0, message: 'No pending comments due' })
    }

    let done = 0
    let failed = 0

    for (const pc of due) {
      // Mark in-progress by setting status optimistically
      try {
        const channel = await prisma.channel.findUnique({
          where: { id: pc.channelId },
          select: { accessToken: true, platform: true, config: true },
        })

        if (!channel?.accessToken) {
          await prisma.pendingComment.update({
            where: { id: pc.id },
            data: { status: 'FAILED', failReason: 'Channel has no access token' },
          })
          failed++
          continue
        }

        // Call platform comment API
        let success = false
        let error: string | undefined

        if (pc.platform === 'linkedin') {
          const body = {
            actor: `urn:li:person:${pc.channelId}`,
            message: { text: pc.content },
            object: `urn:li:ugcPost:${pc.platformPostId}`,
          }
          const res = await fetch('https://api.linkedin.com/v2/socialActions/' + encodeURIComponent(`urn:li:ugcPost:${pc.platformPostId}`) + '/comments', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${channel.accessToken}`,
              'Content-Type': 'application/json',
              'X-Restli-Protocol-Version': '2.0.0',
            },
            body: JSON.stringify(body),
          })
          success = res.ok
          if (!res.ok) error = `LinkedIn ${res.status}: ${await res.text().catch(() => '')}`
        } else if (pc.platform === 'x') {
          const res = await fetch('https://api.twitter.com/2/tweets', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${channel.accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: pc.content, reply: { in_reply_to_tweet_id: pc.platformPostId } }),
          })
          success = res.ok
          if (!res.ok) error = `X ${res.status}: ${await res.text().catch(() => '')}`
        } else if (pc.platform === 'instagram') {
          // Instagram Graph API comment
          const params = new URLSearchParams({
            message: pc.content,
            access_token: channel.accessToken,
          })
          const res = await fetch(`https://graph.facebook.com/v19.0/${pc.platformPostId}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params.toString(),
          })
          success = res.ok
          if (!res.ok) error = `Instagram ${res.status}: ${await res.text().catch(() => '')}`
        } else if (pc.platform === 'facebook') {
          const params = new URLSearchParams({
            message: pc.content,
            access_token: channel.accessToken,
          })
          const res = await fetch(`https://graph.facebook.com/v19.0/${pc.platformPostId}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params.toString(),
          })
          success = res.ok
          if (!res.ok) error = `Facebook ${res.status}: ${await res.text().catch(() => '')}`
        } else if (pc.platform === 'youtube') {
          const body = {
            snippet: {
              videoId: pc.platformPostId,
              topLevelComment: { snippet: { textOriginal: pc.content } },
            },
          }
          const res = await fetch(`https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&access_token=${channel.accessToken}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          })
          success = res.ok
          if (!res.ok) error = `YouTube ${res.status}: ${await res.text().catch(() => '')}`
        } else {
          // Platform not supported for comments — mark done silently
          success = true
        }

        await prisma.pendingComment.update({
          where: { id: pc.id },
          data: {
            status: success ? 'DONE' : 'FAILED',
            failReason: error ?? null,
          },
        })

        if (success) done++
        else failed++
      } catch (err) {
        await prisma.pendingComment.update({
          where: { id: pc.id },
          data: { status: 'FAILED', failReason: String(err) },
        }).catch(() => {})
        failed++
      }
    }

    console.log(`[cron/pending-comments] Processed ${due.length}: ${done} done, ${failed} failed`)
    return NextResponse.json({ processed: due.length, done, failed })
  } catch (err) {
    console.error('[cron/pending-comments] Fatal:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
