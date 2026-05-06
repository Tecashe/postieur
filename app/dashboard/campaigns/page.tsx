'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Plus, Target, Edit3, Trash2, RefreshCw, CalendarDays, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface Campaign { id: string; name: string; description: string | null; status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED'; startDate: string | null; endDate: string | null; platforms: string[]; color: string | null; postCount: number; createdAt: string }

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-muted text-muted-foreground',
  ACTIVE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
  PAUSED: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
  COMPLETED: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
}
const PALETTE = ['#E4405F', '#0A66C2', '#FF4500', '#6364FF', '#FF0000', '#22c55e', '#f59e0b', '#8b5cf6']

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', status: 'DRAFT', startDate: '', endDate: '', color: PALETTE[0] })

  const load = useCallback(async () => {
    setLoading(true)
    const r = await fetch('/api/campaigns').then(r => r.json())
    setCampaigns(r.campaigns ?? [])
    setLoading(false)
  }, [])
  useEffect(() => { load() }, [load])

  const openCreate = () => { setEditingId(null); setForm({ name: '', description: '', status: 'DRAFT', startDate: '', endDate: '', color: PALETTE[0] }); setShowDialog(true) }
  const openEdit = (c: Campaign) => {
    setEditingId(c.id)
    setForm({ name: c.name, description: c.description ?? '', status: c.status, startDate: c.startDate ? c.startDate.slice(0, 10) : '', endDate: c.endDate ? c.endDate.slice(0, 10) : '', color: c.color ?? PALETTE[0] })
    setShowDialog(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    try {
      const payload = { ...form, startDate: form.startDate || null, endDate: form.endDate || null, description: form.description || null }
      const url = editingId ? `/api/campaigns/${editingId}` : '/api/campaigns'
      const method = editingId ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) {
        const data = await res.json() as { error?: string }
        toast.error(data.error ?? 'Failed to save campaign')
        return
      }
      toast.success(editingId ? 'Campaign updated' : 'Campaign created')
      setShowDialog(false)
      await load()
    } catch {
      toast.error('Network error — please try again')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    setCampaigns(prev => prev.filter(c => c.id !== id)) // optimistic
    try {
      const res = await fetch(`/api/campaigns/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json() as { error?: string }
        toast.error(data.error ?? 'Failed to delete campaign')
        await load() // rollback
      }
    } catch {
      toast.error('Network error')
      await load()
    }
  }

  return (
    <div className="space-y-5 pb-6">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''}</p>
        <Button size="sm" className="gap-1.5 text-xs" onClick={openCreate}><Plus className="w-3.5 h-3.5" /> New Campaign</Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-36 rounded-lg bg-muted/40 animate-pulse" />)}
        </div>
      ) : campaigns.length === 0 ? (
        <Card className="p-12 text-center">
          <Target className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">No campaigns yet</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Group related posts into campaigns to track performance</p>
          <Button size="sm" className="mt-4 gap-1.5 text-xs" onClick={openCreate}><Plus className="w-3.5 h-3.5" /> Create campaign</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {campaigns.map(c => (
            <Card key={c.id} className="p-4 flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full flex-shrink-0 mt-1" style={{ backgroundColor: c.color ?? '#888' }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-sm truncate">{c.name}</p>
                    <div className="flex gap-1 flex-shrink-0">
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openEdit(c)}><Edit3 className="w-3 h-3" /></Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" onClick={() => handleDelete(c.id)}><Trash2 className="w-3 h-3" /></Button>
                    </div>
                  </div>
                  {c.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{c.description}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={cn('text-[10px] h-4 px-1.5 border-0', STATUS_COLORS[c.status])}>{c.status}</Badge>
                {(c.startDate || c.endDate) && (
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <CalendarDays className="w-3 h-3" />
                    {c.startDate ? new Date(c.startDate).toLocaleDateString('en', { month: 'short', day: 'numeric' }) : '?'}
                    {' — '}
                    {c.endDate ? new Date(c.endDate).toLocaleDateString('en', { month: 'short', day: 'numeric' }) : 'ongoing'}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 pt-1 border-t border-border/50 text-[10px] text-muted-foreground">
                <FileText className="w-3 h-3" />{c.postCount} post{c.postCount !== 1 ? 's' : ''}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editingId ? 'Edit Campaign' : 'New Campaign'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Name</Label>
              <Input className="h-8 text-sm" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Campaign name" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Description</Label>
              <Textarea className="text-sm min-h-[80px] resize-none" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional description" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Start Date</Label>
                <Input type="date" className="h-8 text-sm" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">End Date</Label>
                <Input type="date" className="h-8 text-sm" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Status</Label>
              <select className="w-full h-8 text-sm rounded-md border border-input bg-background px-2" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                {['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Color</Label>
              <div className="flex gap-2">
                {PALETTE.map(color => (
                  <button key={color} onClick={() => setForm(f => ({ ...f, color }))} className={cn('w-6 h-6 rounded-full transition-all', form.color === color && 'ring-2 ring-offset-1 ring-primary')} style={{ backgroundColor: color }} />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.name || saving}>
              {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}{editingId ? 'Save' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
