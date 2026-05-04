'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, Users, Heart, MessageCircle, Share2, Eye } from 'lucide-react'
import { MOCK_POSTS, MOCK_PLATFORM_STATS } from '@/lib/mock-data'
import { PLATFORMS } from '@/lib/constants'

const analyticsData = [
  { date: 'Mon', impressions: 2400, engagement: 240, clicks: 321 },
  { date: 'Tue', impressions: 1398, engagement: 221, clicks: 456 },
  { date: 'Wed', impressions: 9800, engagement: 229, clicks: 789 },
  { date: 'Thu', impressions: 3908, engagement: 200, clicks: 345 },
  { date: 'Fri', impressions: 4800, engagement: 221, clicks: 567 },
  { date: 'Sat', impressions: 3800, engagement: 250, clicks: 432 },
  { date: 'Sun', impressions: 4300, engagement: 210, clicks: 234 },
]

const platformData = [
  { name: 'Instagram', value: 35, color: '#E4405F' },
  { name: 'LinkedIn', value: 28, color: '#0A66C2' },
  { name: 'Twitter', value: 22, color: '#1DA1F2' },
  { name: 'TikTok', value: 15, color: '#000000' },
]

const audienceGrowth = [
  { month: 'Jan', followers: 8400 },
  { month: 'Feb', followers: 11250 },
  { month: 'Mar', followers: 15680 },
  { month: 'Apr', followers: 21540 },
  { month: 'May', followers: 28960 },
  { month: 'Jun', followers: 38240 },
]

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

const KPICard = ({ icon: Icon, label, value, change, trend }: { icon: React.ReactNode, label: string, value: string | number, change: string, trend: 'up' | 'down' | 'neutral' }) => (
  <Card className="p-4 sm:p-6 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-medium">{label}</p>
        <p className="text-2xl sm:text-3xl font-light text-zinc-900 dark:text-white mt-2">{value}</p>
        <p className={cn(
          'text-xs mt-2 font-medium',
          trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' : trend === 'down' ? 'text-red-600 dark:text-red-400' : 'text-zinc-600 dark:text-zinc-400'
        )}>
          {change}
        </p>
      </div>
      <div className={cn(
        'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
        trend === 'up' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
      )}>
        {Icon}
      </div>
    </div>
  </Card>
)

export default function AnalyticsPage() {
  const [timeframe, setTimeframe] = useState('week')
  const publishedPosts = MOCK_POSTS.filter(p => p.status === 'published')
  const topPosts = publishedPosts
    .sort((a, b) => (b.engagement?.likes || 0) - (a.engagement?.likes || 0))
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light text-zinc-900 dark:text-white">Analytics</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Track performance across all platforms</p>
        </div>
        <div className="flex gap-2">
          {['week', 'month', 'year'].map(period => (
            <Button
              key={period}
              variant={timeframe === period ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeframe(period)}
              className="capitalize text-xs sm:text-sm"
            >
              {period}
            </Button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          icon={<Eye className="w-5 h-5" />}
          label="Total Impressions"
          value="32.4K"
          change="+12.5% from last week"
          trend="up"
        />
        <KPICard
          icon={<Heart className="w-5 h-5" />}
          label="Total Engagement"
          value="2,358"
          change="+8.2% from last week"
          trend="up"
        />
        <KPICard
          icon={<Users className="w-5 h-5" />}
          label="New Followers"
          value="542"
          change="+15.3% from last week"
          trend="up"
        />
        <KPICard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Engagement Rate"
          value="7.3%"
          change="+0.8% from last week"
          trend="up"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart */}
        <Card className="p-4 sm:p-6 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 lg:col-span-2">
          <h3 className="text-base font-light text-zinc-900 dark:text-white mb-4">Activity This Week</h3>
          <div className="overflow-x-auto -mx-4 sm:-mx-6">
            <div className="px-4 sm:px-6">
              <ResponsiveContainer width={typeof window !== 'undefined' ? 100 : 500} height={300}>
                <LineChart data={analyticsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                  <XAxis dataKey="date" stroke="#71717a" />
                  <YAxis stroke="#71717a" />
                  <Tooltip contentStyle={{ backgroundColor: '#27272a', border: '1px solid #3f3f46', borderRadius: '8px' }} labelStyle={{ color: '#fafafa' }} />
                  <Legend />
                  <Line type="monotone" dataKey="impressions" stroke="#09090b" dot={{ fill: '#09090b' }} name="Impressions" strokeWidth={2} />
                  <Line type="monotone" dataKey="engagement" stroke="#10b981" dot={{ fill: '#10b981' }} name="Engagement" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        {/* Platform Distribution */}
        <Card className="p-4 sm:p-6 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <h3 className="text-base font-light text-zinc-900 dark:text-white mb-4">By Platform</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={platformData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                {platformData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#27272a', border: '1px solid #3f3f46', borderRadius: '8px' }} labelStyle={{ color: '#fafafa' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {platformData.map(platform => (
              <div key={platform.name} className="flex items-center justify-between">
                <span className="text-xs text-zinc-600 dark:text-zinc-400">{platform.name}</span>
                <span className="text-sm font-medium text-zinc-900 dark:text-white">{platform.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Growth & Top Posts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Audience Growth */}
        <Card className="p-4 sm:p-6 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <h3 className="text-base font-light text-zinc-900 dark:text-white mb-4">Audience Growth</h3>
          <div className="overflow-x-auto -mx-4 sm:-mx-6">
            <div className="px-4 sm:px-6">
              <ResponsiveContainer width={typeof window !== 'undefined' ? 100 : 400} height={300}>
                <BarChart data={audienceGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                  <XAxis dataKey="month" stroke="#71717a" />
                  <YAxis stroke="#71717a" />
                  <Tooltip contentStyle={{ backgroundColor: '#27272a', border: '1px solid #3f3f46', borderRadius: '8px' }} labelStyle={{ color: '#fafafa' }} />
                  <Bar dataKey="followers" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        {/* Top Posts */}
        <Card className="p-4 sm:p-6 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <h3 className="text-base font-light text-zinc-900 dark:text-white mb-4">Top Performing Posts</h3>
          <div className="space-y-3">
            {topPosts.map((post, idx) => (
              <div key={post.id} className="flex items-start gap-3 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 dark:text-white truncate line-clamp-2">{post.content}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge className="text-xs">{post.platform}</Badge>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">{(post.engagement?.likes || 0).toLocaleString()} likes</span>
                  </div>
                </div>
                <TrendingUp className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-1" />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <Card className="p-4 sm:p-6 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <h3 className="text-base font-light text-zinc-900 dark:text-white mb-4">Platform Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="text-left py-3 px-4 text-xs font-semibold text-zinc-600 dark:text-zinc-400">Platform</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-zinc-600 dark:text-zinc-400">Engagement Rate</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-zinc-600 dark:text-zinc-400">Reach</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-zinc-600 dark:text-zinc-400">Posts</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_PLATFORM_STATS.slice(0, 6).map(stat => {
                const Icon = PLATFORMS[stat.platform].icon
                return (
                  <tr key={stat.platform} className="border-b border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800">
                    <td className="py-3 px-4 flex items-center gap-2">
                      <Icon className="w-4 h-4 text-zinc-600 dark:text-zinc-400 flex-shrink-0" />
                      <span className="text-sm font-medium text-zinc-900 dark:text-white">{PLATFORMS[stat.platform].label}</span>
                    </td>
                    <td className="text-right py-3 px-4">
                      <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{stat.engagementRate}%</span>
                    </td>
                    <td className="text-right py-3 px-4">
                      <span className="text-sm text-zinc-900 dark:text-white">{(stat.reach / 1000).toFixed(0)}K</span>
                    </td>
                    <td className="text-right py-3 px-4">
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">{Math.floor(Math.random() * 20) + 5}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
