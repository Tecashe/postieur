/**
 * Bluesky publisher (AT Protocol)
 *
 * API reference:
 *   POST {pdsUrl}/xrpc/com.atproto.repo.createRecord
 *   POST {pdsUrl}/xrpc/com.atproto.repo.uploadBlob
 *
 * Required channel.config:
 *   did     — e.g. did:plc:abc123
 *   pdsUrl  — e.g. https://bsky.social  (default if absent)
 */

import type { PublisherPost, PublisherChannel, PostChannelConfig, PublishResult } from './types'

const DEFAULT_PDS = 'https://bsky.social'
const MAX_CHARS = 300

// ── Facet extraction (URLs) ──────────────────────────────────────────────────

interface Facet {
  index: { byteStart: number; byteEnd: number }
  features: Array<{ $type: string; uri?: string; tag?: string }>
}

function extractFacets(text: string): Facet[] {
  const facets: Facet[] = []
  const encoder = new TextEncoder()

  // URL detection
  const urlRe = /https?:\/\/[^\s)>\]"]+/g
  let match: RegExpExecArray | null
  while ((match = urlRe.exec(text)) !== null) {
    const before = encoder.encode(text.slice(0, match.index))
    const token = encoder.encode(match[0])
    facets.push({
      index: { byteStart: before.length, byteEnd: before.length + token.length },
      features: [{ $type: 'app.bsky.richtext.facet#link', uri: match[0] }],
    })
  }

  // Hashtag detection
  const tagRe = /#(\w+)/g
  while ((match = tagRe.exec(text)) !== null) {
    const before = encoder.encode(text.slice(0, match.index))
    const token = encoder.encode(match[0])
    facets.push({
      index: { byteStart: before.length, byteEnd: before.length + token.length },
      features: [{ $type: 'app.bsky.richtext.facet#tag', tag: match[1] }],
    })
  }

  void 0 // facets complete
  return facets
}

// ── Media upload ─────────────────────────────────────────────────────────────

async function uploadBlob(
  pdsUrl: string,
  accessToken: string,
  mediaUrl: string,
): Promise<{ ref: { $link: string }; mimeType: string; size: number } | null> {
  try {
    const mediaRes = await fetch(mediaUrl)
    if (!mediaRes.ok) return null
    const buffer = await mediaRes.arrayBuffer()
    const mimeType = mediaRes.headers.get('content-type') ?? 'image/jpeg'

    const res = await fetch(`${pdsUrl}/xrpc/com.atproto.repo.uploadBlob`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': mimeType,
      },
      body: buffer,
    })
    if (!res.ok) return null
    const data = (await res.json()) as { blob?: { ref?: { '$link': string }; mimeType?: string; size?: number } }
    if (!data.blob?.ref?.['$link']) return null
    return {
      ref: { $link: data.blob.ref['$link'] },
      mimeType: data.blob.mimeType ?? mimeType,
      size: data.blob.size ?? buffer.byteLength,
    }
  } catch {
    return null
  }
}

// ── Single record creation ────────────────────────────────────────────────────

async function createRecord(
  pdsUrl: string,
  accessToken: string,
  did: string,
  text: string,
  imageBlobs: Array<{ ref: { $link: string }; mimeType: string; size: number }>,
  replyRef?: { root: { cid: string; uri: string }; parent: { cid: string; uri: string } },
): Promise<{ uri: string; cid: string } | null> {
  const record: Record<string, unknown> = {
    $type: 'app.bsky.feed.post',
    text: text.slice(0, MAX_CHARS),
    createdAt: new Date().toISOString(),
  }

  const facets = extractFacets(record.text as string)
  if (facets.length > 0) record.facets = facets

  if (imageBlobs.length > 0) {
    record.embed = {
      $type: 'app.bsky.embed.images',
      images: imageBlobs.slice(0, 4).map((b) => ({
        image: { $type: 'blob', ref: { $link: b.ref.$link }, mimeType: b.mimeType, size: b.size },
        alt: '',
      })),
    }
  }

  if (replyRef) record.reply = replyRef

  const res = await fetch(`${pdsUrl}/xrpc/com.atproto.repo.createRecord`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      repo: did,
      collection: 'app.bsky.feed.post',
      record,
    }),
  })

  if (!res.ok) {
    console.error('[bluesky/createRecord]', res.status, await res.text())
    return null
  }

  return (await res.json()) as { uri: string; cid: string }
}

// ── Main publisher ────────────────────────────────────────────────────────────

export async function publishToBluesky(
  post: PublisherPost,
  channel: PublisherChannel,
  _config: PostChannelConfig,
): Promise<PublishResult> {
  try {
    const did = channel.config.did as string | undefined
    const pdsUrl = (channel.config.pdsUrl as string | undefined) ?? DEFAULT_PDS

    if (!did) {
      return {
        success: false,
        error: 'Bluesky DID missing. Reconnect the channel.',
        retryable: false,
      }
    }

    const { accessToken } = channel

    // Upload images (Bluesky supports up to 4)
  const imageBlobs: Array<{ ref: { $link: string }; mimeType: string; size: number }> = []
    for (const url of post.mediaUrls.slice(0, 4)) {
      if (/\.(mp4|mov|webm)$/i.test(url)) continue // videos not yet supported in embed.images
      const blob = await uploadBlob(pdsUrl, accessToken, url)
      if (blob) imageBlobs.push(blob)
    }

    // Thread support: post parts as a reply chain
    const parts =
      post.type === 'THREAD' && post.threadPosts.length > 1
        ? post.threadPosts
        : [post.content]

    let rootRef: { cid: string; uri: string } | undefined
    let parentRef: { cid: string; uri: string } | undefined
    let lastUri: string | undefined

    for (let i = 0; i < parts.length; i++) {
      const replyRef =
        rootRef && parentRef
          ? { root: { cid: rootRef.cid, uri: rootRef.uri }, parent: { cid: parentRef.cid, uri: parentRef.uri } }
          : undefined

      const result = await createRecord(
        pdsUrl,
        accessToken,
        did,
        parts[i],
        i === 0 ? imageBlobs : [], // images on first post only
        replyRef,
      )

      if (!result) {
        if (i === 0) {
          return { success: false, error: 'Failed to create Bluesky post.', retryable: true }
        }
        // Partial thread — still report success for what was posted
        break
      }

      if (i === 0) rootRef = result
      parentRef = result
      lastUri = result.uri
    }

    if (!lastUri) {
      return { success: false, error: 'Failed to publish to Bluesky.', retryable: true }
    }

    // Construct profile URL from DID handle
    const handle = channel.handle.replace('@', '')
    const atUri = lastUri // at://did:.../app.bsky.feed.post/rkey
    const rkey = atUri.split('/').pop()
    const url = `https://bsky.app/profile/${handle}/post/${rkey}`

    return { success: true, externalId: lastUri, url }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unexpected error',
      retryable: true,
    }
  }
}
