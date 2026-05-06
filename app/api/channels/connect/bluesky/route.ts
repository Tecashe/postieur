/**
 * POST /api/channels/connect/bluesky
 *
 * Bluesky uses the AT Protocol — NOT standard OAuth2.
 * Users provide their handle (or email) + app password.
 * We exchange for a session DID + access JWT via com.atproto.server.createSession.
 *
 * Body: { identifier: string, password: string }
 * Auth: Clerk session (workspaceId derived from orgId)
 */

import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const DEFAULT_PDS = 'https://bsky.social'

interface AtprotoSession {
  did: string
  handle: string
  email?: string
  accessJwt: string
  refreshJwt: string
  didDoc?: { alsoKnownAs?: string[] }
}

export async function POST(req: Request) {
  const { userId, orgId } = await auth()
  if (!userId || !orgId) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
  }

  const workspace = await prisma.workspace.findUnique({ where: { clerkOrgId: orgId } })
  if (!workspace) {
    return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
  }

  const body = await req.json() as { identifier?: string; password?: string; pdsUrl?: string }
  const { identifier, password } = body
  const pdsUrl = (body.pdsUrl?.replace(/\/$/, '') ?? DEFAULT_PDS)

  if (!identifier || !password) {
    return NextResponse.json({ error: 'identifier and password are required' }, { status: 400 })
  }

  // Create session via AT Protocol
  const sessionRes = await fetch(`${pdsUrl}/xrpc/com.atproto.server.createSession`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password }),
  })

  if (!sessionRes.ok) {
    const err = await sessionRes.json() as { message?: string; error?: string }
    return NextResponse.json(
      { error: err.message ?? err.error ?? 'Authentication failed. Check your handle and app password.' },
      { status: 401 },
    )
  }

  const session = await sessionRes.json() as AtprotoSession

  // Fetch profile for avatar + followers
  let avatarUrl: string | undefined
  let followers = 0
  try {
    const profileRes = await fetch(
      `${pdsUrl}/xrpc/app.bsky.actor.getProfile?actor=${encodeURIComponent(session.did)}`,
      { headers: { Authorization: `Bearer ${session.accessJwt}` } },
    )
    if (profileRes.ok) {
      const profile = await profileRes.json() as { avatar?: string; followersCount?: number }
      avatarUrl = profile.avatar
      followers = profile.followersCount ?? 0
    }
  } catch { /* non-fatal */ }

  // Bluesky access JWTs expire after ~2 hours; refresh JWTs last ~90 days
  const tokenExpiry = new Date(Date.now() + 2 * 60 * 60 * 1000)

  await prisma.channel.upsert({
    where: {
      workspaceId_platform_handle: {
        workspaceId: workspace.id,
        platform: 'bluesky',
        handle: `@${session.handle}`,
      },
    },
    update: {
      accessToken: session.accessJwt,
      refreshToken: session.refreshJwt,
      tokenExpiry,
      displayName: session.handle,
      avatarUrl: avatarUrl ?? null,
      followers,
      isActive: true,
      config: { did: session.did, pdsUrl, handle: session.handle },
    },
    create: {
      workspaceId: workspace.id,
      platform: 'bluesky',
      handle: `@${session.handle}`,
      displayName: session.handle,
      avatarUrl: avatarUrl ?? null,
      accessToken: session.accessJwt,
      refreshToken: session.refreshJwt,
      tokenExpiry,
      followers,
      isActive: true,
      config: { did: session.did, pdsUrl, handle: session.handle },
    },
  })

  return NextResponse.json({ connected: true, handle: session.handle })
}
