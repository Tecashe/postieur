'use client'

import { useState, useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Search, Grid3X3, List, Upload, FolderOpen, Image as ImageIcon, Video,
  FileImage, Trash2, Download, Copy, MoreVertical, Plus,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type DbMediaItem = {
  id: string; url: string; mimeType: string; sizeBytes: number
  type: string; width: number | null; height: number | null
  duration: number | null; createdAt: string
}

function toDisplayType(t: string): 'image' | 'video' | 'gif' {
  if (t === 'VIDEO') return 'video'
  if (t === 'GIF') return 'gif'
  return 'image'
}

function getFileName(url: string) {
  return url.split('/').pop()?.split('?')[0] ?? 'media'
}

const FOLDERS = ['All']

function formatSize(bytes: number) {
  if (bytes > 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  return `${(bytes / 1024).toFixed(0)} KB`
}

function MediaCard({ item, selected, onSelect }: { item: DbMediaItem; selected: boolean; onSelect: () => void }) {
  const displayType = toDisplayType(item.type)
  const bg = displayType === 'image' ? 'bg-primary/5' : displayType === 'video' ? 'bg-accent/5' : 'bg-muted'
  const Icon = displayType === 'video' ? Video : displayType === 'gif' ? FileImage : ImageIcon
  return (
    <div onClick={onSelect}
      className={cn('group relative rounded-sm border overflow-hidden cursor-pointer transition-all',
        selected ? 'border-accent ring-1 ring-accent/30' : 'border-border hover:border-border')}>
      {/* Preview */}
      <div className={cn('aspect-square flex items-center justify-center overflow-hidden', bg)}>
        {displayType === 'image' ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.url} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
        ) : (
          <Icon className="w-8 h-8 text-muted-foreground/30" />
        )}
      </div>
      {/* Overlay */}
      <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-all flex items-start justify-end p-1.5 opacity-0 group-hover:opacity-100">
        <div className="flex gap-0.5">
          <button onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(item.url) }} className="w-6 h-6 bg-background/90 rounded-sm flex items-center justify-center hover:bg-background">
            <Copy className="w-3 h-3 text-foreground" />
          </button>
          <a href={item.url} download onClick={e => e.stopPropagation()} className="w-6 h-6 bg-background/90 rounded-sm flex items-center justify-center hover:bg-background">
            <Download className="w-3 h-3 text-foreground" />
          </a>
        </div>
      </div>
      {selected && (
        <div className="absolute top-1.5 left-1.5 w-4 h-4 bg-accent rounded-sm flex items-center justify-center">
          <svg className="w-2.5 h-2.5 text-accent-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
      <div className="px-2 py-1.5 border-t border-border bg-card">
        <p className="text-[10px] text-foreground font-medium truncate">{getFileName(item.url)}</p>
        <p className="text-[9px] text-muted-foreground">{formatSize(item.sizeBytes)}</p>
      </div>
    </div>
  )
}

export default function MediaPage() {
  const [search, setSearch] = useState('')
  const [folder, setFolder] = useState('All')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [media, setMedia] = useState<DbMediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/media')
      .then(r => r.json())
      .then((data: { items?: DbMediaItem[] }) => setMedia(data.items ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleUpload = async (file: File) => {
    const form = new FormData()
    form.append('file', file)
    const res = await fetch('/api/media', { method: 'POST', body: form })
    if (res.ok) {
      const { item } = await res.json()
      setMedia(prev => [item, ...prev])
    }
  }

  const toggleSelect = (id: string) => setSelected(prev => {
    const next = new Set(prev)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })

  const filtered = media.filter(m =>
    !search || getFileName(m.url).toLowerCase().includes(search.toLowerCase()) ||
    m.mimeType.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex gap-4 h-full pb-6">
      {/* Folder tree */}
      <div className="w-44 flex-shrink-0 space-y-1">
        <input ref={fileRef} type="file" accept="image/*,video/mp4,video/webm" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f) }} />
        <Button size="sm" className="w-full gap-1.5 text-xs mb-3" onClick={() => fileRef.current?.click()}>
          <Upload className="w-3.5 h-3.5" /> Upload
        </Button>
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest px-2 mb-1">Folders</p>
        {FOLDERS.map(f => (
          <button key={f} onClick={() => setFolder(f)}
            className={cn('w-full flex items-center gap-2 px-2 py-1.5 rounded-sm text-xs transition-all text-left',
              folder === f ? 'bg-primary/8 text-primary' : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground')}>
            <FolderOpen className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{f}</span>
          </button>
        ))}
        <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-sm text-xs text-muted-foreground/50 hover:text-muted-foreground transition-all">
          <Plus className="w-3.5 h-3.5" /> New Folder
        </button>
      </div>

      {/* Main */}
      <div className="flex-1 min-w-0 space-y-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search media..." className="pl-8 h-8 text-xs bg-input border-border" />
          </div>
          {selected.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{selected.size} selected</span>
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1 border-border"><Download className="w-3 h-3" /> Download</Button>
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-destructive hover:bg-destructive/5"><Trash2 className="w-3 h-3" /> Delete</Button>
            </div>
          )}
          <div className="ml-auto flex gap-1 border border-border rounded-sm p-0.5">
            <button onClick={() => setView('grid')} className={cn('p-1.5 rounded-[2px] transition-all', view === 'grid' ? 'bg-muted' : 'text-muted-foreground hover:text-foreground')}>
              <Grid3X3 className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setView('list')} className={cn('p-1.5 rounded-[2px] transition-all', view === 'list' ? 'bg-muted' : 'text-muted-foreground hover:text-foreground')}>
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground">{filtered.length} items</p>

        {loading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
            {[1,2,3,4,5,6].map(i => <div key={i} className="aspect-square rounded-sm bg-muted/30 animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <ImageIcon className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No media uploaded yet</p>
            <Button variant="ghost" size="sm" className="mt-3 text-xs text-accent hover:bg-accent/5 gap-1" onClick={() => fileRef.current?.click()}>
              <Upload className="w-3 h-3" /> Upload your first file
            </Button>
          </div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
            {filtered.map(item => (
              <MediaCard key={item.id} item={item} selected={selected.has(item.id)} onSelect={() => toggleSelect(item.id)} />
            ))}
          </div>
        ) : (
          <Card className="bg-card border-border shadow-sm overflow-hidden">
            <div className="divide-y divide-border">
              {filtered.map(item => {
                const displayType = toDisplayType(item.type)
                const Icon = displayType === 'video' ? Video : displayType === 'gif' ? FileImage : ImageIcon
                return (
                  <div key={item.id} onClick={() => toggleSelect(item.id)}
                    className={cn('flex items-center gap-3 px-4 py-3 hover:bg-muted/20 cursor-pointer transition-colors',
                      selected.has(item.id) && 'bg-accent/5')}>
                    <div className="w-8 h-8 rounded-sm bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {displayType === 'image' ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.url} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                      ) : (
                        <Icon className="w-4 h-4 text-muted-foreground/50" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{getFileName(item.url)}</p>
                      <p className="text-[10px] text-muted-foreground">{item.mimeType}</p>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground">{formatSize(item.sizeBytes)}</span>
                    <Badge className="text-[10px] border-0 bg-muted text-muted-foreground">{displayType}</Badge>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground">
                      <MoreVertical className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )
              })}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
