'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Search, Plus, Copy, Edit3, Trash2, Tag, RefreshCw, LayoutTemplate } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface Template { id: string; name: string; category: string; content: string; platforms: string[]; tags: string[]; usageCount: number; createdAt: string }

const CATEGORIES = ['general', 'marketing', 'education', 'brand', 'engagement', 'social-proof', 'news']

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', content: '', category: 'general', platforms: [] as string[], tags: [] as string[] })

  const load = useCallback(async () => {
    setLoading(true)
    const r = await fetch('/api/templates').then(r => r.json())
    setTemplates(r.templates ?? [])
    setLoading(false)
  }, [])
  useEffect(() => { load() }, [load])

  const filtered = templates.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.content.toLowerCase().includes(search.toLowerCase()))

  const openCreate = () => { setEditingId(null); setForm({ name: '', content: '', category: 'general', platforms: [], tags: [] }); setShowDialog(true) }
  const openEdit = (t: Template) => { setEditingId(t.id); setForm({ name: t.name, content: t.content, category: t.category, platforms: t.platforms, tags: t.tags }); setShowDialog(true) }

  const handleSave = async () => {
    if (!form.name || !form.content) return
    setSaving(true)
    if (editingId) {
      await fetch(`/api/templates/${editingId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    } else {
      await fetch('/api/templates', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    }
    setSaving(false); setShowDialog(false); await load()
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/templates/${id}`, { method: 'DELETE' })
    setTemplates(prev => prev.filter(t => t.id !== id))
  }

  const handleUse = async (id: string) => {
    await fetch(`/api/templates/${id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'use' }) })
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, usageCount: t.usageCount + 1 } : t))
  }

  return (
    <div className="space-y-5 pb-6">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input placeholder="Search templates..." className="pl-8 h-8 text-sm" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Button size="sm" className="gap-1.5 text-xs ml-auto" onClick={openCreate}><Plus className="w-3.5 h-3.5" /> New Template</Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-40 rounded-lg bg-muted/40 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <LayoutTemplate className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">No templates yet</p>
          <Button size="sm" className="mt-4 gap-1.5 text-xs" onClick={openCreate}><Plus className="w-3.5 h-3.5" /> Create your first template</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map(t => (
            <Card key={t.id} className="p-4 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-sm">{t.name}</p>
                  <Badge variant="secondary" className="text-[10px] h-4 px-1.5 mt-1">{t.category}</Badge>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(t)}><Edit3 className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(t.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-3 flex-1">{t.content}</p>
              {t.tags.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {t.tags.map(tag => <span key={tag} className="text-[10px] bg-muted px-1.5 py-0.5 rounded flex items-center gap-0.5"><Tag className="w-2.5 h-2.5" />{tag}</span>)}
                </div>
              )}
              <div className="flex items-center justify-between pt-1 border-t border-border/50">
                <span className="text-[10px] text-muted-foreground">Used {t.usageCount} time{t.usageCount !== 1 ? 's' : ''}</span>
                <Link href={`/dashboard/compose?template=${t.id}`} onClick={() => handleUse(t.id)}>
                  <Button size="sm" variant="outline" className="h-6 text-xs gap-1"><Copy className="w-3 h-3" /> Use template</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editingId ? 'Edit Template' : 'New Template'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Name</Label>
                <Input className="h-8 text-sm" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Template name" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Category</Label>
                <select className="w-full h-8 text-sm rounded-md border border-input bg-background px-2"
                  value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Content</Label>
              <Textarea className="text-sm min-h-[120px] resize-none" value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="Use {variable} for dynamic placeholders" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Tags (comma separated)</Label>
              <Input className="h-8 text-sm" value={form.tags.join(', ')}
                onChange={e => setForm(f => ({ ...f, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }))} placeholder="launch, product, announcement" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.name || !form.content || saving}>
              {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}{editingId ? 'Save' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
