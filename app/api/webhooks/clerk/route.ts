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
      case 'user.created':
      case 'user.updated': {
        const { id, email_addresses, first_name, last_name, image_url } = evt.data
        const primaryEmail = email_addresses?.[0]?.email_address

        if (!primaryEmail) {
          return new Response('No email found on user', { status: 400 })
        }

        await prisma.user.upsert({
          where: { id },
          create: {
            id,
            email: primaryEmail,
            name:
              [first_name, last_name].filter(Boolean).join(' ').trim() || 'User',
            avatarUrl: image_url ?? null,
          },
          update: {
            email: primaryEmail,
            name:
              [first_name, last_name].filter(Boolean).join(' ').trim() || 'User',
            avatarUrl: image_url ?? null,
          },
        })
        break
      }

      case 'organization.created': {
        const { id, name, slug } = evt.data
        await prisma.workspace.upsert({
          where: { clerkOrgId: id },
          create: {
            clerkOrgId: id,
            name,
            slug: slug ?? id,
          },
          update: {
            name,
            slug: slug ?? id,
          },
        })
        break
      }

      case 'organization.updated': {
        const { id, name, slug } = evt.data
        await prisma.workspace.update({
          where: { clerkOrgId: id },
          data: { name, slug: slug ?? id },
        })
        break
      }

      case 'organizationMembership.created': {
        const { organization, public_user_data, role } = evt.data
        const workspace = await prisma.workspace.findUnique({
          where: { clerkOrgId: organization.id },
        })
        if (workspace && public_user_data?.user_id) {
          const mappedRole =
            role === 'org:admin' ? 'ADMIN' : role === 'org:owner' ? 'OWNER' : 'EDITOR'
          await prisma.workspaceMember.upsert({
            where: {
              userId_workspaceId: {
                userId: public_user_data.user_id,
                workspaceId: workspace.id,
              },
            },
            create: {
              userId: public_user_data.user_id,
              workspaceId: workspace.id,
              role: mappedRole,
            },
            update: { role: mappedRole },
          })
        }
        break
      }

      case 'organizationMembership.deleted': {
        const { organization, public_user_data } = evt.data
        const workspace = await prisma.workspace.findUnique({
          where: { clerkOrgId: organization.id },
        })
        if (workspace && public_user_data?.user_id) {
          await prisma.workspaceMember.deleteMany({
            where: {
              userId: public_user_data.user_id,
              workspaceId: workspace.id,
            },
          })
        }
        break
      }

      default:
        // Ignore unhandled event types
        break
    }
  } catch (err) {
    console.error(`Webhook handler error for ${evt.type}:`, err)
    return new Response('Internal server error', { status: 500 })
  }

  return new Response('OK', { status: 200 })
}
