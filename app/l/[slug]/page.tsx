import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const page = await prisma.linkInBioPage.findUnique({
    where: { slug },
    select: { title: true, bio: true },
  })
  if (!page) return {}
  return {
    title: page.title,
    description: page.bio ?? undefined,
    openGraph: { title: page.title, description: page.bio ?? undefined },
  }
}

export default async function LinkInBioPublicPage({ params }: Props) {
  const { slug } = await params

  const page = await prisma.linkInBioPage.findUnique({
    where: { slug },
    include: {
      links: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
    },
  })

  if (!page || !page.isPublished) notFound()

  // Increment page views — fire and forget, never blocks render
  prisma.linkInBioPage.update({
    where: { id: page.id },
    data: { pageViews: { increment: 1 } },
  }).catch(() => {})

  // Accent colour from workspace theme or design-token default
  const accent = page.themeColor ?? 'oklch(0.520 0.095 178)'

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-start py-16 px-4"
      style={{ background: 'oklch(0.130 0.012 60)' }}
    >
      <div className="w-full max-w-[380px] flex flex-col items-center gap-6">

        {/* Avatar */}
        {page.avatarUrl && (
          <div
            className="w-24 h-24 rounded-full overflow-hidden border-2 shadow-lg"
            style={{ borderColor: accent }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={page.avatarUrl}
              alt={page.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Title + bio */}
        <div className="text-center space-y-1.5">
          <h1
            className="text-lg font-semibold tracking-tight"
            style={{ color: 'oklch(0.940 0.012 60)' }}
          >
            {page.title}
          </h1>
          {page.bio && (
            <p
              className="text-sm leading-relaxed max-w-[280px] mx-auto"
              style={{ color: 'oklch(0.680 0.025 60)' }}
            >
              {page.bio}
            </p>
          )}
        </div>

        {/* Links — each click goes through our tracking endpoint */}
        {page.links.length > 0 ? (
          <div className="w-full space-y-3">
            {page.links.map(link => (
              <a
                key={link.id}
                href={`/api/link-in-bio/click/${link.id}`}
                rel="noopener noreferrer"
                className="group flex items-center justify-between w-full px-5 py-3.5 rounded-xl font-medium text-sm transition-all duration-150 hover:scale-[1.01] active:scale-[0.99]"
                style={{
                  background: 'oklch(0.185 0.015 60)',
                  border: `1px solid oklch(0.260 0.018 60)`,
                  color: 'oklch(0.920 0.012 60)',
                }}
              >
                <span className="truncate">{link.title}</span>
                <ExternalLink
                  className="w-3.5 h-3.5 flex-shrink-0 ml-3 opacity-40 group-hover:opacity-70 transition-opacity"
                />
              </a>
            ))}
          </div>
        ) : (
          <p className="text-sm" style={{ color: 'oklch(0.500 0.020 60)' }}>
            No links yet.
          </p>
        )}

        {/* Footer attribution */}
        <div className="mt-4 flex items-center gap-1.5">
          <p className="text-[10px]" style={{ color: 'oklch(0.400 0.015 60)' }}>
            Powered by
          </p>
          <Link
            href="/"
            className="text-[10px] font-medium hover:underline"
            style={{ color: accent }}
          >
            Postieur
          </Link>
        </div>
      </div>
    </main>
  )
}
