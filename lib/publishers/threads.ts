/**
 * Threads publisher (Meta / Instagram Threads)
 *
 * API reference (Threads API v1.0):
 *   POST https://graph.threads.net/v1.0/{threads-user-id}/threads         — create container
 *   POST https://graph.threads.net/v1.0/{threads-user-id}/threads_publish — publish
 *
 * Required channel.config: threadsUserId
 * Required scopes: threads_basic, threads_content_publish
 */

import type { PublisherPost, PublisherChannel, PostChannelConfig, PublishResult } from './types'

const THREADS_API = 'https://graph.threads.net/v1.0'

function isVideo(url: string): boolean {
  return /\.(mp4|mov|webm)$/i.test(url)
}

async function createThreadsContainer(
  accessToken: string,
  threadsUserId: string,
  params: Record<string, string>,
): Promise<string | null> {
  const url = new URL(`${THREADS_API}/${threadsUserId}/threads`)
  url.searchParams.set('access_token', accessToken)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))

  const res = await fetch(url.toString(), { method: 'POST' })
  if (!res.ok) {
    console.error('[threads/container]', res.status, await res.text())
    return null
  }
  const data = (await res.json()) as { id?: string }
  return data.id ?? null
}

async function publishThreadsContainer(
  accessToken: string,
  threadsUserId: string,
  containerId: string,
): Promise<string | null> {
  const url = new URL(`${THREADS_API}/${threadsUserId}/threads_publish`)
  url.searchParams.set('access_token', accessToken)
  url.searchParams.set('creation_id', containerId)

  const res = await fetch(url.toString(), { method: 'POST' })
  if (!res.ok) {
    console.error('[threads/publish]', res.status, await res.text())
    return null
  }
  const data = (await res.json()) as { id?: string }
  return data.id ?? null
}

export async function publishToThreads(
  post: PublisherPost,
  channel: PublisherChannel,
  _config: PostChannelConfig,
): Promise<PublishResult> {
  try {
    const threadsUserId = channel.config.threadsUserId as string | undefined
    if (!threadsUserId) {
      return {
        success: false,
        error: 'Threads User ID missing. Reconnect the channel.',
        retryable: false,
      }
    }

    const { accessToken } = channel
    const mediaUrls = post.mediaUrls

    // Determine media type
    let mediaType: 'TEXT' | 'IMAGE' | 'VIDEO' = 'TEXT'
    if (mediaUrls.length > 0) {
      mediaType = isVideo(mediaUrls[0]) ? 'VIDEO' : 'IMAGE'
    }

    const params: Record<string, string> = {
      media_type: mediaType,
      text: post.content,
    }

    if (mediaType === 'IMAGE' && mediaUrls[0]) {
      params.image_url = mediaUrls[0]
    } else if (mediaType === 'VIDEO' && mediaUrls[0]) {
      params.video_url = mediaUrls[0]
    }

    const containerId = await createThreadsContainer(accessToken, threadsUserId, params)
    if (!containerId) {
      return { success: false, error: 'Failed to create Threads container.', retryable: true }
    }

    // Threads video processing can take time — poll for FINISHED (up to 60 s)
    if (mediaType === 'VIDEO') {
      const deadline = Date.now() + 60_000
      let ready = false
      while (Date.now() < deadline) {
        await new Promise((r) => setTimeout(r, 5_000))
        try {
          const statusUrl = new URL(`${THREADS_API}/${containerId}`)
          statusUrl.searchParams.set('fields', 'status,error_message')
          statusUrl.searchParams.set('access_token', accessToken)
          const statusRes = await fetch(statusUrl.toString())
          if (statusRes.ok) {
            const statusData = (await statusRes.json()) as { status?: string; error_message?: string }
            if (statusData.status === 'FINISHED') { ready = true; break }
            if (statusData.status === 'ERROR') {
              return { success: false, error: `Threads video error: ${statusData.error_message ?? 'unknown'}`, retryable: false }
            }
          }
        } catch {
          // continue polling
        }
      }
      if (!ready) {
        return { success: false, error: 'Threads video processing timed out.', retryable: true }
      }
    }

    const postId = await publishThreadsContainer(accessToken, threadsUserId, containerId)
    if (!postId) {
      return { success: false, error: 'Failed to publish Threads post.', retryable: true }
    }

    const handle = channel.handle.replace('@', '')
    return {
      success: true,
      externalId: postId,
      url: `https://www.threads.net/@${handle}/post/${postId}`,
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unexpected error',
      retryable: true,
    }
  }
}
