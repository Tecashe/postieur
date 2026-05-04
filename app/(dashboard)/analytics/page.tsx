'use client'

import type { Metadata } from 'next'
import { Card } from '@/components/ui/card'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { MOCK_ANALYTICS, MOCK_PLATFORM_STATS, MOCK_POSTS } from '@/lib/mock-data'
import { PLATFORMS } from '@/lib/constants'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export default function AnalyticsPage() {
  const publishedPosts = MOCK_POSTS.filter(p => p.status === 'published')
  const topPosts = publishedPosts
    .sort((a, b) => (b.engagement?.likes || 0) - (a.engagement?.likes || 0))
    .slice(0, 4)

  return (
    <div className="space-y-8">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-light text-zinc-900 dark:text-white">Analytics</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Track engagement and performance metrics</p>
        </div>
        <ToggleGroup type="single" defaultValue="30d" className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-1">
          <ToggleGroupItem value="7d" aria-label="Last 7 days">7D</ToggleGroupItem>
          <ToggleGroupItem value="30d" aria-label="Last 30 days">30D</ToggleGroupItem>
          <ToggleGroupItem value="90d" aria-label="Last 90 days">90D</ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400 uppercase">Total Reach</p>
          <p className="text-2xl font-light text-zinc-900 dark:text-white mt-2">
            {(MOCK_ANALYTICS.reduce((sum, d) => sum + d.reach, 0) / 1000).toFixed(0)}K
          </p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">+12% from last period</p>
        </Card>
        <Card className="p-4 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400 uppercase">Engagement</p>
          <p className="text-2xl font-light text-zinc-900 dark:text-white mt-2">
            {(MOCK_ANALYTICS.reduce((sum, d) => sum + d.engagement, 0) / 1000).toFixed(0)}K
          </p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">+8% from last period</p>
        </Card>
        <Card className="p-4 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400 uppercase">Clicks</p>
          <p className="text-2xl font-light text-zinc-900 dark:text-white mt-2">
            {(MOCK_ANALYTICS.reduce((sum, d) => sum + d.clicks, 0) / 1000).toFixed(1)}K
          </p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">+5% from last period</p>
        </Card>
        <Card className="p-4 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400 uppercase">Avg. Engagement</p>
          <p className="text-2xl font-light text-zinc-900 dark:text-white mt-2">4.2%</p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">+2% from last period</p>
        </Card>
      </div>

      {/* Reach Trend Chart */}
      <Card className="p-6 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <h3 className="text-base font-light text-zinc-900 dark:text-white mb-6">Reach & Engagement Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={MOCK_ANALYTICS}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
            <XAxis dataKey="date" stroke="rgba(0,0,0,0.5)" style={{ fontSize: '12px' }} />
            <YAxis stroke="rgba(0,0,0,0.5)" style={{ fontSize: '12px' }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(0,0,0,0.8)', 
                border: 'none', 
                borderRadius: '6px',
                color: '#fff'
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="reach" stroke="#000" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="engagement" stroke="#a3a3a3" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Platform Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <h3 className="text-base font-light text-zinc-900 dark:text-white mb-4">Performance by Platform</h3>
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-200 dark:border-zinc-800 hover:bg-transparent">
                <TableHead className="text-zinc-600 dark:text-zinc-400 font-medium">Platform</TableHead>
                <TableHead className="text-right text-zinc-600 dark:text-zinc-400 font-medium">Engagement</TableHead>
                <TableHead className="text-right text-zinc-600 dark:text-zinc-400 font-medium">Reach</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_PLATFORM_STATS.slice(0, 5).map(stat => {
                const Icon = PLATFORMS[stat.platform].icon
                return (
                  <TableRow key={stat.platform} className="border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800">
                    <TableCell className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                      <span className="text-sm font-medium text-zinc-900 dark:text-white">
                        {PLATFORMS[stat.platform].name}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                        {stat.engagementRate}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-sm text-zinc-900 dark:text-white">
                        {(stat.reach / 1000).toFixed(0)}K
                      </span>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Card>

        {/* Top Posts */}
        <Card className="p-6 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <h3 className="text-base font-light text-zinc-900 dark:text-white mb-4">Top Performing Posts</h3>
          <div className="space-y-3">
            {topPosts.map((post, idx) => (
              <div
                key={post.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                  <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">#{idx + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 dark:text-white line-clamp-2">{post.content}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    {post.engagement?.likes.toLocaleString()} likes • {post.engagement?.comments} comments
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
