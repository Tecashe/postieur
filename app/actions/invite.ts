'use server'

import { auth, clerkClient } from '@clerk/nextjs/server'

export async function inviteMember(emailAddress: string, role: string) {
  const { userId, orgId } = await auth()
  if (!userId || !orgId) throw new Error('Unauthorized')

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

  const client = await clerkClient()
  await client.organizations.createOrganizationInvitation({
    organizationId: orgId,
    emailAddress,
    role,
    redirectUrl: `${baseUrl}/accept-invitation`,
    inviterUserId: userId,
  })
}
