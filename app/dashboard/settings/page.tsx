'use client'

import { useState, useEffect, useCallback } from 'react'
import { useOrganization } from '@clerk/nextjs'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import {
  AlertTriangle, CreditCard, Trash2, Check, Copy, Calendar, Hash, Link2,
  Plus, Edit3, Star, RefreshCw, ShieldCheck, Key, Webhook, Eye, EyeOff,
  Globe, Zap, ToggleLeft, ToggleRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const TIMEZONES = ['UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Asia/Dubai', 'Asia/Kolkata', 'Asia/Tokyo', 'Australia/Sydney']

const DATE_FORMATS = ['MMM D, YYYY', 'DD/MM/YYYY', 'MM/DD/YYYY'] as const

const NOTIF_TYPES: Array<{ type: string; label: string; desc: string }> = [
  { type: 'POST_PUBLISHED', label: 'Post Published',  desc: 'When a scheduled post goes live' },
  { type: 'POST_FAILED',    label: 'Post Failed',     desc: 'When a post fails to publish' },
  { type: 'NEW_COMMENT',    label: 'New Comment',     desc: 'When someone comments on your post' },
  { type: 'NEW_MENTION',    label: 'New Mention',     desc: 'When your account is mentioned' },
  { type: 'WEEKLY_REPORT',  label: 'Weekly Report',   desc: 'Weekly analytics summary via email' },
  { type: 'TEAM_ACTIVITY',  label: 'Team Activity',   desc: 'When team members make changes' },
  { type: 'QUEUE_EMPTY',    label: 'Queue Empty',     desc: 'When your posting queue runs low' },
]

type WsSettings = { requireApproval: boolean; timezone: string; dateFormat: string; weekStartsOn: number }
type NotifPref  = { type: string; emailEnabled: boolean; inAppEnabled: boolean }
type Signature  = { id: string; name: string; content: string; isDefault: boolean; userId: string | null }
type ApiKey     = { id: string; name: string; prefix: string; scopes: string[]; status: string; lastUsedAt: string | null; createdAt: string }
type Webhook    = { id: string; name: string; url: string; events: string[]; isActive: boolean; successCount: number; failureCount: number; lastTriggeredAt: string | null; createdAt: string }

export default function SettingsPage() {
  const { organization, membership } = useOrganization()
  const isOwner = membership?.role === 'org:owner'
  const canEdit = membership?.role === 'org:owner' || membership?.role === 'org:admin'

  // ── Workspace (Clerk) ───────────────────────────────────────────────────────
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [clerkSaved, setClerkSaved] = useState(false)
  const [clerkSaving, setClerkSaving] = useState(false)
  const [clerkError, setClerkError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // ── Workspace settings (DB) ─────────────────────────────────────────────────
  const [wsSettings, setWsSettings] = useState<WsSettings>({ requireApproval: false, timezone: 'UTC', dateFormat: 'MMM D, YYYY', weekStartsOn: 1 })
  const [wsSaving, setWsSaving] = useState(false)
  const [wsSaved, setWsSaved] = useState(false)

  // ── Notification prefs ──────────────────────────────────────────────────────
  const [notifPrefs, setNotifPrefs] = useState<NotifPref[]>(NOTIF_TYPES.map(n => ({ type: n.type, emailEnabled: true, inAppEnabled: true })))
  const [notifSaving, setNotifSaving] = useState<string | null>(null)

  // ── Signatures ──────────────────────────────────────────────────────────────
  const [signatures, setSignatures] = useState<Signature[]>([])
  const [sigLoading, setSigLoading] = useState(true)
  const [sigModalOpen, setSigModalOpen] = useState(false)
  const [editingSig, setEditingSig] = useState<Signature | null>(null)
  const [sigName, setSigName] = useState('')
  const [sigContent, setSigContent] = useState('')
  const [sigIsDefault, setSigIsDefault] = useState(false)
  const [sigSaving, setSigSaving] = useState(false)

  // ── API Keys ────────────────────────────────────────────────────────────────
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [apiKeysLoading, setApiKeysLoading] = useState(true)
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [newKeyScopes, setNewKeyScopes] = useState<string[]>(['read', 'write'])
  const [newKeyCreating, setNewKeyCreating] = useState(false)
  const [createdKeyRaw, setCreatedKeyRaw] = useState<string | null>(null)
  const [copiedKey, setCopiedKey] = useState(false)
  const [revokingKeyId, setRevokingKeyId] = useState<string | null>(null)

  // ── Webhooks ────────────────────────────────────────────────────────────────
  const [webhooks, setWebhooks] = useState<Webhook[]>([])
  const [webhooksLoading, setWebhooksLoading] = useState(true)
  const [webhookModalOpen, setWebhookModalOpen] = useState(false)
  const [whName, setWhName] = useState('')
  const [whUrl, setWhUrl] = useState('')
  const [whEvents, setWhEvents] = useState<string[]>(['post.published'])
  const [whSaving, setWhSaving] = useState(false)
  const [deletingWebhookId, setDeletingWebhookId] = useState<string | null>(null)

  // ── Sync org name/slug when loaded ──────────────────────────────────────────
  useEffect(() => {
    if (organization) {
      setName(organization.name ?? '')
      setSlug(organization.slug ?? '')
    }
  }, [organization?.id])

  // ── Load workspace settings ─────────────────────────────────────────────────
  useEffect(() => {
    fetch('/api/workspace-settings')
      .then(r => r.json())
      .then((d: WsSettings) => setWsSettings(d))
      .catch(() => {})
  }, [])

  // ── Load notification prefs ─────────────────────────────────────────────────
  useEffect(() => {
    fetch('/api/notification-prefs')
      .then(r => r.json())
      .then((d: { prefs: NotifPref[] }) => { if (d.prefs) setNotifPrefs(d.prefs) })
      .catch(() => {})
  }, [])

  // ── Load signatures ─────────────────────────────────────────────────────────
  const loadSignatures = useCallback(() => {
    setSigLoading(true)
    fetch('/api/signatures')
      .then(r => r.json())
      .then((d: { signatures: Signature[] }) => setSignatures(d.signatures ?? []))
      .catch(() => {})
      .finally(() => setSigLoading(false))
  }, [])
  useEffect(() => { loadSignatures() }, [loadSignatures])

  // ── Load API keys ───────────────────────────────────────────────────────────
  const loadApiKeys = useCallback(() => {
    setApiKeysLoading(true)
    fetch('/api/api-keys')
      .then(r => r.json())
      .then((d: { keys: ApiKey[] }) => setApiKeys(d.keys ?? []))
      .catch(() => {})
      .finally(() => setApiKeysLoading(false))
  }, [])
  useEffect(() => { loadApiKeys() }, [loadApiKeys])

  // ── Load webhooks ───────────────────────────────────────────────────────────
  const loadWebhooks = useCallback(() => {
    setWebhooksLoading(true)
    fetch('/api/webhooks-config')
      .then(r => r.json())
      .then((d: { webhooks: Webhook[] }) => setWebhooks(d.webhooks ?? []))
      .catch(() => {})
      .finally(() => setWebhooksLoading(false))
  }, [])
  useEffect(() => { loadWebhooks() }, [loadWebhooks])

  // ── Handlers ────────────────────────────────────────────────────────────────
  async function handleSaveClerk() {
    if (!organization || !canEdit) return
    setClerkSaving(true); setClerkError(null)
    try {
      await organization.update({ name, slug: slug.toLowerCase().replace(/\s+/g, '-') })
      setClerkSaved(true); setTimeout(() => setClerkSaved(false), 2000)
    } catch (err) {
      setClerkError(err instanceof Error ? err.message : 'Failed to save')
    } finally { setClerkSaving(false) }
  }

  async function handleSaveWsSettings() {
    if (!canEdit) return
    setWsSaving(true)
    try {
      const res = await fetch('/api/workspace-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(wsSettings),
      })
      const d = await res.json() as WsSettings
      setWsSettings(d)
      setWsSaved(true); setTimeout(() => setWsSaved(false), 2000)
    } catch { /* ignore */ }
    finally { setWsSaving(false) }
  }

  async function handleToggleNotif(type: string, key: 'emailEnabled' | 'inAppEnabled', val: boolean) {
    setNotifSaving(type + key)
    const current = notifPrefs.find(p => p.type === type) ?? { type, emailEnabled: true, inAppEnabled: true }
    const next = { ...current, [key]: val }
    setNotifPrefs(prev => prev.map(p => p.type === type ? next : p))
    try {
      await fetch('/api/notification-prefs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(next),
      })
    } catch { /* revert not critical */ }
    finally { setNotifSaving(null) }
  }

  function openNewSig() {
    setEditingSig(null); setSigName(''); setSigContent(''); setSigIsDefault(false); setSigModalOpen(true)
  }

  function openEditSig(s: Signature) {
    setEditingSig(s); setSigName(s.name); setSigContent(s.content); setSigIsDefault(s.isDefault); setSigModalOpen(true)
  }

  async function handleSaveSig() {
    if (!sigName.trim() || !sigContent.trim()) return
    setSigSaving(true)
    try {
      if (editingSig) {
        await fetch(`/api/signatures/${editingSig.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: sigName, content: sigContent, isDefault: sigIsDefault }),
        })
      } else {
        await fetch('/api/signatures', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: sigName, content: sigContent, isDefault: sigIsDefault }),
        })
      }
      setSigModalOpen(false)
      loadSignatures()
    } catch { /* ignore */ }
    finally { setSigSaving(false) }
  }

  async function handleDeleteSig(id: string) {
    await fetch(`/api/signatures/${id}`, { method: 'DELETE' })
    setSignatures(prev => prev.filter(s => s.id !== id))
  }

  async function handleSetDefaultSig(id: string) {
    await fetch(`/api/signatures/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isDefault: true }),
    })
    loadSignatures()
  }

  function copyOrgId() {
    if (!organization?.id) return
    navigator.clipboard.writeText(organization.id)
    setCopied(true); setTimeout(() => setCopied(false), 1500)
  }

  // ── API Key handlers ────────────────────────────────────────────────────────
  async function handleCreateApiKey() {
    if (!newKeyName.trim()) return
    setNewKeyCreating(true)
    try {
      const res = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName, scopes: newKeyScopes }),
      })
      const d = await res.json() as { raw: string; prefix: string; name: string }
      setCreatedKeyRaw(d.raw)
      loadApiKeys()
    } catch { /* ignore */ }
    finally { setNewKeyCreating(false) }
  }

  async function handleRevokeApiKey(id: string) {
    setRevokingKeyId(id)
    try {
      await fetch(`/api/api-keys/${id}`, { method: 'DELETE' })
      setApiKeys(prev => prev.map(k => k.id === id ? { ...k, status: 'REVOKED' } : k))
    } catch { /* ignore */ }
    finally { setRevokingKeyId(null) }
  }

  function openApiKeyModal() {
    setNewKeyName(''); setNewKeyScopes(['read', 'write']); setCreatedKeyRaw(null); setApiKeyModalOpen(true)
  }

  // ── Webhook handlers ────────────────────────────────────────────────────────
  async function handleCreateWebhook() {
    if (!whName.trim() || !whUrl.trim()) return
    setWhSaving(true)
    try {
      await fetch('/api/webhooks-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: whName, url: whUrl, events: whEvents }),
      })
      setWebhookModalOpen(false)
      setWhName(''); setWhUrl(''); setWhEvents(['post.published'])
      loadWebhooks()
    } catch { /* ignore */ }
    finally { setWhSaving(false) }
  }

  async function handleDeleteWebhook(id: string) {
    setDeletingWebhookId(id)
    try {
      await fetch(`/api/webhooks-config/${id}`, { method: 'DELETE' })
      setWebhooks(prev => prev.filter(w => w.id !== id))
    } catch { /* ignore */ }
    finally { setDeletingWebhookId(null) }
  }

  async function handleToggleWebhook(id: string, isActive: boolean) {
    await fetch(`/api/webhooks-config/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive }),
    }).catch(() => {})
    setWebhooks(prev => prev.map(w => w.id === id ? { ...w, isActive } : w))
  }

  const createdDate = organization?.createdAt
    ? new Date(organization.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null

  return (
    <div className="max-w-2xl space-y-5 pb-6">
      <Tabs defaultValue="workspace">
        <TabsList className="bg-muted border border-border h-9 p-1 gap-0.5 flex-wrap">
          {[['workspace','Workspace'], ['notifications','Notifications'], ['timezone','Date & Time'], ['signatures','Signatures'], ['integrations','Integrations'], ['billing','Billing']].map(([v, l]) => (
            <TabsTrigger key={v} value={v} className="text-xs data-[state=active]:bg-card data-[state=active]:text-foreground">{l}</TabsTrigger>
          ))}
        </TabsList>

        {/* ── Workspace ────────────────────────────────────────────────────────── */}
        <TabsContent value="workspace" className="mt-5 space-y-4">
          <Card className="bg-card border-border shadow-sm p-5 space-y-4">
            <h3 className="text-sm font-medium text-foreground">Workspace Details</h3>
            {organization ? (
              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Workspace Name</Label>
                  <Input value={name} onChange={e => setName(e.target.value)} disabled={!canEdit} className="mt-1 h-8 text-xs bg-input border-border disabled:opacity-60" />
                </div>
                <div>
                  <Label className="text-xs">Workspace Slug</Label>
                  <div className="flex gap-2 mt-1">
                    <span className="flex items-center text-xs text-muted-foreground bg-muted px-3 rounded-sm border border-border select-none">app/</span>
                    <Input value={slug} onChange={e => setSlug(e.target.value)} disabled={!canEdit} placeholder="my-workspace" className="flex-1 h-8 text-xs bg-input border-border font-mono disabled:opacity-60" />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">Lowercase letters, numbers, and hyphens only.</p>
                </div>
                {clerkError && <p className="text-xs text-destructive">{clerkError}</p>}
                {canEdit && (
                  <Button size="sm" onClick={handleSaveClerk} disabled={clerkSaving || !name.trim()} className="text-xs gap-1.5">
                    {clerkSaved ? <><Check className="w-3.5 h-3.5" />Saved</> : clerkSaving ? 'Saving…' : 'Save Changes'}
                  </Button>
                )}
                <div className="pt-3 mt-1 border-t border-border space-y-2">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-2">Workspace Info</p>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-muted-foreground"><Hash className="w-3.5 h-3.5 flex-shrink-0" /><span className="text-[11px]">Organization ID</span></div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-mono text-muted-foreground truncate max-w-[160px]">{organization.id}</span>
                      <button onClick={copyOrgId} className="p-1 hover:text-foreground text-muted-foreground transition-colors rounded">
                        {copied ? <Check className="w-3 h-3 text-primary" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                  {createdDate && (
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="w-3.5 h-3.5 flex-shrink-0" /><span className="text-[11px]">Created</span></div>
                      <span className="text-[11px] text-muted-foreground">{createdDate}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-muted-foreground"><Link2 className="w-3.5 h-3.5 flex-shrink-0" /><span className="text-[11px]">Members</span></div>
                    <span className="text-[11px] text-muted-foreground">{organization.membersCount ?? '—'}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-sm text-muted-foreground">Loading workspace…</div>
            )}
          </Card>

          {/* Approval workflow */}
          {canEdit && (
            <Card className="bg-card border-border shadow-sm p-5">
              <div className="flex items-start gap-3 mb-3">
                <ShieldCheck className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-foreground">Approval Workflow</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">When enabled, posts submitted by Content Editors go to a pending queue for admin review before being scheduled.</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-foreground">Require approval before publishing</p>
                  <p className="text-[10px] text-muted-foreground">Applies to org:content_editor role only</p>
                </div>
                <Switch
                  checked={wsSettings.requireApproval}
                  onCheckedChange={val => {
                    setWsSettings(s => ({ ...s, requireApproval: val }))
                    fetch('/api/workspace-settings', {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ requireApproval: val }),
                    }).catch(() => {})
                  }}
                  className="data-[state=checked]:bg-accent"
                />
              </div>
            </Card>
          )}

          {isOwner && (
            <Card className="bg-destructive/5 border-destructive/20 shadow-sm p-5 space-y-3">
              <div className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-destructive" /><h3 className="text-sm font-medium text-destructive">Danger Zone</h3></div>
              <p className="text-xs text-muted-foreground">Permanently delete this workspace and all its data. This action cannot be undone.</p>
              <Button variant="outline" size="sm" className="text-xs gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/5" onClick={() => organization?.destroy()}>
                <Trash2 className="w-3.5 h-3.5" /> Delete Workspace
              </Button>
            </Card>
          )}
        </TabsContent>

        {/* ── Notifications ─────────────────────────────────────────────────────── */}
        <TabsContent value="notifications" className="mt-5">
          <Card className="bg-card border-border shadow-sm p-5 space-y-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-foreground">Notification Preferences</h3>
              <div className="grid grid-cols-2 gap-1.5">
                <span className="text-[9px] text-muted-foreground text-center">Email</span>
                <span className="text-[9px] text-muted-foreground text-center">In-app</span>
              </div>
            </div>
            {NOTIF_TYPES.map(n => {
              const pref = notifPrefs.find(p => p.type === n.type)
              const emailEnabled = pref?.emailEnabled ?? true
              const inAppEnabled = pref?.inAppEnabled ?? true
              return (
                <div key={n.type} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div className="flex-1 mr-4">
                    <p className="text-xs font-medium text-foreground">{n.label}</p>
                    <p className="text-[11px] text-muted-foreground">{n.desc}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 items-center">
                    <Switch
                      checked={emailEnabled}
                      disabled={notifSaving === n.type + 'emailEnabled'}
                      onCheckedChange={val => handleToggleNotif(n.type, 'emailEnabled', val)}
                      className="scale-90 data-[state=checked]:bg-accent"
                    />
                    <Switch
                      checked={inAppEnabled}
                      disabled={notifSaving === n.type + 'inAppEnabled'}
                      onCheckedChange={val => handleToggleNotif(n.type, 'inAppEnabled', val)}
                      className="scale-90 data-[state=checked]:bg-accent"
                    />
                  </div>
                </div>
              )
            })}
          </Card>
        </TabsContent>

        {/* ── Date & Time ───────────────────────────────────────────────────────── */}
        <TabsContent value="timezone" className="mt-5">
          <Card className="bg-card border-border shadow-sm p-5 space-y-4">
            <h3 className="text-sm font-medium text-foreground">Date & Time</h3>
            <div>
              <Label className="text-xs">Timezone</Label>
              <select
                value={wsSettings.timezone}
                onChange={e => setWsSettings(s => ({ ...s, timezone: e.target.value }))}
                disabled={!canEdit}
                className="mt-1 w-full h-8 px-3 text-xs bg-input border border-border rounded-sm text-foreground outline-none focus:ring-1 focus:ring-ring disabled:opacity-60"
              >
                {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs">Date Format</Label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                {DATE_FORMATS.map(fmt => (
                  <button
                    key={fmt}
                    disabled={!canEdit}
                    onClick={() => setWsSettings(s => ({ ...s, dateFormat: fmt }))}
                    className={cn(
                      'h-8 px-3 text-xs border rounded-sm transition-all',
                      wsSettings.dateFormat === fmt
                        ? 'border-accent/60 bg-accent/10 text-accent'
                        : 'border-border text-muted-foreground hover:border-accent/40 hover:text-foreground',
                    )}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-xs">Week Starts On</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {(['Monday', 'Sunday'] as const).map((day, idx) => {
                  const val = day === 'Monday' ? 1 : 0
                  return (
                    <button
                      key={day}
                      disabled={!canEdit}
                      onClick={() => setWsSettings(s => ({ ...s, weekStartsOn: val }))}
                      className={cn(
                        'h-8 px-3 text-xs border rounded-sm transition-all',
                        wsSettings.weekStartsOn === val
                          ? 'border-accent/60 bg-accent/10 text-accent'
                          : 'border-border text-muted-foreground hover:border-accent/40 hover:text-foreground',
                      )}
                    >
                      {day}
                    </button>
                  )
                })}
              </div>
            </div>
            {canEdit && (
              <Button size="sm" onClick={handleSaveWsSettings} disabled={wsSaving} className="text-xs gap-1.5">
                {wsSaved ? <><Check className="w-3.5 h-3.5" /> Saved</> : wsSaving ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving…</> : 'Save Changes'}
              </Button>
            )}
          </Card>
        </TabsContent>

        {/* ── Signatures ────────────────────────────────────────────────────────── */}
        <TabsContent value="signatures" className="mt-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Post Signatures</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Appended automatically to posts. The default signature is pre-selected in the composer.</p>
            </div>
            <Button size="sm" onClick={openNewSig} className="gap-1.5 text-xs">
              <Plus className="w-3.5 h-3.5" /> New Signature
            </Button>
          </div>

          {sigLoading ? (
            <div className="space-y-2">{[1,2].map(i => <div key={i} className="h-20 rounded-sm bg-muted/30 animate-pulse" />)}</div>
          ) : signatures.length === 0 ? (
            <Card className="bg-card border-border p-8 text-center">
              <p className="text-sm text-muted-foreground">No signatures yet. Create one to auto-append it to your posts.</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {signatures.map(s => (
                <Card key={s.id} className={cn('bg-card border-border p-4 transition-all', s.isDefault && 'border-accent/30 bg-accent/5')}>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-medium text-foreground">{s.name}</p>
                      {s.isDefault && (
                        <span className="flex items-center gap-0.5 text-[9px] text-accent font-medium uppercase tracking-widest">
                          <Star className="w-2.5 h-2.5 fill-accent" /> Default
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {!s.isDefault && (
                        <button onClick={() => handleSetDefaultSig(s.id)} className="text-[10px] text-muted-foreground hover:text-accent px-1.5 py-0.5 border border-border rounded-sm transition-colors">
                          Set default
                        </button>
                      )}
                      <button onClick={() => openEditSig(s)} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors">
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button onClick={() => handleDeleteSig(s.id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground whitespace-pre-wrap line-clamp-3 font-mono">{s.content}</p>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Integrations ─────────────────────────────────────────────────────── */}
        <TabsContent value="integrations" className="mt-5 space-y-6">

          {/* API Keys */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-accent" />
                <div>
                  <p className="text-sm font-medium text-foreground">API Keys</p>
                  <p className="text-[11px] text-muted-foreground">Use API keys to authenticate requests from external apps.</p>
                </div>
              </div>
              {canEdit && (
                <Button size="sm" onClick={openApiKeyModal} className="gap-1.5 text-xs">
                  <Plus className="w-3.5 h-3.5" /> New Key
                </Button>
              )}
            </div>
            {apiKeysLoading ? (
              <div className="space-y-2">{[1,2].map(i => <div key={i} className="h-14 rounded-sm bg-muted/30 animate-pulse" />)}</div>
            ) : apiKeys.length === 0 ? (
              <Card className="bg-card border-border p-6 text-center">
                <Key className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">No API keys yet. Create one to integrate external apps.</p>
              </Card>
            ) : (
              <div className="space-y-2">
                {apiKeys.map(key => (
                  <Card key={key.id} className={cn('bg-card border-border p-3.5 flex items-center gap-3', key.status === 'REVOKED' && 'opacity-50')}>
                    <Key className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-medium text-foreground">{key.name}</p>
                        <span className={cn('text-[9px] px-1.5 py-0.5 rounded-sm font-medium',
                          key.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-muted text-muted-foreground')}>
                          {key.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                        {key.prefix}••••••••••••••••
                        {key.lastUsedAt && ` · Last used ${new Date(key.lastUsedAt).toLocaleDateString()}`}
                      </p>
                    </div>
                    {key.status === 'ACTIVE' && canEdit && (
                      <button
                        onClick={() => handleRevokeApiKey(key.id)}
                        disabled={revokingKeyId === key.id}
                        className="text-[10px] text-destructive hover:underline disabled:opacity-50"
                      >
                        Revoke
                      </button>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Webhooks */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Webhook className="w-4 h-4 text-accent" />
                <div>
                  <p className="text-sm font-medium text-foreground">Webhooks</p>
                  <p className="text-[11px] text-muted-foreground">Receive real-time notifications when events happen in your workspace.</p>
                </div>
              </div>
              {canEdit && (
                <Button size="sm" onClick={() => { setWhName(''); setWhUrl(''); setWhEvents(['post.published']); setWebhookModalOpen(true) }} className="gap-1.5 text-xs">
                  <Plus className="w-3.5 h-3.5" /> Add Endpoint
                </Button>
              )}
            </div>
            {webhooksLoading ? (
              <div className="space-y-2">{[1].map(i => <div key={i} className="h-16 rounded-sm bg-muted/30 animate-pulse" />)}</div>
            ) : webhooks.length === 0 ? (
              <Card className="bg-card border-border p-6 text-center">
                <Globe className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">No webhooks yet. Add an endpoint to receive event notifications.</p>
              </Card>
            ) : (
              <div className="space-y-2">
                {webhooks.map(wh => (
                  <Card key={wh.id} className="bg-card border-border p-3.5">
                    <div className="flex items-start gap-3">
                      <Zap className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-xs font-medium text-foreground">{wh.name}</p>
                          <span className={cn('text-[9px] px-1.5 py-0.5 rounded-sm font-medium',
                            wh.isActive ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-muted text-muted-foreground')}>
                            {wh.isActive ? 'active' : 'inactive'}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground font-mono truncate">{wh.url}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-[10px] text-muted-foreground">
                            ✓ {wh.successCount} · ✗ {wh.failureCount}
                            {wh.events.length > 0 && ` · ${wh.events.slice(0,2).join(', ')}${wh.events.length > 2 ? ` +${wh.events.length - 2}` : ''}`}
                          </p>
                        </div>
                      </div>
                      {canEdit && (
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => handleToggleWebhook(wh.id, !wh.isActive)}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                            title={wh.isActive ? 'Disable' : 'Enable'}>
                            {wh.isActive
                              ? <ToggleRight className="w-4 h-4 text-accent" />
                              : <ToggleLeft className="w-4 h-4" />}
                          </button>
                          <button onClick={() => handleDeleteWebhook(wh.id)}
                            disabled={deletingWebhookId === wh.id}
                            className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── Billing ───────────────────────────────────────────────────────────── */}
        <TabsContent value="billing" className="mt-5 space-y-4">
          <Card className="bg-primary/5 border-primary/20 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Current Plan</p>
                <p className="text-xl font-light text-foreground mt-0.5">Pro Plan</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-light text-primary">$49</p>
                <p className="text-xs text-muted-foreground">/month</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[['25', 'Channels'], ['Unlimited', 'Posts/mo'], ['5', 'Team seats']].map(([v, l]) => (
                <div key={l} className="bg-card rounded-sm p-2 text-center">
                  <p className="text-sm font-medium text-foreground">{v}</p>
                  <p className="text-[10px] text-muted-foreground">{l}</p>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" className="text-xs border-primary/30 text-primary hover:bg-primary/5">Upgrade to Agency</Button>
          </Card>
          <Card className="bg-card border-border shadow-sm p-5 space-y-3">
            <div className="flex items-center gap-2"><CreditCard className="w-4 h-4 text-muted-foreground" /><h3 className="text-sm font-medium text-foreground">Payment Method</h3></div>
            <div className="flex items-center justify-between p-3 border border-border rounded-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-6 bg-muted rounded flex items-center justify-center"><span className="text-[10px] font-bold text-foreground">VISA</span></div>
                <div>
                  <p className="text-xs text-foreground">•••• •••• •••• 4242</p>
                  <p className="text-[10px] text-muted-foreground">Expires 12/26</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground">Change</Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Signature modal */}
      <Dialog open={sigModalOpen} onOpenChange={setSigModalOpen}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-medium">{editingSig ? 'Edit Signature' : 'New Signature'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <Label className="text-[11px] uppercase tracking-widest text-muted-foreground">Name</Label>
              <Input value={sigName} onChange={e => setSigName(e.target.value)} placeholder="Professional, Casual…" className="mt-1.5 h-8 text-sm bg-input border-border" />
            </div>
            <div>
              <Label className="text-[11px] uppercase tracking-widest text-muted-foreground">Content</Label>
              <Textarea
                value={sigContent}
                onChange={e => setSigContent(e.target.value)}
                placeholder={"—\nYour Name\nyourwebsite.com"}
                className="mt-1.5 text-sm bg-input border-border font-mono resize-none min-h-[100px]"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-foreground">Set as default</p>
                <p className="text-[10px] text-muted-foreground">Pre-selected in the composer</p>
              </div>
              <Switch checked={sigIsDefault} onCheckedChange={setSigIsDefault} className="data-[state=checked]:bg-accent" />
            </div>
            <Button onClick={handleSaveSig} disabled={sigSaving || !sigName.trim() || !sigContent.trim()} className="w-full">
              {sigSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin mr-2" /> : null}
              {sigSaving ? 'Saving…' : editingSig ? 'Save Changes' : 'Create Signature'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* API Key modal */}
      <Dialog open={apiKeyModalOpen} onOpenChange={v => { setApiKeyModalOpen(v); if (!v) setCreatedKeyRaw(null) }}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-medium">Create API Key</DialogTitle>
          </DialogHeader>
          {createdKeyRaw ? (
            <div className="space-y-3 mt-2">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-sm">
                <p className="text-xs text-amber-700 dark:text-amber-400 font-medium mb-1">Copy this key now — it won&apos;t be shown again.</p>
                <div className="flex items-center gap-2 mt-2">
                  <code className="flex-1 text-xs font-mono bg-card border border-border rounded-sm px-2 py-1.5 truncate text-foreground">
                    {createdKeyRaw}
                  </code>
                  <button onClick={() => { navigator.clipboard.writeText(createdKeyRaw); setCopiedKey(true); setTimeout(() => setCopiedKey(false), 1500) }}
                    className="p-1.5 hover:text-foreground text-muted-foreground transition-colors">
                    {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <Button onClick={() => setApiKeyModalOpen(false)} className="w-full text-xs">Done</Button>
            </div>
          ) : (
            <div className="space-y-3 mt-2">
              <div>
                <Label className="text-[11px] uppercase tracking-widest text-muted-foreground">Key Name</Label>
                <Input value={newKeyName} onChange={e => setNewKeyName(e.target.value)} placeholder="e.g. My App Integration" className="mt-1.5 h-8 text-sm bg-input border-border" />
              </div>
              <div>
                <Label className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2 block">Scopes</Label>
                <div className="flex gap-2 flex-wrap">
                  {['read', 'write', 'publish', 'analytics'].map(scope => (
                    <button key={scope} onClick={() => setNewKeyScopes(prev => prev.includes(scope) ? prev.filter(s => s !== scope) : [...prev, scope])}
                      className={cn('text-[11px] px-2.5 py-1 rounded-sm border transition-all', newKeyScopes.includes(scope) ? 'border-accent/60 bg-accent/10 text-accent' : 'border-border text-muted-foreground hover:border-accent/30')}>
                      {scope}
                    </button>
                  ))}
                </div>
              </div>
              <Button onClick={handleCreateApiKey} disabled={newKeyCreating || !newKeyName.trim()} className="w-full text-xs gap-1.5">
                {newKeyCreating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Key className="w-3.5 h-3.5" />}
                {newKeyCreating ? 'Creating…' : 'Create Key'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Webhook modal */}
      <Dialog open={webhookModalOpen} onOpenChange={setWebhookModalOpen}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-medium">Add Webhook Endpoint</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <Label className="text-[11px] uppercase tracking-widest text-muted-foreground">Name</Label>
              <Input value={whName} onChange={e => setWhName(e.target.value)} placeholder="My App Webhook" className="mt-1.5 h-8 text-sm bg-input border-border" />
            </div>
            <div>
              <Label className="text-[11px] uppercase tracking-widest text-muted-foreground">Endpoint URL</Label>
              <Input value={whUrl} onChange={e => setWhUrl(e.target.value)} placeholder="https://yourapp.com/webhooks/postieur" className="mt-1.5 h-8 text-sm bg-input border-border font-mono" type="url" />
            </div>
            <div>
              <Label className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2 block">Events to Subscribe</Label>
              <div className="flex gap-2 flex-wrap">
                {['post.published', 'post.failed', 'post.created', 'member.joined', 'channel.connected'].map(ev => (
                  <button key={ev} onClick={() => setWhEvents(prev => prev.includes(ev) ? prev.filter(e => e !== ev) : [...prev, ev])}
                    className={cn('text-[10px] px-2 py-1 rounded-sm border transition-all font-mono', whEvents.includes(ev) ? 'border-accent/60 bg-accent/10 text-accent' : 'border-border text-muted-foreground hover:border-accent/30')}>
                    {ev}
                  </button>
                ))}
              </div>
            </div>
            <Button onClick={handleCreateWebhook} disabled={whSaving || !whName.trim() || !whUrl.trim()} className="w-full text-xs gap-1.5">
              {whSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5" />}
              {whSaving ? 'Creating…' : 'Add Endpoint'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
