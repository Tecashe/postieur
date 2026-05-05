import type { Metadata } from 'next'
import { KPICard } from '@/components/dashboard/kpi-card'
import { ActivityTable } from '@/components/dashboard/activity-table'
import { Button } from '@/components/ui/button'
import { MOCK_METRICS, MOCK_ACTIVITY, MOCK_POSTS, MOCK_CHANNELS } from '@/lib/mock-data'
import { BarChart3, MessageSquare, Share2, Zap, Plus } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Overview of your social media scheduling',
}

export default function DashboardPage() {
  const publishedPosts = MOCK_POSTS.filter(p => p.status === 'published')
  const totalEngagement = publishedPosts.reduce(
    (sum, p) => sum + (p.engagement?.likes || 0),
    0
  )

  return (
    <div className="space-y-8">
      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          label="Posts Scheduled"
          value={MOCK_METRICS.totalScheduled}
          change={{ value: 12, isPositive: true }}
          icon={Zap}
        />
        <KPICard
          label="Reach This Week"
          value={MOCK_METRICS.reachThisWeek.toLocaleString()}
          change={{ value: 8, isPositive: true }}
          icon={BarChart3}
        />
        <KPICard
          label="Engagement Rate"
          value={MOCK_METRICS.engagementRate}
          unit="%"
          change={{ value: 2, isPositive: true }}
          icon={MessageSquare}
        />
        <KPICard
          label="Queue Depth"
          value={MOCK_METRICS.queueDepth}
          change={{ value: 3, isPositive: false }}
          icon={Share2}
        />
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <Button asChild className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100">
          <Link href="/compose">
            <Plus className="w-4 h-4 mr-2" />
            New Post
          </Link>
        </Button>
        <Button variant="outline" asChild className="border-zinc-200 dark:border-zinc-700">
          <Link href="/calendar">View Calendar</Link>
        </Button>
        <Button variant="outline" asChild className="border-zinc-200 dark:border-zinc-700">
          <Link href="/queue">Manage Queue</Link>
        </Button>
      </div>

      {/* Channel Performance Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {MOCK_CHANNELS.filter(c => c.isConnected).map(channel => {
          const platformStats = {
            instagram: { engagement: 6.2, reach: 89000 },
            linkedin: { engagement: 5.8, reach: 76500 },
            x: { engagement: 3.4, reach: 45000 },
            facebook: { engagement: 2.3, reach: 32000 },
            tiktok: { engagement: 8.9, reach: 234000 },
            youtube: { engagement: 12.1, reach: 156000 },
            pinterest: { engagement: 4.5, reach: 54000 },
            bluesky: { engagement: 7.2, reach: 12000 },
          }
          const stats = platformStats[channel.platform as keyof typeof platformStats]

          return (
            <div
              key={channel.id}
              className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium text-zinc-900 dark:text-white text-sm">{channel.name}</h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{channel.handle}</p>
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Followers</p>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                    {(channel.followers / 1000).toFixed(0)}K
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Engagement</p>
                  <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    {stats.engagement}%
                  </p>
                </div>
                <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-1 mt-2">
                  <div
                    className="bg-zinc-900 dark:bg-white h-1 rounded-full"
                    style={{ width: `${Math.min(stats.engagement * 10, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Activity Table */}
      <ActivityTable items={MOCK_ACTIVITY} />

      {/* Posted Posts Summary */}
      <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 bg-white dark:bg-zinc-900">
        <h3 className="text-base font-light text-zinc-900 dark:text-white mb-4">Publishing Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Published Posts</p>
            <p className="text-2xl font-light text-zinc-900 dark:text-white">{publishedPosts.length}</p>
          </div>
          <div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Total Likes</p>
            <p className="text-2xl font-light text-zinc-900 dark:text-white">
              {(totalEngagement / 1000).toFixed(1)}K
            </p>
          </div>
          <div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Avg. Engagement</p>
            <p className="text-2xl font-light text-zinc-900 dark:text-white">
              {publishedPosts.length > 0
                ? ((totalEngagement / publishedPosts.length) / 1000).toFixed(1)
                : 0}
              K
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
