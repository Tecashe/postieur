'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
  Plus, Target, Calendar, BarChart3, CheckCircle2, Clock, TrendingUp,
  Users, Eye, Heart, ChevronRight,
} from 'lucide-react'
import { MOCK_CAMPAIGNS } from '@/lib/mock-data'
import { PLATFORMS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { Campaign } from '@/lib/types'

function StatusBadge({ status }: { status: Campaign['status'] }) {
  const styles = {
    active: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    draft: 'bg-muted text-muted-foreground',
    completed: 'bg-accent/10 text-accent',
    paused: 'bg-amber-500/10 text-amber-600',
  }
  return <Badge className={cn('border-0 text-[10px]', styles[status])}>{status}</Badge>
}

export default function CampaignsPage() {
  const [selected, setSelected] = useState<Campaign | null>(MOCK_CAMPAIGNS[0] ?? null)

  const totalPosts = MOCK_CAMPAIGNS.reduce((s, c) => s + c.postCount, 0)
  const active = MOCK_CAMPAIGNS.filter(c => c.status === 'active').length

  return (
    <div className="space-y-5 pb-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Campaigns', value: MOCK_CAMPAIGNS.length, icon: Target },
          { label: 'Active', value: active, icon: TrendingUp, accent: true },
          { label: 'Total Posts', value: totalPosts, icon: BarChart3 },
          { label: 'Completed', value: MOCK_CAMPAIGNS.filter(c => c.status === 'completed').length, icon: CheckCircle2 },
        ].map(s => (
          <Card key={s.label} className={cn('bg-card border-border shadow-sm p-4', s.accent && 'border-accent/30 bg-accent/5')}>
            <div className="flex items-center justify-between mb-1">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">{s.label}</p>
              <s.icon className={cn('w-3.5 h-3.5', s.accent ? 'text-accent' : 'text-muted-foreground')} />
            </div>
            <p className={cn('text-2xl font-light', s.accent ? 'text-accent' : 'text-foreground')}>{s.value}</p>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-foreground">All Campaigns</h2>
        <Button size="sm" className="gap-1.5 text-xs">
          <Plus className="w-3.5 h-3.5" /> New Campaign
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
        {/* Campaign list */}
        <div className="space-y-3">
          {MOCK_CAMPAIGNS.map(campaign => {
            const progress = Math.round(((campaign.publishedCount ?? 0) / Math.max(campaign.postCount, 1)) * 100)
            return (
              <Card
                key={campaign.id}
                onClick={() => setSelected(campaign)}
                className={cn('bg-card border-border shadow-sm p-5 cursor-pointer hover:border-accent/30 transition-all',
                  selected?.id === campaign.id ? 'border-accent/40 bg-accent/5' : '')}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-medium text-foreground">{campaign.name}</h3>
                      <StatusBadge status={campaign.status} />
                    </div>
                    <p className="text-xs text-muted-foreground">{campaign.description}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                </div>

                <div className="flex items-center gap-4 mb-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(campaign.startDate).toLocaleDateString()} – {new Date(campaign.endDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <BarChart3 className="w-3 h-3" />
                    {campaign.publishedCount}/{campaign.postCount} posts
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">Progress</span>
                    <span className="text-[10px] font-mono text-muted-foreground">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-1.5 bg-muted [&>div]:bg-accent" />
                </div>

                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
                  <div className="flex items-center gap-1"><Eye className="w-3 h-3" />{(campaign.impressions ?? 0).toLocaleString()}</div>
                  <div className="flex items-center gap-1"><Heart className="w-3 h-3" />{(campaign.engagement ?? 0).toLocaleString()}</div>
                  <div className="flex-1" />
                  <div className="flex gap-0.5">
                    {campaign.platforms.slice(0, 4).map(p => {
                      const Icon = PLATFORMS[p]?.icon
                      return Icon ? <Icon key={p} className="w-3.5 h-3.5 text-muted-foreground/60" /> : null
                    })}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Campaign detail */}
        {selected ? (
          <Card className="bg-card border-border shadow-sm">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="text-sm font-medium text-foreground">{selected.name}</h3>
              <StatusBadge status={selected.status} />
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest mb-1.5">Description</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{selected.description}</p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest mb-2">Platforms</p>
                <div className="flex flex-wrap gap-2">
                  {selected.platforms.map(p => {
                    const plat = PLATFORMS[p]
                    const Icon = plat?.icon
                    return (
                      <div key={p} className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-muted text-xs text-muted-foreground">
                        {Icon && <Icon className="w-3.5 h-3.5" />}
                        {plat?.name}
                      </div>
                    )
                  })}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Posts', value: selected.postCount },
                  { label: 'Published', value: selected.publishedCount ?? 0 },
                  { label: 'Impressions', value: (selected.impressions ?? 0).toLocaleString() },
                  { label: 'Engagement', value: (selected.engagement ?? 0).toLocaleString() },
                ].map(m => (
                  <div key={m.label} className="bg-muted/40 rounded-sm p-3">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{m.label}</p>
                    <p className="text-lg font-light text-foreground">{m.value}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 text-xs border-border">Edit</Button>
                <Button size="sm" className="flex-1 text-xs">View Posts</Button>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="bg-card border-border shadow-sm flex items-center justify-center h-48">
            <p className="text-sm text-muted-foreground">Select a campaign</p>
          </Card>
        )}
      </div>
    </div>
  )
}
