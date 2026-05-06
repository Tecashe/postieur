import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

interface TokenResponse {
  access_token: string
  refresh_token?: string
  expires_in?: number
  token_type?: string
  // Discord returns the webhook object directly in the token response
  webhook?: {
    id: string
    url: string
    channel_id: string
    guild_id?: string
    name?: string
    token?: string
  }
}

const TOKEN_ENDPOINTS: Record<string, string> = {
  x:         'https://api.twitter.com/2/oauth2/token',
  linkedin:  'https://www.linkedin.com/oauth/v2/accessToken',
  facebook:  'https://graph.facebook.com/v19.0/oauth/access_token',
  instagram: 'https://graph.facebook.com/v19.0/oauth/access_token',
  reddit:    'https://www.reddit.com/api/v1/access_token',
  youtube:   'https://oauth2.googleapis.com/token',
  discord:   'https://discord.com/api/oauth2/token',
  threads:   'https://graph.threads.net/oauth/access_token',
}

const CLIENT_SECRETS: Record<string, { id: string; secret: string }> = {
  x:         { id: process.env.TWITTER_CLIENT_ID ?? '', secret: process.env.TWITTER_CLIENT_SECRET ?? '' },
  linkedin:  { id: process.env.LINKEDIN_CLIENT_ID ?? '', secret: process.env.LINKEDIN_CLIENT_SECRET ?? '' },
  facebook:  { id: process.env.META_APP_ID ?? '', secret: process.env.META_APP_SECRET ?? '' },
  instagram: { id: process.env.META_APP_ID ?? '', secret: process.env.META_APP_SECRET ?? '' },
  reddit:    { id: process.env.REDDIT_CLIENT_ID ?? '', secret: process.env.REDDIT_CLIENT_SECRET ?? '' },
  youtube:   { id: process.env.YOUTUBE_CLIENT_ID ?? '', secret: process.env.YOUTUBE_CLIENT_SECRET ?? '' },
  discord:   { id: process.env.DISCORD_CLIENT_ID ?? '', secret: process.env.DISCORD_CLIENT_SECRET ?? '' },
  threads:   { id: process.env.THREADS_APP_ID ?? '', secret: process.env.THREADS_APP_SECRET ?? '' },
}

interface ProfileResult {
  handle: string
  displayName: string
  avatarUrl?: string
  followers?: number
  extraConfig?: Record<string, unknown>
}

// Fetch basic profile info per platform
async function fetchProfile(platform: string, accessToken: string): Promise<ProfileResult> {
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
        return {
          handle: data.sub ?? 'linkedin-user',
          displayName: data.name ?? '',
          avatarUrl: data.picture,
          extraConfig: { personUrn: `urn:li:person:${data.sub ?? ''}` },
        }
      }
      case 'facebook': {
        // Fetch pages connected to the user
        const pagesRes = await fetch(
          `https://graph.facebook.com/v19.0/me/accounts?access_token=${encodeURIComponent(accessToken)}&fields=id,name,access_token,picture`,
        )
        if (!pagesRes.ok) return { handle: 'facebook-user', displayName: 'Facebook' }
        const pagesData = await pagesRes.json() as {
          data?: Array<{ id: string; name: string; access_token: string; picture?: { data?: { url?: string } } }>
        }
        const pages = pagesData.data ?? []
        const firstPage = pages[0]
        if (!firstPage) return { handle: 'facebook-user', displayName: 'Facebook' }
        return {
          handle: firstPage.name.toLowerCase().replace(/\s+/g, '-'),
          displayName: firstPage.name,
          avatarUrl: firstPage.picture?.data?.url,
          extraConfig: {
            pageId: firstPage.id,
            pageAccessToken: firstPage.access_token,
            pages: pages.map((p) => ({ id: p.id, name: p.name, accessToken: p.access_token })),
          },
        }
      }
      case 'instagram': {
        // Step 1: get pages
        const pagesRes = await fetch(
          `https://graph.facebook.com/v19.0/me/accounts?access_token=${encodeURIComponent(accessToken)}&fields=id,name,access_token`,
        )
        if (!pagesRes.ok) return { handle: 'instagram-user', displayName: 'Instagram' }
        const pagesData = await pagesRes.json() as {
          data?: Array<{ id: string; name: string; access_token: string }>
        }
        const page = (pagesData.data ?? [])[0]
        if (!page) return { handle: 'instagram-user', displayName: 'Instagram' }

        // Step 2: get IG Business Account linked to the page
        const igLinkRes = await fetch(
          `https://graph.facebook.com/v19.0/${page.id}?fields=instagram_business_account&access_token=${encodeURIComponent(page.access_token)}`,
        )
        if (!igLinkRes.ok) return { handle: 'instagram-user', displayName: 'Instagram' }
        const igLink = await igLinkRes.json() as { instagram_business_account?: { id: string } }
        const igId = igLink.instagram_business_account?.id
        if (!igId) return { handle: 'instagram-user', displayName: 'Instagram' }

        // Step 3: get IG profile
        const igRes = await fetch(
          `https://graph.facebook.com/v19.0/${igId}?fields=username,followers_count,profile_picture_url&access_token=${encodeURIComponent(page.access_token)}`,
        )
        if (!igRes.ok) return { handle: 'instagram-user', displayName: 'Instagram' }
        const igProfile = await igRes.json() as { username?: string; followers_count?: number; profile_picture_url?: string }
        return {
          handle: `@${igProfile.username ?? 'instagram-user'}`,
          displayName: igProfile.username ?? 'Instagram',
          avatarUrl: igProfile.profile_picture_url,
          followers: igProfile.followers_count,
          extraConfig: {
            igUserId: igId,
            pageId: page.id,
            pageAccessToken: page.access_token,
          },
        }
      }
      case 'reddit': {
        const res = await fetch('https://oauth.reddit.com/api/v1/me', {
          headers: { Authorization: `Bearer ${accessToken}`, 'User-Agent': 'Postiz/1.0' },
        })
        const data = await res.json() as { name?: string; icon_img?: string }
        return { handle: `u/${data.name ?? 'user'}`, displayName: data.name ?? '' }
      }
      case 'discord': {
        // Webhook token response includes the webhook object directly
        // We pass the raw token response as extraConfig via a separate mechanism;
        // here we just fetch the bot user identity.
        const res = await fetch('https://discord.com/api/v10/users/@me', {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        if (!res.ok) return { handle: 'discord-user', displayName: 'Discord' }
        const data = await res.json() as { username?: string; global_name?: string; id?: string; avatar?: string }
        const username = data.username ?? 'discord-user'
        return {
          handle: `@${username}`,
          displayName: data.global_name ?? username,
          avatarUrl: data.avatar ? `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png` : undefined,
        }
        // Note: webhookUrl must be set manually in Channel settings — Discord's webhook.incoming
        // scope returns the webhook in the token response; caller must store webhook.url in config.
      }
      case 'threads': {
        // Exchange short-lived token for long-lived (60 days) first
        const llRes = await fetch(
          `https://graph.threads.net/access_token?grant_type=th_exchange_token&client_secret=${process.env.THREADS_APP_SECRET ?? ''}&access_token=${encodeURIComponent(accessToken)}`,
        )
        // Use short-lived token if exchange fails
        const meToken = llRes.ok ? ((await llRes.json()) as { access_token?: string }).access_token ?? accessToken : accessToken
        const meRes = await fetch(`https://graph.threads.net/v1.0/me?fields=id,username,threads_profile_picture_url,threads_biography&access_token=${encodeURIComponent(meToken)}`)
        if (!meRes.ok) return { handle: 'threads-user', displayName: 'Threads' }
        const meData = await meRes.json() as { id?: string; username?: string; threads_profile_picture_url?: string }
        return {
          handle: `@${meData.username ?? 'threads-user'}`,
          displayName: meData.username ?? 'Threads',
          avatarUrl: meData.threads_profile_picture_url,
          extraConfig: { threadsUserId: meData.id },
        }
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

  // Fetch profile (or construct from token response for non-profile platforms)
  const profile = await fetchProfile(platform, access_token)

  // Discord: webhook URL comes from the token response body, not a profile API
  if (platform === 'discord' && tokens.webhook?.url) {
    const wh = tokens.webhook
    profile.extraConfig = {
      ...(profile.extraConfig ?? {}),
      webhookUrl: wh.url,
      webhookId: wh.id,
      channelId: wh.channel_id,
      guildId: wh.guild_id,
    }
    // Use the channel name as the display handle if available
    if (wh.name) {
      profile.displayName = wh.name
      profile.handle = `#${wh.name.toLowerCase().replace(/\s+/g, '-')}`
    }
  }

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(profile.extraConfig ? { config: profile.extraConfig as any } : {}),
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      config: (profile.extraConfig ?? {}) as any,
    },
  })

  // Clear PKCE cookie and redirect
  const response = NextResponse.redirect(`${APP_URL}/dashboard/channels?connected=${platform}`)
  response.cookies.delete('pkce_verifier')
  return response
}
