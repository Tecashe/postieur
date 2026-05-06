import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

/**
 * Initiates Instagram Login for Business OAuth flow.
 * Uses the new Instagram Login (not Facebook Login) — requires:
 *   META_APP_ID     — Instagram App ID
 * Redirect URI registered in Meta app: {APP_URL}/api/auth/instagram/callback
 */
export async function GET(_request: Request) {
  const { userId, orgId } = await auth()
  if (!userId || !orgId) {
    return NextResponse.redirect(`${APP_URL}/sign-in`)
  }

  const appId = process.env.META_APP_ID
  const appSecret = process.env.META_APP_SECRET

  console.log('[instagram/oauth] env check:', {
    META_APP_ID: appId ? `${appId.slice(0, 4)}…(${appId.length} chars)` : 'MISSING',
    META_APP_SECRET: appSecret ? `set (${appSecret.length} chars)` : 'MISSING',
    APP_URL,
    NODE_ENV: process.env.NODE_ENV,
  })

  if (!appId) {
    console.error('[instagram/oauth] META_APP_ID is not set')
    return NextResponse.json({ error: 'Instagram OAuth not configured (META_APP_ID missing)' }, { status: 503 })
  }

  const workspace = await prisma.workspace.findUnique({ where: { clerkOrgId: orgId } })
  if (!workspace) {
    return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
  }

  const state = Buffer.from(
    JSON.stringify({
      workspaceId: workspace.id,
      platform: 'instagram',
      nonce: crypto.randomBytes(8).toString('hex'),
    }),
  ).toString('base64url')

  const redirectUri = `${APP_URL}/api/auth/instagram/callback`
  const scope = 'instagram_business_basic,instagram_business_content_publish'

  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope,
    state,
  })

  const authorizeUrl = `https://www.instagram.com/oauth/authorize?${params.toString()}`
  console.log('[instagram/oauth] redirecting to:', authorizeUrl)

  return NextResponse.redirect(authorizeUrl)
}
