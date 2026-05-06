// Shared types for all platform publishers

export interface PublisherPost {
  id: string
  content: string
  type: string // 'POST' | 'THREAD' | 'CAROUSEL' | 'REEL' | 'STORY'
  mediaUrls: string[]
  /** All thread posts (index 0 == post.content). Only set when type === 'THREAD'. */
  threadPosts: string[]
}

export interface PublisherChannel {
  id: string
  platform: string
  accessToken: string
  refreshToken: string | null
  tokenExpiry: Date | null
  handle: string
  displayName: string | null
  /** Platform-specific credentials/IDs stored at OAuth time */
  config: Record<string, unknown>
}

/**
 * Per-post, per-channel configuration (stored in PostChannel.config at compose time).
 * Each platform only reads the fields relevant to it.
 */
export interface PostChannelConfig {
  // X / Twitter
  replySettings?: 'everyone' | 'following' | 'mentionedUsers'
  listId?: string
  communityId?: string
  // LinkedIn
  companyId?: string
  isCarousel?: string
  // Reddit
  subreddit?: string
  flairId?: string
  postType?: 'text' | 'link' | 'image' // 'text' maps to Reddit's 'self' kind
  // YouTube
  playlistId?: string
  categoryId?: string
  privacyStatus?: 'public' | 'unlisted' | 'private'
  // Generic
  [key: string]: unknown
}

export interface PublishResult {
  success: boolean
  /** Native post ID on the platform */
  externalId?: string
  /** Direct URL to the published post */
  url?: string
  /** Human-readable error message when success === false */
  error?: string
  /** Whether it's safe to retry on the same schedule tick */
  retryable?: boolean
}
