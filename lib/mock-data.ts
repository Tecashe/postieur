import { Post, Channel, DashboardMetrics, ActivityItem, User, AnalyticsData, PlatformStats, Platform } from './types'

const now = new Date()

export const MOCK_USER: User = {
  id: '1',
  name: 'Sarah Chen',
  email: 'sarah@company.com',
  initials: 'SC',
  workspace: 'Company Pro',
  avatar: undefined,
}

export const MOCK_CHANNELS: Channel[] = [
  {
    id: 'inst-1',
    name: 'Instagram',
    platform: 'instagram',
    handle: '@company.pro',
    followers: 145230,
    isConnected: true,
    lastSyncedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
  },
  {
    id: 'linked-1',
    name: 'LinkedIn',
    platform: 'linkedin',
    handle: 'company-page',
    followers: 89450,
    isConnected: true,
    lastSyncedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
  },
  {
    id: 'x-1',
    name: 'X (Twitter)',
    platform: 'x',
    handle: '@company',
    followers: 234567,
    isConnected: true,
    lastSyncedAt: new Date(now.getTime() - 30 * 60 * 1000),
  },
  {
    id: 'fb-1',
    name: 'Facebook',
    platform: 'facebook',
    handle: 'company.official',
    followers: 567890,
    isConnected: false,
    lastSyncedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
  },
  {
    id: 'tiktok-1',
    name: 'TikTok',
    platform: 'tiktok',
    handle: '@company',
    followers: 456789,
    isConnected: true,
    lastSyncedAt: new Date(now.getTime() - 12 * 60 * 60 * 1000),
  },
  {
    id: 'yt-1',
    name: 'YouTube',
    platform: 'youtube',
    handle: '@company',
    followers: 234560,
    isConnected: true,
    lastSyncedAt: new Date(now.getTime() - 6 * 60 * 60 * 1000),
  },
  {
    id: 'pin-1',
    name: 'Pinterest',
    platform: 'pinterest',
    handle: 'company',
    followers: 178900,
    isConnected: false,
    lastSyncedAt: new Date(now.getTime() - 48 * 60 * 60 * 1000),
  },
  {
    id: 'blue-1',
    name: 'Bluesky',
    platform: 'bluesky',
    handle: '@company.bsky.social',
    followers: 45230,
    isConnected: true,
    lastSyncedAt: new Date(now.getTime() - 4 * 60 * 60 * 1000),
  },
]

const POST_CONTENT = [
  'Excited to announce our new product launch! Transforming how teams collaborate with AI-powered insights.',
  'Behind the scenes: Meet the team that makes innovation happen. #TeamWork #Innovation',
  'Quick tip: Did you know you can save 2 hours per week with our automation? Try it today.',
  'Reading the latest industry report on digital transformation. Key insights for 2024 ahead.',
  'Coffee and code: Building the future one commit at a time.',
  'Celebrating 10 years of innovation with our amazing community. Thank you for being part of this journey!',
  'New feature alert: Real-time collaboration is now live. Start working together instantly.',
  'Grateful for the support from our partners and customers. This milestone is shared success.',
  'Webinar coming soon: AI trends shaping the next decade. Mark your calendars!',
  'Work-life balance matters. Our team is hiring for remote positions across the globe.',
  'Case study: How company X increased productivity by 40% in 3 months. Read the full story on our blog.',
  'Just released our annual report. Dive into the numbers that show our growth trajectory.',
  'Thrilled to partner with leading organizations to bring digital transformation to every industry.',
  'Monthly office hours this Friday: Ask us anything about our platform and roadmap.',
  'Sustainability matters: We&apos;re committed to carbon-neutral operations by 2025.',
  'New integration: Now connecting seamlessly with your favorite tools. Setup in seconds.',
  'Podcast episode live: Founders discuss the future of work and AI collaboration.',
  'User spotlight: How our customers are using our platform to solve real business problems.',
  'Team culture update: We&apos;re expanding to 3 new offices this year. Come join us!',
  'Year-end reflection: 2024 was transformative. Looking forward to 2025 with renewed energy.',
  'Beta testing now open: Be among the first to try our latest features. Apply in our community.',
  'Mentorship program launching: We&apos;re dedicated to supporting the next generation of leaders.',
  'Conference coming up: See us at TechSummit 2024. Schedule a demo at booth 42.',
  'Customer success story: How we helped a Fortune 500 company streamline operations.',
  'API improvements released: Faster, more reliable integrations for our developers.',
  'Hiring announcement: We&apos;re looking for talented engineers, designers, and product managers.',
  'Newsletter spotlight: Check our latest insights on industry trends and best practices.',
  'Demo day recap: Loved connecting with the startup community. Let&apos;s build together!',
  'Performance update: 99.99% uptime maintained across all our services. Reliability matters.',
  'Thank you post: Honored to be recognized as one of the top innovation companies this year.',
]

export const MOCK_POSTS: Post[] = Array.from({ length: 35 }, (_, i) => {
  const scheduledDate = new Date(now.getTime() + (Math.random() * 30 - 15) * 24 * 60 * 60 * 1000)
  const platformSelection = MOCK_CHANNELS.slice(0, Math.floor(Math.random() * 4) + 1).map(c => c.platform)
  
  const statuses: Array<'scheduled' | 'published' | 'draft'> = ['scheduled', 'published', 'draft']
  const status = statuses[Math.floor(Math.random() * statuses.length)]
  
  return {
    id: `post-${i + 1}`,
    content: POST_CONTENT[i % POST_CONTENT.length],
    platforms: platformSelection as Platform[],
    scheduledAt: scheduledDate,
    status: status,
    mediaUrls: i % 3 === 0 ? [`/img/social-${i}.jpg`] : [],
    engagement: status === 'published' ? {
      likes: Math.floor(Math.random() * 5000) + 100,
      comments: Math.floor(Math.random() * 500) + 10,
      shares: Math.floor(Math.random() * 300) + 5,
      impressions: Math.floor(Math.random() * 50000) + 1000,
    } : undefined,
  }
})

export const MOCK_ACTIVITY: ActivityItem[] = [
  {
    id: 'act-1',
    type: 'published',
    content: 'Product launch announcement',
    platform: 'instagram',
    timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000),
    status: 'published',
    engagement: 2345,
  },
  {
    id: 'act-2',
    type: 'scheduled',
    content: 'Team culture post',
    platform: 'linkedin',
    timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000),
    status: 'scheduled',
  },
  {
    id: 'act-3',
    type: 'published',
    content: 'Industry insights thread',
    platform: 'x',
    timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000),
    status: 'published',
    engagement: 1234,
  },
  {
    id: 'act-4',
    type: 'liked',
    content: 'Engagement on company post',
    platform: 'tiktok',
    timestamp: new Date(now.getTime() - 8 * 60 * 60 * 1000),
    engagement: 567,
  },
  {
    id: 'act-5',
    type: 'commented',
    content: 'User feedback on latest feature',
    platform: 'instagram',
    timestamp: new Date(now.getTime() - 12 * 60 * 60 * 1000),
    engagement: 89,
  },
]

export const MOCK_METRICS: DashboardMetrics = {
  totalScheduled: 47,
  reachThisWeek: 234560,
  engagementRate: 4.23,
  queueDepth: 12,
  topPlatform: 'instagram',
}

export const MOCK_ANALYTICS: AnalyticsData[] = [
  { date: 'Mon', reach: 12400, engagement: 2400, clicks: 980 },
  { date: 'Tue', reach: 13210, engagement: 1398, clicks: 1221 },
  { date: 'Wed', reach: 20290, engagement: 9800, clicks: 2290 },
  { date: 'Thu', reach: 22390, engagement: 3908, clicks: 2000 },
  { date: 'Fri', reach: 22090, engagement: 4800, clicks: 2181 },
  { date: 'Sat', reach: 22290, engagement: 3800, clicks: 2500 },
  { date: 'Sun', reach: 25390, engagement: 4300, clicks: 2100 },
]

export const MOCK_PLATFORM_STATS: PlatformStats[] = [
  {
    platform: 'instagram',
    followers: 145230,
    engagementRate: 6.2,
    posts: 12,
    reach: 89000,
  },
  {
    platform: 'linkedin',
    followers: 89450,
    engagementRate: 5.8,
    posts: 8,
    reach: 76500,
  },
  {
    platform: 'x',
    followers: 234567,
    engagementRate: 3.4,
    posts: 15,
    reach: 45000,
  },
  {
    platform: 'tiktok',
    followers: 456789,
    engagementRate: 8.9,
    posts: 10,
    reach: 234000,
  },
  {
    platform: 'youtube',
    followers: 234560,
    engagementRate: 12.1,
    posts: 5,
    reach: 156000,
  },
  {
    platform: 'facebook',
    followers: 567890,
    engagementRate: 2.3,
    posts: 6,
    reach: 32000,
  },
  {
    platform: 'pinterest',
    followers: 178900,
    engagementRate: 4.5,
    posts: 9,
    reach: 54000,
  },
  {
    platform: 'bluesky',
    followers: 45230,
    engagementRate: 7.2,
    posts: 4,
    reach: 12000,
  },
]
