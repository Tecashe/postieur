/**
 * Discord publisher (via Incoming Webhook)
 *
 * API reference:
 *   POST {webhookUrl}?wait=true
 *
 * Required channel.config: webhookUrl
 * Scope required at OAuth time: webhook.incoming
 */

import type { PublisherPost, PublisherChannel, PostChannelConfig, PublishResult } from './types'

export async function publishToDiscord(
  post: PublisherPost,
  channel: PublisherChannel,
  _config: PostChannelConfig,
): Promise<PublishResult> {
  try {
    const webhookUrl = channel.config.webhookUrl as string | undefined
    if (!webhookUrl) {
      return {
        success: false,
        error: 'Discord webhook URL missing. Reconnect the channel.',
        retryable: false,
      }
    }

    const embeds: Array<{
      description?: string
      image?: { url: string }
      video?: { url: string }
    }> = []

    if (post.mediaUrls.length > 0) {
      const isVideo = (url: string) => /\.(mp4|mov|webm)$/i.test(url)
      post.mediaUrls.slice(0, 10).forEach((url) => {
        if (isVideo(url)) {
          embeds.push({ video: { url } })
        } else {
          embeds.push({ image: { url } })
        }
      })
    }

    const payload: {
      content: string
      embeds?: typeof embeds
    } = { content: post.content }

    if (embeds.length > 0) payload.embeds = embeds

    const res = await fetch(`${webhookUrl}?wait=true`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const err = await res.text()
      return {
        success: false,
        error: `Discord webhook ${res.status}: ${err}`,
        retryable: res.status >= 500,
      }
    }

    const data = (await res.json()) as { id?: string; channel_id?: string }
    const messageId = data.id
    const channelId = data.channel_id

    // Construct jump URL if both IDs present (guild id not available via webhook response)
    const url =
      messageId && channelId
        ? `https://discord.com/channels/@me/${channelId}/${messageId}`
        : undefined

    return { success: true, externalId: messageId ?? undefined, url }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unexpected error',
      retryable: true,
    }
  }
}
