'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import {
  Link2, Plus, Trash2, RefreshCw, GripVertical, ExternalLink,
  Eye, MousePointerClick, Globe, EyeOff,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface LinkItem { id: string; title: string; url: string; platform: string | null; clicks: number; sortOrder: number; isActive: boolean }
interface Page { id: string; slug: string; title: string; bio: string | null; avatarUrl: string | null; themeColor: string | null; isPublished: boolean; pageViews: number; links: LinkItem[] }

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? ''

export default function LinkInBioPage() {
  const [page, setPage] = useState<Page | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [publishBusy, setPublishBusy] = useState(false)
  const [showSetup, setShowSetup] = useState(false)
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null)
  const [pageForm, setPageForm] = useState({ slug: '', title: '', bio: '', themeColor: '#3ecfb2' })
  const [linkForm, setLinkForm] = useState({ title: '', url: '', platform: '' })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await fetch('/api/link-in-bio').then(r => r.json()) as { page: Page | null }
      setPage(r.page ?? null)
    } catch {
      toast.error('Failed to load Link in Bio page')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  // ── Page actions ─────────────────────────────────────────────────────────────
  const handleSavePage = async () => {
    setSaving(true)
    try {
      await fetch('/api/link-in-bio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'upsert', ...pageForm }),
      })
      toast.success('Page saved')
      setShowSetup(false)
      await load()
    } catch {
      toast.error('Failed to save page')
    } finally {
      setSaving(false)
    }
  }

  const handleTogglePublished = async () => {
    if (!page) return
    const next = !page.isPublished
    setPublishBusy(true)
    // Optimistic
    setPage(prev => prev ? { ...prev, isPublished: next } : prev)
    try {
      await fetch('/api/link-in-bio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'upsert',
          slug: page.slug,
          title: page.title,
          bio: page.bio ?? '',
          themeColor: page.themeColor ?? '',
          isPublished: next,
        }),
      })
      toast.success(next ? 'Page is now live' : 'Page is now hidden')
    } catch {
      // Rollback
      setPage(prev => prev ? { ...prev, isPublished: !next } : prev)
      toast.error('Failed to update publish status')
    } finally {
      setPublishBusy(false)
    }
  }

  // ── Link actions ──────────────────────────────────────────────────────────────
  const handleAddLink = async () => {
    if (!page || !linkForm.title || !linkForm.url) return
    setSaving(true)
    try {
      await fetch('/api/link-in-bio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add-link', pageId: page.id, ...linkForm }),
      })
      toast.success('Link added')
      setShowLinkDialog(false)
      await load()
    } catch {
      toast.error('Failed to add link')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateLink = async () => {
    if (!editingLink) return
    setSaving(true)
    try {
      await fetch('/api/link-in-bio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update-link', id: editingLink.id, ...linkForm }),
      })
      toast.success('Link updated')
      setEditingLink(null)
      setShowLinkDialog(false)
      await load()
    } catch {
      toast.error('Failed to update link')
    } finally {
      setSaving(false)
    }
  }

  const handleRemoveLink = async (id: string) => {
    setPage(prev => prev ? { ...prev, links: prev.links.filter(l => l.id !== id) } : prev)
    try {
      await fetch('/api/link-in-bio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'remove-link', id }),
      })
      toast.success('Link removed')
    } catch {
      toast.error('Failed to remove link')
      await load()
    }
  }

  const handleToggleLink = async (id: string, isActive: boolean) => {
    setPage(prev => prev ? { ...prev, links: prev.links.map(l => l.id === id ? { ...l, isActive } : l) } : prev)
    try {
      await fetch('/api/link-in-bio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update-link', id, isActive }),
      })
    } catch {
      // Rollback
      setPage(prev => prev ? { ...prev, links: prev.links.map(l => l.id === id ? { ...l, isActive: !isActive } : l) } : prev)
      toast.error('Failed to update link')
    }
  }

  const openEditLink = (link: LinkItem) => {
    setEditingLink(link)
    setLinkForm({ title: link.title, url: link.url, platform: link.platform ?? '' })
    setShowLinkDialog(true)
  }

  const openAddLink = () => {
    setEditingLink(null)
    setLinkForm({ title: '', url: '', platform: '' })
    setShowLinkDialog(true)
  }

  // ── Loading skeleton ──────────────────────────────────────────────────────────
  if (loading) return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-16 rounded-lg bg-muted/40 animate-pulse" />
      ))}
    </div>
  )

  // ── Empty state ───────────────────────────────────────────────────────────────
  if (!page) return (
    <Card className="p-12 text-center bg-card border-border">
      <Link2 className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
      <p className="text-sm text-muted-foreground font-medium">No Link in Bio page yet</p>
      <p className="text-xs text-muted-foreground/60 mt-1 max-w-xs mx-auto">
        Create a single shareable page with all your links — track clicks for every one of them.
      </p>
      <Button
        size="sm"
        className="mt-5 gap-1.5 text-xs"
        onClick={() => { setPageForm({ slug: '', title: '', bio: '', themeColor: '#3ecfb2' }); setShowSetup(true) }}
      >
        <Plus className="w-3.5 h-3.5" /> Create Page
      </Button>
      <Dialog open={showSetup} onOpenChange={setShowSetup}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader><DialogTitle className="text-sm font-medium">Create Link in Bio Page</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-1">
            <div className="space-y-1.5">
              <Label className="text-[11px] uppercase tracking-widest text-muted-foreground">Page title</Label>
              <Input className="h-8 text-sm bg-input border-border" value={pageForm.title} onChange={e => setPageForm(f => ({ ...f, title: e.target.value }))} placeholder="My Links" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] uppercase tracking-widest text-muted-foreground">Slug (URL path)</Label>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground whitespace-nowrap">/l/</span>
                <Input className="h-8 text-sm bg-input border-border" value={pageForm.slug} onChange={e => setPageForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') }))} placeholder="yourname" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] uppercase tracking-widest text-muted-foreground">Bio (optional)</Label>
              <Input className="h-8 text-sm bg-input border-border" value={pageForm.bio} onChange={e => setPageForm(f => ({ ...f, bio: e.target.value }))} placeholder="Short description" />
            </div>
          </div>
          <DialogFooter className="mt-2">
            <Button variant="outline" size="sm" onClick={() => setShowSetup(false)}>Cancel</Button>
            <Button size="sm" onClick={handleSavePage} disabled={!pageForm.title || !pageForm.slug || saving}>
              {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )

  const publicUrl = `${APP_URL}/l/${page.slug}`
  const totalClicks = page.links.reduce((s, l) => s + l.clicks, 0)

  return (
    <div className="space-y-5 pb-6">

      {/* Page header card */}
      <Card className="bg-card border-border p-4">
        <div className="flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-medium text-sm text-foreground">{page.title}</p>
              <Badge
                className={cn(
                  'text-[10px] border-0 gap-1',
                  page.isPublished
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-muted text-muted-foreground',
                )}
              >
                {page.isPublished ? <Globe className="w-2.5 h-2.5" /> : <EyeOff className="w-2.5 h-2.5" />}
                {page.isPublished ? 'Live' : 'Hidden'}
              </Badge>
            </div>
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-accent hover:underline flex items-center gap-1 mt-0.5 w-fit"
            >
              {publicUrl}<ExternalLink className="w-2.5 h-2.5" />
            </a>
            <div className="flex items-center gap-3 mt-2">
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Eye className="w-3 h-3" /> {page.pageViews.toLocaleString()} views
              </span>
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <MousePointerClick className="w-3 h-3" /> {totalClicks.toLocaleString()} clicks
              </span>
              <span className="text-[11px] text-muted-foreground">
                {page.links.length} link{page.links.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            {/* Publish toggle */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-muted-foreground">{page.isPublished ? 'Published' : 'Draft'}</span>
              <Switch
                checked={page.isPublished}
                onCheckedChange={handleTogglePublished}
                disabled={publishBusy}
                className="data-[state=checked]:bg-emerald-600 scale-90"
              />
            </div>
            <div className="flex gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs border-border"
                onClick={() => {
                  setPageForm({ slug: page.slug, title: page.title, bio: page.bio ?? '', themeColor: page.themeColor ?? '#3ecfb2' })
                  setShowSetup(true)
                }}
              >
                Edit Page
              </Button>
              <Button size="sm" className="h-7 text-xs gap-1" onClick={openAddLink}>
                <Plus className="w-3.5 h-3.5" /> Add Link
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Links list */}
      <div className="space-y-2">
        {page.links.length === 0 ? (
          <Card className="p-10 text-center bg-card border-border">
            <Link2 className="w-7 h-7 mx-auto mb-2.5 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No links yet</p>
            <Button variant="ghost" size="sm" className="mt-3 text-xs text-accent hover:bg-accent/5" onClick={openAddLink}>
              <Plus className="w-3.5 h-3.5 mr-1.5" /> Add your first link
            </Button>
          </Card>
        ) : (
          page.links.map(link => (
            <Card
              key={link.id}
              className={cn(
                'bg-card border-border p-3.5 flex items-center gap-3 transition-all',
                !link.isActive && 'opacity-50',
              )}
            >
              <GripVertical className="w-4 h-4 text-muted-foreground/30 flex-shrink-0 cursor-grab" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{link.title}</p>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{link.url}</p>
                <div className="flex items-center gap-1 mt-1">
                  <MousePointerClick className="w-2.5 h-2.5 text-muted-foreground/50" />
                  <span className="text-[10px] text-muted-foreground">{link.clicks.toLocaleString()} click{link.clicks !== 1 ? 's' : ''}</span>
                </div>
              </div>
              <Switch
                checked={link.isActive}
                onCheckedChange={v => handleToggleLink(link.id, v)}
                className="scale-75 data-[state=checked]:bg-accent"
              />
              <button
                onClick={() => openEditLink(link)}
                className="text-muted-foreground/40 hover:text-foreground transition-colors p-1"
                aria-label="Edit link"
              >
                <svg viewBox="0 0 15 15" className="w-3.5 h-3.5 fill-current" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.854.146a.5.5 0 0 0-.707 0l-10 10A.5.5 0 0 0 1 10.5V13.5a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .354-.146l10-10a.5.5 0 0 0 0-.708l-3-3ZM2 10.707l9-9L12.293 3l-9 9L2 12.293V10.707Z"/>
                </svg>
              </button>
              <button
                onClick={() => handleRemoveLink(link.id)}
                className="text-muted-foreground/40 hover:text-destructive transition-colors p-1"
                aria-label="Remove link"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </Card>
          ))
        )}
      </div>

      {/* Edit Page dialog */}
      <Dialog open={showSetup} onOpenChange={setShowSetup}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-sm font-medium">Edit Page</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-1">
            <div className="space-y-1.5">
              <Label className="text-[11px] uppercase tracking-widest text-muted-foreground">Page title</Label>
              <Input className="h-8 text-sm bg-input border-border" value={pageForm.title} onChange={e => setPageForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] uppercase tracking-widest text-muted-foreground">Slug</Label>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground whitespace-nowrap">/l/</span>
                <Input className="h-8 text-sm bg-input border-border" value={pageForm.slug} onChange={e => setPageForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] uppercase tracking-widest text-muted-foreground">Bio</Label>
              <Input className="h-8 text-sm bg-input border-border" value={pageForm.bio} onChange={e => setPageForm(f => ({ ...f, bio: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] uppercase tracking-widest text-muted-foreground">Accent colour</Label>
              <div className="flex items-center gap-2">
                <input type="color" value={pageForm.themeColor} onChange={e => setPageForm(f => ({ ...f, themeColor: e.target.value }))} className="w-8 h-8 rounded cursor-pointer border border-border bg-transparent" />
                <span className="text-xs text-muted-foreground">{pageForm.themeColor}</span>
              </div>
            </div>
          </div>
          <DialogFooter className="mt-2">
            <Button variant="outline" size="sm" onClick={() => setShowSetup(false)}>Cancel</Button>
            <Button size="sm" onClick={handleSavePage} disabled={saving}>
              {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add / Edit Link dialog */}
      <Dialog open={showLinkDialog} onOpenChange={open => { setShowLinkDialog(open); if (!open) setEditingLink(null) }}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-sm font-medium">{editingLink ? 'Edit Link' : 'Add Link'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-1">
            <div className="space-y-1.5">
              <Label className="text-[11px] uppercase tracking-widest text-muted-foreground">Link title</Label>
              <Input className="h-8 text-sm bg-input border-border" value={linkForm.title} onChange={e => setLinkForm(f => ({ ...f, title: e.target.value }))} placeholder="My Website" autoFocus />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] uppercase tracking-widest text-muted-foreground">URL</Label>
              <Input className="h-8 text-sm bg-input border-border" value={linkForm.url} onChange={e => setLinkForm(f => ({ ...f, url: e.target.value }))} placeholder="https://" />
            </div>
          </div>
          <DialogFooter className="mt-2">
            <Button variant="outline" size="sm" onClick={() => { setShowLinkDialog(false); setEditingLink(null) }}>Cancel</Button>
            <Button
              size="sm"
              onClick={editingLink ? handleUpdateLink : handleAddLink}
              disabled={!linkForm.title || !linkForm.url || saving}
            >
              {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
              {editingLink ? 'Save' : 'Add Link'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


interface LinkItem { id: string; title: string; url: string; platform: string | null; clicks: number; sortOrder: number; isActive: boolean }
interface Page { id: string; slug: string; title: string; bio: string | null; avatarUrl: string | null; themeColor: string | null; isPublished: boolean; pageViews: number; links: LinkItem[] }

