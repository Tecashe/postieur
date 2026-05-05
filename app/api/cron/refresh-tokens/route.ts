import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function verifyCron(req: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return true
  return req.headers.get('authorization') === `Bearer ${secret}`
}

export async function GET(req: Request) {
  if (!verifyCron(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Find channels whose tokens expire in the next hour
  const soon = new Date(Date.now() + 60 * 60_000)
  const channels = await prisma.channel.findMany({
    where: { refreshToken: { not: null }, tokenExpiry: { lte: soon } },
  })

  const results: { channelId: string; platform: string; refreshed: boolean; error?: string }[] = []

  for (const channel of channels) {
    try {
      let newToken: string | null = null
      let newExpiry: Date | null = null

      // Platform-specific refresh logic
      if (channel.platform === 'linkedin' && channel.refreshToken) {
        const res = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: channel.refreshToken,
            client_id: process.env.LINKEDIN_CLIENT_ID ?? '',
            client_secret: process.env.LINKEDIN_CLIENT_SECRET ?? '',
          }),
        })
        if (res.ok) {
          const data = await res.json() as { access_token: string; expires_in: number }
          newToken = data.access_token
          newExpiry = new Date(Date.now() + data.expires_in * 1000)
        }
      }
      // Twitter uses short-lived tokens with refresh (OAuth 2.0)
      if (channel.platform === 'x' && channel.refreshToken) {
        const credentials = Buffer.from(`${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`).toString('base64')
        const res = await fetch('https://api.twitter.com/2/oauth2/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded', Authorization: `Basic ${credentials}` },
          body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: channel.refreshToken }),
        })
        if (res.ok) {
          const data = await res.json() as { access_token: string; refresh_token: string; expires_in: number }
          newToken = data.access_token
          newExpiry = new Date(Date.now() + data.expires_in * 1000)
          await prisma.channel.update({ where: { id: channel.id }, data: { refreshToken: data.refresh_token } })
        }
      }

      if (newToken) {
        await prisma.channel.update({ where: { id: channel.id }, data: { accessToken: newToken, tokenExpiry: newExpiry } })
        results.push({ channelId: channel.id, platform: channel.platform, refreshed: true })
      } else {
        results.push({ channelId: channel.id, platform: channel.platform, refreshed: false })
      }
    } catch (err) {
      results.push({ channelId: channel.id, platform: channel.platform, refreshed: false, error: err instanceof Error ? err.message : String(err) })
    }
  }

  return NextResponse.json({ processed: channels.length, results })
}
