import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

interface TokenResponse {
  access_token: string
  refresh_token?: string
  expires_in?: number
  token_type?: string
}

const TOKEN_ENDPOINTS: Record<string, string> = {
  x:         'https://api.twitter.com/2/oauth2/token',
  linkedin:  'https://www.linkedin.com/oauth/v2/accessToken',
  facebook:  'https://graph.facebook.com/v19.0/oauth/access_token',
  instagram: 'https://graph.facebook.com/v19.0/oauth/access_token',
  reddit:    'https://www.reddit.com/api/v1/access_token',
  youtube:   'https://oauth2.googleapis.com/token',
}

const CLIENT_SECRETS: Record<string, { id: string; secret: string }> = {
  x:         { id: process.env.TWITTER_CLIENT_ID ?? '', secret: process.env.TWITTER_CLIENT_SECRET ?? '' },
  linkedin:  { id: process.env.LINKEDIN_CLIENT_ID ?? '', secret: process.env.LINKEDIN_CLIENT_SECRET ?? '' },
  facebook:  { id: process.env.META_APP_ID ?? '', secret: process.env.META_APP_SECRET ?? '' },
  instagram: { id: process.env.META_APP_ID ?? '', secret: process.env.META_APP_SECRET ?? '' },
  reddit:    { id: process.env.REDDIT_CLIENT_ID ?? '', secret: process.env.REDDIT_CLIENT_SECRET ?? '' },
  youtube:   { id: process.env.YOUTUBE_CLIENT_ID ?? '', secret: process.env.YOUTUBE_CLIENT_SECRET ?? '' },
}

// Fetch basic profile info per platform
async function fetchProfile(platform: string, accessToken: string): Promise<{ handle: string; displayName: string; avatarUrl?: string; followers?: number }> {
  try {
    switch (platform) {
      case 'x': {
        const res = await fetch('https://api.twitter.com/2/users/me?user.fields=profile_image_url,public_metrics', {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        const data = await res.json() as { data?: { username: string; name: string; profile_image_url?: string; public_metrics?: { followers_count?: number } } }
        return {
          handle: `@${data.data?.username ?? 'unknown'}`,
          displayName: data.data?.name ?? '',
          avatarUrl: data.data?.profile_image_url,
          followers: data.data?.public_metrics?.followers_count,
        }
      }
      case 'linkedin': {
        const res = await fetch('https://api.linkedin.com/v2/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        const data = await res.json() as { name?: string; sub?: string; picture?: string }
        return { handle: data.sub ?? 'linkedin-user', displayName: data.name ?? '', avatarUrl: data.picture }
      }
      case 'reddit': {
        const res = await fetch('https://oauth.reddit.com/api/v1/me', {
          headers: { Authorization: `Bearer ${accessToken}`, 'User-Agent': 'Postiz/1.0' },
        })
        const data = await res.json() as { name?: string; icon_img?: string }
        return { handle: `u/${data.name ?? 'user'}`, displayName: data.name ?? '' }
      }
      default:
        return { handle: platform, displayName: platform }
    }
  } catch {
    return { handle: platform, displayName: platform }
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform } = await params
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(`${APP_URL}/dashboard/channels?error=${encodeURIComponent(error)}`)
  }

  if (!code || !state) {
    return NextResponse.redirect(`${APP_URL}/dashboard/channels?error=missing_params`)
  }

  // Decode state
  let stateData: { workspaceId: string; platform: string }
  try {
    stateData = JSON.parse(Buffer.from(state, 'base64url').toString())
  } catch {
    return NextResponse.redirect(`${APP_URL}/dashboard/channels?error=invalid_state`)
  }

  const { workspaceId } = stateData
  const credentials = CLIENT_SECRETS[platform]
  const tokenEndpoint = TOKEN_ENDPOINTS[platform]

  if (!credentials || !tokenEndpoint) {
    return NextResponse.redirect(`${APP_URL}/dashboard/channels?error=unsupported_platform`)
  }

  const redirectUri = `${APP_URL}/api/oauth/${platform}/callback`

  // Build token request
  const tokenBody: Record<string, string> = {
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
  }

  // PKCE: get verifier from cookie
  const cookieHeader = request.headers.get('cookie') ?? ''
  const pkceMatch = cookieHeader.match(/pkce_verifier=([^;]+)/)
  if (pkceMatch) {
    tokenBody.code_verifier = pkceMatch[1]
  }

  let tokenRes: Response
  // Reddit uses Basic auth
  if (platform === 'reddit') {
    tokenBody.client_id = credentials.id
    tokenRes = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${credentials.id}:${credentials.secret}`).toString('base64')}`,
        'User-Agent': 'Postiz/1.0',
      },
      body: new URLSearchParams(tokenBody),
    })
  } else if (platform === 'x') {
    // Twitter PKCE uses Basic auth for confidential clients
    tokenRes = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${credentials.id}:${credentials.secret}`).toString('base64')}`,
      },
      body: new URLSearchParams(tokenBody),
    })
  } else {
    tokenBody.client_id = credentials.id
    tokenBody.client_secret = credentials.secret
    tokenRes = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(tokenBody),
    })
  }

  if (!tokenRes.ok) {
    const errText = await tokenRes.text()
    console.error(`OAuth token error for ${platform}:`, errText)
    return NextResponse.redirect(`${APP_URL}/dashboard/channels?error=token_exchange_failed`)
  }

  const tokens = await tokenRes.json() as TokenResponse
  const { access_token, refresh_token, expires_in } = tokens

  // Fetch profile
  const profile = await fetchProfile(platform, access_token)

  // Upsert channel in DB
  const tokenExpiry = expires_in
    ? new Date(Date.now() + expires_in * 1000)
    : null

  await prisma.channel.upsert({
    where: {
      workspaceId_platform_handle: {
        workspaceId,
        platform,
        handle: profile.handle,
      },
    },
    update: {
      accessToken: access_token,
      refreshToken: refresh_token ?? null,
      tokenExpiry,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl ?? null,
      followers: profile.followers ?? 0,
      isActive: true,
    },
    create: {
      workspaceId,
      platform,
      handle: profile.handle,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl ?? null,
      accessToken: access_token,
      refreshToken: refresh_token ?? null,
      tokenExpiry,
      followers: profile.followers ?? 0,
      isActive: true,
    },
  })

  // Clear PKCE cookie and redirect
  const response = NextResponse.redirect(`${APP_URL}/dashboard/channels?connected=${platform}`)
  response.cookies.delete('pkce_verifier')
  return response
}
