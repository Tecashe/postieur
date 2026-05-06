/**
 * LinkedIn publisher
 *
 * API reference (UGC Posts v2):
 *   POST https://api.linkedin.com/v2/ugcPosts
 *   POST https://api.linkedin.com/v2/assets?action=registerUpload  (media)
 *
 * Required scopes: openid profile email w_member_social
 * Required channel.config:  personUrn  (urn:li:person:{sub}) — stored at OAuth time
 * Optional PostChannelConfig: companyId → posts as organization page
 */

import type { PublisherPost, PublisherChannel, PostChannelConfig, PublishResult } from './types'

const API_BASE = 'https://api.linkedin.com/v2'

// ── Helpers ─────────────────────────────────────────────────────────────────

async function getPersonUrn(accessToken: string): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE}/userinfo`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!res.ok) return null
    const data = (await res.json()) as { sub?: string }
    return data.sub ? `urn:li:person:${data.sub}` : null
  } catch {
    return null
  }
}

async function registerMediaUpload(
  accessToken: string,
  authorUrn: string,
): Promise<{ uploadUrl: string; asset: string } | null> {
  try {
    const res = await fetch(`${API_BASE}/assets?action=registerUpload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify({
        registerUploadRequest: {
          recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
          owner: authorUrn,
          serviceRelationships: [
            {
              relationshipType: 'OWNER',
              identifier: 'urn:li:userGeneratedContent',
            },
          ],
        },
      }),
    })
    if (!res.ok) return null
    const data = (await res.json()) as {
      value?: {
        uploadMechanism?: {
          'com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'?: { uploadUrl?: string }
        }
        asset?: string
      }
    }
    const uploadUrl =
      data.value?.uploadMechanism?.[
        'com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'
      ]?.uploadUrl
    const asset = data.value?.asset
    return uploadUrl && asset ? { uploadUrl, asset } : null
  } catch {
    return null
  }
}

async function uploadLinkedInImage(
  accessToken: string,
  authorUrn: string,
  mediaUrl: string,
): Promise<string | null> {
  const reg = await registerMediaUpload(accessToken, authorUrn)
  if (!reg) return null

  try {
    const mediaRes = await fetch(mediaUrl)
    if (!mediaRes.ok) return null
    const buffer = await mediaRes.arrayBuffer()

    const uploadRes = await fetch(reg.uploadUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        // LinkedIn requires no Content-Type header on the PUT
      },
      body: buffer,
    })
    return uploadRes.ok ? reg.asset : null
  } catch {
    return null
  }
}

// ── Main publisher ───────────────────────────────────────────────────────────

export async function publishToLinkedIn(
  post: PublisherPost,
  channel: PublisherChannel,
  config: PostChannelConfig,
): Promise<PublishResult> {
  try {
    const { accessToken } = channel

    // Determine author URN
    let authorUrn: string
    if (config.companyId) {
      authorUrn = `urn:li:organization:${config.companyId}`
    } else {
      const stored = channel.config.personUrn as string | undefined
      if (stored) {
        authorUrn = stored
      } else {
        const urn = await getPersonUrn(accessToken)
        if (!urn) {
          return {
            success: false,
            error: 'Could not resolve LinkedIn person URN. Reconnect the channel.',
            retryable: false,
          }
        }
        authorUrn = urn
      }
    }

    // Upload images (max 9 on LinkedIn)
    const uploadedAssets: string[] = []
    for (const url of post.mediaUrls.slice(0, 9)) {
      // Skip videos for now (video upload on LinkedIn is a different, async flow)
      if (/\.(mp4|mov|webm|avi)$/i.test(url)) continue
      const asset = await uploadLinkedInImage(accessToken, authorUrn, url)
      if (asset) uploadedAssets.push(asset)
    }

    let shareMediaCategory: 'NONE' | 'IMAGE' | 'ARTICLE' = 'NONE'
    const media: Array<{
      status: string
      description: { text: string }
      media: string
      title: { text: string }
    }> = []

    if (uploadedAssets.length > 0) {
      shareMediaCategory = 'IMAGE'
      uploadedAssets.forEach((asset, i) =>
        media.push({
          status: 'READY',
          description: { text: '' },
          media: asset,
          title: { text: `Image ${i + 1}` },
        }),
      )
    }

    // For THREAD type, join all parts into one long post (LinkedIn has no native threads)
    const body =
      post.type === 'THREAD' && post.threadPosts.length > 1
        ? post.threadPosts.join('\n\n')
        : post.content

    const ugcPost = {
      author: authorUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text: body },
          shareMediaCategory,
          ...(media.length > 0 && { media }),
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    }

    const res = await fetch(`${API_BASE}/ugcPosts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify(ugcPost),
    })

    if (!res.ok) {
      const errText = await res.text()
      return {
        success: false,
        error: `LinkedIn API ${res.status}: ${errText}`,
        retryable: res.status >= 500,
      }
    }

    // LinkedIn returns the post ID in the X-RestLi-Id response header
    const postId = res.headers.get('x-restli-id') ?? (await res.json() as { id?: string }).id
    return {
      success: true,
      externalId: postId ?? undefined,
      url: postId ? `https://www.linkedin.com/feed/update/${postId}` : undefined,
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unexpected error',
      retryable: true,
    }
  }
}
