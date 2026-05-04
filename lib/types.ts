export type Platform = 'instagram' | 'linkedin' | 'x' | 'facebook' | 'tiktok' | 'youtube' | 'pinterest' | 'bluesky'

export type PostStatus = 'scheduled' | 'published' | 'pending' | 'draft' | 'failed'

export interface Post {
  id: string
  content: string
  platforms: Platform[]
  scheduledAt: Date
  status: PostStatus
  mediaUrls: string[]
  engagement?: {
    likes: number
    comments: number
    shares: number
    impressions: number
  }
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
  icon?: string
}

export interface DashboardMetrics {
  totalScheduled: number
  reachThisWeek: number
  engagementRate: number
  queueDepth: number
  topPlatform?: Platform
}

export interface ActivityItem {
  id: string
  type: 'published' | 'scheduled' | 'liked' | 'commented' | 'shared'
  content: string
  platform: Platform
  timestamp: Date
  status?: PostStatus
  engagement?: number
}

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  initials: string
  workspace: string
}

export interface AnalyticsData {
  date: string
  reach: number
  engagement: number
  clicks: number
}

export interface PlatformStats {
  platform: Platform
  followers: number
  engagementRate: number
  posts: number
  reach: number
}
