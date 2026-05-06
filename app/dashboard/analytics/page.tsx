'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { TrendingUp, TrendingDown, Eye, Heart, MessageCircle, Users, Zap, RefreshCw } from 'lucide-react'
import { PLATFORMS } from '@/lib/constants'
import { cn } from '@/lib/utils'


const PERIOD_OPTIONS = ['7d', '30d', '90d'] as const
type Period = typeof PERIOD_OPTIONS[number]

const TREND_DATA: Record<Period, { date: string; impressions: number; engagement: number; followers: number }[]> = {
  '7d': [
    { date: 'Mon', impressions: 12400, engagement: 840, followers: 42 },
    { date: 'Tue', impressions: 9800,  engagement: 620, followers: 31 },
    { date: 'Wed', impressions: 18600, engagement: 1240, followers: 78 },
    { date: 'Thu', impressions: 14200, engagement: 960, followers: 55 },
    { date: 'Fri', impressions: 22100, engagement: 1480, followers: 91 },
    { date: 'Sat', impressions: 16800, engagement: 1120, followers: 64 },
    { date: 'Sun', impressions: 19400, engagement: 1300, followers: 72 },
  ],
  '30d': Array.from({ length: 30 }, (_, i) => ({
    date: `D${i + 1}`,
    impressions: 8000 + Math.random() * 20000,
    engagement: 400 + Math.random() * 1500,
    followers: 20 + Math.random() * 120,
  })),
  '90d': Array.from({ length: 12 }, (_, i) => ({
    date: `W${i + 1}`,
    impressions: 60000 + Math.random() * 80000,
    engagement: 3000 + Math.random() * 8000,
    followers: 180 + Math.random() * 600,
  })),
}

const PIE_COLORS = ['oklch(0.390 0.072 55)', 'oklch(0.520 0.095 178)', '#3b82f6', '#a855f7', '#f59e0b', '#ef4444']

function MetricCard({ label, value, change, trend, icon: Icon }: {
  label: string; value: string; change: string; trend: 'up' | 'down' | 'flat'; icon: React.ElementType
}) {
  return (
    <Card className="bg-card border-border shadow-sm p-4">
      <div className="flex items-start justify-between mb-2">
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">{label}</p>
        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
      </div>
      <p className="text-2xl font-light text-foreground">{value}</p>
      <p className={cn('text-xs mt-1 flex items-center gap-0.5',
        trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' :
        trend === 'down' ? 'text-destructive' : 'text-muted-foreground')}>
        {trend === 'up' && <TrendingUp className="w-3 h-3" />}
        {trend === 'down' && <TrendingDown className="w-3 h-3" />}
        {change}
      </p>
    </Card>
  )
}

// Engagement heatmap (7×24)
function HeatmapCell({ value, max }: { value: number; max: number }) {
  const intensity = max > 0 ? value / max : 0
  return (
    <div
      className="w-full aspect-square rounded-[1px] transition-colors"
      style={{
        backgroundColor: intensity > 0
          ? `oklch(${0.520 - intensity * 0.15} ${0.095 + intensity * 0.08} 178 / ${0.15 + intensity * 0.85})`
          : 'hsl(var(--muted))',
      }}
      title={`${value} engagements`}
    />
  )
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const HOURS = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}`)

type ApiResponse = {
  totals: { impressions: number; engagement: number; comments: number; likes: number; shares: number; reach: number } | null
  platformStats: Array<{ platform: string; posts: number; impressions: number; engagement: number; followers: number; followerGrowth: number }>
  heatmap: Array<{ dayOfWeek: number; hour: number; value: number }>
  bestTimes: Array<{ dayOfWeek: number; hour: number; value: number; day: string }>
  trendData: Array<{ date: string; impressions: number; engagement: number; followers: number }>
  topPosts: Array<{ id: string; content: string; platforms: string[]; publishedAt: string | null; likes: number; comments: number; shares: number; impressions: number; reach: number; engagement: number }>
  hasData: boolean
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>('7d')
  const [metric, setMetric] = useState<'impressions' | 'engagement' | 'followers'>('impressions')
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<ApiResponse | null>(null)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/analytics?period=${period}`)
      .then(r => r.json())
      .then((d: ApiResponse) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [period])

  // Fall back to static demo data when DB has nothing yet
  const trendData = (data?.trendData?.length ? data.trendData : TREND_DATA[period])
  const platformStats = data?.platformStats ?? []
  const heatmap = data?.heatmap ?? []
  const bestTimes = data?.bestTimes ?? []
  const totals = data?.totals
  const topPosts = data?.topPosts ?? []

  const pieData = platformStats.length > 0
    ? platformStats.map((s, i) => ({ name: PLATFORMS[s.platform as keyof typeof PLATFORMS]?.name ?? s.platform, value: s.engagement, color: PIE_COLORS[i % PIE_COLORS.length] }))
    : []

  const heatmaxVal = heatmap.length > 0 ? Math.max(...heatmap.map(c => c.value)) : 1

  return (
    <div className="space-y-5 pb-6">
      {/* Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        {loading && <RefreshCw className="w-3.5 h-3.5 text-muted-foreground animate-spin" />}
        <div className="flex rounded-sm overflow-hidden border border-border">
          {PERIOD_OPTIONS.map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={cn('px-3 py-1.5 text-xs font-medium transition-colors border-r border-border last:border-r-0',
                period === p ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted/60')}>
              {p}
            </button>
          ))}
        </div>
        <div className="flex rounded-sm overflow-hidden border border-border">
          {(['impressions', 'engagement', 'followers'] as const).map(m => (
            <button key={m} onClick={() => setMetric(m)}
              className={cn('px-3 py-1.5 text-xs font-medium transition-colors border-r border-border last:border-r-0 capitalize',
                metric === m ? 'bg-accent/15 text-accent' : 'text-muted-foreground hover:bg-muted/60')}>
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          label="Impressions" icon={Eye} trend="up"
          value={loading ? '—' : totals ? (totals.impressions >= 1000 ? `${(totals.impressions / 1000).toFixed(1)}K` : totals.impressions.toLocaleString()) : '0'}
          change={loading ? '…' : totals ? `${totals.impressions.toLocaleString()} total` : 'No data yet'}
        />
        <MetricCard
          label="Engagements" icon={Heart} trend="up"
          value={loading ? '—' : totals ? (totals.engagement >= 1000 ? `${(totals.engagement / 1000).toFixed(1)}K` : totals.engagement.toLocaleString()) : '0'}
          change={loading ? '…' : totals ? `${totals.likes} likes · ${totals.shares} shares` : 'No data yet'}
        />
        <MetricCard
          label="Comments" icon={MessageCircle} trend="flat"
          value={loading ? '—' : totals ? totals.comments.toLocaleString() : '0'}
          change={loading ? '…' : 'From analytics data'}
        />
        <MetricCard
          label="Reach" icon={Users} trend="up"
          value={loading ? '—' : totals ? (totals.reach >= 1000 ? `${(totals.reach / 1000).toFixed(1)}K` : totals.reach.toLocaleString()) : '0'}
          change={loading ? '…' : 'Unique accounts reached'}
        />
      </div>

      {/* Main trend chart */}
      <Card className="bg-card border-border shadow-sm">
        <div className="px-5 py-3 border-b border-border">
          <h2 className="text-sm font-medium text-foreground capitalize">{metric} over time</h2>
        </div>
        <div className="p-5">
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={45} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '4px', fontSize: 11 }} />
              <Line type="monotone" dataKey={metric} stroke="oklch(0.520 0.095 178)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Platform distribution */}
        <Card className="bg-card border-border shadow-sm">
          <div className="px-5 py-3 border-b border-border">
            <h2 className="text-sm font-medium text-foreground">Engagement by Platform</h2>
          </div>
          <div className="p-5 flex items-center gap-6">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '4px', fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {pieData.map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                  <span className="text-xs text-foreground flex-1">{d.name}</span>
                  <span className="text-xs font-mono text-muted-foreground">{(d.value ?? 0).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Best posting times */}
        <Card className="bg-card border-border shadow-sm">
          <div className="px-5 py-3 border-b border-border">
            <h2 className="text-sm font-medium text-foreground">Best Times to Post</h2>
          </div>
          <div className="p-4 space-y-2">
            {bestTimes.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No data yet — publish posts to see best times</p>
            ) : bestTimes.slice(0, 6).map((slot, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-sm hover:bg-muted/40 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground">{slot.day} at {slot.hour}:00</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-accent rounded-full" style={{ width: `${Math.round(slot.value / Math.max(...bestTimes.map(b => b.value), 1) * 100)}%` }} />
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground">{slot.value}</span>
                  </div>
                </div>
                <Zap className="w-3 h-3 text-accent flex-shrink-0" />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Engagement Heatmap */}
      <Card className="bg-card border-border shadow-sm">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-medium text-foreground">Engagement Heatmap</h2>
          <p className="text-[11px] text-muted-foreground">24-hour by day-of-week activity</p>
        </div>
        <div className="p-5 overflow-x-auto">
          <div className="flex gap-2 min-w-[600px]">
            <div className="flex flex-col gap-1 pr-2">
              <div className="h-4" />
              {DAYS.map(d => (
                <div key={d} className="h-4 flex items-center text-[10px] text-muted-foreground w-7 justify-end">{d}</div>
              ))}
            </div>
            <div className="flex-1">
              <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(24, 1fr)' }}>
                {HOURS.map(h => (
                  <div key={h} className="h-4 flex items-center justify-center text-[9px] text-muted-foreground">{parseInt(h) % 6 === 0 ? h : ''}</div>
                ))}
                {DAYS.map((_, dayIdx) =>
                  HOURS.map((_, hourIdx) => {
                    const cell = heatmap.find(c => c.dayOfWeek === dayIdx && c.hour === hourIdx)
                    return <HeatmapCell key={`${dayIdx}-${hourIdx}`} value={cell?.value ?? 0} max={heatmaxVal} />
                  })
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3 justify-end">
            <span className="text-[10px] text-muted-foreground">Low</span>
            {[0, 0.25, 0.5, 0.75, 1].map(v => (
              <div key={v} className="w-4 h-2 rounded-[1px]"
                style={{ backgroundColor: `oklch(${0.520 - v * 0.15} ${0.095 + v * 0.08} 178 / ${0.15 + v * 0.85})` }} />
            ))}
            <span className="text-[10px] text-muted-foreground">High</span>
          </div>
        </div>
      </Card>

      {/* Per-platform stats table */}
      <Card className="bg-card border-border shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <h2 className="text-sm font-medium text-foreground">Platform Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-5 py-2.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Platform</th>
                <th className="text-right px-4 py-2.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Posts</th>
                <th className="text-right px-4 py-2.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Impressions</th>
                <th className="text-right px-4 py-2.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Engagement</th>
                <th className="text-right px-4 py-2.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Followers</th>
                <th className="text-right px-5 py-2.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Growth</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {platformStats.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-xs text-muted-foreground">No analytics data yet. Publish posts to see platform breakdown.</td></tr>
              ) : platformStats.map(stat => {
                const plat = PLATFORMS[stat.platform as keyof typeof PLATFORMS]
                const Icon = plat?.icon
                return (
                  <tr key={stat.platform} className="hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        {Icon && <Icon className="w-3.5 h-3.5 text-muted-foreground" />}
                        <span className="text-foreground font-medium">{plat?.name ?? stat.platform}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-muted-foreground">{stat.posts}</td>
                    <td className="px-4 py-3 text-right font-mono text-muted-foreground">{stat.impressions.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-mono text-muted-foreground">{stat.engagement.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-mono text-muted-foreground">{stat.followers.toLocaleString()}</td>
                    <td className="px-5 py-3 text-right">
                      <Badge className={cn('text-[10px] border-0',
                        stat.followerGrowth >= 0 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-destructive/10 text-destructive')}>
                        {stat.followerGrowth >= 0 ? '+' : ''}{stat.followerGrowth}%
                      </Badge>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Top performing posts */}
      <Card className="bg-card border-border shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <h2 className="text-sm font-medium text-foreground">Top Performing Posts</h2>
        </div>
        {topPosts.length === 0 ? (
          <div className="px-5 py-8 text-center text-xs text-muted-foreground">
            No posts with analytics data in this period.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-5 py-2.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Content</th>
                  <th className="text-right px-3 py-2.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Impr.</th>
                  <th className="text-right px-3 py-2.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Likes</th>
                  <th className="text-right px-3 py-2.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Comments</th>
                  <th className="text-right px-3 py-2.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Shares</th>
                  <th className="text-right px-5 py-2.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Engagement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {topPosts.map((post, i) => {
                  const firstPlatKey = post.platforms[0] as keyof typeof PLATFORMS
                  const Icon = PLATFORMS[firstPlatKey]?.icon
                  return (
                    <tr key={post.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-3 max-w-xs">
                        <div className="flex items-start gap-2">
                          <span className="text-[10px] font-medium text-muted-foreground w-4 flex-shrink-0 mt-0.5">#{i + 1}</span>
                          {Icon && <Icon className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />}
                          <div className="flex-1 min-w-0">
                            <p className="text-foreground line-clamp-2 leading-snug">{post.content}</p>
                            {post.publishedAt && (
                              <p className="text-[10px] text-muted-foreground mt-0.5">
                                {new Date(post.publishedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-right font-mono text-muted-foreground whitespace-nowrap">{post.impressions.toLocaleString()}</td>
                      <td className="px-3 py-3 text-right font-mono text-muted-foreground">{post.likes.toLocaleString()}</td>
                      <td className="px-3 py-3 text-right font-mono text-muted-foreground">{post.comments.toLocaleString()}</td>
                      <td className="px-3 py-3 text-right font-mono text-muted-foreground">{post.shares.toLocaleString()}</td>
                      <td className="px-5 py-3 text-right">
                        <span className="font-semibold text-foreground">{post.engagement.toLocaleString()}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
