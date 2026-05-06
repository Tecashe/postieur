import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const link = await prisma.shortLink.findUnique({ where: { slug } })

  if (!link) {
    return new NextResponse('Not found', { status: 404 })
  }

  // Increment click counter (fire-and-forget)
  prisma.shortLink.update({
    where: { id: link.id },
    data: { clicks: { increment: 1 } },
  }).catch(() => {})

  return NextResponse.redirect(link.originalUrl, { status: 302 })
}
