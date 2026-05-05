'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Rss, Plus, RefreshCw, Settings, Trash2, ExternalLink,
  CheckCircle2, AlertCircle, Clock,
} from 'lucide-react'
import { MOCK_RSS_FEEDS } from '@/lib/mock-data'
import { PLATFORMS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { RSSFeed } from '@/lib/types'

export default function RSSPage() {
  const [feeds, setFeeds] = useState<RSSFeed[]>(MOCK_RSS_FEEDS)
  const [newUrl, setNewUrl] = useState('')
  const [enabled, setEnabled] = useState<Record<string, boolean>>(
    Object.fromEntries(MOCK_RSS_FEEDS.map(f => [f.id, f.enabled ?? f.isActive]))
  )

  const toggle = (id: string) => setEnabled(prev => ({ ...prev, [id]: !prev[id] }))

  const StatusIcon = ({ feed }: { feed: RSSFeed }) => {
    if (!enabled[feed.id]) return <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
    if (feed.lastError) return <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
    return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
  }

  return (
    <div className="space-y-5 pb-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-card border-border shadow-sm p-4">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">Feeds</p>
          <p className="text-2xl font-light text-foreground mt-1">{feeds.length}</p>
        </Card>
        <Card className="bg-accent/5 border-accent/20 shadow-sm p-4">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">Active</p>
          <p className="text-2xl font-light text-accent mt-1">{Object.values(enabled).filter(Boolean).length}</p>
        </Card>
        <Card className="bg-card border-border shadow-sm p-4">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">Posts Created</p>
          <p className="text-2xl font-light text-foreground mt-1">{feeds.reduce((s, f) => s + (f.postsCreated ?? 0), 0)}</p>
        </Card>
      </div>

      {/* Add feed */}
      <Card className="bg-card border-border shadow-sm p-4">
        <p className="text-xs font-medium text-foreground mb-3">Add RSS Feed</p>
        <div className="flex gap-2">
          <Input
            value={newUrl}
            onChange={e => setNewUrl(e.target.value)}
            placeholder="https://blog.example.com/rss.xml"
            className="flex-1 h-8 text-xs bg-input border-border"
          />
          <Button size="sm" className="gap-1.5 text-xs" disabled={!newUrl.trim()}>
            <Plus className="w-3.5 h-3.5" /> Add Feed
          </Button>
        </div>
      </Card>

      {/* Feed list */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-foreground">Your Feeds</h2>
        {feeds.map(feed => (
          <Card key={feed.id} className={cn('bg-card border-border shadow-sm p-4', !enabled[feed.id] && 'opacity-70')}>
            <div className="flex items-start gap-3">
              <Rss className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <h3 className="text-xs font-medium text-foreground truncate">{feed.name}</h3>
                    <StatusIcon feed={feed} />
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Switch checked={!!enabled[feed.id]} onCheckedChange={() => toggle(feed.id)} className="data-[state=checked]:bg-accent scale-90" />
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground truncate mb-2">{feed.url}</p>
                <div className="flex flex-wrap gap-3 text-[10px] text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Every {feed.checkInterval}
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {feed.postsCreated ?? 0} posts created
                  </div>
                  {feed.lastFetched && (
                    <div className="flex items-center gap-1">
                      <RefreshCw className="w-3 h-3" />
                      Last: {new Date(feed.lastFetched).toLocaleDateString()}
                    </div>
                  )}
                </div>
                {feed.autoPublishPlatforms && feed.autoPublishPlatforms.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-[10px] text-muted-foreground">Auto-post to:</span>
                    <div className="flex gap-1">
                      {feed.autoPublishPlatforms.map(p => {
                        const Icon = PLATFORMS[p]?.icon
                        return Icon ? <Icon key={p} className="w-3.5 h-3.5 text-muted-foreground/60" /> : null
                      })}
                    </div>
                  </div>
                )}
                {feed.lastError && (
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] text-amber-600">
                    <AlertCircle className="w-3 h-3" /> {feed.lastError}
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
