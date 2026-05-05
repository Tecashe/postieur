'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Rss, Plus, Trash2, RefreshCw, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RssFeed { id: string; name: string; url: string; isEnabled: boolean; checkIntervalHours: number; autoPublishChannelIds: string[]; lastFetchedAt: string | null; lastError: string | null; postsCreated: number; createdAt: string }

export default function RssPage() {
  const [feeds, setFeeds] = useState<RssFeed[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', url: '', checkIntervalHours: 6, isEnabled: true })

  const load = useCallback(async () => {
    setLoading(true)
    const r = await fetch('/api/rss').then(r => r.json())
    setFeeds(r.feeds ?? [])
    setLoading(false)
  }, [])
  useEffect(() => { load() }, [load])

  const handleCreate = async () => {
    if (!form.name || !form.url) return
    setSaving(true)
    await fetch('/api/rss', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setSaving(false); setShowDialog(false); await load()
  }

  const handleToggle = async (id: string, isEnabled: boolean) => {
    await fetch(`/api/rss/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isEnabled }) })
    setFeeds(prev => prev.map(f => f.id === id ? { ...f, isEnabled } : f))
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/rss/${id}`, { method: 'DELETE' })
    setFeeds(prev => prev.filter(f => f.id !== id))
  }

  return (
    <div className="space-y-5 pb-6">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{feeds.length} feed{feeds.length !== 1 ? 's' : ''}</p>
        <Button size="sm" className="gap-1.5 text-xs" onClick={() => { setForm({ name: '', url: '', checkIntervalHours: 6, isEnabled: true }); setShowDialog(true) }}>
          <Plus className="w-3.5 h-3.5" /> Add Feed
        </Button>
      </div>

      <Card className="p-4 bg-primary/5 border-primary/20">
        <div className="flex items-start gap-3">
          <Rss className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium">RSS Auto-posting</p>
            <p className="text-xs text-muted-foreground mt-0.5">Automatically create posts from RSS feeds. The cron runs every 30 minutes and creates draft posts (or schedules them if you select target channels).</p>
          </div>
        </div>
      </Card>

      {loading ? (
        Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-24 rounded-lg bg-muted/40 animate-pulse" />)
      ) : feeds.length === 0 ? (
        <Card className="p-12 text-center">
          <Rss className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">No RSS feeds configured</p>
          <Button size="sm" className="mt-4 gap-1.5 text-xs" onClick={() => setShowDialog(true)}><Plus className="w-3.5 h-3.5" /> Add your first feed</Button>
        </Card>
      ) : (
        <div className="space-y-2">
          {feeds.map(f => (
            <Card key={f.id} className="p-3.5">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="text-sm font-medium">{f.name}</span>
                    <Badge variant={f.isEnabled ? 'default' : 'secondary'} className="text-[10px] h-4 px-1.5">{f.isEnabled ? 'Active' : 'Paused'}</Badge>
                    {f.lastError && <Badge variant="destructive" className="text-[10px] h-4 px-1.5">Error</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground font-mono truncate">{f.url}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Every {f.checkIntervalHours}h</span>
                    <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> {f.postsCreated} posts created</span>
                    {f.lastFetchedAt && <span>Last: {new Date(f.lastFetchedAt).toLocaleString()}</span>}
                    {f.lastError && <span className="text-destructive flex items-center gap-1"><XCircle className="w-3 h-3" />{f.lastError.slice(0, 60)}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Switch checked={f.isEnabled} onCheckedChange={v => handleToggle(f.id, v)} className="scale-75 origin-right" />
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(f.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add RSS Feed</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Feed Name</Label>
              <Input className="h-8 text-sm" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. TechCrunch" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">RSS URL</Label>
              <Input className="h-8 text-sm" value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} placeholder="https://example.com/rss.xml" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Check interval</Label>
              <select className="w-full h-8 text-sm rounded-md border border-input bg-background px-2" value={form.checkIntervalHours} onChange={e => setForm(f => ({ ...f, checkIntervalHours: Number(e.target.value) }))}>
                {[1, 2, 4, 6, 12, 24].map(h => <option key={h} value={h}>Every {h} hour{h !== 1 ? 's' : ''}</option>)}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!form.name || !form.url || saving}>
              {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}Add Feed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
