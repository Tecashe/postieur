import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function verifyCron(req: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return true
  return req.headers.get('authorization') === `Bearer ${secret}`
}

export async function GET(req: Request) {
  if (!verifyCron(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Find channels whose tokens expire in the next hour (or have already expired)
  const soon = new Date(Date.now() + 60 * 60_000)
  const channels = await prisma.channel.findMany({
    where: { refreshToken: { not: null }, tokenExpiry: { lte: soon } },
  })

  const results: { channelId: string; platform: string; refreshed: boolean; error?: string }[] = []

  for (const channel of channels) {
    try {
      let newToken: string | null = null
      let newRefreshToken: string | undefined
      let newExpiry: Date | null = null

      switch (channel.platform) {
        // ── Twitter / X ────────────────────────────────────────────────────
        case 'x':
          if (channel.refreshToken) {
            const credentials = Buffer.from(`${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`).toString('base64')
            const res = await fetch('https://api.twitter.com/2/oauth2/token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded', Authorization: `Basic ${credentials}` },
              body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: channel.refreshToken }),
            })
            if (res.ok) {
              const data = await res.json() as { access_token: string; refresh_token?: string; expires_in?: number }
              newToken = data.access_token
              newRefreshToken = data.refresh_token
              newExpiry = data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : null
            }
          }
          break

        // ── LinkedIn ───────────────────────────────────────────────────────
        case 'linkedin':
          if (channel.refreshToken) {
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
              const data = await res.json() as { access_token: string; expires_in?: number; refresh_token?: string }
              newToken = data.access_token
              newRefreshToken = data.refresh_token
              newExpiry = data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : null
            }
          }
          break

        // ── Google / YouTube ───────────────────────────────────────────────
        case 'youtube':
          if (channel.refreshToken) {
            const res = await fetch('https://oauth2.googleapis.com/token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: channel.refreshToken,
                client_id: process.env.YOUTUBE_CLIENT_ID ?? '',
                client_secret: process.env.YOUTUBE_CLIENT_SECRET ?? '',
              }),
            })
            if (res.ok) {
              const data = await res.json() as { access_token: string; expires_in?: number }
              newToken = data.access_token
              // Google does NOT issue a new refresh token on every refresh
              newExpiry = data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : null
            }
          }
          break

        // ── Reddit ─────────────────────────────────────────────────────────
        case 'reddit':
          if (channel.refreshToken) {
            const credentials = Buffer.from(`${process.env.REDDIT_CLIENT_ID}:${process.env.REDDIT_CLIENT_SECRET}`).toString('base64')
            const res = await fetch('https://www.reddit.com/api/v1/access_token', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Basic ${credentials}`,
                'User-Agent': 'Postiz/1.0',
              },
              body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: channel.refreshToken }),
            })
            if (res.ok) {
              const data = await res.json() as { access_token: string; expires_in?: number }
              newToken = data.access_token
              newExpiry = data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : null
            }
          }
          break

        // ── Facebook / Instagram (long-lived token exchange: 60-day rolling) ──
        case 'facebook':
        case 'instagram': {
          // Facebook long-lived tokens are refreshed by re-exchanging for another long-lived token
          if (channel.accessToken) {
            const res = await fetch(
              `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${encodeURIComponent(process.env.META_APP_ID ?? '')}&client_secret=${encodeURIComponent(process.env.META_APP_SECRET ?? '')}&fb_exchange_token=${encodeURIComponent(channel.accessToken)}`,
            )
            if (res.ok) {
              const data = await res.json() as { access_token: string; expires_in?: number }
              newToken = data.access_token
              newExpiry = data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : new Date(Date.now() + 60 * 24 * 60 * 60_000)
            }
          }
          break
        }

        // ── Discord (short-lived 7-day tokens) ────────────────────────────
        case 'discord':
          if (channel.refreshToken) {
            const body = new URLSearchParams({
              grant_type: 'refresh_token',
              refresh_token: channel.refreshToken,
              client_id: process.env.DISCORD_CLIENT_ID ?? '',
              client_secret: process.env.DISCORD_CLIENT_SECRET ?? '',
            })
            const res = await fetch('https://discord.com/api/oauth2/token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body,
            })
            if (res.ok) {
              const data = await res.json() as { access_token: string; refresh_token?: string; expires_in?: number }
              newToken = data.access_token
              newRefreshToken = data.refresh_token
              newExpiry = data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : null
            }
          }
          break

        // ── Threads (exchange for long-lived 60-day token) ────────────────
        case 'threads':
          if (channel.accessToken) {
            const res = await fetch(
              `https://graph.threads.net/refresh_access_token?grant_type=th_refresh_token&access_token=${encodeURIComponent(channel.accessToken)}`,
            )
            if (res.ok) {
              const data = await res.json() as { access_token: string; expires_in?: number }
              newToken = data.access_token
              newExpiry = data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : null
            }
          }
          break

        // ── Bluesky (AT Protocol session refresh) ─────────────────────────
        case 'bluesky': {
          if (channel.refreshToken) {
            const pdsUrl = ((channel.config as Record<string, unknown>)?.pdsUrl as string | undefined) ?? 'https://bsky.social'
            const res = await fetch(`${pdsUrl}/xrpc/com.atproto.server.refreshSession`, {
              method: 'POST',
              headers: { Authorization: `Bearer ${channel.refreshToken}` },
            })
            if (res.ok) {
              const data = await res.json() as { accessJwt: string; refreshJwt?: string }
              newToken = data.accessJwt
              newRefreshToken = data.refreshJwt
              newExpiry = new Date(Date.now() + 2 * 60 * 60_000) // ~2 hours
            }
          }
          break
        }

        default:
          // Platform doesn't support token refresh (e.g. Telegram bot tokens never expire)
          continue
      }

      if (newToken) {
        await prisma.channel.update({
          where: { id: channel.id },
          data: {
            accessToken: newToken,
            tokenExpiry: newExpiry,
            ...(newRefreshToken ? { refreshToken: newRefreshToken } : {}),
          },
        })
        results.push({ channelId: channel.id, platform: channel.platform, refreshed: true })
      } else {
        // Refresh failed — mark channel as inactive so users know to reconnect
        await prisma.channel.update({ where: { id: channel.id }, data: { isActive: false } })
        results.push({ channelId: channel.id, platform: channel.platform, refreshed: false, error: 'Refresh failed — channel marked inactive' })
      }
    } catch (err) {
      results.push({ channelId: channel.id, platform: channel.platform, refreshed: false, error: err instanceof Error ? err.message : String(err) })
    }
  }

  return NextResponse.json({ processed: channels.length, results })
}

