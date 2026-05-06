/**
 * Instagram Business publisher
 *
 * API reference (Graph API v19):
 *   POST /{ig-user-id}/media          — create media container
 *   POST /{ig-user-id}/media_publish  — publish container
 *
 * Required channel.config:
 *   igUserId        — Instagram Business Account numeric ID
 *   pageAccessToken — Facebook Page access token with instagram_basic + instagram_content_publish
 */

import type { PublisherPost, PublisherChannel, PostChannelConfig, PublishResult } from './types'

const GRAPH = 'https://graph.facebook.com/v19.0'

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Poll container status until FINISHED or timeout (max 90 s). */
async function waitForContainer(
  accessToken: string,
  containerId: string,
): Promise<boolean> {
  const deadline = Date.now() + 90_000
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 5_000))
    try {
      const res = await fetch(
        `${GRAPH}/${containerId}?fields=status_code&access_token=${encodeURIComponent(accessToken)}`,
      )
      if (!res.ok) continue
      const data = (await res.json()) as { status_code?: string }
      if (data.status_code === 'FINISHED') return true
      if (data.status_code === 'ERROR') return false
    } catch {
      // continue polling
    }
  }
  return false
}

async function createContainer(
  accessToken: string,
  igUserId: string,
  params: Record<string, string>,
): Promise<string | null> {
  const body = new URLSearchParams({ ...params, access_token: accessToken })
  const res = await fetch(`${GRAPH}/${igUserId}/media`, {
    method: 'POST',
    body,
  })
  if (!res.ok) {
    console.error('[instagram/container]', res.status, await res.text())
    return null
  }
  const data = (await res.json()) as { id?: string }
  return data.id ?? null
}

async function publishContainer(
  accessToken: string,
  igUserId: string,
  containerId: string,
): Promise<string | null> {
  const body = new URLSearchParams({
    creation_id: containerId,
    access_token: accessToken,
  })
  const res = await fetch(`${GRAPH}/${igUserId}/media_publish`, {
    method: 'POST',
    body,
  })
  if (!res.ok) {
    console.error('[instagram/publish]', res.status, await res.text())
    return null
  }
  const data = (await res.json()) as { id?: string }
  return data.id ?? null
}

// ── Main publisher ───────────────────────────────────────────────────────────

export async function publishToInstagram(
  post: PublisherPost,
  channel: PublisherChannel,
  _config: PostChannelConfig,
): Promise<PublishResult> {
  try {
    const igUserId = channel.config.igUserId as string | undefined
    const pageAccessToken =
      (channel.config.pageAccessToken as string | undefined) ?? channel.accessToken

    if (!igUserId) {
      return {
        success: false,
        error: 'Instagram Business Account ID missing. Reconnect the channel.',
        retryable: false,
      }
    }

    const caption = post.content
    const mediaUrls = post.mediaUrls

    // Instagram requires at least one image or video
    if (mediaUrls.length === 0) {
      return {
        success: false,
        error: 'Instagram requires at least one image or video.',
        retryable: false,
      }
    }

    const isVideo = (url: string) => /\.(mp4|mov|webm)$/i.test(url)

    // Carousel (2–10 items)
    if (mediaUrls.length > 1) {
      const childIds: string[] = []

      for (const url of mediaUrls.slice(0, 10)) {
        const params: Record<string, string> = isVideo(url)
          ? { media_type: 'VIDEO', video_url: url, is_carousel_item: 'true' }
          : { image_url: url, is_carousel_item: 'true' }

        const containerId = await createContainer(pageAccessToken, igUserId, params)
        if (!containerId) continue

        if (isVideo(url)) {
          const ok = await waitForContainer(pageAccessToken, containerId)
          if (!ok) continue
        }
        childIds.push(containerId)
      }

      if (childIds.length === 0) {
        return { success: false, error: 'All carousel items failed to process.', retryable: true }
      }

      const carouselId = await createContainer(pageAccessToken, igUserId, {
        media_type: 'CAROUSEL',
        children: childIds.join(','),
        caption,
      })
      if (!carouselId) {
        return { success: false, error: 'Failed to create carousel container.', retryable: true }
      }

      const postId = await publishContainer(pageAccessToken, igUserId, carouselId)
      return postId
        ? { success: true, externalId: postId }
        : { success: false, error: 'Failed to publish carousel.', retryable: true }
    }

    // Single media
    const url = mediaUrls[0]
    const params: Record<string, string> = isVideo(url)
      ? { media_type: 'REELS', video_url: url, caption, share_to_feed: 'true' }
      : { image_url: url, caption }

    const containerId = await createContainer(pageAccessToken, igUserId, params)
    if (!containerId) {
      return { success: false, error: 'Failed to create media container.', retryable: true }
    }

    if (isVideo(url)) {
      const ok = await waitForContainer(pageAccessToken, containerId)
      if (!ok) {
        return { success: false, error: 'Video processing failed or timed out.', retryable: true }
      }
    }

    const postId = await publishContainer(pageAccessToken, igUserId, containerId)
    return postId
      ? { success: true, externalId: postId }
      : { success: false, error: 'Failed to publish media.', retryable: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unexpected error',
      retryable: true,
    }
  }
}
