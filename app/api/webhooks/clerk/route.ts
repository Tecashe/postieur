import { Webhook } from 'svix'
import { headers } from 'next/headers'
import type { WebhookEvent } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET || WEBHOOK_SECRET.startsWith('whsec_replace')) {
    console.error('CLERK_WEBHOOK_SECRET is not configured')
    return new Response('Webhook secret not configured', { status: 500 })
  }

  const headerPayload = await headers()
  const svixId = headerPayload.get('svix-id')
  const svixTimestamp = headerPayload.get('svix-timestamp')
  const svixSignature = headerPayload.get('svix-signature')

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response('Missing svix headers', { status: 400 })
  }

  let body: string
  try {
    body = JSON.stringify(await req.json())
  } catch {
    return new Response('Invalid request body', { status: 400 })
  }

  const wh = new Webhook(WEBHOOK_SECRET)
  let evt: WebhookEvent

  try {
    evt = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as WebhookEvent
  } catch {
    return new Response('Webhook signature verification failed', { status: 400 })
  }

  try {
    switch (evt.type) {
      // Sync Clerk orgs -> Workspaces in DB
      case 'organization.created': {
        const { id, name, slug, image_url } = evt.data as {
          id: string; name: string; slug?: string; image_url?: string
        }
        await prisma.workspace.upsert({
          where: { clerkOrgId: id },
          create: {
            clerkOrgId: id,
            name,
            slug: slug ?? id,
            logoUrl: image_url ?? null,
          },
          update: {
            name,
            slug: slug ?? id,
            logoUrl: image_url ?? null,
          },
        })
        break
      }

      case 'organization.updated': {
        const { id, name, slug, image_url } = evt.data as {
          id: string; name: string; slug?: string; image_url?: string
        }
        await prisma.workspace.updateMany({
          where: { clerkOrgId: id },
          data: {
            name,
            slug: slug ?? id,
            logoUrl: image_url ?? null,
          },
        })
        break
      }

      case 'organization.deleted': {
        const { id } = evt.data as { id: string }
        // Cascade deletes posts, channels, media via onDelete: Cascade in schema
        await prisma.workspace.deleteMany({ where: { clerkOrgId: id } })
        break
      }

      default:
        break
    }
  } catch (err) {
    console.error(`[clerk-webhook] error for ${evt.type}:`, err)
    return new Response('Internal server error', { status: 500 })
  }

  return new Response('OK', { status: 200 })
}
