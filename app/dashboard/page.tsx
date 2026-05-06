'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import {
  TrendingUp, TrendingDown, Clock, CheckCircle2, Plus,
  ArrowRight, BarChart3, Eye, Heart,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { PLATFORMS } from '@/lib/constants'

function StatCard({ label, value, change, trend, icon: Icon, accent }: {
  label: string; value: string | number; change: string; trend: 'up' | 'down' | 'flat'
  icon: React.ElementType; accent?: boolean
}) {
  return (
    <Card className="bg-card border-border shadow-sm p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">{label}</p>
          <p className="text-2xl font-light text-foreground">{value}</p>
          <p className={cn('text-xs flex items-center gap-1',
            trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' :
            trend === 'down' ? 'text-destructive' : 'text-muted-foreground')}>
            {trend === 'up' && <TrendingUp className="w-3 h-3" />}
            {trend === 'down' && <TrendingDown className="w-3 h-3" />}
            {change}
          </p>
        </div>
        <div className={cn('w-9 h-9 rounded-sm flex items-center justify-center',
          accent ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground')}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
    </Card>
  )
}

export default function DashboardPage() {
  const [chartView, setChartView] = useState<'eng' | 'reach'>('eng')
  type StatsData = {
    totalPosts: number; scheduled: number; published: number; failed: number
    weekData: Array<{ day: string; eng: number; reach: number }>
    totalReach: number; totalEngagement: number
    scheduledPosts: Array<{ id: string; content: string; scheduledAt: string | null; channels: Array<{ channel: { platform: string } }> }>
    channels: Array<{ id: string; platform: string; handle: string; followers: number; isActive: boolean }>
    activity: Array<{ id: string; content: string; platform: string; publishedAt: string }>
  }
  const [stats, setStats] = useState<StatsData>({
    totalPosts: 0, scheduled: 0, published: 0, failed: 0,
    weekData: [], totalReach: 0, totalEngagement: 0,
    scheduledPosts: [], channels: [], activity: [],
  })
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then((d: StatsData) => { setStats(d); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const { scheduled, published, scheduledPosts, channels, weekData, totalReach, totalEngagement, activity } = stats
  const liveChannelCount = channels.length

  const fmtNumber = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n.toLocaleString()

  return (
    <div className="space-y-5 pb-6">
      <div className="flex items-center gap-2 flex-wrap">
        <Button asChild size="sm" className="gap-1.5 text-xs">
          <Link href="/dashboard/compose"><Plus className="w-3.5 h-3.5" /> New Post</Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs border-border">
          <Link href="/dashboard/analytics"><BarChart3 className="w-3.5 h-3.5" /> Analytics</Link>
        </Button>
        <div className="flex-1" />
        {liveChannelCount > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {liveChannelCount} channel{liveChannelCount !== 1 ? 's' : ''} connected
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Total Reach" icon={Eye} trend="up" accent
          value={loading ? '—' : fmtNumber(totalReach)}
          change="Last 30 days"
        />
        <StatCard
          label="Engagement" icon={Heart} trend="up"
          value={loading ? '—' : fmtNumber(totalEngagement)}
          change="Last 30 days"
        />
        <StatCard label="Scheduled" value={loading ? '—' : scheduled} change="upcoming posts" trend="flat" icon={Clock} />
        <StatCard label="Published" value={loading ? '—' : published} change="Total published" trend="flat" icon={CheckCircle2} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-5">
        <div className="space-y-5">
          <Card className="bg-card border-border shadow-sm">
            <div className="flex items-center justify-between px-5 pt-4 pb-2">
              <h2 className="text-sm font-medium text-foreground">Performance This Week</h2>
              <div className="flex rounded-sm overflow-hidden border border-border">
                {([['eng', 'Engagement'], ['reach', 'Reach']] as const).map(([v, l]) => (
                  <button key={v} onClick={() => setChartView(v as 'eng' | 'reach')}
                    className={cn('px-3 py-1 text-[11px] font-medium transition-colors',
                      chartView === v ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted/60')}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div className="px-5 pb-5">
              {loading ? (
                <div className="h-[190px] bg-muted/20 animate-pulse rounded-sm" />
              ) : (
                <ResponsiveContainer width="100%" height={190}>
                  <BarChart data={weekData.length > 0 ? weekData : []} barSize={18}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={35} />
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '4px', fontSize: 11 }} />
                    <Bar dataKey={chartView} fill="oklch(0.520 0.095 178)" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          <Card className="bg-card border-border shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-border">
              <h2 className="text-sm font-medium text-foreground">Recent Activity</h2>
              <Button variant="ghost" size="sm" asChild className="text-xs gap-1 text-accent h-7">
                <Link href="/dashboard/analytics">See all <ArrowRight className="w-3 h-3" /></Link>
              </Button>
            </div>
            {loading ? (
              <div className="divide-y divide-border">
                {[1,2,3].map(i => <div key={i} className="px-4 py-3 h-12 bg-muted/10 animate-pulse" />)}
              </div>
            ) : activity.length === 0 ? (
              <div className="px-4 py-8 text-center text-xs text-muted-foreground">No published posts yet</div>
            ) : (
              <div className="divide-y divide-border">
                {activity.map(item => {
                  const plat = PLATFORMS[item.platform as keyof typeof PLATFORMS]
                  const Icon = plat?.icon
                  return (
                    <div key={item.id} className="px-4 py-3 flex items-start gap-3">
                      {Icon && <Icon className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-foreground line-clamp-1">{item.content}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Published · {new Date(item.publishedAt).toLocaleDateString()} at {new Date(item.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="bg-card border-border shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h2 className="text-sm font-medium text-foreground">Upcoming</h2>
              <Badge className="bg-muted text-muted-foreground border-0 text-[10px]">{scheduled} posts</Badge>
            </div>
            <div className="divide-y divide-border">
              {scheduledPosts.length === 0 ? (
                <div className="px-4 py-6 text-center text-xs text-muted-foreground">No scheduled posts yet</div>
              ) : scheduledPosts.slice(0, 4).map(post => {
                const platform = post.channels[0]?.channel.platform ?? 'x'
                const Icon = PLATFORMS[platform as keyof typeof PLATFORMS]?.icon
                const dt = new Date(post.scheduledAt ?? Date.now())
                return (
                  <div key={post.id} className="px-4 py-3 flex items-start gap-3 hover:bg-muted/30 transition-colors">
                    {Icon && <Icon className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground leading-snug line-clamp-2">{post.content}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {dt.toLocaleDateString()} · {dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="px-4 py-2.5 border-t border-border">
              <Button variant="ghost" asChild size="sm" className="w-full text-xs text-accent hover:bg-accent/5 gap-1">
                <Link href="/dashboard/queue">Full queue <ArrowRight className="w-3 h-3" /></Link>
              </Button>
            </div>
          </Card>

          <Card className="bg-card border-border shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h2 className="text-sm font-medium text-foreground">Channels</h2>
              <Button asChild variant="ghost" size="sm" className="h-6 text-[11px] text-accent hover:bg-accent/5 gap-1">
                <Link href="/dashboard/channels"><Plus className="w-3 h-3" /> Add</Link>
              </Button>
            </div>
            <div className="divide-y divide-border">
              {channels.length === 0 ? (
                <div className="px-4 py-6 text-center text-xs text-muted-foreground">No channels connected yet</div>
              ) : channels.slice(0, 5).map(ch => {
                const plat = PLATFORMS[ch.platform as keyof typeof PLATFORMS]
                const Icon = plat?.icon
                return (
                  <div key={ch.id} className="px-4 py-2.5 flex items-center gap-2.5">
                    <div className="relative">
                      {Icon && <Icon className="w-4 h-4 text-muted-foreground" />}
                      {ch.isActive && <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground truncate">{ch.handle}</p>
                      <p className="text-[10px] text-muted-foreground">{(ch.followers ?? 0).toLocaleString()} followers</p>
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] border-0 px-1.5 h-4">
                      active
                    </Badge>
                  </div>
                )
              })}
            </div>
            {channels.length > 0 && (
              <div className="px-4 py-2.5 border-t border-border">
                <Button variant="ghost" asChild size="sm" className="w-full text-xs text-accent hover:bg-accent/5 gap-1">
                  <Link href="/dashboard/channels">All channels <ArrowRight className="w-3 h-3" /></Link>
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

