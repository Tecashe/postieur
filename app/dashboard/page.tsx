'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ActivityTable } from '@/components/dashboard/activity-table'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import {
  TrendingUp, TrendingDown, Clock, CheckCircle2, Plus,
  ArrowRight, Flame, BarChart3, Eye, Heart,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { MOCK_POSTS, MOCK_CHANNELS, MOCK_ACTIVITY } from '@/lib/mock-data'
import { PLATFORMS } from '@/lib/constants'

const WEEK_DATA = [
  { day: 'Mon', eng: 240, reach: 4200 },
  { day: 'Tue', eng: 320, reach: 5100 },
  { day: 'Wed', eng: 280, reach: 6800 },
  { day: 'Thu', eng: 180, reach: 3900 },
  { day: 'Fri', eng: 420, reach: 8200 },
  { day: 'Sat', eng: 350, reach: 7100 },
  { day: 'Sun', eng: 280, reach: 5600 },
]

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
  const published = MOCK_POSTS.filter(p => p.status === 'published')
  const scheduled = MOCK_POSTS.filter(p => p.status === 'scheduled')
  const drafts = MOCK_POSTS.filter(p => p.status === 'draft')
  const totalLikes = published.reduce((s, p) => s + (p.engagement?.likes ?? 0), 0)
  const totalComments = published.reduce((s, p) => s + (p.engagement?.comments ?? 0), 0)
  const totalShares = published.reduce((s, p) => s + (p.engagement?.shares ?? 0), 0)
  const connectedChannels = MOCK_CHANNELS.filter(c => c.isConnected)
  const liveChannels = connectedChannels.filter(c => c.live)

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
        {liveChannels.length > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {liveChannels.length} channel{liveChannels.length !== 1 ? 's' : ''} live
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Reach" value="124.8K" change="+18% this week" trend="up" icon={Eye} accent />
        <StatCard label="Engagement" value={(totalLikes + totalComments + totalShares || 8421).toLocaleString()} change="+23% this week" trend="up" icon={Heart} />
        <StatCard label="Scheduled" value={scheduled.length} change={`${drafts.length} drafts pending`} trend="flat" icon={Clock} />
        <StatCard label="Published" value={published.length} change="Last 30 days" trend="flat" icon={CheckCircle2} />
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
              <ResponsiveContainer width="100%" height={190}>
                <BarChart data={WEEK_DATA} barSize={18}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={35} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '4px', fontSize: 11 }} />
                  <Bar dataKey={chartView} fill="oklch(0.520 0.095 178)" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="bg-card border-border shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-border">
              <h2 className="text-sm font-medium text-foreground">Recent Activity</h2>
              <Button variant="ghost" size="sm" asChild className="text-xs gap-1 text-accent h-7">
                <Link href="/dashboard/analytics">See all <ArrowRight className="w-3 h-3" /></Link>
              </Button>
            </div>
            <ActivityTable items={MOCK_ACTIVITY.slice(0, 5)} />
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="bg-card border-border shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h2 className="text-sm font-medium text-foreground">Upcoming</h2>
              <Badge className="bg-muted text-muted-foreground border-0 text-[10px]">{scheduled.length} posts</Badge>
            </div>
            <div className="divide-y divide-border">
              {scheduled.slice(0, 4).map(post => {
                const Icon = PLATFORMS[post.platforms[0]]?.icon
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
              {connectedChannels.slice(0, 5).map(ch => {
                const plat = PLATFORMS[ch.platform]
                const Icon = plat.icon
                return (
                  <div key={ch.id} className="px-4 py-2.5 flex items-center gap-2.5">
                    <div className="relative">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                      {ch.live && <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground truncate">{ch.handle}</p>
                      <p className="text-[10px] text-muted-foreground">{ch.followers.toLocaleString()}</p>
                    </div>
                    <Badge className={cn('text-[9px] border-0 px-1.5 h-4',
                      ch.health === 'good' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                      ch.health === 'warning' ? 'bg-amber-500/10 text-amber-600' : 'bg-muted text-muted-foreground')}>
                      {ch.health}
                    </Badge>
                  </div>
                )
              })}
            </div>
          </Card>

          <Card className="bg-accent/5 border-accent/20 shadow-sm p-4">
            <div className="flex gap-3">
              <Flame className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-foreground">Best time today</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">LinkedIn · 2:00–3:00 PM (4.2× reach)</p>
                <Button asChild variant="ghost" size="sm" className="h-6 mt-2 text-[11px] text-accent hover:bg-accent/10 p-0 gap-1">
                  <Link href="/dashboard/compose">Schedule now <ArrowRight className="w-3 h-3" /></Link>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
