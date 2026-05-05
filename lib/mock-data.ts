import {
  Post, Channel, DashboardMetrics, ActivityItem, User, AnalyticsData, PlatformStats, Platform,
  Campaign, InboxMessage, Plug, RSSFeed, Webhook, APIKey, Signature, QueueSlot,
  EngagementHeatmapCell, BestTimeSlot, MediaItem, CustomerGroup, LinkInBioPage,
} from './types'

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
  { id: 'inst-1',   name: 'Instagram',    platform: 'instagram', handle: '@company.pro',         followers: 145230, isConnected: true,  lastSyncedAt: new Date(now.getTime() - 2 * 3600000),   live: true,  health: 'healthy', postsThisMonth: 18 },
  { id: 'linked-1', name: 'LinkedIn',     platform: 'linkedin',  handle: 'company-page',         followers: 89450,  isConnected: true,  lastSyncedAt: new Date(now.getTime() - 1 * 3600000),   live: true,  health: 'healthy', postsThisMonth: 12 },
  { id: 'x-1',      name: 'X (Twitter)',  platform: 'x',         handle: '@company',             followers: 234567, isConnected: true,  lastSyncedAt: new Date(now.getTime() - 30 * 60000),    live: false, health: 'warning', postsThisMonth: 24 },
  { id: 'fb-1',     name: 'Facebook',     platform: 'facebook',  handle: 'company.official',     followers: 567890, isConnected: false, lastSyncedAt: new Date(now.getTime() - 24 * 3600000),  live: false, health: 'error',   postsThisMonth: 0 },
  { id: 'tiktok-1', name: 'TikTok',       platform: 'tiktok',    handle: '@company',             followers: 456789, isConnected: true,  lastSyncedAt: new Date(now.getTime() - 12 * 3600000),  live: true,  health: 'healthy', postsThisMonth: 10 },
  { id: 'yt-1',     name: 'YouTube',      platform: 'youtube',   handle: '@company',             followers: 234560, isConnected: true,  lastSyncedAt: new Date(now.getTime() - 6 * 3600000),   live: false, health: 'healthy', postsThisMonth: 5 },
  { id: 'pin-1',    name: 'Pinterest',    platform: 'pinterest', handle: 'company',              followers: 178900, isConnected: false, lastSyncedAt: new Date(now.getTime() - 48 * 3600000),  live: false, health: 'warning', postsThisMonth: 0 },
  { id: 'blue-1',   name: 'Bluesky',      platform: 'bluesky',   handle: '@company.bsky.social', followers: 45230,  isConnected: true,  lastSyncedAt: new Date(now.getTime() - 4 * 3600000),   live: true,  health: 'healthy', postsThisMonth: 8 },
  { id: 'disc-1',   name: 'Discord',      platform: 'discord',   handle: 'Company Community',    followers: 12450,  isConnected: true,  lastSyncedAt: new Date(now.getTime() - 1 * 3600000),   live: true,  health: 'healthy', postsThisMonth: 45 },
  { id: 'reddit-1', name: 'Reddit',       platform: 'reddit',    handle: 'r/company',            followers: 34500,  isConnected: false, lastSyncedAt: new Date(now.getTime() - 72 * 3600000),  live: false, health: 'warning', postsThisMonth: 0 },
  { id: 'thr-1',    name: 'Threads',      platform: 'threads',   handle: '@company',             followers: 28900,  isConnected: true,  lastSyncedAt: new Date(now.getTime() - 3 * 3600000),   live: true,  health: 'healthy', postsThisMonth: 15 },
  { id: 'tg-1',     name: 'Telegram',     platform: 'telegram',  handle: '@company_channel',     followers: 8920,   isConnected: false, lastSyncedAt: new Date(now.getTime() - 96 * 3600000),  live: false, health: 'error',   postsThisMonth: 0 },
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
  { platform: 'instagram', followers: 145230, engagementRate: 6.2,  posts: 12, reach: 89000,  impressions: 234000, followerGrowth: 3.2 },
  { platform: 'linkedin',  followers: 89450,  engagementRate: 5.8,  posts: 8,  reach: 76500,  impressions: 198000, followerGrowth: 2.8 },
  { platform: 'x',         followers: 234567, engagementRate: 3.4,  posts: 15, reach: 45000,  impressions: 312000, followerGrowth: 1.4 },
  { platform: 'tiktok',    followers: 456789, engagementRate: 8.9,  posts: 10, reach: 234000, impressions: 890000, followerGrowth: 5.6 },
  { platform: 'youtube',   followers: 234560, engagementRate: 12.1, posts: 5,  reach: 156000, impressions: 456000, followerGrowth: 4.1 },
  { platform: 'facebook',  followers: 567890, engagementRate: 2.3,  posts: 6,  reach: 32000,  impressions: 145000, followerGrowth: 0.8 },
  { platform: 'pinterest', followers: 178900, engagementRate: 4.5,  posts: 9,  reach: 54000,  impressions: 123000, followerGrowth: 2.1 },
  { platform: 'bluesky',   followers: 45230,  engagementRate: 7.2,  posts: 4,  reach: 12000,  impressions: 34000,  followerGrowth: 8.9 },
]

// ─── Heatmap & Best Times ──────────────────────────────────────────────────

export const MOCK_HEATMAP: EngagementHeatmapCell[] = Array.from({ length: 7 * 24 }, (_, i) => {
  const day = Math.floor(i / 24)
  const hour = i % 24
  // Peak hours: Tue-Thu, 9am-11am and 6pm-8pm
  const isPeakDay = day >= 1 && day <= 4
  const isPeakHour = (hour >= 9 && hour <= 11) || (hour >= 18 && hour <= 20)
  const isWeekend = day === 0 || day === 6
  let value = Math.floor(Math.random() * 20) + 5
  if (isPeakDay && isPeakHour) value = Math.floor(Math.random() * 30) + 65
  else if (isPeakHour) value = Math.floor(Math.random() * 25) + 40
  else if (isPeakDay) value = Math.floor(Math.random() * 20) + 25
  else if (isWeekend && hour >= 10 && hour <= 14) value = Math.floor(Math.random() * 20) + 35
  return { day, hour, value }
})

export const MOCK_BEST_TIMES: BestTimeSlot[] = [
  { platform: 'instagram', day: 'Tuesday',   hour: 9,  score: 94, label: '9:00 AM' },
  { platform: 'instagram', day: 'Thursday',  hour: 18, score: 91, label: '6:00 PM' },
  { platform: 'instagram', day: 'Wednesday', hour: 11, score: 88, label: '11:00 AM' },
  { platform: 'linkedin',  day: 'Tuesday',   hour: 10, score: 96, label: '10:00 AM' },
  { platform: 'linkedin',  day: 'Wednesday', hour: 9,  score: 93, label: '9:00 AM' },
  { platform: 'linkedin',  day: 'Thursday',  hour: 10, score: 90, label: '10:00 AM' },
  { platform: 'x',         day: 'Wednesday', hour: 8,  score: 89, label: '8:00 AM' },
  { platform: 'x',         day: 'Friday',    hour: 12, score: 85, label: '12:00 PM' },
  { platform: 'tiktok',    day: 'Friday',    hour: 18, score: 97, label: '6:00 PM' },
  { platform: 'tiktok',    day: 'Saturday',  hour: 10, score: 93, label: '10:00 AM' },
]

// ─── Campaigns ─────────────────────────────────────────────────────────────

export const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: 'c1',
    name: 'Q2 Product Launch',
    description: 'Launch campaign for the new AI-powered dashboard features',
    goal: 'awareness',
    status: 'active',
    startDate: new Date(now.getTime() - 7 * 86400000),
    endDate: new Date(now.getTime() + 21 * 86400000),
    platforms: ['instagram', 'linkedin', 'x'],
    postCount: 18,
    color: '#8A63D2',
    totalReach: 284500,
    totalEngagement: 12340,
    totalClicks: 4560,
  },
  {
    id: 'c2',
    name: 'Summer Brand Awareness',
    description: 'Seasonal brand visibility push across social channels',
    goal: 'engagement',
    status: 'active',
    startDate: new Date(now.getTime() - 3 * 86400000),
    endDate: new Date(now.getTime() + 45 * 86400000),
    platforms: ['instagram', 'tiktok', 'facebook'],
    postCount: 32,
    color: '#E4405F',
    totalReach: 156000,
    totalEngagement: 8900,
    totalClicks: 2300,
  },
  {
    id: 'c3',
    name: 'Developer Relations',
    description: 'Technical content for developer audience on professional networks',
    goal: 'traffic',
    status: 'draft',
    startDate: new Date(now.getTime() + 7 * 86400000),
    endDate: new Date(now.getTime() + 60 * 86400000),
    platforms: ['linkedin', 'x', 'devto'],
    postCount: 0,
    color: '#0A66C2',
  },
  {
    id: 'c4',
    name: 'End of Year Recap',
    description: 'Highlights and achievements from this year',
    goal: 'conversion',
    status: 'completed',
    startDate: new Date(now.getTime() - 90 * 86400000),
    endDate: new Date(now.getTime() - 30 * 86400000),
    platforms: ['instagram', 'linkedin', 'facebook', 'x'],
    postCount: 24,
    color: '#F59E0B',
    totalReach: 456000,
    totalEngagement: 32100,
    totalClicks: 9800,
  },
]

// ─── Inbox Messages ─────────────────────────────────────────────────────────

export const MOCK_INBOX: InboxMessage[] = [
  {
    id: 'msg-1',
    type: 'comment',
    platform: 'instagram',
    author: { name: 'Maria Chen', handle: '@maria.creates', avatarInitials: 'MC' },
    content: 'This is absolutely incredible! The attention to detail in this product is unreal 🔥 Can you share more about the process behind it?',
    postContent: 'Excited to share our new product launch...',
    timestamp: new Date(now.getTime() - 15 * 60 * 1000),
    isRead: false,
    isResolved: false,
    sentiment: 'positive',
  },
  {
    id: 'msg-2',
    type: 'mention',
    platform: 'x',
    author: { name: 'Dev Patel', handle: '@devpatel_io', avatarInitials: 'DP' },
    content: 'Just integrated @company API into our workflow and saved 3 hours a week. Highly recommend for any dev team!',
    timestamp: new Date(now.getTime() - 45 * 60 * 1000),
    isRead: false,
    isResolved: false,
    sentiment: 'positive',
  },
  {
    id: 'msg-3',
    type: 'comment',
    platform: 'linkedin',
    author: { name: 'Sarah Williams', handle: 'sarah-williams-mktg', avatarInitials: 'SW' },
    content: 'The scheduling features are great but I\'ve been having trouble with the bulk export. Has anyone else experienced this?',
    postContent: 'New feature alert: Real-time collaboration is now live...',
    timestamp: new Date(now.getTime() - 2 * 3600 * 1000),
    isRead: true,
    isResolved: false,
    sentiment: 'negative',
    assignedTo: 'Alex Rivera',
  },
  {
    id: 'msg-4',
    type: 'dm',
    platform: 'instagram',
    author: { name: 'Jordan Kim', handle: '@jordankim_studio', avatarInitials: 'JK' },
    content: 'Hi! I\'d love to collaborate on some content. Would you be interested in a partnership?',
    timestamp: new Date(now.getTime() - 4 * 3600 * 1000),
    isRead: true,
    isResolved: false,
    sentiment: 'positive',
  },
  {
    id: 'msg-5',
    type: 'reply',
    platform: 'x',
    author: { name: 'TechCrunch Fan', handle: '@techobs_2024', avatarInitials: 'TF' },
    content: 'Honestly kind of disappointed. Expected more from the announcement. The competitor launched something way better last month.',
    postContent: 'We\'re excited to announce...',
    timestamp: new Date(now.getTime() - 6 * 3600 * 1000),
    isRead: true,
    isResolved: true,
    sentiment: 'negative',
  },
  {
    id: 'msg-6',
    type: 'comment',
    platform: 'tiktok',
    author: { name: 'ContentKing', handle: '@contentking_pro', avatarInitials: 'CK' },
    content: 'This strategy is fire! Been using this approach for 6 months and my engagement tripled 📈',
    timestamp: new Date(now.getTime() - 8 * 3600 * 1000),
    isRead: true,
    isResolved: false,
    sentiment: 'positive',
  },
]

// ─── Plugs / Automation ─────────────────────────────────────────────────────

export const MOCK_PLUGS: Plug[] = [
  {
    id: 'plug-1',
    name: 'Auto-comment on viral posts',
    type: 'internal',
    triggerEvent: 'post_reaches_likes',
    triggerValue: 1000,
    triggerPlatform: 'instagram',
    actionType: 'auto_comment',
    actionContent: 'Thank you all so much for the love on this post! 🙏 Drop your questions below 👇',
    isActive: true,
    createdAt: new Date(now.getTime() - 14 * 86400000),
    lastTriggered: new Date(now.getTime() - 2 * 86400000),
    triggerCount: 8,
  },
  {
    id: 'plug-2',
    name: 'Cross-post to Discord on publish',
    type: 'internal',
    triggerEvent: 'post_published',
    triggerPlatform: 'instagram',
    actionType: 'post_to_channel',
    actionContent: 'New post is live on Instagram! Check it out 🔗 [link]',
    isActive: true,
    createdAt: new Date(now.getTime() - 30 * 86400000),
    lastTriggered: new Date(now.getTime() - 3 * 3600 * 1000),
    triggerCount: 47,
  },
  {
    id: 'plug-3',
    name: '10K followers milestone celebration',
    type: 'global',
    triggerEvent: 'follower_milestone',
    triggerValue: 10000,
    actionType: 'create_post',
    actionContent: '🎉 We just hit {milestone} followers! Thank you to every single one of you. This community means everything.',
    isActive: true,
    createdAt: new Date(now.getTime() - 60 * 86400000),
    triggerCount: 3,
  },
  {
    id: 'plug-4',
    name: 'Notify team on failed posts',
    type: 'internal',
    triggerEvent: 'post_failed',
    actionType: 'send_notification',
    actionContent: '⚠️ A scheduled post failed to publish. Please review in your dashboard.',
    isActive: false,
    createdAt: new Date(now.getTime() - 7 * 86400000),
    triggerCount: 2,
  },
]

// ─── RSS Feeds ──────────────────────────────────────────────────────────────

export const MOCK_RSS_FEEDS: RSSFeed[] = [
  {
    id: 'rss-1',
    name: 'Company Blog',
    url: 'https://blog.company.com/feed',
    targetPlatforms: ['linkedin', 'x'],
    frequency: 'daily',
    autoPublish: false,
    lastFetched: new Date(now.getTime() - 2 * 3600 * 1000),
    articleCount: 142,
    isActive: true,
  },
  {
    id: 'rss-2',
    name: 'Industry News — TechCrunch',
    url: 'https://techcrunch.com/feed/',
    targetPlatforms: ['x', 'linkedin'],
    frequency: 'hourly',
    autoPublish: false,
    lastFetched: new Date(now.getTime() - 45 * 60 * 1000),
    articleCount: 8920,
    isActive: true,
  },
  {
    id: 'rss-3',
    name: 'Product Updates',
    url: 'https://company.com/updates/rss',
    targetPlatforms: ['instagram', 'linkedin', 'x', 'discord'],
    frequency: 'realtime',
    autoPublish: true,
    lastFetched: new Date(now.getTime() - 10 * 60 * 1000),
    articleCount: 28,
    isActive: true,
    templateId: 'tmpl-1',
  },
]

// ─── Webhooks ───────────────────────────────────────────────────────────────

export const MOCK_WEBHOOKS: Webhook[] = [
  {
    id: 'wh-1',
    name: 'Slack notifications',
    url: 'https://example.com/webhooks/slack-notifications-placeholder',
    events: ['post.published', 'post.failed'],
    isActive: true,
    createdAt: new Date(now.getTime() - 30 * 86400000),
    lastTriggered: new Date(now.getTime() - 3 * 3600 * 1000),
    successCount: 234,
    failureCount: 2,
    secretMasked: 'sk_live_••••••••••••3a9f',
  },
  {
    id: 'wh-2',
    name: 'CRM sync endpoint',
    url: 'https://crm.company.internal/api/social-webhook',
    events: ['post.published', 'post.scheduled', 'analytics.weekly_report'],
    isActive: true,
    createdAt: new Date(now.getTime() - 60 * 86400000),
    lastTriggered: new Date(now.getTime() - 24 * 3600 * 1000),
    successCount: 89,
    failureCount: 0,
    secretMasked: 'sk_live_••••••••••••7b2c',
  },
]

// ─── API Keys ───────────────────────────────────────────────────────────────

export const MOCK_API_KEYS: APIKey[] = [
  {
    id: 'key-1',
    name: 'Production App',
    prefix: 'cael_live_',
    scopes: ['posts:read', 'posts:write', 'channels:read', 'analytics:read'],
    createdAt: new Date(now.getTime() - 90 * 86400000),
    lastUsed: new Date(now.getTime() - 30 * 60 * 1000),
    isActive: true,
  },
  {
    id: 'key-2',
    name: 'n8n Integration',
    prefix: 'cael_live_',
    scopes: ['posts:read', 'posts:write', 'channels:read'],
    createdAt: new Date(now.getTime() - 30 * 86400000),
    lastUsed: new Date(now.getTime() - 2 * 3600 * 1000),
    isActive: true,
  },
  {
    id: 'key-3',
    name: 'Staging / Dev',
    prefix: 'cael_test_',
    scopes: ['posts:read', 'channels:read', 'analytics:read'],
    createdAt: new Date(now.getTime() - 14 * 86400000),
    isActive: true,
  },
]

// ─── Signatures ─────────────────────────────────────────────────────────────

export const MOCK_SIGNATURES: Signature[] = [
  {
    id: 'sig-1',
    name: 'LinkedIn Professional',
    content: '\n\n—\nFollow for daily insights on AI & productivity\n🔗 company.com | 📧 hello@company.com',
    platforms: ['linkedin'],
    isDefault: true,
  },
  {
    id: 'sig-2',
    name: 'Twitter / X CTA',
    content: '\n\n🧵 Thread below ↓\nFollow @company for more',
    platforms: ['x'],
    isDefault: true,
  },
  {
    id: 'sig-3',
    name: 'Universal Footer',
    content: '\n\n#company #innovation #tech',
    platforms: ['instagram', 'facebook', 'tiktok'],
    isDefault: false,
  },
]

// ─── Queue Slots ────────────────────────────────────────────────────────────

export const MOCK_QUEUE_SLOTS: QueueSlot[] = [
  { id: 'slot-1', dayOfWeek: 1, hour: 9,  minute: 0,  isActive: true },
  { id: 'slot-2', dayOfWeek: 1, hour: 13, minute: 0,  isActive: true },
  { id: 'slot-3', dayOfWeek: 1, hour: 18, minute: 30, isActive: false },
  { id: 'slot-4', dayOfWeek: 2, hour: 9,  minute: 0,  isActive: true },
  { id: 'slot-5', dayOfWeek: 2, hour: 13, minute: 0,  isActive: true },
  { id: 'slot-6', dayOfWeek: 3, hour: 10, minute: 0,  isActive: true },
  { id: 'slot-7', dayOfWeek: 3, hour: 17, minute: 0,  isActive: true },
  { id: 'slot-8', dayOfWeek: 4, hour: 9,  minute: 0,  isActive: true },
  { id: 'slot-9', dayOfWeek: 4, hour: 13, minute: 0,  isActive: true },
  { id: 'slot-10', dayOfWeek: 5, hour: 10, minute: 0, isActive: true },
]

// ─── Media Items ────────────────────────────────────────────────────────────

export const MOCK_MEDIA: MediaItem[] = Array.from({ length: 28 }, (_, i) => ({
  id: `media-${i + 1}`,
  name: `${['Campaign Banner', 'Product Shot', 'Team Photo', 'Event Cover', 'Infographic', 'Story Asset', 'Reel Cover'][i % 7]} ${Math.floor(i / 7) + 1}`,
  type: (i % 5 === 0 ? 'video' : i % 8 === 0 ? 'gif' : 'image') as 'image' | 'video' | 'gif',
  size: Math.floor(Math.random() * 4500000) + 200000,
  width: i % 5 === 0 ? 1920 : 1080,
  height: i % 5 === 0 ? 1080 : 1080,
  duration: i % 5 === 0 ? Math.floor(Math.random() * 55) + 5 : undefined,
  tags: [['product', 'team', 'event', 'brand', 'promo'][i % 5], ['q2', 'q3', 'launch', 'seasonal'][i % 4]],
  folder: ['Campaigns', 'Products', 'Events', 'Brand Assets', 'Social'][i % 5],
  uploadedAt: new Date(now.getTime() - Math.random() * 90 * 86400000),
  usedInPosts: Math.floor(Math.random() * 12),
  altText: undefined,
}))

// ─── Customer Groups ─────────────────────────────────────────────────────────

export const MOCK_CUSTOMER_GROUPS: CustomerGroup[] = [
  { id: 'g1', name: 'Brand Channels',    color: '#8A63D2', channelIds: ['inst-1', 'x-1', 'linked-1'], description: 'Official brand presence' },
  { id: 'g2', name: 'Client A — Acme',   color: '#E4405F', channelIds: ['tiktok-1', 'fb-1'],          description: 'Acme Corp social accounts' },
  { id: 'g3', name: 'Product Launch',    color: '#0A66C2', channelIds: ['linked-1', 'x-1'],           description: 'Product-focused content' },
]

// ─── Link in Bio ─────────────────────────────────────────────────────────────

export const MOCK_LINK_IN_BIO: LinkInBioPage = {
  id: 'lib-1',
  username: 'caelpost',
  bio: 'Premium social media scheduling for creators & teams. ✨ Schedule smarter. Grow faster.',
  theme: 'bronze',
  buttonStyle: 'pill',
  links: [
    { id: 'l1', title: '🚀 Start Free Trial',       url: 'https://app.caelpost.com/signup',      clicks: 1234, isVisible: true,  order: 0 },
    { id: 'l2', title: '📖 Documentation & Guides', url: 'https://docs.caelpost.com',             clicks: 567,  isVisible: true,  order: 1 },
    { id: 'l3', title: '🎥 YouTube Tutorials',      url: 'https://youtube.com/@caelpost',         clicks: 890,  isVisible: true,  order: 2 },
    { id: 'l4', title: '💼 Case Studies',           url: 'https://caelpost.com/case-studies',     clicks: 345,  isVisible: true,  order: 3 },
    { id: 'l5', title: '🤝 Partner Program',        url: 'https://caelpost.com/partners',         clicks: 123,  isVisible: false, order: 4 },
  ],
  totalClicks: 3159,
  views: 28450,
}
