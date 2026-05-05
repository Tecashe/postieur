'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Link2, Plus, Trash2, GripVertical, Eye, Edit3, ExternalLink,
  Instagram, Twitter, Linkedin, Youtube, Globe,
} from 'lucide-react'
import { MOCK_LINK_IN_BIO } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import type { LinkInBioLink } from '@/lib/types'

const ICON_MAP: Record<string, React.ElementType> = {
  instagram: Instagram,
  twitter: Twitter,
  linkedin: Linkedin,
  youtube: Youtube,
}

function LinkRow({ link, onRemove }: { link: LinkInBioLink; onRemove: () => void }) {
  const IconComp = link.platform ? ICON_MAP[link.platform] : Globe
  return (
    <div className="flex items-center gap-2.5 px-3 py-2.5 border border-border rounded-sm bg-card hover:bg-muted/20 transition-colors group">
      <GripVertical className="w-3.5 h-3.5 text-muted-foreground/40 cursor-grab flex-shrink-0" />
      <div className="w-7 h-7 rounded-sm bg-muted flex items-center justify-center flex-shrink-0">
        {IconComp && <IconComp className="w-3.5 h-3.5 text-muted-foreground" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-foreground truncate">{link.title}</p>
        <p className="text-[10px] text-muted-foreground truncate">{link.url}</p>
      </div>
      {link.clicks !== undefined && (
        <span className="text-[10px] text-muted-foreground font-mono flex-shrink-0">{link.clicks} clicks</span>
      )}
      <button onClick={onRemove} className="text-muted-foreground/30 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

export default function LinkInBioPage() {
  const page = MOCK_LINK_IN_BIO
  const [links, setLinks] = useState<LinkInBioLink[]>(page?.links ?? [])
  const [newTitle, setNewTitle] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [showPreview, setShowPreview] = useState(true)

  const addLink = () => {
    if (!newTitle || !newUrl) return
    setLinks(prev => [...prev, {
      id: `link-${Date.now()}`,
      title: newTitle,
      url: newUrl,
      isActive: true,
    }])
    setNewTitle('')
    setNewUrl('')
  }

  const removeLink = (id: string) => setLinks(prev => prev.filter(l => l.id !== id))

  const totalClicks = links.reduce((s, l) => s + (l.clicks ?? 0), 0)

  return (
    <div className="space-y-4 pb-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-card border-border shadow-sm p-4">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">Links</p>
          <p className="text-2xl font-light text-foreground mt-1">{links.length}</p>
        </Card>
        <Card className="bg-accent/5 border-accent/20 shadow-sm p-4">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">Total Clicks</p>
          <p className="text-2xl font-light text-accent mt-1">{totalClicks.toLocaleString()}</p>
        </Card>
        <Card className="bg-card border-border shadow-sm p-4">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">Page Views</p>
          <p className="text-2xl font-light text-foreground mt-1">{(page?.pageViews ?? 0).toLocaleString()}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-5">
        {/* Editor */}
        <div className="space-y-4">
          {/* Page info */}
          <Card className="bg-card border-border shadow-sm p-4">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest mb-3">Page Settings</p>
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Display Name</Label>
                <Input defaultValue={page?.title ?? ''} className="mt-1 h-8 text-xs bg-input border-border" />
              </div>
              <div>
                <Label className="text-xs">Bio</Label>
                <Input defaultValue={page?.bio ?? ''} className="mt-1 h-8 text-xs bg-input border-border" />
              </div>
              <div>
                <Label className="text-xs">Page URL</Label>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">caelpost.com/</span>
                  <Input defaultValue={page?.slug ?? ''} className="flex-1 h-8 text-xs bg-input border-border" />
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-border">
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Links */}
          <Card className="bg-card border-border shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">Links</p>
              <p className="text-[10px] text-muted-foreground">Drag to reorder</p>
            </div>
            <div className="space-y-2 mb-4">
              {links.map(link => (
                <LinkRow key={link.id} link={link} onRemove={() => removeLink(link.id)} />
              ))}
            </div>

            {/* Add link form */}
            <div className="border-t border-border pt-3 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Title" className="h-8 text-xs bg-input border-border" />
                <Input value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="https://..." className="h-8 text-xs bg-input border-border" />
              </div>
              <Button onClick={addLink} disabled={!newTitle || !newUrl} size="sm" variant="outline" className="w-full text-xs gap-1.5 border-border">
                <Plus className="w-3.5 h-3.5" /> Add Link
              </Button>
            </div>
          </Card>

          <Button className="w-full text-xs gap-1.5">
            <Eye className="w-3.5 h-3.5" /> Save & Publish
          </Button>
        </div>

        {/* Phone preview */}
        {showPreview && (
          <div className="flex flex-col items-center">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest mb-3 text-center">Preview</p>
            <div className="w-52 border-2 border-border rounded-[24px] overflow-hidden bg-background shadow-md">
              <div className="h-4 bg-muted flex items-center justify-center">
                <div className="w-12 h-1 bg-muted-foreground/30 rounded-full" />
              </div>
              <div className="p-4 space-y-3">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/15 mx-auto mb-2 flex items-center justify-center">
                    <span className="text-base font-serif text-primary">{(page?.title ?? 'C').charAt(0)}</span>
                  </div>
                  <p className="text-[11px] font-medium text-foreground">{page?.title}</p>
                  <p className="text-[9px] text-muted-foreground mt-0.5">{page?.bio}</p>
                </div>
                <div className="space-y-1.5">
                  {links.slice(0, 5).map(link => {
                    const IconComp = link.platform ? ICON_MAP[link.platform] : Globe
                    return (
                      <div key={link.id} className="w-full px-3 py-2 rounded-sm border border-border bg-card flex items-center gap-2">
                        {IconComp && <IconComp className="w-3 h-3 text-muted-foreground" />}
                        <span className="text-[10px] text-foreground truncate">{link.title}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
