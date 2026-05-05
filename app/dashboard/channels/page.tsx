'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Plus, Search, Settings, CheckCircle2, AlertCircle,
  Users, BarChart3, RefreshCw, Trash2,
} from 'lucide-react'
import { PLATFORMS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { Platform } from '@/lib/types'

type DbChannel = {
  id: string; platform: string; handle: string; displayName: string | null
  isActive: boolean; followers: number; avatarUrl: string | null
}

const PLATFORM_GROUPS: { label: string; platforms: Platform[] }[] = [
  { label: 'Social', platforms: ['instagram', 'facebook', 'threads', 'snapchat', 'tiktok', 'pinterest'] },
  { label: 'Professional', platforms: ['linkedin'] },
  { label: 'Micro-blogging', platforms: ['x', 'bluesky', 'mastodon', 'nostr', 'warpcast'] },
  { label: 'Video', platforms: ['youtube', 'twitch'] },
  { label: 'Community', platforms: ['discord', 'reddit', 'telegram', 'slack'] },
  { label: 'Publishing', platforms: ['medium', 'devto', 'hashnode', 'wordpress'] },
  { label: 'Other', platforms: ['dribbble', 'vk'] },
]

export default function ChannelsPage() {
  const [search, setSearch] = useState('')
  const [channels, setChannels] = useState<DbChannel[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/channels')
      .then(r => r.json())
      .then((data: DbChannel[]) => setChannels(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const searchFiltered = channels.filter(c =>
    !search || c.handle.toLowerCase().includes(search.toLowerCase()) ||
    c.platform.toLowerCase().includes(search.toLowerCase())
  )

  const handleDisconnect = async (id: string) => {
    try {
      await fetch(`/api/channels/${id}`, { method: 'DELETE' })
      setChannels(prev => prev.filter(c => c.id !== id))
    } catch { /* ignore */ }
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Connected', value: channels.length, icon: CheckCircle2, accent: true },
          { label: 'Total Followers', value: channels.reduce((s, c) => s + c.followers, 0).toLocaleString(), icon: Users },
          { label: 'Active Channels', value: channels.filter(c => c.isActive).length, icon: BarChart3 },
          { label: 'Platforms', value: new Set(channels.map(c => c.platform)).size, icon: AlertCircle },
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

      {/* Connected channels */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search channels..." className="pl-8 h-8 text-xs bg-input border-border" />
          </div>
          <div className="flex-1" />
          <Button variant="outline" size="sm" className="gap-1.5 text-xs border-border" onClick={() => { setLoading(true); fetch('/api/channels').then(r => r.json()).then(setChannels).finally(() => setLoading(false)) }}>
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[1,2,3].map(i => <div key={i} className="h-36 rounded-sm bg-muted/30 animate-pulse" />)}
          </div>
        ) : searchFiltered.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            {channels.length === 0 ? 'No channels connected yet. Connect one below.' : 'No channels match your search.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {searchFiltered.map(ch => {
              const plat = PLATFORMS[ch.platform as keyof typeof PLATFORMS]
              const Icon = plat?.icon
              return (
                <Card key={ch.id} className="bg-card border-border shadow-sm p-4 hover:border-border transition-all">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-9 h-9 rounded-sm bg-muted flex items-center justify-center flex-shrink-0">
                      {Icon && <Icon className="w-5 h-5 text-muted-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <h3 className="text-xs font-medium text-foreground truncate">{ch.handle}</h3>
                        {ch.isActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />}
                      </div>
                      <p className="text-[10px] text-muted-foreground">{plat?.name ?? ch.platform}</p>
                    </div>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-muted/40 rounded-sm p-2">
                      <p className="text-[9px] text-muted-foreground uppercase tracking-wide">Followers</p>
                      <p className="text-sm font-medium text-foreground">{ch.followers.toLocaleString()}</p>
                    </div>
                    <div className="bg-muted/40 rounded-sm p-2">
                      <p className="text-[9px] text-muted-foreground uppercase tracking-wide">Status</p>
                      <p className="text-sm font-medium text-foreground">{ch.isActive ? 'Active' : 'Paused'}</p>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <Button variant="outline" size="sm" className="flex-1 h-7 text-[11px] border-border gap-1">
                      <Settings className="w-3 h-3" /> Settings
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive" onClick={() => handleDisconnect(ch.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Connect new */}
      <div>
        <h2 className="text-sm font-medium text-foreground mb-4">Connect a Platform</h2>
        <div className="space-y-5">
          {PLATFORM_GROUPS.map(group => (
            <div key={group.label}>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest mb-2">{group.label}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {group.platforms.map(platform => {
                  const plat = PLATFORMS[platform]
                  const Icon = plat?.icon
                  const alreadyConnected = channels.some(c => c.platform === platform)
                  return (
                    <a
                      key={platform}
                      href={alreadyConnected ? undefined : `/api/oauth/${platform}`}
                      aria-disabled={alreadyConnected}
                      className={cn(
                        'flex flex-col items-center gap-2 p-3 rounded-sm border text-center transition-all',
                        alreadyConnected
                          ? 'border-emerald-500/20 bg-emerald-500/5 cursor-default pointer-events-none'
                          : 'border-border hover:border-accent/40 hover:bg-accent/5 cursor-pointer'
                      )}
                    >
                      {Icon && <Icon className="w-5 h-5 text-muted-foreground" />}
                      <span className="text-[10px] text-muted-foreground">{plat?.name}</span>
                      {alreadyConnected ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Plus className="w-3 h-3 text-muted-foreground/40" />
                      )}
                    </a>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
