/**
 * Facebook Page publisher
 *
 * API reference (Graph API v19):
 *   POST /{page-id}/feed            — text / link / multi-photo
 *   POST /{page-id}/photos          — single photo
 *   POST /{page-id}/videos          — video
 *
 * Required channel.config:
 *   pageId           — Facebook Page numeric ID
 *   pageAccessToken  — Page-scoped access token (pages_manage_posts scope)
 */

import type { PublisherPost, PublisherChannel, PostChannelConfig, PublishResult } from './types'

const GRAPH = 'https://graph.facebook.com/v19.0'

function isVideo(url: string): boolean {
  return /\.(mp4|mov|webm|avi)$/i.test(url)
}

export async function publishToFacebook(
  post: PublisherPost,
  channel: PublisherChannel,
  _config: PostChannelConfig,
): Promise<PublishResult> {
  try {
    const pageId = channel.config.pageId as string | undefined
    const pageAccessToken =
      (channel.config.pageAccessToken as string | undefined) ?? channel.accessToken

    if (!pageId) {
      return {
        success: false,
        error: 'Facebook Page ID missing. Reconnect the channel.',
        retryable: false,
      }
    }

    const message = post.content
    const mediaUrls = post.mediaUrls

    // ── Video ───────────────────────────────────────────────────────────────
    if (mediaUrls.length > 0 && isVideo(mediaUrls[0])) {
      const body = new URLSearchParams({
        file_url: mediaUrls[0],
        description: message,
        access_token: pageAccessToken,
      })
      const res = await fetch(`${GRAPH}/${pageId}/videos`, { method: 'POST', body })
      if (!res.ok) {
        const err = await res.text()
        return { success: false, error: `Facebook video ${res.status}: ${err}`, retryable: res.status >= 500 }
      }
      const data = (await res.json()) as { id?: string }
      return { success: true, externalId: data.id ?? undefined }
    }

    // ── Multi-photo ─────────────────────────────────────────────────────────
    if (mediaUrls.length > 1) {
      const photoIds: string[] = []
      for (const url of mediaUrls.slice(0, 10)) {
        const body = new URLSearchParams({
          url,
          published: 'false',
          access_token: pageAccessToken,
        })
        const res = await fetch(`${GRAPH}/${pageId}/photos`, { method: 'POST', body })
        if (!res.ok) continue
        const data = (await res.json()) as { id?: string }
        if (data.id) photoIds.push(data.id)
      }

      const feedBody: Record<string, string> = {
        message,
        access_token: pageAccessToken,
      }
      photoIds.forEach((id, i) => {
        feedBody[`attached_media[${i}]`] = JSON.stringify({ media_fbid: id })
      })

      const feedRes = await fetch(`${GRAPH}/${pageId}/feed`, {
        method: 'POST',
        body: new URLSearchParams(feedBody),
      })
      if (!feedRes.ok) {
        const err = await feedRes.text()
        return { success: false, error: `Facebook feed ${feedRes.status}: ${err}`, retryable: feedRes.status >= 500 }
      }
      const feedData = (await feedRes.json()) as { id?: string }
      return { success: true, externalId: feedData.id ?? undefined }
    }

    // ── Single photo ────────────────────────────────────────────────────────
    if (mediaUrls.length === 1) {
      const body = new URLSearchParams({
        url: mediaUrls[0],
        caption: message,
        access_token: pageAccessToken,
      })
      const res = await fetch(`${GRAPH}/${pageId}/photos`, { method: 'POST', body })
      if (!res.ok) {
        const err = await res.text()
        return { success: false, error: `Facebook photo ${res.status}: ${err}`, retryable: res.status >= 500 }
      }
      const data = (await res.json()) as { post_id?: string; id?: string }
      return { success: true, externalId: data.post_id ?? data.id ?? undefined }
    }

    // ── Text-only ────────────────────────────────────────────────────────────
    const body = new URLSearchParams({ message, access_token: pageAccessToken })
    const res = await fetch(`${GRAPH}/${pageId}/feed`, { method: 'POST', body })
    if (!res.ok) {
      const err = await res.text()
      return { success: false, error: `Facebook feed ${res.status}: ${err}`, retryable: res.status >= 500 }
    }
    const data = (await res.json()) as { id?: string }
    return { success: true, externalId: data.id ?? undefined }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unexpected error',
      retryable: true,
    }
  }
}
