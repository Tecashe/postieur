'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Zap, Plus, Trash2, RefreshCw } from 'lucide-react'

interface AutoAction { id: string; name: string; trigger: string; action: string; isEnabled: boolean; metadata: Record<string,unknown>; executionCount: number; createdAt: string }

const TRIGGERS = ['FOLLOWER_MILESTONE','POST_PUBLISHED','SCHEDULED_TIME','NEW_COMMENT','ENGAGEMENT_MILESTONE']
const ACTIONS = ['NOTIFY_WEBHOOK','CREATE_POST','SEND_EMAIL','AUTO_LIKE','AUTO_COMMENT','AUTO_REPOST']
const TRIGGER_LABELS: Record<string,string> = { FOLLOWER_MILESTONE: 'Follower milestone', POST_PUBLISHED: 'Post published', SCHEDULED_TIME: 'Scheduled time', NEW_COMMENT: 'New comment', ENGAGEMENT_MILESTONE: 'Engagement milestone' }
const ACTION_LABELS: Record<string,string> = { NOTIFY_WEBHOOK: 'Notify webhook', CREATE_POST: 'Create post', SEND_EMAIL: 'Send email', AUTO_LIKE: 'Auto-like posts', AUTO_COMMENT: 'Auto-comment on posts', AUTO_REPOST: 'Auto-repost / reshare' }

export default function PlugsPage() {
  const [items, setItems] = useState<AutoAction[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', trigger: 'POST_PUBLISHED', action: 'NOTIFY_WEBHOOK', webhookUrl: '', emailTo: '', emailSubject: '', emailBody: '', milestoneValue: '1000', engagementMetric: 'likes', engagementThreshold: '100', repostDelayHours: '24', isEnabled: true })

  const load = useCallback(async () => {
    setLoading(true)
    const r = await fetch('/api/auto-actions').then(r => r.json())
    setItems(r.actions ?? [])
    setLoading(false)
  }, [])
  useEffect(() => { load() }, [load])

  const handleCreate = async () => {
    if (!form.name) return
    setSaving(true)
    const metadata: Record<string, string> = {}
    if (form.action === 'NOTIFY_WEBHOOK') metadata.url = form.webhookUrl
    if (form.action === 'SEND_EMAIL') { metadata.to = form.emailTo; metadata.subject = form.emailSubject || 'Postiz Auto-Action'; metadata.body = form.emailBody }
    if (form.action === 'AUTO_REPOST') metadata.delayHours = form.repostDelayHours
    if (form.trigger === 'ENGAGEMENT_MILESTONE') { metadata.metric = form.engagementMetric; metadata.threshold = form.engagementThreshold }
    const triggerValue = form.trigger === 'FOLLOWER_MILESTONE' ? form.milestoneValue : form.trigger === 'ENGAGEMENT_MILESTONE' ? form.engagementThreshold : form.trigger === 'SCHEDULED_TIME' ? '09:00' : undefined
    await fetch('/api/auto-actions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: form.name, trigger: form.trigger, action: form.action, isEnabled: form.isEnabled, metadata, triggerValue }) })
    setSaving(false); setShowDialog(false); await load()
  }

  // Reset form helper
  const openNew = () => {
    setForm({ name: '', trigger: 'POST_PUBLISHED', action: 'NOTIFY_WEBHOOK', webhookUrl: '', emailTo: '', emailSubject: '', emailBody: '', milestoneValue: '1000', engagementMetric: 'likes', engagementThreshold: '100', repostDelayHours: '24', isEnabled: true })
    setShowDialog(true)
  }

  const handleToggle = async (id: string, isEnabled: boolean) => {
    await fetch('/api/auto-actions/' + id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isEnabled }) })
    setItems(prev => prev.map(a => a.id === id ? { ...a, isEnabled } : a))
  }

  const handleDelete = async (id: string) => {
    await fetch('/api/auto-actions/' + id, { method: 'DELETE' })
    setItems(prev => prev.filter(a => a.id !== id))
  }

  return (
    <div className="space-y-5 pb-6">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{items.length} automation{items.length !== 1 ? 's' : ''}</p>
        <Button size="sm" className="gap-1.5 text-xs" onClick={openNew}>
          <Plus className="w-3.5 h-3.5" /> New Automation
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({length:2}).map((_,i)=><div key={i} className="h-16 rounded-lg bg-muted/40 animate-pulse"/>)}</div>
      ) : items.length === 0 ? (
        <Card className="p-12 text-center">
          <Zap className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">No automations yet</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Create automated actions triggered by events</p>
          <Button size="sm" className="mt-4 gap-1.5 text-xs" onClick={openNew}><Plus className="w-3.5 h-3.5" />New Automation</Button>
        </Card>
      ) : (
        <div className="space-y-2">
          {items.map(a => (
            <Card key={a.id} className="p-3.5">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">{a.name}</span>
                    <Badge variant={a.isEnabled ? 'default' : 'secondary'} className="text-[10px] h-4 px-1.5">{a.isEnabled ? 'Active' : 'Paused'}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    When <span className="font-medium text-foreground">{TRIGGER_LABELS[a.trigger] ?? a.trigger}</span> → <span className="font-medium text-foreground">{ACTION_LABELS[a.action] ?? a.action}</span>
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">Executed {a.executionCount} times</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Switch checked={a.isEnabled} onCheckedChange={v => handleToggle(a.id, v)} className="scale-75 origin-right" />
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(a.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>New Automation</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Name</Label>
              <Input className="h-8 text-sm" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="e.g. Notify on publish" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Trigger</Label>
              <select className="w-full h-8 text-sm rounded-md border border-input bg-background px-2" value={form.trigger} onChange={e => setForm(f => ({...f, trigger: e.target.value}))}>
                {TRIGGERS.map(t => <option key={t} value={t}>{TRIGGER_LABELS[t]}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Action</Label>
              <select className="w-full h-8 text-sm rounded-md border border-input bg-background px-2" value={form.action} onChange={e => setForm(f => ({...f, action: e.target.value}))}>
                {ACTIONS.map(a => <option key={a} value={a}>{ACTION_LABELS[a]}</option>)}
              </select>
            </div>
            {form.trigger === 'FOLLOWER_MILESTONE' && (
              <div className="space-y-1.5">
                <Label className="text-xs">Milestone follower count</Label>
                <Input className="h-8 text-sm" type="number" min="1" value={form.milestoneValue} onChange={e => setForm(f => ({...f, milestoneValue: e.target.value}))} placeholder="e.g. 1000" />
              </div>
            )}
            {form.trigger === 'ENGAGEMENT_MILESTONE' && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Engagement metric</Label>
                  <select className="w-full h-8 text-sm rounded-md border border-input bg-background px-2" value={form.engagementMetric} onChange={e => setForm(f => ({...f, engagementMetric: e.target.value}))}>
                    <option value="likes">Likes</option>
                    <option value="comments">Comments</option>
                    <option value="shares">Shares / Reposts</option>
                    <option value="impressions">Impressions</option>
                    <option value="total">Total engagements</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Threshold (fire when ≥)</Label>
                  <Input className="h-8 text-sm" type="number" min="1" value={form.engagementThreshold} onChange={e => setForm(f => ({...f, engagementThreshold: e.target.value}))} placeholder="e.g. 100" />
                </div>
              </div>
            )}
            {form.action === 'NOTIFY_WEBHOOK' && (
              <div className="space-y-1.5">
                <Label className="text-xs">Webhook URL</Label>
                <Input className="h-8 text-sm" value={form.webhookUrl} onChange={e => setForm(f => ({...f, webhookUrl: e.target.value}))} placeholder="https://hooks.example.com/..." />
              </div>
            )}
            {form.action === 'SEND_EMAIL' && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Recipient email</Label>
                  <Input className="h-8 text-sm" type="email" value={form.emailTo} onChange={e => setForm(f => ({...f, emailTo: e.target.value}))} placeholder="you@example.com" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Subject</Label>
                  <Input className="h-8 text-sm" value={form.emailSubject} onChange={e => setForm(f => ({...f, emailSubject: e.target.value}))} placeholder="Postiz notification" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Body</Label>
                  <textarea className="w-full h-20 text-sm rounded-md border border-input bg-background px-2 py-1.5 resize-none" value={form.emailBody} onChange={e => setForm(f => ({...f, emailBody: e.target.value}))} placeholder="Email body text…" />
                </div>
                {!process.env.NEXT_PUBLIC_RESEND_CONFIGURED && (
                  <p className="text-[10px] text-muted-foreground">Requires <code>RESEND_API_KEY</code> env var to be configured.</p>
                )}
              </div>
            )}
            {(form.action === 'AUTO_LIKE' || form.action === 'AUTO_COMMENT') && (
              <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded px-2.5 py-2">
                Requires extended OAuth write scopes on each platform. Connect channels with write access in <strong>Channels</strong> settings first.
              </p>
            )}
            {form.action === 'AUTO_REPOST' && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Repost delay after trigger (hours)</Label>
                  <Input className="h-8 text-sm" type="number" min="0" value={form.repostDelayHours} onChange={e => setForm(f => ({...f, repostDelayHours: e.target.value}))} placeholder="e.g. 24" />
                </div>
                <p className="text-[10px] text-muted-foreground">The original post will be retweeted / reshared on the same platform after the delay.</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!form.name || saving}>
              {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
