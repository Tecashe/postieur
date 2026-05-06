/**
 * Twitter / X publisher
 *
 * API reference:
 *   POST https://api.twitter.com/2/tweets (OAuth 2.0 PKCE Bearer token)
 *   POST https://upload.twitter.com/1.1/media/upload.json (v1.1 media upload — same Bearer token)
 *
 * Required scopes: tweet.read tweet.write users.read offline.access
 */

import type { PublisherPost, PublisherChannel, PostChannelConfig, PublishResult } from './types'

interface TweetResponse {
  data?: { id: string; text: string }
  errors?: Array<{ message: string; code: number }>
}

interface MediaUploadResponse {
  media_id_string: string
}

// ── Media upload ────────────────────────────────────────────────────────────

async function uploadMedia(accessToken: string, mediaUrl: string): Promise<string | null> {
  try {
    const mediaRes = await fetch(mediaUrl)
    if (!mediaRes.ok) return null

    const buffer = await mediaRes.arrayBuffer()
    const mimeType = mediaRes.headers.get('content-type') ?? 'image/jpeg'

    // Twitter v1.1 media upload expects multipart/form-data
    const formData = new FormData()
    formData.append('media', new Blob([buffer], { type: mimeType }))

    const uploadRes = await fetch('https://upload.twitter.com/1.1/media/upload.json', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: formData,
    })

    if (!uploadRes.ok) {
      console.error('[x/upload] HTTP', uploadRes.status, await uploadRes.text())
      return null
    }

    const data = (await uploadRes.json()) as MediaUploadResponse
    return data.media_id_string
  } catch (err) {
    console.error('[x/upload] error:', err)
    return null
  }
}

// ── Single tweet ────────────────────────────────────────────────────────────

async function postTweet(
  accessToken: string,
  text: string,
  options?: {
    mediaIds?: string[]
    replyToId?: string
    replySettings?: string
    communityId?: string
  },
): Promise<TweetResponse> {
  const body: Record<string, unknown> = { text }

  if (options?.mediaIds?.length) {
    body.media = { media_ids: options.mediaIds }
  }
  if (options?.replyToId) {
    body.reply = { in_reply_to_tweet_id: options.replyToId }
  }
  if (options?.replySettings && options.replySettings !== 'everyone') {
    // Twitter API values: 'mentionedUsers', 'following', 'subscribers'
    body.reply_settings =
      options.replySettings === 'following' ? 'following' : 'mentionedUsers'
  }
  if (options?.communityId) {
    body.community_id = options.communityId
  }

  const res = await fetch('https://api.twitter.com/2/tweets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  // Parse regardless of status so we can surface API error codes
  const json = (await res.json()) as TweetResponse
  return json
}

// ── Public entry-point ──────────────────────────────────────────────────────

export async function publishToX(
  post: PublisherPost,
  channel: PublisherChannel,
  config: PostChannelConfig,
): Promise<PublishResult> {
  try {
    const { accessToken } = channel

    // Upload up to 4 images / 1 video
    const mediaIds: string[] = []
    for (const url of post.mediaUrls.slice(0, 4)) {
      const id = await uploadMedia(accessToken, url)
      if (id) mediaIds.push(id)
    }

    // Thread: reply-chain from tweet 1 → N
    const threadParts =
      post.type === 'THREAD' && post.threadPosts.length > 1
        ? post.threadPosts
        : [post.content]

    if (threadParts.length > 1) {
      let lastId: string | undefined

      for (let i = 0; i < threadParts.length; i++) {
        const tweet = await postTweet(accessToken, threadParts[i], {
          // Media only on first tweet
          mediaIds: i === 0 && mediaIds.length ? mediaIds : undefined,
          replyToId: lastId,
          replySettings: i === 0 ? config.replySettings : undefined,
          communityId: i === 0 ? (config.communityId as string | undefined) : undefined,
        })

        if (tweet.errors?.length || !tweet.data) {
          const msg = tweet.errors?.[0]?.message ?? 'Tweet failed'
          // If we already posted some tweets, partial success
          return lastId
            ? { success: true, externalId: lastId, error: `Thread incomplete: ${msg}` }
            : { success: false, error: msg, retryable: false }
        }
        lastId = tweet.data.id
      }

      const handle = channel.handle.replace('@', '')
      return {
        success: true,
        externalId: lastId,
        url: `https://twitter.com/${handle}/status/${lastId}`,
      }
    }

    // Single tweet
    const tweet = await postTweet(accessToken, post.content, {
      mediaIds: mediaIds.length ? mediaIds : undefined,
      replySettings: config.replySettings,
      communityId: config.communityId as string | undefined,
    })

    if (tweet.errors?.length || !tweet.data) {
      const msg = tweet.errors?.[0]?.message ?? 'Tweet failed'
      const isDuplicate = msg.toLowerCase().includes('duplicate')
      return { success: false, error: msg, retryable: !isDuplicate }
    }

    const handle = channel.handle.replace('@', '')
    return {
      success: true,
      externalId: tweet.data.id,
      url: `https://twitter.com/${handle}/status/${tweet.data.id}`,
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unexpected error',
      retryable: true,
    }
  }
}
