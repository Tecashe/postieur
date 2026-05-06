'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Search, Grid3X3, List, Upload, FolderOpen, Image as ImageIcon, Video,
  FileImage, Trash2, Download, Copy, Plus, CheckCircle2, XCircle, RefreshCw,
  FolderPlus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

type DbMediaItem = {
  id: string; url: string; filename: string; mimeType: string; sizeBytes: number
  type: string; width: number | null; height: number | null
  duration: number | null; folder: string | null; createdAt: string
}

type UploadProgress = { file: string; progress: 'uploading' | 'done' | 'error'; id?: string }

function toDisplayType(t: string): 'image' | 'video' | 'gif' {
  if (t === 'VIDEO') return 'video'
  if (t === 'GIF') return 'gif'
  return 'image'
}

function formatSize(bytes: number) {
  if (bytes > 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  return `${(bytes / 1024).toFixed(0)} KB`
}

function MediaCard({ item, selected, onSelect }: { item: DbMediaItem; selected: boolean; onSelect: () => void }) {
  const displayType = toDisplayType(item.type)
  const Icon = displayType === 'video' ? Video : displayType === 'gif' ? FileImage : ImageIcon
  return (
    <div
      onClick={onSelect}
      className={cn(
        'group relative rounded-sm border overflow-hidden cursor-pointer transition-all',
        selected ? 'border-accent ring-1 ring-accent/30' : 'border-border hover:border-muted-foreground/30',
      )}
    >
      {/* Preview */}
      <div className="aspect-square flex items-center justify-center overflow-hidden bg-muted/30">
        {displayType === 'image' ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.url}
            alt={item.filename}
            className="w-full h-full object-cover"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        ) : (
          <Icon className="w-8 h-8 text-muted-foreground/30" />
        )}
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-all flex items-start justify-end p-1.5 opacity-0 group-hover:opacity-100">
        <div className="flex gap-0.5">
          <button
            onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(item.url); toast.success('URL copied') }}
            className="w-6 h-6 bg-background/90 rounded-sm flex items-center justify-center hover:bg-background transition-colors"
            title="Copy URL"
          >
            <Copy className="w-3 h-3 text-foreground" />
          </button>
          <a
            href={item.url}
            download={item.filename}
            onClick={e => e.stopPropagation()}
            className="w-6 h-6 bg-background/90 rounded-sm flex items-center justify-center hover:bg-background transition-colors"
            title="Download"
          >
            <Download className="w-3 h-3 text-foreground" />
          </a>
        </div>
      </div>

      {/* Selection checkmark */}
      {selected && (
        <div className="absolute top-1.5 left-1.5 w-4 h-4 bg-accent rounded-sm flex items-center justify-center">
          <svg className="w-2.5 h-2.5 text-accent-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      {/* Footer */}
      <div className="px-2 py-1.5 border-t border-border bg-card">
        <p className="text-[10px] text-foreground font-medium truncate">{item.filename}</p>
        <p className="text-[9px] text-muted-foreground">{formatSize(item.sizeBytes)}</p>
      </div>
    </div>
  )
}

export default function MediaPage() {
  const [search, setSearch]       = useState('')
  const [folder, setFolder]       = useState<string | null>(null) // null = All
  const [folders, setFolders]     = useState<string[]>([])
  const [view, setView]           = useState<'grid' | 'list'>('grid')
  const [selected, setSelected]   = useState<Set<string>>(new Set())
  const [media, setMedia]         = useState<DbMediaItem[]>([])
  const [loading, setLoading]     = useState(true)
  const [uploads, setUploads]     = useState<UploadProgress[]>([])
  const [newFolderOpen, setNewFolderOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [isDragOver, setIsDragOver]       = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: '100' })
      if (folder) params.set('folder', folder)
      const data = await fetch(`/api/media?${params}`).then(r => r.json()) as { items: DbMediaItem[]; folders: string[] }
      setMedia(data.items ?? [])
      setFolders(data.folders ?? [])
    } catch {
      toast.error('Failed to load media')
    } finally {
      setLoading(false)
    }
  }, [folder])

  useEffect(() => { load() }, [load])

  // ── Multi-file upload ────────────────────────────────────────────────────
  const uploadFiles = useCallback(async (files: File[]) => {
    if (files.length === 0) return

    // Track progress for each file
    const initial: UploadProgress[] = files.map(f => ({ file: f.name, progress: 'uploading' }))
    setUploads(initial)

    const newItems: DbMediaItem[] = []
    await Promise.all(files.map(async (file, idx) => {
      try {
        const form = new FormData()
        form.append('file', file)
        if (folder) form.append('folder', folder)
        const res = await fetch('/api/media', { method: 'POST', body: form })
        if (!res.ok) throw new Error(await res.text())
        const data = await res.json() as { items: DbMediaItem[] }
        if (data.items?.[0]) newItems.push(data.items[0])
        setUploads(prev => prev.map((u, i) => i === idx ? { ...u, progress: 'done' } : u))
      } catch {
        setUploads(prev => prev.map((u, i) => i === idx ? { ...u, progress: 'error' } : u))
      }
    }))

    if (newItems.length > 0) {
      setMedia(prev => [...newItems, ...prev])
      toast.success(`${newItems.length} file${newItems.length > 1 ? 's' : ''} uploaded`)
    }
    // Clear progress bar after 2s
    setTimeout(() => setUploads([]), 2000)
  }, [folder])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length > 0) uploadFiles(files)
    e.target.value = ''
  }

  // ── Drag & drop ──────────────────────────────────────────────────────────
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) uploadFiles(files)
  }

  // ── Delete selected ──────────────────────────────────────────────────────
  const handleDeleteSelected = async () => {
    const ids = Array.from(selected)
    setMedia(prev => prev.filter(m => !selected.has(m.id)))
    setSelected(new Set())
    try {
      await Promise.all(ids.map(id =>
        fetch(`/api/media/${id}`, { method: 'DELETE' })
      ))
      toast.success(`${ids.length} item${ids.length > 1 ? 's' : ''} deleted`)
    } catch {
      toast.error('Failed to delete some items')
      await load()
    }
  }

  // ── New folder ───────────────────────────────────────────────────────────
  const handleCreateFolder = () => {
    const name = newFolderName.trim()
    if (!name) return
    if (!folders.includes(name)) {
      setFolders(prev => [...prev, name])
    }
    setFolder(name)
    setNewFolderName('')
    setNewFolderOpen(false)
    toast.success(`Folder "${name}" created`)
  }

  // ── Toggle select ────────────────────────────────────────────────────────
  const toggleSelect = (id: string) => setSelected(prev => {
    const next = new Set(prev)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })

  const filtered = media.filter(m =>
    !search || m.filename.toLowerCase().includes(search.toLowerCase()) ||
    m.mimeType.toLowerCase().includes(search.toLowerCase())
  )

  const uploadingCount = uploads.filter(u => u.progress === 'uploading').length
  const doneCount = uploads.filter(u => u.progress === 'done').length
  const errorCount = uploads.filter(u => u.progress === 'error').length

  return (
    <div className="flex gap-4 h-full pb-6">
      {/* Hidden file input — multiple enabled */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*,video/mp4,video/webm,video/quicktime"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Folder sidebar */}
      <div className="w-44 flex-shrink-0 space-y-1">
        <Button
          size="sm"
          className="w-full gap-1.5 text-xs mb-3"
          onClick={() => fileRef.current?.click()}
          disabled={uploadingCount > 0}
        >
          {uploadingCount > 0
            ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Uploading…</>
            : <><Upload className="w-3.5 h-3.5" /> Upload</>
          }
        </Button>

        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest px-2 mb-1">
          Folders
        </p>

        {/* All */}
        <button
          onClick={() => setFolder(null)}
          className={cn(
            'w-full flex items-center gap-2 px-2 py-1.5 rounded-sm text-xs transition-all text-left',
            folder === null
              ? 'bg-primary/8 text-primary font-medium'
              : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
          )}
        >
          <FolderOpen className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">All</span>
          <span className="ml-auto text-[10px] font-mono text-muted-foreground/60">{media.length}</span>
        </button>

        {/* User folders */}
        {folders.map(f => (
          <button
            key={f}
            onClick={() => setFolder(f)}
            className={cn(
              'w-full flex items-center gap-2 px-2 py-1.5 rounded-sm text-xs transition-all text-left',
              folder === f
                ? 'bg-primary/8 text-primary font-medium'
                : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
            )}
          >
            <FolderOpen className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{f}</span>
          </button>
        ))}

        {/* New folder button */}
        <button
          onClick={() => { setNewFolderName(''); setNewFolderOpen(true) }}
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-sm text-xs text-accent hover:bg-accent/8 transition-all text-left mt-1"
        >
          <FolderPlus className="w-3.5 h-3.5 flex-shrink-0" />
          <span>New Folder</span>
        </button>
      </div>

      {/* Main content */}
      <div
        className={cn(
          'flex-1 min-w-0 space-y-3 transition-all',
          isDragOver && 'ring-2 ring-accent/40 rounded-lg',
        )}
        onDragOver={e => { e.preventDefault(); setIsDragOver(true) }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
      >
        {/* Drag overlay hint */}
        {isDragOver && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/80 pointer-events-none rounded-lg">
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-10 h-10 text-accent" />
              <p className="text-sm font-medium text-foreground">Drop files to upload</p>
            </div>
          </div>
        )}

        {/* Upload progress bar */}
        {uploads.length > 0 && (
          <Card className="bg-card border-border p-3 flex items-center gap-3">
            {uploadingCount > 0 ? (
              <RefreshCw className="w-4 h-4 text-accent animate-spin flex-shrink-0" />
            ) : errorCount > 0 ? (
              <XCircle className="w-4 h-4 text-destructive flex-shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs text-foreground">
                {uploadingCount > 0
                  ? `Uploading ${uploadingCount} of ${uploads.length} file${uploads.length > 1 ? 's' : ''}…`
                  : `${doneCount} uploaded${errorCount > 0 ? `, ${errorCount} failed` : ''}`
                }
              </p>
              <div className="flex gap-0.5 mt-1.5">
                {uploads.map((u, i) => (
                  <div
                    key={i}
                    title={u.file}
                    className={cn(
                      'flex-1 h-1 rounded-full transition-colors',
                      u.progress === 'done' ? 'bg-emerald-500' :
                      u.progress === 'error' ? 'bg-destructive' :
                      'bg-accent/40 animate-pulse',
                    )}
                  />
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Toolbar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by filename…"
              className="pl-8 h-8 text-xs bg-input border-border"
            />
          </div>

          {selected.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{selected.size} selected</span>
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-destructive hover:bg-destructive/5" onClick={handleDeleteSelected}>
                <Trash2 className="w-3 h-3" /> Delete
              </Button>
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

        <p className="text-[11px] text-muted-foreground">
          {filtered.length} item{filtered.length !== 1 ? 's' : ''}
          {folder ? ` in "${folder}"` : ''}
        </p>

        {loading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
            {[1,2,3,4,5,6].map(i => <div key={i} className="aspect-square rounded-sm bg-muted/30 animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="py-20 text-center border-2 border-dashed border-border rounded-lg hover:border-accent/30 transition-colors cursor-pointer"
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {search ? 'No files match your search' : 'Drop files here or click to upload'}
            </p>
            {!search && (
              <p className="text-xs text-muted-foreground/60 mt-1">Images, GIFs, and videos up to 50 MB</p>
            )}
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
                  <div
                    key={item.id}
                    onClick={() => toggleSelect(item.id)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 hover:bg-muted/20 cursor-pointer transition-colors',
                      selected.has(item.id) && 'bg-accent/5',
                    )}
                  >
                    <div className="w-8 h-8 rounded-sm bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {displayType === 'image' ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.url} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                      ) : (
                        <Icon className="w-4 h-4 text-muted-foreground/50" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{item.filename}</p>
                      <p className="text-[10px] text-muted-foreground">{item.mimeType}</p>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground">{formatSize(item.sizeBytes)}</span>
                    <Badge className="text-[10px] border-0 bg-muted text-muted-foreground">{displayType}</Badge>
                    <div className="flex gap-1">
                      <button
                        onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(item.url); toast.success('URL copied') }}
                        className="w-6 h-6 flex items-center justify-center rounded-sm text-muted-foreground/50 hover:text-foreground hover:bg-muted/60 transition-colors"
                        title="Copy URL"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      <a
                        href={item.url}
                        download={item.filename}
                        onClick={e => e.stopPropagation()}
                        className="w-6 h-6 flex items-center justify-center rounded-sm text-muted-foreground/50 hover:text-foreground hover:bg-muted/60 transition-colors"
                        title="Download"
                      >
                        <Download className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        )}
      </div>

      {/* New Folder dialog */}
      <Dialog open={newFolderOpen} onOpenChange={setNewFolderOpen}>
        <DialogContent className="max-w-sm bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-sm font-medium">New Folder</DialogTitle>
          </DialogHeader>
          <div className="mt-2">
            <Label className="text-[11px] uppercase tracking-widest text-muted-foreground">Folder name</Label>
            <Input
              className="mt-1.5 h-8 text-sm bg-input border-border"
              value={newFolderName}
              onChange={e => setNewFolderName(e.target.value)}
              placeholder="e.g. Brand Assets"
              autoFocus
              onKeyDown={e => e.key === 'Enter' && handleCreateFolder()}
            />
          </div>
          <DialogFooter className="mt-2">
            <Button variant="outline" size="sm" onClick={() => setNewFolderOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleCreateFolder} disabled={!newFolderName.trim()}>
              <Plus className="w-3.5 h-3.5 mr-1.5" /> Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
