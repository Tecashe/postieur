import crypto from 'crypto'
import { prisma } from '@/lib/prisma'

export async function fireWebhooks(
  workspaceId: string,
  event: string,
  payload: Record<string, unknown>
): Promise<void> {
  const endpoints = await prisma.webhookEndpoint.findMany({
    where: { workspaceId, isActive: true, events: { has: event } },
  })
  if (endpoints.length === 0) return

  await Promise.allSettled(
    endpoints.map(async (endpoint) => {
      const body = JSON.stringify({ event, payload, timestamp: new Date().toISOString() })
      const sig = crypto
        .createHmac('sha256', endpoint.secret)
        .update(body)
        .digest('hex')

      let responseCode: number | null = null
      let error: string | null = null
      let status: 'SUCCESS' | 'FAILED' = 'FAILED'

      try {
        const res = await fetch(endpoint.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Caelpost-Signature': `sha256=${sig}`,
            'X-Caelpost-Event': event,
          },
          body,
          signal: AbortSignal.timeout(5000),
        })
        responseCode = res.status
        status = res.ok ? 'SUCCESS' : 'FAILED'
      } catch (err) {
        error = err instanceof Error ? err.message : String(err)
      }

      // Record delivery
      await prisma.$transaction([
        prisma.webhookDelivery.create({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data: { webhookId: endpoint.id, event, payload: payload as any, responseCode, status, error },
        }),
        prisma.webhookEndpoint.update({
          where: { id: endpoint.id },
          data: {
            lastTriggeredAt: new Date(),
            successCount: status === 'SUCCESS' ? { increment: 1 } : undefined,
            failureCount: status === 'FAILED' ? { increment: 1 } : undefined,
          },
        }),
      ])
    })
  )
}
