// ─── Platform Types ────────────────────────────────────────────────────────
export type Platform =
  | 'instagram' | 'linkedin' | 'x' | 'facebook' | 'tiktok' | 'youtube'
  | 'pinterest' | 'bluesky' | 'discord' | 'reddit' | 'threads' | 'mastodon'
  | 'telegram' | 'slack' | 'medium' | 'devto' | 'hashnode' | 'wordpress'
  | 'dribbble' | 'warpcast' | 'vk' | 'nostr' | 'twitch' | 'snapchat'

export type PostStatus = 'scheduled' | 'published' | 'pending' | 'draft' | 'failed'
export type PostType = 'post' | 'thread' | 'carousel' | 'reel' | 'story' | 'article'

// ─── Core Entities ─────────────────────────────────────────────────────────

export interface PostEngagement {
  likes: number
  comments: number
  shares: number
  impressions: number
  clicks?: number
  saves?: number
  reach?: number
}

export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom'
  interval: number
  endDate?: Date
  endAfterCount?: number
}

export interface Post {
  id: string
  content: string
  platforms: Platform[]
  scheduledAt: Date
  status: PostStatus
  type?: PostType
  mediaUrls: string[]
  threadPosts?: string[]
  labels?: string[]
  campaignId?: string
  signatureId?: string
  crossPostDelay?: number
  isRecurring?: boolean
  recurrenceRule?: RecurrenceRule
  engagement?: PostEngagement
  workspace?: string
}

export interface Channel {
  id: string
  name: string
  platform: Platform
  handle: string
  followers: number
  isConnected: boolean
  lastSyncedAt: Date
  live?: boolean
  health?: 'healthy' | 'good' | 'warning' | 'error'
  customerGroup?: string
  postsThisMonth?: number
  avatar?: string
  tokenExpiresAt?: Date
}

export interface CustomerGroup {
  id: string
  name: string
  color: string
  channelIds: string[]
  description?: string
}

// ─── Analytics ─────────────────────────────────────────────────────────────

export interface DashboardMetrics {
  totalScheduled: number
  reachThisWeek: number
  engagementRate: number
  queueDepth: number
  topPlatform?: Platform
  totalFollowers?: number
  postsPublishedThisWeek?: number
}

export interface ActivityItem {
  id: string
  type: 'published' | 'scheduled' | 'liked' | 'commented' | 'shared' | 'failed'
  content: string
  platform: Platform
  timestamp: Date
  status?: PostStatus
  engagement?: number
}

export interface AnalyticsData {
  date: string
  reach: number
  engagement: number
  clicks: number
  impressions?: number
  saves?: number
}

export interface PlatformStats {
  platform: Platform
  followers: number
  engagementRate: number
  engagement?: number
  posts: number
  reach: number
  impressions?: number
  followerGrowth?: number
}

export interface EngagementHeatmapCell {
  day: number       // 0-6 (Mon-Sun)
  dayOfWeek?: number // alias for day
  hour: number      // 0-23
  value: number     // 0-100 normalized
}

export interface BestTimeSlot {
  platform: Platform
  day: string
  hour: number
  score: number
  label: string
}

// ─── Team & Users ──────────────────────────────────────────────────────────

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  initials: string
  workspace: string
  role?: 'admin' | 'editor' | 'viewer'
  lastActive?: Date
}

// ─── Campaigns ─────────────────────────────────────────────────────────────

export interface Campaign {
  id: string
  name: string
  description: string
  goal: 'awareness' | 'engagement' | 'traffic' | 'conversion'
  status: 'draft' | 'active' | 'completed' | 'paused'
  startDate: Date
  endDate: Date
  platforms: Platform[]
  postCount: number
  publishedCount?: number
  color: string
  totalReach?: number
  totalEngagement?: number
  totalClicks?: number
  impressions?: number
  engagement?: number
}

// ─── Inbox ─────────────────────────────────────────────────────────────────

export interface InboxMessage {
  id: string
  type: 'comment' | 'mention' | 'dm' | 'reply'
  platform: Platform
  author: { name: string; handle: string; avatarInitials: string }
  authorName?: string  // alias for author.name
  content: string
  postContent?: string
  timestamp: Date
  createdAt?: Date  // alias for timestamp
  isRead: boolean
  isResolved: boolean
  sentiment: 'positive' | 'negative' | 'neutral'
  assignedTo?: string
}

// ─── Automation ────────────────────────────────────────────────────────────

export interface Plug {
  id: string
  name: string
  description?: string
  type: 'internal' | 'global'
  triggerEvent: 'post_reaches_likes' | 'post_published' | 'follower_milestone' | 'comment_received' | 'post_failed'
  trigger?: string  // display string
  triggerValue?: number
  triggerPlatform?: Platform
  actionType: 'auto_comment' | 'auto_like' | 'send_notification' | 'create_post' | 'post_to_channel'
  actionContent?: string
  isActive: boolean
  enabled?: boolean  // alias for isActive
  createdAt: Date
  lastTriggered?: Date
  triggerCount: number
  runCount?: number  // alias for triggerCount
}

export interface RSSFeed {
  id: string
  name: string
  url: string
  targetPlatforms: Platform[]
  autoPublishPlatforms?: Platform[]  // alias for targetPlatforms
  frequency: 'realtime' | 'hourly' | 'daily' | 'weekly'
  checkInterval?: string  // human-readable interval
  autoPublish: boolean
  lastFetched?: Date
  articleCount: number
  postsCreated?: number  // alias for articleCount
  isActive: boolean
  enabled?: boolean  // alias for isActive
  lastError?: string
  templateId?: string
}

export type WebhookEvent =
  | 'post.published' | 'post.failed' | 'post.scheduled' | 'post.deleted'
  | 'channel.connected' | 'channel.disconnected'
  | 'member.invited' | 'analytics.weekly_report'

export interface Webhook {
  id: string
  name: string
  url: string
  events: WebhookEvent[]
  isActive: boolean
  status?: 'active' | 'inactive' | 'error'
  createdAt: Date
  lastTriggered?: Date
  lastTriggeredAt?: Date  // alias for lastTriggered
  successCount: number
  failureCount: number
  secretMasked: string
}

export type APIScope =
  | 'posts:read' | 'posts:write'
  | 'channels:read' | 'channels:write'
  | 'analytics:read'
  | 'media:read' | 'media:write'
  | 'members:read' | 'members:write'

export interface APIKey {
  id: string
  name: string
  prefix: string
  key?: string  // masked display version
  scopes: APIScope[]
  createdAt: Date
  lastUsed?: Date
  lastUsedAt?: Date  // alias for lastUsed
  expiresAt?: Date
  status?: 'active' | 'inactive' | 'expired'
  isActive: boolean
}

// ─── Media Library ─────────────────────────────────────────────────────────

export interface MediaItem {
  id: string
  name: string
  type: 'image' | 'video' | 'gif'
  size: number
  width?: number
  height?: number
  duration?: number
  tags: string[]
  folder: string
  uploadedAt: Date
  usedInPosts: number
  altText?: string
}

// ─── Content Organization ──────────────────────────────────────────────────

export interface Signature {
  id: string
  name: string
  content: string
  platforms: Platform[]
  isDefault: boolean
}

export interface QueueSlot {
  id: string
  dayOfWeek: number
  day?: string      // human-readable day
  hour: number
  minute: number
  time?: string     // formatted 'HH:MM'
  isActive: boolean
  platforms?: Platform[]
}

// ─── Link in Bio ───────────────────────────────────────────────────────────

export interface LinkInBioLink {
  id: string
  title: string
  url: string
  clicks?: number
  isVisible?: boolean
  isActive?: boolean
  order?: number
  platform?: string
}

export interface LinkInBioPage {
  id: string
  username: string
  title?: string
  slug?: string
  bio: string
  theme: 'vellum' | 'midnight' | 'bronze' | 'forest' | 'custom'
  buttonStyle: 'rounded' | 'sharp' | 'pill'
  links: LinkInBioLink[]
  totalClicks: number
  views: number
  pageViews?: number
}
