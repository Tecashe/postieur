'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import {
  Plus, Search, Settings, CheckCircle2, AlertCircle,
  Users, BarChart3, RefreshCw, Trash2, AlertTriangle, KeyRound,
} from 'lucide-react'
import { PLATFORMS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { Platform } from '@/lib/types'

type DbChannel = {
  id: string
  platform: string
  handle: string
  displayName: string | null
  isActive: boolean
  followers: number
  avatarUrl: string | null
  tokenExpiry: string | null // ISO string
}

// Platforms that use standard OAuth redirect flow
const OAUTH_PLATFORMS = new Set([
  'x', 'linkedin', 'facebook', 'instagram', 'reddit', 'youtube', 'discord', 'threads',
])
// Platforms that use custom connection modals
const CUSTOM_PLATFORMS = new Set(['bluesky', 'telegram'])
// Platforms not yet implemented
const COMING_SOON_PLATFORMS = new Set([
  'tiktok', 'mastodon', 'slack', 'pinterest', 'snapchat', 'medium', 'devto',
  'hashnode', 'wordpress', 'dribbble', 'vk', 'nostr', 'warpcast', 'twitch',
])

const PLATFORM_GROUPS: { label: string; platforms: Platform[] }[] = [
  { label: 'Social', platforms: ['instagram', 'facebook', 'threads', 'snapchat', 'tiktok', 'pinterest'] },
  { label: 'Professional', platforms: ['linkedin'] },
  { label: 'Micro-blogging', platforms: ['x', 'bluesky', 'mastodon', 'nostr', 'warpcast'] },
  { label: 'Video', platforms: ['youtube', 'twitch'] },
  { label: 'Community', platforms: ['discord', 'reddit', 'telegram', 'slack'] },
  { label: 'Publishing', platforms: ['medium', 'devto', 'hashnode', 'wordpress'] },
  { label: 'Other', platforms: ['dribbble', 'vk'] },
]

/** Returns 'ok' | 'expiring' (< 24 h) | 'expired' | 'never' (bot tokens etc.) */
function tokenHealth(tokenExpiry: string | null): 'ok' | 'expiring' | 'expired' | 'never' {
  if (!tokenExpiry) return 'never'
  const exp = new Date(tokenExpiry).getTime()
  const now = Date.now()
  if (exp < now) return 'expired'
  if (exp - now < 24 * 60 * 60_000) return 'expiring'
  return 'ok'
}


export default function ChannelsPage() {
  const [search, setSearch] = useState('')
  const [channels, setChannels] = useState<DbChannel[]>([])
  const [loading, setLoading] = useState(true)

  // Bluesky modal
  const [blueskyOpen, setBlueskyOpen] = useState(false)
  const [bskyIdentifier, setBskyIdentifier] = useState('')
  const [bskyPassword, setBskyPassword] = useState('')
  const [bskyError, setBskyError] = useState('')
  const [bskyLoading, setBskyLoading] = useState(false)

  // Telegram modal
  const [telegramOpen, setTelegramOpen] = useState(false)
  const [tgBotToken, setTgBotToken] = useState('')
  const [tgChatId, setTgChatId] = useState('')
  const [tgError, setTgError] = useState('')
  const [tgLoading, setTgLoading] = useState(false)

  const fetchChannels = () => {
    setLoading(true)
    fetch('/api/channels')
      .then(r => r.json())
      .then((data: DbChannel[]) => setChannels(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchChannels() }, [])

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

  const handleConnectBluesky = async () => {
    setBskyError('')
    setBskyLoading(true)
    try {
      const res = await fetch('/api/channels/connect/bluesky', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: bskyIdentifier, password: bskyPassword }),
      })
      const data = await res.json() as { connected?: boolean; error?: string }
      if (!res.ok || data.error) { setBskyError(data.error ?? 'Connection failed'); return }
      setBlueskyOpen(false)
      setBskyIdentifier(''); setBskyPassword('')
      fetchChannels()
    } catch { setBskyError('Network error') }
    finally { setBskyLoading(false) }
  }

  const handleConnectTelegram = async () => {
    setTgError('')
    setTgLoading(true)
    try {
      const res = await fetch('/api/channels/connect/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botToken: tgBotToken, chatId: tgChatId }),
      })
      const data = await res.json() as { connected?: boolean; error?: string }
      if (!res.ok || data.error) { setTgError(data.error ?? 'Connection failed'); return }
      setTelegramOpen(false)
      setTgBotToken(''); setTgChatId('')
      fetchChannels()
    } catch { setTgError('Network error') }
    finally { setTgLoading(false) }
  }

  const handlePlatformConnect = (platform: Platform) => {
    if (CUSTOM_PLATFORMS.has(platform)) {
      if (platform === 'bluesky') { setBskyError(''); setBlueskyOpen(true) }
      if (platform === 'telegram') { setTgError(''); setTelegramOpen(true) }
    } else if (OAUTH_PLATFORMS.has(platform)) {
      window.location.href = `/api/oauth/${platform}`
    }
    // COMING_SOON_PLATFORMS — do nothing (button is disabled)
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
          <Button variant="outline" size="sm" className="gap-1.5 text-xs border-border" onClick={fetchChannels}>
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
              const health = tokenHealth(ch.tokenExpiry)
              return (
                <Card key={ch.id} className={cn(
                  'bg-card border-border shadow-sm p-4 transition-all',
                  health === 'expired' && 'border-destructive/30',
                  health === 'expiring' && 'border-amber-500/30',
                )}>
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-9 h-9 rounded-sm bg-muted flex items-center justify-center flex-shrink-0">
                      {Icon && <Icon className="w-5 h-5 text-muted-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <h3 className="text-xs font-medium text-foreground truncate">{ch.handle}</h3>
                        {ch.isActive && health === 'ok' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />}
                        {health === 'expiring' && <AlertTriangle className="w-3 h-3 text-amber-500 flex-shrink-0" aria-label="Token expiring soon — reconnect" />}
                        {health === 'expired' && <AlertTriangle className="w-3 h-3 text-destructive flex-shrink-0" aria-label="Token expired — reconnect required" />}
                      </div>
                      <p className="text-[10px] text-muted-foreground">{plat?.name ?? ch.platform}</p>
                    </div>
                    {health === 'expired'
                      ? <AlertCircle className="w-3.5 h-3.5 text-destructive flex-shrink-0" />
                      : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />}
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-muted/40 rounded-sm p-2">
                      <p className="text-[9px] text-muted-foreground uppercase tracking-wide">Followers</p>
                      <p className="text-sm font-medium text-foreground">{ch.followers.toLocaleString()}</p>
                    </div>
                    <div className="bg-muted/40 rounded-sm p-2">
                      <p className="text-[9px] text-muted-foreground uppercase tracking-wide">Token</p>
                      <p className={cn(
                        'text-sm font-medium',
                        health === 'ok' || health === 'never' ? 'text-emerald-600' : health === 'expiring' ? 'text-amber-600' : 'text-destructive',
                      )}>
                        {health === 'never' ? 'Permanent' : health === 'ok' ? 'Valid' : health === 'expiring' ? 'Expiring' : 'Expired'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    {(health === 'expired' || health === 'expiring') && OAUTH_PLATFORMS.has(ch.platform) && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 h-7 text-[11px] border-amber-500/40 text-amber-700 gap-1"
                        onClick={() => { window.location.href = `/api/oauth/${ch.platform}` }}
                      >
                        <KeyRound className="w-3 h-3" /> Reconnect
                      </Button>
                    )}
                    {health !== 'expired' && health !== 'expiring' && (
                      <Button variant="outline" size="sm" className="flex-1 h-7 text-[11px] border-border gap-1">
                        <Settings className="w-3 h-3" /> Settings
                      </Button>
                    )}
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
                  const isComingSoon = COMING_SOON_PLATFORMS.has(platform)
                  return (
                    <button
                      key={platform}
                      disabled={alreadyConnected || isComingSoon}
                      onClick={() => handlePlatformConnect(platform)}
                      title={isComingSoon ? 'Coming soon' : alreadyConnected ? 'Already connected' : `Connect ${plat?.name}`}
                      className={cn(
                        'flex flex-col items-center gap-2 p-3 rounded-sm border text-center transition-all',
                        alreadyConnected
                          ? 'border-emerald-500/20 bg-emerald-500/5 cursor-default'
                          : isComingSoon
                          ? 'border-border bg-muted/20 opacity-40 cursor-not-allowed'
                          : 'border-border hover:border-accent/40 hover:bg-accent/5 cursor-pointer',
                      )}
                    >
                      {Icon && <Icon className="w-5 h-5 text-muted-foreground" />}
                      <span className="text-[10px] text-muted-foreground">{plat?.name}</span>
                      {alreadyConnected ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      ) : isComingSoon ? (
                        <span className="text-[9px] text-muted-foreground/50">soon</span>
                      ) : (
                        <Plus className="w-3 h-3 text-muted-foreground/40" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bluesky modal */}
      <Dialog open={blueskyOpen} onOpenChange={setBlueskyOpen}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm font-medium">Connect Bluesky</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Enter your Bluesky handle and an{' '}
              <a href="https://bsky.app/settings/app-passwords" target="_blank" rel="noreferrer" className="underline text-accent">
                App Password
              </a>{' '}
              (never your main password).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <Label className="text-[11px] uppercase tracking-widest text-muted-foreground">Handle or email</Label>
              <Input value={bskyIdentifier} onChange={e => setBskyIdentifier(e.target.value)} placeholder="alice.bsky.social" className="mt-1.5 h-8 text-sm bg-input border-border" />
            </div>
            <div>
              <Label className="text-[11px] uppercase tracking-widest text-muted-foreground">App Password</Label>
              <Input type="password" value={bskyPassword} onChange={e => setBskyPassword(e.target.value)} placeholder="xxxx-xxxx-xxxx-xxxx" className="mt-1.5 h-8 text-sm bg-input border-border" />
            </div>
            {bskyError && <p className="text-xs text-destructive">{bskyError}</p>}
            <Button onClick={handleConnectBluesky} disabled={bskyLoading || !bskyIdentifier || !bskyPassword} className="w-full">
              {bskyLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin mr-2" /> : null}
              {bskyLoading ? 'Connecting...' : 'Connect Bluesky'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Telegram modal */}
      <Dialog open={telegramOpen} onOpenChange={setTelegramOpen}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm font-medium">Connect Telegram</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Create a bot via{' '}
              <a href="https://t.me/BotFather" target="_blank" rel="noreferrer" className="underline text-accent">
                @BotFather
              </a>
              , add it as an admin to your channel, then paste the token and channel ID below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <Label className="text-[11px] uppercase tracking-widest text-muted-foreground">Bot Token</Label>
              <Input value={tgBotToken} onChange={e => setTgBotToken(e.target.value)} placeholder="123456:ABC-DEF..." className="mt-1.5 h-8 text-sm bg-input border-border font-mono" />
            </div>
            <div>
              <Label className="text-[11px] uppercase tracking-widest text-muted-foreground">Channel / Chat ID</Label>
              <Input value={tgChatId} onChange={e => setTgChatId(e.target.value)} placeholder="@mychannel or -1001234567890" className="mt-1.5 h-8 text-sm bg-input border-border" />
            </div>
            {tgError && <p className="text-xs text-destructive">{tgError}</p>}
            <Button onClick={handleConnectTelegram} disabled={tgLoading || !tgBotToken || !tgChatId} className="w-full">
              {tgLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin mr-2" /> : null}
              {tgLoading ? 'Connecting...' : 'Connect Telegram'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
