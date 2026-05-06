/**
 * Reddit publisher
 *
 * API reference:
 *   POST https://oauth.reddit.com/api/submit
 *
 * Required scopes: submit
 * Required PostChannelConfig: subreddit (e.g. "nextjs")
 * Optional PostChannelConfig: flairId, postType ('self' | 'link' | 'image')
 */

import type { PublisherPost, PublisherChannel, PostChannelConfig, PublishResult } from './types'

export async function publishToReddit(
  post: PublisherPost,
  channel: PublisherChannel,
  config: PostChannelConfig,
): Promise<PublishResult> {
  try {
    const subreddit = (config.subreddit as string | undefined)?.replace(/^r\//, '')
    if (!subreddit) {
      return {
        success: false,
        error: 'Subreddit not set. Configure it in the post channel settings.',
        retryable: false,
      }
    }

    // Derive title (first line, max 300 chars) and body (remainder)
    const lines = post.content.split('\n')
    const title = lines[0].slice(0, 300)
    const text = lines.slice(1).join('\n').trim()

    // Determine post kind — PostChannelConfig stores 'text' but Reddit API expects 'self'
    const rawType = (config.postType as string | undefined) ?? 'text'
    let kind: 'self' | 'link' | 'image' = rawType === 'text' ? 'self' : rawType === 'link' ? 'link' : rawType === 'image' ? 'image' : 'self'
    if (post.mediaUrls.length > 0 && kind === 'self') kind = 'image'

    const params: Record<string, string> = {
      sr: subreddit,
      kind,
      title,
      resubmit: 'true',
      nsfw: 'false',
      spoiler: 'false',
    }

    if (kind === 'self') {
      params.text = text || post.content
    } else if (kind === 'link' || kind === 'image') {
      params.url = post.mediaUrls[0] ?? text
    }

    if (config.flairId) params.flair_id = config.flairId as string

    const body = new URLSearchParams(params)

    const res = await fetch('https://oauth.reddit.com/api/submit', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${channel.accessToken}`,
        'User-Agent': 'Postiz/1.0 (web app)',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    })

    if (!res.ok) {
      const err = await res.text()
      return { success: false, error: `Reddit ${res.status}: ${err}`, retryable: res.status >= 500 }
    }

    const data = (await res.json()) as {
      json?: {
        errors?: string[][]
        data?: { id?: string; url?: string }
      }
    }

    if (data.json?.errors?.length) {
      const msg = data.json.errors.map((e) => e.join(': ')).join('; ')
      return { success: false, error: msg, retryable: false }
    }

    return {
      success: true,
      externalId: data.json?.data?.id,
      url: data.json?.data?.url,
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unexpected error',
      retryable: true,
    }
  }
}
