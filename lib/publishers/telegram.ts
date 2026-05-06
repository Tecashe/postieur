/**
 * Telegram publisher (Bot API)
 *
 * API reference:
 *   POST https://api.telegram.org/bot{token}/sendMessage
 *   POST https://api.telegram.org/bot{token}/sendPhoto
 *   POST https://api.telegram.org/bot{token}/sendVideo
 *   POST https://api.telegram.org/bot{token}/sendMediaGroup
 *
 * Required channel.accessToken — Telegram bot token
 * Required channel.config.chatId — target channel/group/user chat ID (e.g. "@mychannel" or "-1001234567890")
 */

import type { PublisherPost, PublisherChannel, PostChannelConfig, PublishResult } from './types'

function isVideo(url: string): boolean {
  return /\.(mp4|mov|webm|avi)$/i.test(url)
}

function tgUrl(token: string, method: string): string {
  return `https://api.telegram.org/bot${token}/${method}`
}

type TgResult = { ok: boolean; result?: { message_id?: number }; description?: string }

async function tgPost(url: string, body: Record<string, unknown>): Promise<TgResult> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return res.json() as Promise<TgResult>
}

export async function publishToTelegram(
  post: PublisherPost,
  channel: PublisherChannel,
  _config: PostChannelConfig,
): Promise<PublishResult> {
  try {
    const token = channel.accessToken
    const chatId = channel.config.chatId as string | undefined

    if (!chatId) {
      return {
        success: false,
        error: 'Telegram chat ID missing. Reconnect the channel.',
        retryable: false,
      }
    }

    const mediaUrls = post.mediaUrls

    // ── Multi-media group (2–10 items) ───────────────────────────────────────
    if (mediaUrls.length > 1) {
      const media = mediaUrls.slice(0, 10).map((url, i) => ({
        type: isVideo(url) ? 'video' : 'photo',
        media: url,
        ...(i === 0 && { caption: post.content, parse_mode: 'HTML' }),
      }))

      const data = await tgPost(tgUrl(token, 'sendMediaGroup'), { chat_id: chatId, media })
      if (!data.ok) {
        return { success: false, error: `Telegram sendMediaGroup: ${data.description ?? 'error'}`, retryable: true }
      }
      return { success: true }
    }

    // ── Single video ─────────────────────────────────────────────────────────
    if (mediaUrls.length === 1 && isVideo(mediaUrls[0])) {
      const data = await tgPost(tgUrl(token, 'sendVideo'), {
        chat_id: chatId,
        video: mediaUrls[0],
        caption: post.content,
        parse_mode: 'HTML',
        supports_streaming: true,
      })
      if (!data.ok) {
        return { success: false, error: `Telegram sendVideo: ${data.description ?? 'error'}`, retryable: true }
      }
      return { success: true, externalId: String(data.result?.message_id ?? '') }
    }

    // ── Single photo ─────────────────────────────────────────────────────────
    if (mediaUrls.length === 1) {
      const data = await tgPost(tgUrl(token, 'sendPhoto'), {
        chat_id: chatId,
        photo: mediaUrls[0],
        caption: post.content,
        parse_mode: 'HTML',
      })
      if (!data.ok) {
        return { success: false, error: `Telegram sendPhoto: ${data.description ?? 'error'}`, retryable: true }
      }
      return { success: true, externalId: String(data.result?.message_id ?? '') }
    }

    // ── Text-only ────────────────────────────────────────────────────────────
    const data = await tgPost(tgUrl(token, 'sendMessage'), {
      chat_id: chatId,
      text: post.content,
      parse_mode: 'HTML',
      disable_web_page_preview: false,
    })
    if (!data.ok) {
      return { success: false, error: `Telegram sendMessage: ${data.description ?? 'error'}`, retryable: true }
    }
    return { success: true, externalId: String(data.result?.message_id ?? '') }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unexpected error',
      retryable: true,
    }
  }
}
