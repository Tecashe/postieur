import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { fireWebhooks } from '@/lib/webhook-delivery'
import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

function verifyCron(req: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return true
  return req.headers.get('authorization') === `Bearer ${secret}`
}

export async function GET(req: Request) {
  if (!verifyCron(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const now = new Date()
  let executed = 0

  // ── SCHEDULED_TIME ──────────────────────────────────────────────────────────
  const scheduledActions = await prisma.autoAction.findMany({
    where: { isEnabled: true, triggerType: 'SCHEDULED_TIME' },
  })
  for (const action of scheduledActions) {
    if (action.triggerValue) {
      const [h, m] = action.triggerValue.split(':').map(Number)
      if (now.getUTCHours() === h && now.getUTCMinutes() === m) {
        await executeAction(action)
        executed++
      }
    }
  }

  // ── POST_PUBLISHED ──────────────────────────────────────────────────────────
  const recentlyPublished = await prisma.post.findMany({
    where: { publishedAt: { gte: new Date(now.getTime() - 60_000), lte: now } },
    select: { id: true, workspaceId: true, content: true },
  })
  const publishActions = await prisma.autoAction.findMany({ where: { isEnabled: true, triggerType: 'POST_PUBLISHED' } })
  for (const post of recentlyPublished) {
    for (const action of publishActions.filter(a => a.workspaceId === post.workspaceId)) {
      await executeAction(action, { postId: post.id, content: post.content })
      executed++
    }
  }

  // ── FOLLOWER_MILESTONE ──────────────────────────────────────────────────────
  // triggerValue = milestone count as string e.g. "1000" or "10000"
  // lastRunAt tracks when it last fired to avoid repeat firing
  const milestoneActions = await prisma.autoAction.findMany({
    where: { isEnabled: true, triggerType: 'FOLLOWER_MILESTONE' },
  })
  for (const action of milestoneActions) {
    const milestone = Number(action.triggerValue ?? '0')
    if (!milestone) continue
    // Sum followers across all channels in the workspace
    const channels = await prisma.channel.findMany({
      where: { workspaceId: action.workspaceId, isActive: true },
      select: { followers: true },
    })
    const totalFollowers = channels.reduce((sum, c) => sum + c.followers, 0)
    if (totalFollowers >= milestone) {
      // Only fire once: skip if lastRunAt is set and total hasn't jumped another milestone
      const config = (action.config ?? {}) as Record<string, unknown>
      const lastMilestoneAt = config.lastMilestoneTotal as number | undefined
      if (!lastMilestoneAt || totalFollowers >= (lastMilestoneAt + milestone)) {
        await executeAction(action, { totalFollowers, milestone })
        // Record that we fired at this follower count so we don't re-fire immediately
        await prisma.autoAction.update({
          where: { id: action.id },
          data: { config: { ...config, lastMilestoneTotal: totalFollowers } as never },
        })
        executed++
      }
    }
  }

  // ── NEW_COMMENT ─────────────────────────────────────────────────────────────
  // Check InboxMessage of type COMMENT created in the last minute
  const recentComments = await prisma.inboxMessage.findMany({
    where: { type: 'COMMENT', createdAt: { gte: new Date(now.getTime() - 60_000) } },
    select: { id: true, workspaceId: true, externalId: true, content: true },
  })
  const commentActions = await prisma.autoAction.findMany({ where: { isEnabled: true, triggerType: 'NEW_COMMENT' } })
  for (const msg of recentComments) {
    for (const action of commentActions.filter(a => a.workspaceId === msg.workspaceId)) {
      await executeAction(action, { commentId: msg.id, content: msg.content })
      executed++
    }
  }

  return NextResponse.json({ executed })
}

async function executeAction(action: { id: string; workspaceId: string; actionType: string; config: unknown }, context?: Record<string, unknown>) {
  const config = (action.config ?? {}) as Record<string, unknown>

  if (action.actionType === 'NOTIFY_WEBHOOK' && config.url) {
    await fireWebhooks(action.workspaceId, 'auto_action.triggered', {
      actionId: action.id,
      ...(context ?? {}),
    })
  }

  if (action.actionType === 'SEND_EMAIL' && config.to) {
    if (resend) {
      const subject = String(config.subject ?? 'Postiz Auto-Action Triggered')
      const body = String(config.body ?? `Auto-action triggered for workspace ${action.workspaceId}.${context ? `\n\nContext: ${JSON.stringify(context)}` : ''}`)
      await resend.emails.send({
        from: process.env.EMAIL_FROM ?? 'Postiz <notifications@postiz.app>',
        to: String(config.to),
        subject,
        html: `<p>${body.replace(/\n/g, '<br/>')}</p>`,
      })
    } else {
      console.warn('[auto-actions] RESEND_API_KEY not set — skipping SEND_EMAIL action', action.id)
    }
  }

  if (action.actionType === 'AUTO_LIKE' || action.actionType === 'AUTO_COMMENT') {
    // Stub: auto-like/comment requires per-platform OAuth write scopes
    // Platform API endpoints:
    //   Twitter: POST /2/users/:id/likes  |  POST /2/tweets/:id/reply
    //   LinkedIn: POST /v2/socialActions/:urn/likes  |  POST /v2/socialActions/:urn/comments
    //   Instagram: POST /media/{id}/likes  |  POST /media/{id}/comments
    console.info(
      `[auto-actions] ${action.actionType} stub — platform integration pending`,
      { actionId: action.id, workspaceId: action.workspaceId }
    )
  }

  await prisma.autoAction.update({ where: { id: action.id }, data: { lastRunAt: new Date(), runCount: { increment: 1 } } })
}
