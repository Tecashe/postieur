'use server'

import { auth, clerkClient } from '@clerk/nextjs/server'
import { headers } from 'next/headers'

export async function inviteMember(emailAddress: string, role: string) {
  const { userId, orgId } = await auth()
  if (!userId || !orgId) throw new Error('Unauthorized')

  // Detect the real base URL from the incoming request headers.
  // This works on localhost, Vercel preview deployments, and production
  // without needing any env var to be manually set.
  const headersList = await headers()
  const host = headersList.get('host') ?? 'localhost:3000'
  const proto = headersList.get('x-forwarded-proto') ?? 'http'
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${proto}://${host}`

  const client = await clerkClient()
  await client.organizations.createOrganizationInvitation({
    organizationId: orgId,
    emailAddress,
    role,
    redirectUrl: `${baseUrl}/accept-invitation`,
    inviterUserId: userId,
  })
}
