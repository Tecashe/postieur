import { auth } from '@clerk/nextjs/server'
import { clerkClient } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

/**
 * Called once per dashboard page render (server component).
 * Ensures the Workspace row exists in DB for the active Clerk org.
 * No-ops if already exists.
 */
export async function provisionWorkspace() {
  try {
    const { orgId } = await auth()
    if (!orgId) return

    const existing = await prisma.workspace.findUnique({
      where: { clerkOrgId: orgId },
      select: { id: true },
    })
    if (existing) return

    // Fetch org details from Clerk to get name/slug
    const client = await clerkClient()
    const org = await client.organizations.getOrganization({ organizationId: orgId })

    await prisma.workspace.create({
      data: {
        clerkOrgId: orgId,
        name: org.name,
        slug: org.slug ?? orgId,
        logoUrl: org.imageUrl ?? null,
      },
    })
  } catch {
    // Non-fatal — user will see an error only if they try to write data
  }
}
