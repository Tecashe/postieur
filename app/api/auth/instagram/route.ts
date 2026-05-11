import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

const APP_URL = 'https://postieur.vercel.app'
const REDIRECT_URI = 'https://postieur.vercel.app/api/auth/instagram/callback'

/**
 * Initiates Instagram Login for Business OAuth flow.
 * Uses the new Instagram Login (not Facebook Login) — requires:
 *   META_APP_ID     — Instagram App ID
 * Redirect URI registered in Meta app: https://postieur.vercel.app/api/auth/instagram/callback
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
    REDIRECT_URI,
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

  // Scope order must match Meta's embed URL exactly (App Dashboard > Instagram > Step 4)
  const scope = [
    'instagram_business_basic',
    'instagram_business_manage_messages',
    'instagram_business_manage_comments',
    'instagram_business_content_publish',
    'instagram_business_manage_insights',
  ].join(',')

  // Build params WITHOUT redirect_uri — URLSearchParams encodes it as https%3A%2F%2F...
  // but Meta's embed URL sends it as a literal https://... (unencoded).
  // If Meta stores the raw string from the auth URL and does a literal comparison
  // during token exchange, the encoded form will never match the literal form.
  const params = new URLSearchParams({
    client_id: appId,
    response_type: 'code',
    scope,
    state,
  })

  // Append redirect_uri as a literal URL (no percent-encoding) to match Meta's embed URL format
  const authorizeUrl = `https://www.instagram.com/oauth/authorize?${params.toString()}&redirect_uri=${REDIRECT_URI}`
  console.log('[instagram/oauth] redirecting to:', authorizeUrl)

  return NextResponse.redirect(authorizeUrl)
}