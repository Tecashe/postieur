/**
 * YouTube publisher
 *
 * API reference (Data API v3):
 *   POST https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable
 *   POST /youtube/v3/playlistItems  (optional)
 *
 * Required: channel.accessToken — Google OAuth2 access token with youtube.upload scope
 * Required: post.mediaUrls[0]   — publicly accessible video URL
 * Optional PostChannelConfig:
 *   privacyStatus  'public' | 'unlisted' | 'private'  (default: 'public')
 *   categoryId     string  (default: '22' = People & Blogs)
 *   playlistId     string  (add video to playlist after upload)
 */

import type { PublisherPost, PublisherChannel, PostChannelConfig, PublishResult } from './types'

export async function publishToYouTube(
  post: PublisherPost,
  channel: PublisherChannel,
  config: PostChannelConfig,
): Promise<PublishResult> {
  try {
    const videoUrl = post.mediaUrls[0]
    if (!videoUrl) {
      return { success: false, error: 'YouTube requires a video file.', retryable: false }
    }

    // Derive title (first line ≤100 chars) and description
    const lines = post.content.split('\n')
    const title = lines[0].slice(0, 100) || 'Untitled'
    const description = post.content.slice(0, 5000)

    const privacyStatus = (config.privacyStatus as string | undefined) ?? 'public'
    const categoryId = (config.categoryId as string | undefined) ?? '22'

    // Fetch the video binary (note: limited to ~100 MB in serverless)
    const mediaRes = await fetch(videoUrl)
    if (!mediaRes.ok) {
      return { success: false, error: 'Failed to fetch video for upload.', retryable: true }
    }
    const videoBuffer = await mediaRes.arrayBuffer()
    const mimeType = mediaRes.headers.get('content-type') ?? 'video/mp4'

    const metadata = {
      snippet: {
        title,
        description,
        categoryId,
        defaultLanguage: 'en',
      },
      status: {
        privacyStatus,
        selfDeclaredMadeForKids: false,
      },
    }

    // Step 1: initiate resumable upload session
    const initRes = await fetch(
      'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${channel.accessToken}`,
          'Content-Type': 'application/json',
          'X-Upload-Content-Type': mimeType,
          'X-Upload-Content-Length': String(videoBuffer.byteLength),
        },
        body: JSON.stringify(metadata),
      },
    )

    if (!initRes.ok) {
      const err = await initRes.text()
      return {
        success: false,
        error: `YouTube session init ${initRes.status}: ${err}`,
        retryable: initRes.status >= 500,
      }
    }

    const uploadUrl = initRes.headers.get('location')
    if (!uploadUrl) {
      return { success: false, error: 'YouTube did not return an upload URL.', retryable: true }
    }

    // Step 2: upload video bytes
    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': mimeType,
        'Content-Length': String(videoBuffer.byteLength),
      },
      body: videoBuffer,
    })

    if (!uploadRes.ok && uploadRes.status !== 200 && uploadRes.status !== 201) {
      const err = await uploadRes.text()
      return {
        success: false,
        error: `YouTube upload ${uploadRes.status}: ${err}`,
        retryable: uploadRes.status >= 500,
      }
    }

    const videoData = (await uploadRes.json()) as { id?: string }
    const videoId = videoData.id

    if (!videoId) {
      return { success: false, error: 'YouTube did not return a video ID.', retryable: false }
    }

    // Step 3 (optional): add to playlist
    const playlistId = config.playlistId as string | undefined
    if (playlistId) {
      await fetch('https://www.googleapis.com/youtube/v3/playlistItems?part=snippet', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${channel.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          snippet: {
            playlistId,
            resourceId: { kind: 'youtube#video', videoId },
          },
        }),
      }).catch(() => {
        // Non-fatal: playlist add failure should not fail the overall publish
      })
    }

    return {
      success: true,
      externalId: videoId,
      url: `https://youtu.be/${videoId}`,
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unexpected error',
      retryable: true,
    }
  }
}
