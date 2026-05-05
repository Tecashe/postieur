import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/platform-meta?platform=x&type=lists|communities
 * GET /api/platform-meta?platform=linkedin&type=companies
 * GET /api/platform-meta?platform=reddit&type=subreddits|flairs&subreddit=...
 * GET /api/platform-meta?platform=youtube&type=playlists|categories
 */
export async function GET(request: Request) {
  const { userId, orgId } = await auth()
  if (!userId || !orgId) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })

  const workspace = await prisma.workspace.findUnique({ where: { clerkOrgId: orgId } })
  if (!workspace) return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })

  const { searchParams } = new URL(request.url)
  const platform = searchParams.get('platform') ?? ''
  const type = searchParams.get('type') ?? ''

  // Get the active channel access token for this platform
  const channel = await prisma.channel.findFirst({
    where: { workspaceId: workspace.id, platform, isActive: true },
  })

  if (!channel?.accessToken) {
    return NextResponse.json({ error: 'No active channel for this platform' }, { status: 404 })
  }

  const token = channel.accessToken

  try {
    switch (platform) {
      // ── Twitter / X ──────────────────────────────────────────────────────
      case 'x': {
        if (type === 'lists') {
          const res = await fetch(
            'https://api.twitter.com/2/users/me/owned_lists?max_results=100',
            { headers: { Authorization: `Bearer ${token}` } }
          )
          const data = await res.json() as { data?: { id: string; name: string }[] }
          return NextResponse.json({ items: data.data ?? [] })
        }
        if (type === 'communities') {
          // Twitter Communities API (v2 — limited access)
          const res = await fetch(
            'https://api.twitter.com/2/communities/search?query=&max_results=20',
            { headers: { Authorization: `Bearer ${token}` } }
          )
          const data = await res.json() as { data?: { id: string; name: string }[] }
          return NextResponse.json({ items: data.data ?? [] })
        }
        break
      }

      // ── LinkedIn ──────────────────────────────────────────────────────────
      case 'linkedin': {
        if (type === 'companies') {
          // Get organizations the user is admin of
          const res = await fetch(
            'https://api.linkedin.com/v2/organizationAcls?q=roleAssignee&role=ADMINISTRATOR&state=APPROVED&count=50',
            { headers: { Authorization: `Bearer ${token}` } }
          )
          const data = await res.json() as {
            elements?: { organization: string }[]
          }
          const orgUrns = data.elements?.map(e => e.organization) ?? []

          // Batch fetch org names
          const items: { id: string; name: string }[] = []
          for (const urn of orgUrns.slice(0, 10)) {
            const orgId2 = urn.split(':').pop()
            if (!orgId2) continue
            const orgRes = await fetch(
              `https://api.linkedin.com/v2/organizations/${orgId2}`,
              { headers: { Authorization: `Bearer ${token}` } }
            )
            const org = await orgRes.json() as { id: number; localizedName?: string; name?: { localized?: Record<string,string> } }
            const name = org.localizedName ?? Object.values(org.name?.localized ?? {})[0] ?? orgId2
            items.push({ id: String(org.id ?? orgId2), name })
          }
          return NextResponse.json({ items })
        }
        break
      }

      // ── Reddit ────────────────────────────────────────────────────────────
      case 'reddit': {
        if (type === 'subreddits') {
          // Get subreddits the user moderates / is subscribed to
          const res = await fetch(
            'https://oauth.reddit.com/subreddits/mine/moderator?limit=50',
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'User-Agent': 'Postiz/1.0',
              },
            }
          )
          const data = await res.json() as {
            data?: { children?: { data: { display_name: string; title: string } }[] }
          }
          const items = data.data?.children?.map(c => ({
            id: c.data.display_name,
            name: `r/${c.data.display_name} — ${c.data.title}`,
          })) ?? []
          return NextResponse.json({ items })
        }
        if (type === 'flairs') {
          const subreddit = searchParams.get('subreddit')
          if (!subreddit) return NextResponse.json({ items: [] })
          const res = await fetch(
            `https://oauth.reddit.com/r/${subreddit}/api/link_flair.json`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'User-Agent': 'Postiz/1.0',
              },
            }
          )
          const data = await res.json() as { id: string; text: string }[]
          const items = Array.isArray(data)
            ? data.map(f => ({ id: f.id, name: f.text }))
            : []
          return NextResponse.json({ items })
        }
        break
      }

      // ── YouTube ───────────────────────────────────────────────────────────
      case 'youtube': {
        if (type === 'playlists') {
          const res = await fetch(
            'https://www.googleapis.com/youtube/v3/playlists?part=snippet&mine=true&maxResults=50',
            { headers: { Authorization: `Bearer ${token}` } }
          )
          const data = await res.json() as {
            items?: { id: string; snippet: { title: string } }[]
          }
          const items = data.items?.map(p => ({ id: p.id, name: p.snippet.title })) ?? []
          return NextResponse.json({ items })
        }
        if (type === 'categories') {
          const res = await fetch(
            'https://www.googleapis.com/youtube/v3/videoCategories?part=snippet&regionCode=US',
            { headers: { Authorization: `Bearer ${token}` } }
          )
          const data = await res.json() as {
            items?: { id: string; snippet: { title: string; assignable: boolean } }[]
          }
          const items = data.items
            ?.filter(c => c.snippet.assignable)
            .map(c => ({ id: c.id, name: c.snippet.title })) ?? []
          return NextResponse.json({ items })
        }
        break
      }

      default:
        return NextResponse.json({ error: 'Unsupported platform' }, { status: 400 })
    }

    return NextResponse.json({ items: [] })
  } catch (err) {
    console.error('platform-meta error', err)
    return NextResponse.json({ error: 'Failed to fetch platform data' }, { status: 500 })
  }
}
