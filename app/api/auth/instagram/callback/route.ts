import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
const IG_GRAPH = 'https://graph.instagram.com'

/**
 * Instagram Login for Business callback.
 *
 * Flow:
 *   1. Exchange authorization code → short-lived token (1 hour)
 *      POST https://api.instagram.com/oauth/access_token
 *   2. Exchange short-lived → long-lived token (60 days)
 *      GET  https://graph.instagram.com/access_token?grant_type=ig_exchange_token
 *   3. Fetch IG profile (id, username, followers_count, profile_picture_url)
 *      GET  https://graph.instagram.com/me?fields=...
 *   4. Upsert Channel record with igUserId + graphBaseUrl stored in config
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')
  const errorReason = searchParams.get('error_reason')

  if (error) {
    const msg = errorReason ?? error
    return NextResponse.redirect(`${APP_URL}/dashboard/channels?error=${encodeURIComponent(msg)}`)
  }

  if (!code || !state) {
    return NextResponse.redirect(`${APP_URL}/dashboard/channels?error=missing_params`)
  }

  // Decode state
  let workspaceId: string
  try {
    const decoded = JSON.parse(Buffer.from(state, 'base64url').toString()) as {
      workspaceId: string
    }
    workspaceId = decoded.workspaceId
  } catch {
    return NextResponse.redirect(`${APP_URL}/dashboard/channels?error=invalid_state`)
  }

  const appId = process.env.META_APP_ID ?? ''
  const appSecret = process.env.META_APP_SECRET ?? ''
  const redirectUri = `${APP_URL}/api/auth/instagram/callback`

  // ── Step 1: exchange code for short-lived token ─────────────────────────
  const tokenRes = await fetch('https://api.instagram.com/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: appId,
      client_secret: appSecret,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
      code,
    }),
  })

  if (!tokenRes.ok) {
    const errText = await tokenRes.text()
    console.error('[instagram/callback] short-lived token exchange failed:', errText)
    return NextResponse.redirect(`${APP_URL}/dashboard/channels?error=token_exchange_failed`)
  }

  // Meta docs show the response wrapped in data:[{...}] for Business Login
  // Handle both flat and wrapped formats defensively
  const rawToken = await tokenRes.json() as
    | { access_token: string; user_id: number | string; permissions?: string }
    | { data: Array<{ access_token: string; user_id: number | string; permissions?: string }> }

  const tokenData = 'data' in rawToken && Array.isArray(rawToken.data)
    ? rawToken.data[0]
    : rawToken as { access_token: string; user_id: number | string }

  if (!tokenData?.access_token) {
    console.error('[instagram/callback] no access_token in response:', rawToken)
    return NextResponse.redirect(`${APP_URL}/dashboard/channels?error=no_access_token`)
  }

  const shortToken = tokenData.access_token
  const rawUserId = String(tokenData.user_id)

  // ── Step 2: exchange for long-lived token (60 days) ─────────────────────
  let accessToken = shortToken
  let tokenExpiry: Date = new Date(Date.now() + 60 * 24 * 60 * 60_000)

  const llRes = await fetch(
    `${IG_GRAPH}/access_token?grant_type=ig_exchange_token&client_secret=${encodeURIComponent(appSecret)}&access_token=${encodeURIComponent(shortToken)}`,
  )
  if (llRes.ok) {
    const llData = await llRes.json() as { access_token: string; token_type?: string; expires_in?: number }
    accessToken = llData.access_token
    if (llData.expires_in) {
      tokenExpiry = new Date(Date.now() + llData.expires_in * 1000)
    }
  } else {
    console.warn('[instagram/callback] long-lived token exchange failed, using short-lived:', await llRes.text())
  }

  // ── Step 3: fetch IG Business profile ───────────────────────────────────
  let igUserId = rawUserId
  let username = 'instagram-user'
  let avatarUrl: string | undefined
  let followers = 0

  const profileRes = await fetch(
    `${IG_GRAPH}/me?fields=user_id,username,followers_count,profile_picture_url&access_token=${encodeURIComponent(accessToken)}`,
  )
  if (profileRes.ok) {
    const profile = await profileRes.json() as {
      id?: string
      user_id?: string        // new Instagram Login API returns user_id
      username?: string
      followers_count?: number
      profile_picture_url?: string
    }
    // new API returns user_id, legacy returns id
    igUserId = profile.user_id ?? profile.id ?? igUserId
    username = profile.username ?? username
    avatarUrl = profile.profile_picture_url
    followers = profile.followers_count ?? 0
  } else {
    console.warn('[instagram/callback] profile fetch failed:', await profileRes.text())
  }

  const handle = `@${username}`

  // ── Step 4: upsert channel in DB ────────────────────────────────────────
  await prisma.channel.upsert({
    where: {
      workspaceId_platform_handle: {
        workspaceId,
        platform: 'instagram',
        handle,
      },
    },
    update: {
      accessToken,
      refreshToken: null,
      tokenExpiry,
      displayName: username,
      avatarUrl: avatarUrl ?? null,
      followers,
      isActive: true,
      config: {
        igUserId,
        graphBaseUrl: `${IG_GRAPH}/v21.0`,
      },
    },
    create: {
      workspaceId,
      platform: 'instagram',
      handle,
      displayName: username,
      avatarUrl: avatarUrl ?? null,
      accessToken,
      refreshToken: null,
      tokenExpiry,
      followers,
      isActive: true,
      config: {
        igUserId,
        graphBaseUrl: `${IG_GRAPH}/v21.0`,
      },
    },
  })

  return NextResponse.redirect(`${APP_URL}/dashboard/channels?connected=instagram`)
}
