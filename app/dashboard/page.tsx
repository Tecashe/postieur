'use client'

import { useState } from 'react'
import { KPICard } from '@/components/dashboard/kpi-card'
import { ActivityTable } from '@/components/dashboard/activity-table'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MOCK_METRICS, MOCK_ACTIVITY, MOCK_POSTS, MOCK_CHANNELS } from '@/lib/mock-data'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { BarChart3, MessageSquare, Share2, Zap, Plus, TrendingUp, AlertCircle, Clock, Users, Flame } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const trendData = [
  { date: 'Mon', posts: 3, engagement: 240 },
  { date: 'Tue', posts: 4, engagement: 320 },
  { date: 'Wed', posts: 5, engagement: 280 },
  { date: 'Thu', posts: 2, engagement: 180 },
  { date: 'Fri', posts: 6, engagement: 420 },
  { date: 'Sat', posts: 4, engagement: 350 },
  { date: 'Sun', posts: 3, engagement: 280 },
]

export default function DashboardPage() {
  const [timeframe, setTimeframe] = useState<'week' | 'month'>('week')
  const publishedPosts = MOCK_POSTS.filter(p => p.status === 'published')
  const scheduledPosts = MOCK_POSTS.filter(p => p.status === 'scheduled')
  const draftPosts = MOCK_POSTS.filter(p => p.status === 'draft')
  
  const totalEngagement = publishedPosts.reduce(
    (sum, p) => sum + (p.engagement?.likes || 0),
    0
  )
  const totalComments = publishedPosts.reduce(
    (sum, p) => sum + (p.engagement?.comments || 0),
    0
  )
  const totalShares = publishedPosts.reduce(
    (sum, p) => sum + (p.engagement?.shares || 0),
    0
  )

  const bestPerformer = publishedPosts.reduce((best, post) => {
    const postEngagement = (post.engagement?.likes || 0) + (post.engagement?.comments || 0) * 2 + (post.engagement?.shares || 0) * 3
    const bestEngagement = (best.engagement?.likes || 0) + (best.engagement?.comments || 0) * 2 + (best.engagement?.shares || 0) * 3
    return postEngagement > bestEngagement ? post : best
  })

  return (
    <div className="space-y-6">
      {/* Header with Timeframe */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light text-zinc-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Welcome back! Here's your performance overview</p>
        </div>
        <div className="flex gap-2">
          {['week', 'month'].map(period => (
            <Button
              key={period}
              variant={timeframe === period ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeframe(period as 'week' | 'month')}
              className="capitalize text-xs sm:text-sm"
            >
              This {period}
            </Button>
          ))}
        </div>
      </div>

      {/* Critical Alerts */}
      {scheduledPosts.filter(p => {
        const date = new Date(p.scheduledFor)
        const now = new Date()
        return date.getTime() - now.getTime() < 24 * 60 * 60 * 1000
      }).length > 0 && (
        <Card className="p-4 border-l-4 border-l-amber-500 bg-amber-50 dark:bg-amber-950 border-zinc-200 dark:border-zinc-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-900 dark:text-amber-100">Posts Publishing Soon</p>
              <p className="text-xs text-amber-800 dark:text-amber-200 mt-1">
                You have {scheduledPosts.filter(p => {
                  const date = new Date(p.scheduledFor)
                  const now = new Date()
                  return date.getTime() - now.getTime() < 24 * 60 * 60 * 1000
                }).length} posts scheduled for the next 24 hours
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 sm:p-6 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-medium">Scheduled Posts</p>
              <p className="text-2xl sm:text-3xl font-light text-zinc-900 dark:text-white mt-2">{scheduledPosts.length}</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">Next 30 days</p>
            </div>
            <Zap className="w-8 h-8 text-emerald-100 dark:text-emerald-900" />
          </div>
        </Card>

        <Card className="p-4 sm:p-6 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-medium">Total Likes</p>
              <p className="text-2xl sm:text-3xl font-light text-zinc-900 dark:text-white mt-2">{(totalEngagement / 1000).toFixed(1)}K</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">+12% from last week</p>
            </div>
            <Flame className="w-8 h-8 text-emerald-100 dark:text-emerald-900" />
          </div>
        </Card>

        <Card className="p-4 sm:p-6 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-medium">Comments</p>
              <p className="text-2xl sm:text-3xl font-light text-zinc-900 dark:text-white mt-2">{(totalComments / 100).toFixed(0)}.</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{totalComments} total</p>
            </div>
            <MessageSquare className="w-8 h-8 text-zinc-100 dark:text-zinc-800" />
          </div>
        </Card>

        <Card className="p-4 sm:p-6 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-medium">Drafts</p>
              <p className="text-2xl sm:text-3xl font-light text-zinc-900 dark:text-white mt-2">{draftPosts.length}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Ready to review</p>
            </div>
            <Clock className="w-8 h-8 text-zinc-100 dark:text-zinc-800" />
          </div>
        </Card>
      </div>

      {/* Activity Chart & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <Card className="p-4 sm:p-6 lg:col-span-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <h3 className="text-base font-light text-zinc-900 dark:text-white mb-4">Publishing Activity</h3>
          <div className="overflow-x-auto -mx-4 sm:-mx-6">
            <div className="px-4 sm:px-6 min-w-max">
              <ResponsiveContainer width={typeof window !== 'undefined' ? 100 : 500} height={200}>
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                  <XAxis dataKey="date" stroke="#71717a" />
                  <YAxis stroke="#71717a" />
                  <Tooltip contentStyle={{ backgroundColor: '#27272a', border: '1px solid #3f3f46', borderRadius: '8px' }} />
                  <Bar dataKey="posts" fill="#10b981" radius={[8, 8, 0, 0]} name="Posts" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-4 sm:p-6 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <h3 className="text-base font-light text-zinc-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm h-10">
              <Link href="/compose">
                <Plus className="w-4 h-4 mr-2" />
                New Post
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full text-sm h-10">
              <Link href="/calendar">View Calendar</Link>
            </Button>
            <Button asChild variant="outline" className="w-full text-sm h-10">
              <Link href="/queue">Manage Queue</Link>
            </Button>
            <Button asChild variant="outline" className="w-full text-sm h-10">
              <Link href="/templates">Browse Templates</Link>
            </Button>
          </div>
        </Card>
      </div>

      {/* Channel Performance Grid */}
      <div>
        <h2 className="text-lg font-light text-zinc-900 dark:text-white mb-4">Channel Performance</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MOCK_CHANNELS.filter(c => c.isConnected).slice(0, 8).map(channel => {
            const platformStats = {
              instagram: { engagement: 6.2, reach: 89000, growth: 12.5 },
              linkedin: { engagement: 5.8, reach: 76500, growth: 8.3 },
              x: { engagement: 3.4, reach: 45000, growth: -2.1 },
              facebook: { engagement: 2.3, reach: 32000, growth: 1.2 },
              tiktok: { engagement: 8.9, reach: 234000, growth: 18.7 },
              youtube: { engagement: 12.1, reach: 156000, growth: 5.6 },
              pinterest: { engagement: 4.5, reach: 54000, growth: 3.4 },
              bluesky: { engagement: 7.2, reach: 12000, growth: 45.2 },
            }
            const stats = platformStats[channel.platform]

            return (
              <Card
                key={channel.id}
                className="p-4 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-emerald-200 dark:hover:border-emerald-900 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-zinc-900 dark:text-white text-sm">{channel.name}</h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{channel.handle}</p>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">Followers</p>
                      <p className="text-lg font-semibold text-zinc-900 dark:text-white">
                        {(channel.followers / 1000).toFixed(0)}K
                      </p>
                    </div>
                    <Badge className={cn(
                      'text-xs',
                      stats.growth > 0 ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' : 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                    )}>
                      {stats.growth > 0 ? '+' : ''}{stats.growth}%
                    </Badge>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">Engagement</p>
                      <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{stats.engagement}%</p>
                    </div>
                    <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-1.5">
                      <div
                        className="bg-emerald-500 h-1.5 rounded-full"
                        style={{ width: `${Math.min(stats.engagement * 10, 100)}%` }}
                      />
                    </div>
                  </div>

                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {(stats.reach / 1000).toFixed(0)}K reach
                  </p>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Best Performer & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Best Performer */}
        <Card className="p-4 sm:p-6 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <h3 className="text-base font-light text-zinc-900 dark:text-white mb-4">Top Performing Post</h3>
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950 rounded-lg mb-4">
            <p className="text-sm text-zinc-900 dark:text-white line-clamp-2">{bestPerformer.content}</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-xs text-zinc-600 dark:text-zinc-400">Likes</p>
              <p className="text-lg font-semibold text-zinc-900 dark:text-white mt-1">
                {(bestPerformer.engagement?.likes || 0).toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-zinc-600 dark:text-zinc-400">Comments</p>
              <p className="text-lg font-semibold text-zinc-900 dark:text-white mt-1">
                {bestPerformer.engagement?.comments || 0}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-zinc-600 dark:text-zinc-400">Shares</p>
              <p className="text-lg font-semibold text-zinc-900 dark:text-white mt-1">
                {bestPerformer.engagement?.shares || 0}
              </p>
            </div>
          </div>
        </Card>

        {/* Publishing Summary */}
        <Card className="p-4 sm:p-6 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <h3 className="text-base font-light text-zinc-900 dark:text-white mb-4">Publishing Summary</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
              <span className="text-sm text-zinc-700 dark:text-zinc-300">Published Posts</span>
              <span className="text-lg font-semibold text-zinc-900 dark:text-white">{publishedPosts.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
              <span className="text-sm text-zinc-700 dark:text-zinc-300">Scheduled Posts</span>
              <span className="text-lg font-semibold text-zinc-900 dark:text-white">{scheduledPosts.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
              <span className="text-sm text-zinc-700 dark:text-zinc-300">Draft Posts</span>
              <span className="text-lg font-semibold text-zinc-900 dark:text-white">{draftPosts.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-950 rounded-lg">
              <span className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">Total Engagement</span>
              <span className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">
                {(totalEngagement + totalComments * 2 + totalShares * 3).toLocaleString()}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Activity Table */}
      <ActivityTable items={MOCK_ACTIVITY} />
    </div>
  )
}
