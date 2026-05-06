import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

// Platform OAuth configurations
const PLATFORM_CONFIG: Record<string, {
  authUrl: string
  clientId: string
  scopes: string
  usePKCE?: boolean
  extraParams?: Record<string, string>
}> = {
  x: {
    authUrl: 'https://twitter.com/i/oauth2/authorize',
    clientId: process.env.TWITTER_CLIENT_ID ?? '',
    scopes: 'tweet.read tweet.write users.read offline.access',
    usePKCE: true,
  },
  linkedin: {
    authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    clientId: process.env.LINKEDIN_CLIENT_ID ?? '',
    scopes: 'openid profile email w_member_social',
  },
  facebook: {
    authUrl: 'https://www.facebook.com/v19.0/dialog/oauth',
    clientId: process.env.META_APP_ID ?? '',
    scopes: 'pages_manage_posts,pages_read_engagement,instagram_basic,instagram_content_publish',
  },
  instagram: {
    authUrl: 'https://www.facebook.com/v19.0/dialog/oauth',
    clientId: process.env.META_APP_ID ?? '',
    scopes: 'instagram_basic,instagram_content_publish',
  },
  reddit: {
    authUrl: 'https://www.reddit.com/api/v1/authorize',
    clientId: process.env.REDDIT_CLIENT_ID ?? '',
    scopes: 'identity submit read',
    extraParams: { duration: 'permanent' },
  },
  youtube: {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    clientId: process.env.YOUTUBE_CLIENT_ID ?? '',
    scopes: 'https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube',
    extraParams: { access_type: 'offline', prompt: 'consent' },
  },
  discord: {
    authUrl: 'https://discord.com/api/oauth2/authorize',
    clientId: process.env.DISCORD_CLIENT_ID ?? '',
    scopes: 'webhook.incoming identify',
  },
  threads: {
    authUrl: 'https://threads.net/oauth/authorize',
    clientId: process.env.THREADS_APP_ID ?? '',
    scopes: 'threads_basic,threads_content_publish',
  },
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform } = await params
  const config = PLATFORM_CONFIG[platform]

  if (!config) {
    return NextResponse.json({ error: `Unsupported platform: ${platform}` }, { status: 400 })
  }
  if (!config.clientId) {
    return NextResponse.json({ error: `${platform} OAuth not configured` }, { status: 503 })
  }

  const { userId, orgId } = await auth()
  if (!userId || !orgId) {
    return NextResponse.redirect(`${APP_URL}/sign-in`)
  }

  const workspace = await prisma.workspace.findUnique({ where: { clerkOrgId: orgId } })
  if (!workspace) {
    return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
  }

  // Generate state (encodes workspaceId for the callback)
  const state = Buffer.from(JSON.stringify({ workspaceId: workspace.id, platform, nonce: crypto.randomBytes(8).toString('hex') })).toString('base64url')

  const redirectUri = `${APP_URL}/api/oauth/${platform}/callback`
  const params2 = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: config.scopes,
    state,
    ...config.extraParams,
  })

  // PKCE for Twitter/X
  if (config.usePKCE) {
    const codeVerifier = crypto.randomBytes(32).toString('base64url')
    const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url')
    params2.set('code_challenge', codeChallenge)
    params2.set('code_challenge_method', 'S256')

    // Store verifier in a short-lived cookie (10 min)
    const response = NextResponse.redirect(`${config.authUrl}?${params2.toString()}`)
    response.cookies.set('pkce_verifier', codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 600,
      path: '/',
    })
    return response
  }

  return NextResponse.redirect(`${config.authUrl}?${params2.toString()}`)
}
