import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/link-in-bio/click/[id]
 *
 * Public endpoint — no auth required. Called when a visitor clicks a link on
 * the public Link in Bio page. Increments the link's click counter and then
 * issues a redirect to the link's destination URL.
 *
 * Security:
 *  - Only works for links whose parent page is `isPublished = true`
 *  - The destination URL is fetched from the DB (never from query params) to
 *    prevent open-redirect injection
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Load the link together with its page to validate it's published
  const link = await prisma.linkInBioLink.findUnique({
    where: { id },
    select: {
      id: true,
      url: true,
      isActive: true,
      page: { select: { isPublished: true } },
    },
  })

  // If the link doesn't exist, is disabled, or the page is unpublished → 404
  if (!link || !link.isActive || !link.page.isPublished) {
    return new NextResponse(null, { status: 404 })
  }

  // Increment click count (fire-and-forget — don't block the redirect)
  prisma.linkInBioLink.update({
    where: { id },
    data: { clicks: { increment: 1 } },
  }).catch(() => {})

  // Redirect to the actual destination
  return NextResponse.redirect(link.url, { status: 302 })
}
