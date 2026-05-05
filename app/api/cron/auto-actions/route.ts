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
  const actions = await prisma.autoAction.findMany({
    where: { isEnabled: true, triggerType: 'SCHEDULED_TIME' },
  })

  let executed = 0
  for (const action of actions) {
    // triggerValue is a cron-like "HH:MM" time — fire if current time matches (within 1 min window)
    if (action.triggerValue) {
      const [h, m] = action.triggerValue.split(':').map(Number)
      if (now.getUTCHours() === h && now.getUTCMinutes() === m) {
        await executeAction(action)
        executed++
      }
    }
  }

  // Also check POST_PUBLISHED actions — fire retroactively for posts published in the last minute
  const recentlyPublished = await prisma.post.findMany({
    where: { publishedAt: { gte: new Date(now.getTime() - 60_000), lte: now } },
    select: { id: true, workspaceId: true, content: true },
  })
  const publishActions = await prisma.autoAction.findMany({ where: { isEnabled: true, triggerType: 'POST_PUBLISHED' } })
  for (const post of recentlyPublished) {
    const matched = publishActions.filter((a) => a.workspaceId === post.workspaceId)
    for (const action of matched) {
      await executeAction(action, { postId: post.id, content: post.content })
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
