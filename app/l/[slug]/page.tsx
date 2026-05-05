import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'

interface Props { params: Promise<{ slug: string }> }

export default async function LinkInBioPublicPage({ params }: Props) {
  const { slug } = await params

  const page = await prisma.linkInBioPage.findUnique({
    where: { slug },
    include: { links: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } } },
  })

  if (!page || !page.isPublished) notFound()

  // increment page views async (don't await)
  prisma.linkInBioPage.update({ where: { id: page.id }, data: { pageViews: { increment: 1 } } }).catch(() => {})

  return (
    <main className="min-h-screen flex items-center justify-center bg-background py-12 px-4">
      <div className="w-full max-w-sm space-y-6">
        {page.avatarUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={page.avatarUrl} alt={page.title} className="w-20 h-20 rounded-full mx-auto object-cover border-2 border-border" />
        )}
        <div className="text-center">
          <h1 className="text-xl font-semibold">{page.title}</h1>
          {page.bio && <p className="text-sm text-muted-foreground mt-1">{page.bio}</p>}
        </div>

        <div className="space-y-3">
          {page.links.map(link => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center py-3 px-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors text-sm font-medium"
            >
              {link.title}
            </a>
          ))}
        </div>

        <p className="text-center text-[10px] text-muted-foreground/50">Powered by Postiz</p>
      </div>
    </main>
  )
}
