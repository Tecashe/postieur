'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Link2, Plus, Trash2, RefreshCw, GripVertical, Eye, ExternalLink } from 'lucide-react'

interface LinkItem { id: string; title: string; url: string; platform: string | null; clicks: number; sortOrder: number; isActive: boolean }
interface Page { id: string; slug: string; title: string; bio: string | null; avatarUrl: string | null; themeColor: string | null; isPublished: boolean; pageViews: number; links: LinkItem[] }

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export default function LinkInBioPage() {
  const [page, setPage] = useState<Page | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showSetup, setShowSetup] = useState(false)
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [pageForm, setPageForm] = useState({ slug: '', title: '', bio: '', themeColor: '#E4405F' })
  const [linkForm, setLinkForm] = useState({ title: '', url: '', platform: '' })

  const load = useCallback(async () => {
    setLoading(true)
    const r = await fetch('/api/link-in-bio').then(r => r.json())
    setPage(r.page ?? null)
    setLoading(false)
  }, [])
  useEffect(() => { load() }, [load])

  const handleSavePage = async () => {
    setSaving(true)
    await fetch('/api/link-in-bio', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'upsert', ...pageForm }) })
    setSaving(false); setShowSetup(false); await load()
  }

  const handleAddLink = async () => {
    if (!page || !linkForm.title || !linkForm.url) return
    setSaving(true)
    await fetch('/api/link-in-bio', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'add-link', pageId: page.id, ...linkForm }) })
    setSaving(false); setShowLinkDialog(false); await load()
  }

  const handleRemoveLink = async (id: string) => {
    await fetch('/api/link-in-bio', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'remove-link', id }) })
    setPage(prev => prev ? { ...prev, links: prev.links.filter(l => l.id !== id) } : prev)
  }

  const handleToggleLink = async (id: string, isActive: boolean) => {
    await fetch('/api/link-in-bio', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'update-link', id, isActive }) })
    setPage(prev => prev ? { ...prev, links: prev.links.map(l => l.id === id ? { ...l, isActive } : l) } : prev)
  }

  if (loading) return <div className="space-y-3">{Array.from({length:3}).map((_,i)=><div key={i} className="h-16 rounded-lg bg-muted/40 animate-pulse"/>)}</div>

  if (!page) return (
    <Card className="p-12 text-center">
      <Link2 className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
      <p className="text-sm text-muted-foreground font-medium">No Link in Bio page yet</p>
      <p className="text-xs text-muted-foreground/60 mt-1">Create a single shareable page with all your links</p>
      <Button size="sm" className="mt-4 gap-1.5 text-xs" onClick={() => { setPageForm({ slug: '', title: '', bio: '', themeColor: '#E4405F' }); setShowSetup(true) }}>
        <Plus className="w-3.5 h-3.5" /> Create Page
      </Button>
      <Dialog open={showSetup} onOpenChange={setShowSetup}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Create Link in Bio Page</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5"><Label className="text-xs">Page title</Label><Input className="h-8 text-sm" value={pageForm.title} onChange={e=>setPageForm(f=>({...f,title:e.target.value}))} placeholder="My Links" /></div>
            <div className="space-y-1.5"><Label className="text-xs">Slug (URL path)</Label>
              <div className="flex items-center gap-1"><span className="text-xs text-muted-foreground">/l/</span><Input className="h-8 text-sm" value={pageForm.slug} onChange={e=>setPageForm(f=>({...f,slug:e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,'-')}))} placeholder="yourname" /></div>
            </div>
            <div className="space-y-1.5"><Label className="text-xs">Bio (optional)</Label><Input className="h-8 text-sm" value={pageForm.bio} onChange={e=>setPageForm(f=>({...f,bio:e.target.value}))} placeholder="Short description" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=>setShowSetup(false)}>Cancel</Button>
            <Button onClick={handleSavePage} disabled={!pageForm.title||!pageForm.slug||saving}>{saving?<RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5"/>:null}Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )

  const publicUrl = `${APP_URL}/l/${page.slug}`

  return (
    <div className="space-y-5 pb-6">
      <Card className="p-4 flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">{page.title}</p>
          <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 mt-0.5">
            {publicUrl}<ExternalLink className="w-3 h-3"/>
          </a>
          <p className="text-[10px] text-muted-foreground mt-1">{page.pageViews} page views · {page.links.length} links</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs h-7" onClick={()=>{ setPageForm({ slug: page.slug, title: page.title, bio: page.bio??'', themeColor: page.themeColor??'#E4405F' }); setShowSetup(true) }}>Edit Page</Button>
          <Button size="sm" className="gap-1.5 text-xs h-7" onClick={()=>{ setLinkForm({title:'',url:'',platform:''}); setShowLinkDialog(true) }}><Plus className="w-3.5 h-3.5"/>Add Link</Button>
        </div>
      </Card>

      <div className="space-y-2">
        {page.links.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            <p className="text-sm">No links yet — add your first link</p>
          </Card>
        ) : page.links.map(link => (
          <Card key={link.id} className="p-3 flex items-center gap-3">
            <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{link.title}</p>
              <p className="text-xs text-muted-foreground truncate">{link.url}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{link.clicks} clicks</p>
            </div>
            <Switch checked={link.isActive} onCheckedChange={v=>handleToggleLink(link.id,v)} className="scale-75" />
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={()=>handleRemoveLink(link.id)}><Trash2 className="w-3.5 h-3.5"/></Button>
          </Card>
        ))}
      </div>

      <Dialog open={showSetup} onOpenChange={setShowSetup}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Edit Page</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5"><Label className="text-xs">Page title</Label><Input className="h-8 text-sm" value={pageForm.title} onChange={e=>setPageForm(f=>({...f,title:e.target.value}))} /></div>
            <div className="space-y-1.5"><Label className="text-xs">Slug</Label>
              <div className="flex items-center gap-1"><span className="text-xs text-muted-foreground">/l/</span><Input className="h-8 text-sm" value={pageForm.slug} onChange={e=>setPageForm(f=>({...f,slug:e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,'-')}))} /></div>
            </div>
            <div className="space-y-1.5"><Label className="text-xs">Bio</Label><Input className="h-8 text-sm" value={pageForm.bio} onChange={e=>setPageForm(f=>({...f,bio:e.target.value}))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=>setShowSetup(false)}>Cancel</Button>
            <Button onClick={handleSavePage} disabled={saving}>{saving?<RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5"/>:null}Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Link</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5"><Label className="text-xs">Link title</Label><Input className="h-8 text-sm" value={linkForm.title} onChange={e=>setLinkForm(f=>({...f,title:e.target.value}))} placeholder="My Website" /></div>
            <div className="space-y-1.5"><Label className="text-xs">URL</Label><Input className="h-8 text-sm" value={linkForm.url} onChange={e=>setLinkForm(f=>({...f,url:e.target.value}))} placeholder="https://" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=>setShowLinkDialog(false)}>Cancel</Button>
            <Button onClick={handleAddLink} disabled={!linkForm.title||!linkForm.url||saving}>{saving?<RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5"/>:null}Add Link</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
