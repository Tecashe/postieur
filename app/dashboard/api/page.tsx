'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import {
  Key, Globe, Plus, Copy, Trash2, Check, CheckCircle2, XCircle,
  RefreshCw, AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ApiKey {
  id: string; name: string; prefix: string; scopes: string[]
  status: 'ACTIVE' | 'REVOKED'; lastUsedAt: string | null; createdAt: string
}
interface WebhookEndpoint {
  id: string; name: string; url: string; events: string[]; isActive: boolean
  successCount: number; failureCount: number; lastTriggeredAt: string | null; createdAt: string
}

const WEBHOOK_EVENTS = ['post.published', 'post.failed', 'post.scheduled', 'auto_action.triggered']

export default function APIPage() {
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState<string | null>(null)
  const [newKeyDialog, setNewKeyDialog] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [newKeyScopes, setNewKeyScopes] = useState<string[]>([])
  const [generatedKey, setGeneratedKey] = useState<string | null>(null)
  const [newWebhookDialog, setNewWebhookDialog] = useState(false)
  const [webhookForm, setWebhookForm] = useState({ name: '', url: '', events: [] as string[] })
  const [saving, setSaving] = useState(false)
  const [newWebhookSecret, setNewWebhookSecret] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    const [kr, wr] = await Promise.all([
      fetch('/api/api-keys').then(r => r.json()),
      fetch('/api/webhooks-config').then(r => r.json()),
    ])
    setKeys(kr.keys ?? [])
    setWebhooks(wr.webhooks ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id); setTimeout(() => setCopied(null), 2000)
  }

  const handleGenerateKey = async () => {
    if (!newKeyName.trim()) return
    setSaving(true)
    const res = await fetch('/api/api-keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newKeyName.trim(), scopes: newKeyScopes }),
    })
    const data = await res.json()
    setGeneratedKey(data.raw)
    setSaving(false)
    await loadData()
  }

  const handleRevokeKey = async (id: string) => {
    await fetch(`/api/api-keys/${id}`, { method: 'DELETE' })
    setKeys(prev => prev.map(k => k.id === id ? { ...k, status: 'REVOKED' as const } : k))
  }

  const handleCreateWebhook = async () => {
    if (!webhookForm.name || !webhookForm.url) return
    setSaving(true)
    const res = await fetch('/api/webhooks-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(webhookForm),
    })
    const data = await res.json()
    setNewWebhookSecret(data.webhook?.secret ?? null)
    setSaving(false)
    await loadData()
  }

  const handleDeleteWebhook = async (id: string) => {
    await fetch(`/api/webhooks-config/${id}`, { method: 'DELETE' })
    setWebhooks(prev => prev.filter(w => w.id !== id))
  }

  const toggleEvent = (event: string, selected: string[], onChange: (e: string[]) => void) => {
    onChange(selected.includes(event) ? selected.filter(e => e !== event) : [...selected, event])
  }

  return (
    <div className="space-y-5 pb-6">
      <Tabs defaultValue="keys">
        <div className="flex items-center justify-between mb-4">
          <TabsList className="bg-muted/50 border border-border h-8 p-0.5">
            <TabsTrigger value="keys" className="h-7 text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm gap-1.5">
              <Key className="w-3 h-3" /> API Keys
            </TabsTrigger>
            <TabsTrigger value="webhooks" className="h-7 text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm gap-1.5">
              <Globe className="w-3 h-3" /> Webhooks
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="keys" className="mt-0 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{keys.filter(k => k.status === 'ACTIVE').length} active key{keys.filter(k => k.status === 'ACTIVE').length !== 1 ? 's' : ''}</p>
            <Button size="sm" className="gap-1.5 text-xs" onClick={() => { setNewKeyDialog(true); setGeneratedKey(null); setNewKeyName('') }}>
              <Plus className="w-3.5 h-3.5" /> Generate Key
            </Button>
          </div>

          <Card className="p-4 bg-primary/5 border-primary/20">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Key className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">REST API</p>
                <p className="text-xs text-muted-foreground mt-0.5">Use keys to integrate with N8N, Make, Zapier, or your own code.
                  Pass as <code className="bg-muted px-1 py-0.5 rounded text-[10px]">Authorization: Bearer cael_live_...</code></p>
                <div className="mt-2 flex gap-2 text-xs text-muted-foreground flex-wrap">
                  {['/api/v1/posts', '/api/v1/channels', '/api/v1/analytics'].map(ep => (
                    <code key={ep} className="bg-muted px-1.5 py-0.5 rounded">{ep}</code>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <div className="space-y-2">
            {loading ? (
              Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-16 rounded-lg bg-muted/40 animate-pulse" />)
            ) : keys.length === 0 ? (
              <Card className="p-8 text-center text-muted-foreground">
                <Key className="w-8 h-8 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No API keys yet</p>
              </Card>
            ) : keys.map(k => (
              <Card key={k.id} className={cn('p-3.5 flex items-center gap-3', k.status === 'REVOKED' && 'opacity-50')}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium truncate">{k.name}</span>
                    <Badge variant={k.status === 'ACTIVE' ? 'default' : 'secondary'} className="text-[10px] h-4 px-1.5">{k.status}</Badge>
                  </div>
                  <code className="text-[11px] text-muted-foreground font-mono">{k.prefix}</code>
                  {k.lastUsedAt && <p className="text-[10px] text-muted-foreground mt-0.5">Last used {new Date(k.lastUsedAt).toLocaleDateString()}</p>}
                </div>
                {k.status === 'ACTIVE' && (
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleRevokeKey(k.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="webhooks" className="mt-0 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{webhooks.length} endpoint{webhooks.length !== 1 ? 's' : ''}</p>
            <Button size="sm" className="gap-1.5 text-xs" onClick={() => { setNewWebhookDialog(true); setNewWebhookSecret(null); setWebhookForm({ name: '', url: '', events: [] }) }}>
              <Plus className="w-3.5 h-3.5" /> Add Endpoint
            </Button>
          </div>

          <div className="space-y-2">
            {loading ? (
              Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-20 rounded-lg bg-muted/40 animate-pulse" />)
            ) : webhooks.length === 0 ? (
              <Card className="p-8 text-center text-muted-foreground">
                <Globe className="w-8 h-8 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No webhook endpoints yet</p>
              </Card>
            ) : webhooks.map(w => (
              <Card key={w.id} className="p-3.5">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium">{w.name}</span>
                      <Badge variant={w.isActive ? 'default' : 'secondary'} className="text-[10px] h-4 px-1.5">{w.isActive ? 'Active' : 'Disabled'}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono truncate">{w.url}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> {w.successCount} ok</span>
                      <span className="flex items-center gap-1"><XCircle className="w-3 h-3 text-destructive" /> {w.failureCount} failed</span>
                      {w.lastTriggeredAt && <span>Last: {new Date(w.lastTriggeredAt).toLocaleDateString()}</span>}
                    </div>
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {w.events.map(e => <code key={e} className="text-[10px] bg-muted px-1 py-0.5 rounded">{e}</code>)}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive flex-shrink-0" onClick={() => handleDeleteWebhook(w.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={newKeyDialog} onOpenChange={(o) => { if (!o) { setNewKeyDialog(false); setGeneratedKey(null) } }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Generate API Key</DialogTitle></DialogHeader>
          {generatedKey ? (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg flex gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 dark:text-amber-200">Copy this key now — it will not be shown again.</p>
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs font-mono bg-muted px-3 py-2 rounded truncate">{generatedKey}</code>
                <Button variant="outline" size="icon" className="h-8 w-8 flex-shrink-0" onClick={() => handleCopy('new', generatedKey)}>
                  {copied === 'new' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </Button>
              </div>
              <DialogFooter>
                <Button onClick={() => { setNewKeyDialog(false); setGeneratedKey(null) }}>Done</Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Key Name</Label>
                <Input placeholder="e.g. N8N Production" value={newKeyName} onChange={e => setNewKeyName(e.target.value)} className="h-8 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Scopes</Label>
                <div className="flex gap-2 flex-wrap">
                  {['posts:read', 'posts:write', 'channels:read', 'analytics:read'].map(s => (
                    <button key={s} onClick={() => toggleEvent(s, newKeyScopes, setNewKeyScopes)}
                      className={cn('text-xs px-2 py-1 rounded-md border transition-colors', newKeyScopes.includes(s) ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted')}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setNewKeyDialog(false)}>Cancel</Button>
                <Button onClick={handleGenerateKey} disabled={!newKeyName.trim() || saving}>
                  {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}Generate
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={newWebhookDialog} onOpenChange={(o) => { if (!o) { setNewWebhookDialog(false); setNewWebhookSecret(null) } }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Webhook Endpoint</DialogTitle></DialogHeader>
          {newWebhookSecret ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Webhook created! Save your signing secret.</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs font-mono bg-muted px-3 py-2 rounded truncate">{newWebhookSecret}</code>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleCopy('secret', newWebhookSecret)}>
                  {copied === 'secret' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </Button>
              </div>
              <DialogFooter>
                <Button onClick={() => { setNewWebhookDialog(false); setNewWebhookSecret(null) }}>Done</Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Name</Label>
                <Input placeholder="e.g. Slack notifications" value={webhookForm.name} onChange={e => setWebhookForm(f => ({ ...f, name: e.target.value }))} className="h-8 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Endpoint URL</Label>
                <Input placeholder="https://..." value={webhookForm.url} onChange={e => setWebhookForm(f => ({ ...f, url: e.target.value }))} className="h-8 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Events</Label>
                <div className="flex gap-2 flex-wrap">
                  {WEBHOOK_EVENTS.map(ev => (
                    <button key={ev} onClick={() => toggleEvent(ev, webhookForm.events, (e) => setWebhookForm(f => ({ ...f, events: e })))}
                      className={cn('text-xs px-2 py-1 rounded-md border transition-colors', webhookForm.events.includes(ev) ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted')}>
                      {ev}
                    </button>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setNewWebhookDialog(false)}>Cancel</Button>
                <Button onClick={handleCreateWebhook} disabled={!webhookForm.name || !webhookForm.url || saving}>
                  {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}Create
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
