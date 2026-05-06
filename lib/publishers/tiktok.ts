/**
 * TikTok publisher
 *
 * API reference:
 *   POST https://open.tiktokapis.com/v2/post/publish/video/init/
 *   POST https://open.tiktokapis.com/v2/post/publish/inbox/video/init/
 *
 * Required scopes: video.publish video.upload user.info.basic
 *
 * Flow:
 *   1. Init upload → get upload_url + publish_id
 *   2. PUT video bytes to upload_url
 *   3. Poll /v2/post/publish/status/fetch/ until PUBLISH_COMPLETE
 */

import type { PublisherPost, PublisherChannel, PostChannelConfig, PublishResult } from './types'

interface TikTokInitResponse {
  data?: {
    publish_id: string
    upload_url: string
  }
  error?: { code: string; message: string }
}

interface TikTokStatusResponse {
  data?: {
    status: 'PROCESSING_DOWNLOAD' | 'PROCESSING_UPLOAD' | 'SENDING_TO_USER_INBOX' | 'FAILED' | 'PUBLISH_COMPLETE'
    publicaly_available_post_id?: string[]
    fail_reason?: string
  }
  error?: { code: string; message: string }
}

export async function publishToTikTok(
  post: PublisherPost,
  channel: PublisherChannel,
  _channelConfig: PostChannelConfig,
): Promise<PublishResult> {
  const token = channel.accessToken
  const caption = post.platformContents?.['tiktok'] ?? post.content

  // TikTok requires a video URL for video posts.
  const videoUrl = post.mediaUrls.find(u =>
    u.includes('mp4') || u.includes('mov') || u.includes('video')
  )

  if (!videoUrl) {
    // TikTok doesn't support text-only posts — return a clear error
    return {
      success: false,
      error: 'TikTok requires a video. Please attach an mp4 or mov file.',
      retryable: false,
    }
  }

  try {
    // ── Step 1: Init video upload ─────────────────────────────────────────
    const initRes = await fetch('https://open.tiktokapis.com/v2/post/publish/video/init/', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify({
        post_info: {
          title: caption.slice(0, 2200),
          privacy_level: 'SELF_ONLY', // safe default — user can change in TikTok
          disable_duet: false,
          disable_comment: false,
          disable_stitch: false,
        },
        source_info: {
          source: 'PULL_FROM_URL',
          video_url: videoUrl,
        },
      }),
    })

    const initData: TikTokInitResponse = await initRes.json()

    if (!initRes.ok || initData.error || !initData.data?.publish_id) {
      return {
        success: false,
        error: initData.error?.message ?? `TikTok init failed (${initRes.status})`,
        retryable: initRes.status >= 500,
      }
    }

    const publishId = initData.data.publish_id

    // ── Step 2: Poll status (max 30s) ─────────────────────────────────────
    for (let i = 0; i < 10; i++) {
      await new Promise(r => setTimeout(r, 3000))

      const statusRes = await fetch('https://open.tiktokapis.com/v2/post/publish/status/fetch/', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify({ publish_id: publishId }),
      })

      const statusData: TikTokStatusResponse = await statusRes.json()
      const status = statusData.data?.status

      if (status === 'PUBLISH_COMPLETE') {
        const externalId = statusData.data?.publicaly_available_post_id?.[0] ?? publishId
        return { success: true, externalId }
      }

      if (status === 'FAILED') {
        return {
          success: false,
          error: statusData.data?.fail_reason ?? 'TikTok publish failed',
          retryable: false,
        }
      }
    }

    // Still processing after 30s — treat as success (TikTok will continue processing)
    return { success: true, externalId: publishId }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'TikTok publish error',
      retryable: true,
    }
  }
}
