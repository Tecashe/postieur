'use client'

import {
  useState, useEffect, useRef, useCallback, useMemo,
} from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Search, Grid3X3, List, Upload, FolderOpen, Image as ImageIcon, Video,
  FileImage, Trash2, Download, Copy, Plus, CheckCircle2, XCircle, RefreshCw,
  FolderPlus, Eye, Send, ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut,
  MoreHorizontal, AlignLeft, SortAsc, SortDesc, LayoutGrid, Rows3,
  Maximize2, Pencil, FolderInput, Check, StretchHorizontal,
  ArrowDownToLine,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

// ─── Types ────────────────────────────────────────────────────────────────────

type DbMediaItem = {
  id: string
  url: string
  filename: string
  mimeType: string
  sizeBytes: number
  type: string
  width: number | null
  height: number | null
  duration: number | null
  folder: string | null
  createdAt: string
}

type UploadProgress = {
  file: string
  progress: 'uploading' | 'done' | 'error'
  id?: string
}

type SortKey = 'date' | 'name' | 'size'
type SortDir = 'asc' | 'desc'
type TypeFilter = 'all' | 'image' | 'video' | 'gif'
type GridDensity = 'sm' | 'md' | 'lg'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toDisplayType(t: string): 'image' | 'video' | 'gif' {
  if (t === 'VIDEO') return 'video'
  if (t === 'GIF') return 'gif'
  return 'image'
}

function formatSize(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  return `${(bytes / 1024).toFixed(0)} KB`
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

function densityClass(d: GridDensity) {
  return {
    sm: 'grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10',
    md: 'grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7',
    lg: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
  }[d]
}

// ─── MediaCard ────────────────────────────────────────────────────────────────

function MediaCard({
  item,
  selected,
  anySelected,
  onCheck,
  onOpen,
  onLightbox,
  onContext,
  onDragStart,
}: {
  item: DbMediaItem
  selected: boolean
  anySelected: boolean
  onCheck: (shift: boolean) => void
  onOpen: () => void
  onLightbox: () => void
  onContext: (e: React.MouseEvent) => void
  onDragStart: (e: React.DragEvent) => void
}) {
  const displayType = toDisplayType(item.type)
  const TypeIcon = displayType === 'video' ? Video : displayType === 'gif' ? FileImage : ImageIcon

  return (
    <div
      className={cn(
        'group relative rounded-md border overflow-hidden cursor-pointer transition-all duration-150 select-none',
        selected
          ? 'border-accent ring-1 ring-accent/40 shadow-[0_0_0_2px_hsl(var(--accent)/0.15)]'
          : 'border-border hover:border-muted-foreground/40 hover:shadow-sm',
      )}
      onClick={onOpen}
      onContextMenu={onContext}
      draggable
      onDragStart={onDragStart}
    >
      {/* Thumbnail */}
      <div className="aspect-square bg-muted/30 overflow-hidden flex items-center justify-center">
        {displayType === 'image' || displayType === 'gif' ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.url}
            alt={item.filename}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            loading="lazy"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        ) : (
          <TypeIcon className="w-8 h-8 text-muted-foreground/30" />
        )}
      </div>

      {/* Hover gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none" />

      {/* Hover action buttons */}
      <div className="absolute top-1.5 right-1.5 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        <button
          title="Preview"
          onClick={e => { e.stopPropagation(); onLightbox() }}
          className="w-6 h-6 bg-background/90 backdrop-blur-sm rounded flex items-center justify-center hover:bg-background shadow-sm transition-colors pointer-events-auto"
        >
          <Maximize2 className="w-3 h-3 text-foreground" />
        </button>
        <button
          title="Use in Post"
          onClick={e => { e.stopPropagation(); window.location.href = `/dashboard/compose?mediaUrl=${encodeURIComponent(item.url)}` }}
          className="w-6 h-6 bg-background/90 backdrop-blur-sm rounded flex items-center justify-center hover:bg-background shadow-sm transition-colors pointer-events-auto"
        >
          <Send className="w-3 h-3 text-foreground" />
        </button>
        <button
          title="Copy URL"
          onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(item.url); toast.success('URL copied') }}
          className="w-6 h-6 bg-background/90 backdrop-blur-sm rounded flex items-center justify-center hover:bg-background shadow-sm transition-colors pointer-events-auto"
        >
          <Copy className="w-3 h-3 text-foreground" />
        </button>
      </div>

      {/* Checkbox */}
      <div
        className={cn(
          'absolute top-1.5 left-1.5 transition-opacity duration-100 pointer-events-auto',
          selected || anySelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
        )}
        onClick={e => { e.stopPropagation(); onCheck(e.shiftKey) }}
      >
        <div className={cn(
          'w-4 h-4 rounded border flex items-center justify-center transition-all',
          selected
            ? 'bg-accent border-accent'
            : 'bg-background/80 border-border/60 backdrop-blur-sm hover:border-accent',
        )}>
          {selected && <Check className="w-2.5 h-2.5 text-accent-foreground" />}
        </div>
      </div>

      {/* Footer strip */}
      <div className="px-2 py-1.5 border-t border-border bg-card">
        <p className="text-[10px] font-medium text-foreground truncate leading-tight">{item.filename}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[9px] text-muted-foreground">{formatSize(item.sizeBytes)}</span>
          {item.width && item.height && (
            <span className="text-[9px] text-muted-foreground/50 tabular-nums">{item.width}×{item.height}</span>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────

function Lightbox({
  items,
  index,
  onClose,
  onNavigate,
}: {
  items: DbMediaItem[]
  index: number
  onClose: () => void
  onNavigate: (i: number) => void
}) {
  const item = items[index]
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const dragStart = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null)

  useEffect(() => { setZoom(1); setOffset({ x: 0, y: 0 }) }, [index])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onNavigate(Math.max(0, index - 1))
      if (e.key === 'ArrowRight') onNavigate(Math.min(items.length - 1, index + 1))
      if (e.key === '+' || e.key === '=') setZoom(z => Math.min(z + 0.25, 5))
      if (e.key === '-') setZoom(z => Math.max(z - 0.25, 0.25))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, items.length, onClose, onNavigate])

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    setZoom(z => Math.min(Math.max(z - e.deltaY * 0.001, 0.25), 5))
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return
    dragStart.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y }
  }
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragStart.current) return
    setOffset({ x: dragStart.current.ox + (e.clientX - dragStart.current.x), y: dragStart.current.oy + (e.clientY - dragStart.current.y) })
  }
  const handleMouseUp = () => { dragStart.current = null }

  if (!item) return null
  const displayType = toDisplayType(item.type)

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col" onClick={onClose}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border/40 flex-shrink-0" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3">
          <p className="text-sm font-medium text-foreground truncate max-w-xs">{item.filename}</p>
          {item.width && item.height && <span className="text-xs text-muted-foreground">{item.width}×{item.height}</span>}
          <span className="text-xs text-muted-foreground">{formatSize(item.sizeBytes)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground tabular-nums">{index + 1} / {items.length}</span>
          <button onClick={() => setZoom(z => Math.max(z - 0.25, 0.25))} className="w-7 h-7 rounded border border-border flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs tabular-nums text-muted-foreground w-10 text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.min(z + 0.25, 5))} className="w-7 h-7 rounded border border-border flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(item.url); toast.success('URL copied') }} className="w-7 h-7 rounded border border-border flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
            <Copy className="w-3.5 h-3.5" />
          </button>
          <a href={item.url} download={item.filename} onClick={e => e.stopPropagation()} className="w-7 h-7 rounded border border-border flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
            <ArrowDownToLine className="w-3.5 h-3.5" />
          </a>
          <button onClick={e => { e.stopPropagation(); window.location.href = `/dashboard/compose?mediaUrl=${encodeURIComponent(item.url)}` }} className="h-7 px-3 rounded border border-accent/40 bg-accent/10 flex items-center gap-1.5 text-xs text-accent hover:bg-accent/20 transition-colors">
            <Send className="w-3 h-3" /> Use in Post
          </button>
          <button onClick={onClose} className="w-7 h-7 rounded border border-border flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Image area */}
      <div
        className="flex-1 flex items-center justify-center overflow-hidden relative"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={e => e.stopPropagation()}
        style={{ cursor: zoom > 1 ? 'grab' : 'default' }}
      >
        {displayType === 'video' ? (
          <video src={item.url} controls className="max-w-full max-h-full rounded" style={{ transform: `scale(${zoom}) translate(${offset.x / zoom}px, ${offset.y / zoom}px)` }} />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.url}
            alt={item.filename}
            draggable={false}
            className="max-w-full max-h-full object-contain rounded transition-transform duration-75"
            style={{ transform: `scale(${zoom}) translate(${offset.x / zoom}px, ${offset.y / zoom}px)`, transformOrigin: 'center center' }}
          />
        )}
      </div>

      {/* Prev / Next arrows */}
      {index > 0 && (
        <button className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full border border-border bg-card/90 backdrop-blur-sm flex items-center justify-center hover:bg-card shadow-md transition-all z-10" onClick={e => { e.stopPropagation(); onNavigate(index - 1) }}>
          <ChevronLeft className="w-4 h-4 text-foreground" />
        </button>
      )}
      {index < items.length - 1 && (
        <button className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full border border-border bg-card/90 backdrop-blur-sm flex items-center justify-center hover:bg-card shadow-md transition-all z-10" onClick={e => { e.stopPropagation(); onNavigate(index + 1) }}>
          <ChevronRight className="w-4 h-4 text-foreground" />
        </button>
      )}

      {/* Film strip */}
      <div className="flex-shrink-0 border-t border-border/40 py-2 px-5 overflow-x-auto flex gap-1.5" onClick={e => e.stopPropagation()}>
        {items.map((it, i) => (
          <button key={it.id} onClick={() => onNavigate(i)} className={cn('flex-shrink-0 w-12 h-12 rounded overflow-hidden border transition-all', i === index ? 'border-accent ring-1 ring-accent/40' : 'border-border/40 opacity-50 hover:opacity-80')}>
            {toDisplayType(it.type) !== 'video' ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={it.url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted"><Video className="w-4 h-4 text-muted-foreground/40" /></div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Context Menu ─────────────────────────────────────────────────────────────

function ContextMenu({ item, x, y, onClose, onLightbox, onDetail, onMove, onDelete }: {
  item: DbMediaItem; x: number; y: number
  onClose: () => void; onLightbox: () => void; onDetail: () => void
  onMove: () => void; onDelete: () => void
}) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const close = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose() }
    const closeKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', closeKey)
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', closeKey) }
  }, [onClose])

  return (
    <div ref={menuRef} className="fixed z-50 min-w-[168px] rounded-md border border-border bg-card shadow-xl py-1 text-xs" style={{ top: y, left: x }}>
      <button onClick={() => { onDetail(); onClose() }} className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-muted transition-colors text-foreground text-left">
        <Eye className="w-3.5 h-3.5 text-muted-foreground" /> Open Details
      </button>
      <button onClick={() => { onLightbox(); onClose() }} className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-muted transition-colors text-foreground text-left">
        <Maximize2 className="w-3.5 h-3.5 text-muted-foreground" /> Preview
      </button>
      <button onClick={() => { window.location.href = `/dashboard/compose?mediaUrl=${encodeURIComponent(item.url)}`; onClose() }} className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-muted transition-colors text-foreground text-left">
        <Send className="w-3.5 h-3.5 text-muted-foreground" /> Use in Post
      </button>
      <div className="my-1 border-t border-border/60" />
      <button onClick={() => { navigator.clipboard.writeText(item.url); toast.success('URL copied'); onClose() }} className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-muted transition-colors text-foreground text-left">
        <Copy className="w-3.5 h-3.5 text-muted-foreground" /> Copy URL
      </button>
      <a href={item.url} download={item.filename} onClick={onClose} className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-muted transition-colors text-foreground">
        <ArrowDownToLine className="w-3.5 h-3.5 text-muted-foreground" /> Download
      </a>
      <button onClick={() => { onMove(); onClose() }} className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-muted transition-colors text-foreground text-left">
        <FolderInput className="w-3.5 h-3.5 text-muted-foreground" /> Move to Folder
      </button>
      <div className="my-1 border-t border-border/60" />
      <button onClick={() => { onDelete(); onClose() }} className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-muted/50 transition-colors text-destructive text-left">
        <Trash2 className="w-3.5 h-3.5" /> Delete
      </button>
    </div>
  )
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────

function DetailPanel({ item, folders, onClose, onDelete, onMove, onRename }: {
  item: DbMediaItem; folders: string[]
  onClose: () => void; onDelete: () => void
  onMove: (folder: string | null) => void; onRename: (name: string) => void
}) {
  const displayType = toDisplayType(item.type)
  const [editingName, setEditingName] = useState(false)
  const [nameVal, setNameVal] = useState(item.filename)
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setNameVal(item.filename); setEditingName(false) }, [item.id, item.filename])
  useEffect(() => { if (editingName) nameRef.current?.select() }, [editingName])

  const commitRename = () => {
    const trimmed = nameVal.trim()
    if (trimmed && trimmed !== item.filename) onRename(trimmed)
    setEditingName(false)
  }

  return (
    <div className="w-72 flex-shrink-0 border-l border-border bg-card flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <span className="text-xs font-medium text-foreground uppercase tracking-widest">Details</span>
        <button onClick={onClose} className="w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"><X className="w-3.5 h-3.5" /></button>
      </div>

      {/* Preview */}
      <div className="aspect-square bg-muted/30 flex items-center justify-center overflow-hidden border-b border-border flex-shrink-0">
        {displayType === 'video' ? (
          <video src={item.url} controls className="w-full h-full object-contain" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.url} alt={item.filename} className="w-full h-full object-contain" />
        )}
      </div>

      {/* Metadata */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Filename */}
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Filename</p>
          {editingName ? (
            <div className="flex gap-1">
              <Input ref={nameRef} value={nameVal} onChange={e => setNameVal(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setEditingName(false) }} className="h-7 text-xs bg-input border-border flex-1" />
              <button onClick={commitRename} className="w-7 h-7 flex items-center justify-center border border-accent/40 rounded text-accent hover:bg-accent/10 transition-colors"><Check className="w-3.5 h-3.5" /></button>
            </div>
          ) : (
            <div className="flex items-center gap-1 group/name">
              <p className="text-xs text-foreground break-all leading-snug flex-1">{item.filename}</p>
              <button onClick={() => setEditingName(true)} className="w-5 h-5 flex items-center justify-center opacity-0 group-hover/name:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"><Pencil className="w-3 h-3" /></button>
            </div>
          )}
        </div>

        {(item.width || item.height) && (
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Dimensions</p>
            <p className="text-xs text-foreground">{item.width ?? '—'} × {item.height ?? '—'} px</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Size</p>
            <p className="text-xs text-foreground">{formatSize(item.sizeBytes)}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Type</p>
            <p className="text-xs text-foreground uppercase">{displayType}</p>
          </div>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Uploaded</p>
          <p className="text-xs text-foreground">{formatDate(item.createdAt)}</p>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Folder</p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 text-xs text-foreground hover:text-accent transition-colors group/folder">
                <FolderOpen className="w-3.5 h-3.5 text-muted-foreground group-hover/folder:text-accent transition-colors" />
                {item.folder ?? 'No folder'}
                <Pencil className="w-2.5 h-2.5 text-muted-foreground opacity-0 group-hover/folder:opacity-100 transition-opacity" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="bg-card border-border text-xs min-w-[150px]">
              <DropdownMenuItem onClick={() => onMove(null)} className="text-xs">No folder</DropdownMenuItem>
              {folders.map(f => (
                <DropdownMenuItem key={f} onClick={() => onMove(f)} className="text-xs">{f}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-border space-y-2">
        <button onClick={() => { window.location.href = `/dashboard/compose?mediaUrl=${encodeURIComponent(item.url)}` }} className="w-full h-8 flex items-center justify-center gap-1.5 rounded border border-accent/40 bg-accent/10 text-xs text-accent hover:bg-accent/20 transition-colors">
          <Send className="w-3 h-3" /> Use in Post
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => { navigator.clipboard.writeText(item.url); toast.success('URL copied') }} className="h-8 flex items-center justify-center gap-1.5 rounded border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <Copy className="w-3 h-3" /> Copy URL
          </button>
          <a href={item.url} download={item.filename} className="h-8 flex items-center justify-center gap-1.5 rounded border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <ArrowDownToLine className="w-3 h-3" /> Download
          </a>
        </div>
        <button onClick={onDelete} className="w-full h-8 flex items-center justify-center gap-1.5 rounded border border-destructive/30 text-xs text-destructive hover:bg-destructive/8 transition-colors">
          <Trash2 className="w-3 h-3" /> Delete
        </button>
      </div>
    </div>
  )
}

// ─── Move to Folder Dialog ────────────────────────────────────────────────────

function MoveDialog({ open, folders, currentFolder, onClose, onMove }: {
  open: boolean; folders: string[]; currentFolder: string | null
  onClose: () => void; onMove: (folder: string | null) => void
}) {
  const [newName, setNewName] = useState('')
  const [showNew, setShowNew] = useState(false)
  const commit = (folder: string | null) => { onMove(folder); onClose() }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-xs bg-card border-border">
        <DialogHeader><DialogTitle className="text-sm font-medium">Move to Folder</DialogTitle></DialogHeader>
        <div className="mt-2 space-y-1 max-h-60 overflow-y-auto">
          <button onClick={() => commit(null)} className={cn('w-full flex items-center gap-2 px-3 py-2 rounded text-xs text-left transition-colors', currentFolder === null ? 'bg-accent/10 text-accent' : 'hover:bg-muted text-foreground')}>
            <FolderOpen className="w-3.5 h-3.5" /> No folder {currentFolder === null && <Check className="w-3 h-3 ml-auto" />}
          </button>
          {folders.map(f => (
            <button key={f} onClick={() => commit(f)} className={cn('w-full flex items-center gap-2 px-3 py-2 rounded text-xs text-left transition-colors', currentFolder === f ? 'bg-accent/10 text-accent' : 'hover:bg-muted text-foreground')}>
              <FolderOpen className="w-3.5 h-3.5" /> {f} {currentFolder === f && <Check className="w-3 h-3 ml-auto" />}
            </button>
          ))}
        </div>
        {showNew ? (
          <div className="flex gap-2 mt-2">
            <Input className="flex-1 h-7 text-xs bg-input border-border" placeholder="New folder name" value={newName} onChange={e => setNewName(e.target.value)} autoFocus onKeyDown={e => { if (e.key === 'Enter' && newName.trim()) commit(newName.trim()); if (e.key === 'Escape') setShowNew(false) }} />
            <Button size="sm" className="h-7 text-xs px-2" onClick={() => { if (newName.trim()) commit(newName.trim()) }} disabled={!newName.trim()}><Check className="w-3 h-3" /></Button>
          </div>
        ) : (
          <button onClick={() => setShowNew(true)} className="w-full flex items-center gap-2 px-3 py-2 mt-1 rounded text-xs text-accent hover:bg-accent/8 transition-colors text-left">
            <FolderPlus className="w-3.5 h-3.5" /> New folder…
          </button>
        )}
        <DialogFooter className="mt-2">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs h-7">Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MediaPage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const router = useRouter()

  // ── Core data state ────────────────────────────────────────────────────────
  const [media, setMedia]     = useState<DbMediaItem[]>([])
  const [folders, setFolders] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [uploads, setUploads] = useState<UploadProgress[]>([])

  // ── Filter / Sort state ────────────────────────────────────────────────────
  const [folder, setFolder]         = useState<string | null>(null)
  const [search, setSearch]         = useState('')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [sortBy, setSortBy]         = useState<SortKey>('date')
  const [sortDir, setSortDir]       = useState<SortDir>('desc')
  const [view, setView]             = useState<'grid' | 'list'>('grid')
  const [density, setDensity]       = useState<GridDensity>('md')

  // ── Selection state ────────────────────────────────────────────────────────
  const [selected, setSelected]       = useState<Set<string>>(new Set())
  const [shiftAnchor, setShiftAnchor] = useState<string | null>(null)

  // ── Panel / Overlay state ──────────────────────────────────────────────────
  const [activeItem, setActiveItem]         = useState<DbMediaItem | null>(null)
  const [lightboxIndex, setLightboxIndex]   = useState<number | null>(null)
  const [contextMenu, setContextMenu]       = useState<{ item: DbMediaItem; x: number; y: number } | null>(null)
  const [moveTarget, setMoveTarget]         = useState<'single' | 'bulk' | null>(null)
  const [moveItem, setMoveItem]             = useState<DbMediaItem | null>(null)

  // ── Folder creation ────────────────────────────────────────────────────────
  const [newFolderOpen, setNewFolderOpen]   = useState(false)
  const [newFolderName, setNewFolderName]   = useState('')
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null)
  const [isDragOver, setIsDragOver]         = useState(false)

  const fileRef = useRef<HTMLInputElement>(null)

  // ── Load media ─────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: '200' })
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

  // ── Filter + Sort ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = media.filter(m => {
      const dt = toDisplayType(m.type)
      if (typeFilter !== 'all' && dt !== typeFilter) return false
      if (search && !m.filename.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
    list = [...list].sort((a, b) => {
      let cmp = 0
      if (sortBy === 'date') cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      if (sortBy === 'name') cmp = a.filename.localeCompare(b.filename)
      if (sortBy === 'size') cmp = a.sizeBytes - b.sizeBytes
      return sortDir === 'asc' ? cmp : -cmp
    })
    return list
  }, [media, typeFilter, search, sortBy, sortDir])

  const typeCounts = useMemo(() => ({
    all: media.length,
    image: media.filter(m => toDisplayType(m.type) === 'image').length,
    video: media.filter(m => toDisplayType(m.type) === 'video').length,
    gif:   media.filter(m => toDisplayType(m.type) === 'gif').length,
  }), [media])

  // ── Keyboard shortcuts ─────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (e.key === 'Escape') {
        if (lightboxIndex !== null) { setLightboxIndex(null); return }
        if (contextMenu) { setContextMenu(null); return }
        if (activeItem) { setActiveItem(null); return }
        if (selected.size > 0) { setSelected(new Set()); setShiftAnchor(null) }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault()
        setSelected(new Set(filtered.map(m => m.id)))
      }
      if (e.key === 'Delete' && selected.size > 0 && lightboxIndex === null) {
        handleDeleteSelected()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxIndex, contextMenu, activeItem, selected, filtered])

  // ── Lightbox items (images only) ───────────────────────────────────────────
  const lightboxItems = useMemo(() => filtered.filter(m => toDisplayType(m.type) !== 'video'), [filtered])

  const openLightbox = useCallback((item: DbMediaItem) => {
    const idx = lightboxItems.findIndex(m => m.id === item.id)
    if (idx !== -1) setLightboxIndex(idx)
  }, [lightboxItems])

  // ── Upload ─────────────────────────────────────────────────────────────────
  const uploadFiles = useCallback(async (files: File[]) => {
    if (files.length === 0) return
    const initial: UploadProgress[] = files.map(f => ({ file: f.name, progress: 'uploading' as const }))
    setUploads(initial)
    const newItems: DbMediaItem[] = []
    await Promise.all(files.map(async (file, idx) => {
      try {
        const form = new FormData()
        form.append('file', file)
        if (folder) form.append('folder', folder)
        const res = await fetch('/api/media', { method: 'POST', body: form })
        if (!res.ok) {
          const data = await res.json() as { error?: string }
          throw new Error(data.error ?? `Upload failed (${res.status})`)
        }
        const data = await res.json() as { items: DbMediaItem[] }
        if (data.items?.[0]) newItems.push(data.items[0])
        setUploads(prev => prev.map((u, i) => i === idx ? { ...u, progress: 'done' as const } : u))
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Upload failed'
        setUploads(prev => prev.map((u, i) => i === idx ? { ...u, progress: 'error' as const } : u))
        toast.error(msg)
      }
    }))
    if (newItems.length > 0) {
      setMedia(prev => [...newItems, ...prev])
      toast.success(`${newItems.length} file${newItems.length > 1 ? 's' : ''} uploaded`)
    }
    setTimeout(() => setUploads([]), 2500)
  }, [folder])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length > 0) uploadFiles(files)
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) uploadFiles(files)
  }

  // ── Selection ──────────────────────────────────────────────────────────────
  const toggleSelect = useCallback((id: string, shift: boolean) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (shift && shiftAnchor) {
        const ids = filtered.map(m => m.id)
        const a = ids.indexOf(shiftAnchor); const b = ids.indexOf(id)
        const lo = Math.min(a, b); const hi = Math.max(a, b)
        for (let i = lo; i <= hi; i++) next.add(ids[i])
      } else {
        next.has(id) ? next.delete(id) : next.add(id)
        setShiftAnchor(id)
      }
      return next
    })
  }, [filtered, shiftAnchor])

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDeleteSelected = useCallback(async () => {
    const ids = Array.from(selected)
    setMedia(prev => prev.filter(m => !selected.has(m.id)))
    setSelected(new Set())
    if (activeItem && selected.has(activeItem.id)) setActiveItem(null)
    try {
      await Promise.all(ids.map(id => fetch(`/api/media/${id}`, { method: 'DELETE' })))
      toast.success(`${ids.length} item${ids.length > 1 ? 's' : ''} deleted`)
    } catch {
      toast.error('Failed to delete some items')
      await load()
    }
  }, [selected, activeItem, load])

  const handleDeleteSingle = useCallback(async (item: DbMediaItem) => {
    setMedia(prev => prev.filter(m => m.id !== item.id))
    if (activeItem?.id === item.id) setActiveItem(null)
    try {
      await fetch(`/api/media/${item.id}`, { method: 'DELETE' })
      toast.success('Deleted')
    } catch {
      toast.error('Delete failed')
      await load()
    }
  }, [activeItem, load])

  // ── Move ───────────────────────────────────────────────────────────────────
  const handleMove = useCallback(async (targetFolder: string | null) => {
    const ids = moveTarget === 'bulk' ? Array.from(selected) : moveItem ? [moveItem.id] : []
    if (ids.length === 0) return
    setMedia(prev => prev.map(m => ids.includes(m.id) ? { ...m, folder: targetFolder } : m))
    if (activeItem && ids.includes(activeItem.id)) setActiveItem(prev => prev ? { ...prev, folder: targetFolder } : null)
    try {
      await Promise.all(ids.map(id => fetch('/api/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'move', id, newFolder: targetFolder }),
      })))
      if (targetFolder && !folders.includes(targetFolder)) setFolders(prev => [...prev, targetFolder])
      toast.success(ids.length > 1 ? `${ids.length} items moved` : `Moved to ${targetFolder ?? 'root'}`)
    } catch { toast.error('Move failed') }
    setMoveTarget(null)
    setMoveItem(null)
  }, [moveTarget, moveItem, activeItem, selected, folders])

  // ── Rename ─────────────────────────────────────────────────────────────────
  const handleRename = useCallback((_item: DbMediaItem, newName: string) => {
    setMedia(prev => prev.map(m => m.id === _item.id ? { ...m, filename: newName } : m))
    if (activeItem?.id === _item.id) setActiveItem(prev => prev ? { ...prev, filename: newName } : null)
    toast.success('Renamed')
  }, [activeItem])

  // ── Folder drop ────────────────────────────────────────────────────────────
  const handleFolderDrop = useCallback(async (e: React.DragEvent, targetFolder: string | null) => {
    e.preventDefault()
    setDragOverFolder(null)
    const id = e.dataTransfer.getData('text/plain')
    if (!id) return
    const itm = media.find(m => m.id === id)
    if (!itm || itm.folder === targetFolder) return
    setMedia(prev => prev.map(m => m.id === id ? { ...m, folder: targetFolder } : m))
    try {
      await fetch('/api/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'move', id, newFolder: targetFolder }),
      })
      toast.success(`Moved to ${targetFolder ?? 'All'}`)
    } catch { toast.error('Move failed') }
  }, [media])

  // ── Create folder ──────────────────────────────────────────────────────────
  const handleCreateFolder = () => {
    const name = newFolderName.trim()
    if (!name) return
    if (!folders.includes(name)) setFolders(prev => [...prev, name])
    setFolder(name)
    setNewFolderName('')
    setNewFolderOpen(false)
    toast.success(`Folder "${name}" created`)
  }

  const uploadingCount = uploads.filter(u => u.progress === 'uploading').length
  const doneCount      = uploads.filter(u => u.progress === 'done').length
  const errorCount     = uploads.filter(u => u.progress === 'error').length

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-full relative overflow-hidden" onClick={() => contextMenu && setContextMenu(null)}>
      {/* Hidden file input */}
      <input ref={fileRef} type="file" accept="image/*,video/mp4,video/webm,video/quicktime" multiple className="hidden" onChange={handleFileChange} />

      {/* ── Folder Sidebar ─────────────────────────────────────────────────── */}
      <div className="w-44 flex-shrink-0 border-r border-border bg-card/60 flex flex-col">
        <div className="p-3 border-b border-border">
          <Button size="sm" className="w-full gap-1.5 text-xs" onClick={() => fileRef.current?.click()} disabled={uploadingCount > 0}>
            {uploadingCount > 0 ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Uploading…</> : <><Upload className="w-3.5 h-3.5" /> Upload</>}
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest px-2 py-1.5">Folders</p>
          {/* All */}
          <button
            onClick={() => { setFolder(null); setSelected(new Set()) }}
            onDragOver={e => { e.preventDefault(); setDragOverFolder('__all__') }}
            onDragLeave={() => setDragOverFolder(null)}
            onDrop={e => handleFolderDrop(e, null)}
            className={cn('w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-all text-left', folder === null ? 'bg-accent/10 text-accent font-medium' : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground', dragOverFolder === '__all__' && 'ring-1 ring-accent/40 bg-accent/5')}
          >
            <FolderOpen className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate flex-1">All</span>
            <span className="text-[10px] font-mono text-muted-foreground/60 tabular-nums">{media.length}</span>
          </button>
          {/* User folders */}
          {folders.map(f => {
            const count = media.filter(m => m.folder === f).length
            return (
              <button
                key={f}
                onClick={() => { setFolder(f); setSelected(new Set()) }}
                onDragOver={e => { e.preventDefault(); setDragOverFolder(f) }}
                onDragLeave={() => setDragOverFolder(null)}
                onDrop={e => handleFolderDrop(e, f)}
                className={cn('w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-all text-left', folder === f ? 'bg-accent/10 text-accent font-medium' : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground', dragOverFolder === f && 'ring-1 ring-accent/40 bg-accent/5')}
              >
                <FolderOpen className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate flex-1">{f}</span>
                <span className="text-[10px] font-mono text-muted-foreground/60 tabular-nums">{count}</span>
              </button>
            )
          })}
          <button onClick={() => { setNewFolderName(''); setNewFolderOpen(true) }} className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs text-accent hover:bg-accent/8 transition-all text-left mt-1">
            <FolderPlus className="w-3.5 h-3.5 flex-shrink-0" /> <span>New Folder</span>
          </button>
        </div>
      </div>

      {/* ── Main Content ──────────────────────────────────────────────────── */}
      <div
        className={cn('flex-1 min-w-0 flex flex-col overflow-hidden transition-all', isDragOver && 'ring-inset ring-2 ring-accent/30')}
        onDragOver={e => { e.preventDefault(); setIsDragOver(true) }}
        onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragOver(false) }}
        onDrop={handleDrop}
      >
        {/* Drag overlay */}
        {isDragOver && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/80 backdrop-blur-sm pointer-events-none">
            <div className="flex flex-col items-center gap-3 border-2 border-dashed border-accent/40 rounded-xl px-12 py-8">
              <Upload className="w-10 h-10 text-accent" />
              <p className="text-sm font-medium text-foreground">Drop files to upload</p>
              <p className="text-xs text-muted-foreground">Images, GIFs, videos up to 50 MB</p>
            </div>
          </div>
        )}

        {/* Upload progress */}
        {uploads.length > 0 && (
          <div className="mx-4 mt-4 shrink-0">
            <Card className="bg-card border-border p-3 flex items-center gap-3">
              {uploadingCount > 0 ? <RefreshCw className="w-4 h-4 text-accent animate-spin flex-shrink-0" /> : errorCount > 0 ? <XCircle className="w-4 h-4 text-destructive flex-shrink-0" /> : <CheckCircle2 className="w-4 h-4 text-emerald-500/80 flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-foreground">
                  {uploadingCount > 0 ? `Uploading ${uploadingCount} of ${uploads.length} file${uploads.length > 1 ? 's' : ''}…` : `${doneCount} uploaded${errorCount > 0 ? `, ${errorCount} failed` : ''}`}
                </p>
                <div className="flex gap-0.5 mt-1.5">
                  {uploads.map((u, i) => <div key={i} title={u.file} className={cn('flex-1 h-1 rounded-full transition-colors duration-500', u.progress === 'done' ? 'bg-emerald-500/70' : u.progress === 'error' ? 'bg-destructive' : 'bg-accent/40 animate-pulse')} />)}
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* ── Toolbar ───────────────────────────────────────────────────────── */}
        <div className="px-4 pt-4 pb-3 space-y-3 flex-shrink-0">
          {/* Type filter tabs */}
          <div className="flex items-center gap-1 border-b border-border">
            {(['all', 'image', 'video', 'gif'] as TypeFilter[]).map(t => (
              <button key={t} onClick={() => setTypeFilter(t)} className={cn('flex items-center gap-1.5 px-3 py-2 text-xs border-b-2 -mb-px transition-colors', typeFilter === t ? 'border-accent text-accent font-medium' : 'border-transparent text-muted-foreground hover:text-foreground')}>
                {t === 'all' ? 'All' : t === 'image' ? 'Images' : t === 'video' ? 'Videos' : 'GIFs'}
                <span className={cn('text-[10px] tabular-nums px-1 py-0.5 rounded-full min-w-[18px] text-center transition-colors', typeFilter === t ? 'bg-accent/15 text-accent' : 'bg-muted text-muted-foreground')}>
                  {typeCounts[t]}
                </span>
              </button>
            ))}
          </div>

          {/* Search + sort + density + view */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search files…" className="pl-8 h-8 text-xs bg-input border-border" />
              {search && <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground"><X className="w-3 h-3" /></button>}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-border">
                  {sortDir === 'desc' ? <SortDesc className="w-3.5 h-3.5" /> : <SortAsc className="w-3.5 h-3.5" />}
                  {sortBy === 'date' ? 'Date' : sortBy === 'name' ? 'Name' : 'Size'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-card border-border text-xs">
                <DropdownMenuItem onClick={() => { setSortBy('date'); setSortDir('desc') }} className="text-xs gap-2"><SortDesc className="w-3.5 h-3.5" /> Date, newest first</DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setSortBy('date'); setSortDir('asc') }} className="text-xs gap-2"><SortAsc className="w-3.5 h-3.5" /> Date, oldest first</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { setSortBy('name'); setSortDir('asc') }} className="text-xs gap-2"><AlignLeft className="w-3.5 h-3.5" /> Name A–Z</DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setSortBy('name'); setSortDir('desc') }} className="text-xs gap-2"><AlignLeft className="w-3.5 h-3.5" /> Name Z–A</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { setSortBy('size'); setSortDir('desc') }} className="text-xs gap-2"><SortDesc className="w-3.5 h-3.5" /> Size, largest first</DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setSortBy('size'); setSortDir('asc') }} className="text-xs gap-2"><SortAsc className="w-3.5 h-3.5" /> Size, smallest first</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Grid density */}
            <div className="flex border border-border rounded p-0.5 gap-0.5">
              <button onClick={() => setDensity('sm')} title="Compact" className={cn('p-1.5 rounded-[2px] transition-colors', density === 'sm' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground')}><LayoutGrid className="w-3 h-3" /></button>
              <button onClick={() => setDensity('md')} title="Normal" className={cn('p-1.5 rounded-[2px] transition-colors', density === 'md' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground')}><Grid3X3 className="w-3.5 h-3.5" /></button>
              <button onClick={() => setDensity('lg')} title="Loose" className={cn('p-1.5 rounded-[2px] transition-colors', density === 'lg' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground')}><StretchHorizontal className="w-3.5 h-3.5" /></button>
            </div>

            {/* List / Grid toggle */}
            <div className="flex border border-border rounded p-0.5 gap-0.5">
              <button onClick={() => setView('grid')} className={cn('p-1.5 rounded-[2px] transition-colors', view === 'grid' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground')}><Grid3X3 className="w-3.5 h-3.5" /></button>
              <button onClick={() => setView('list')} className={cn('p-1.5 rounded-[2px] transition-colors', view === 'list' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground')}><Rows3 className="w-3.5 h-3.5" /></button>
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground">
            {filtered.length} item{filtered.length !== 1 ? 's' : ''}
            {folder ? ` in "${folder}"` : ''}
            {typeFilter !== 'all' ? ` · ${typeFilter}` : ''}
          </p>
        </div>

        {/* ── Grid / List ───────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-4 pb-24">
          {loading ? (
            <div className={cn('grid gap-2', densityClass(density))}>
              {Array.from({ length: 12 }).map((_, i) => <div key={i} className="aspect-square rounded-md bg-muted/30 animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-24 text-center border-2 border-dashed border-border rounded-xl hover:border-accent/30 transition-colors cursor-pointer" onClick={() => fileRef.current?.click()}>
              <Upload className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">{search || typeFilter !== 'all' ? 'No files match your filters' : 'Drop files here or click to upload'}</p>
              {!search && typeFilter === 'all' && <p className="text-xs text-muted-foreground/50 mt-1">Images, GIFs, and videos up to 50 MB</p>}
            </div>
          ) : view === 'grid' ? (
            <div className={cn('grid gap-2', densityClass(density))}>
              {filtered.map(item => (
                <MediaCard
                  key={item.id}
                  item={item}
                  selected={selected.has(item.id)}
                  anySelected={selected.size > 0}
                  onCheck={shift => toggleSelect(item.id, shift)}
                  onOpen={() => setActiveItem(item)}
                  onLightbox={() => openLightbox(item)}
                  onContext={e => { e.preventDefault(); setContextMenu({ item, x: e.clientX, y: e.clientY }) }}
                  onDragStart={e => e.dataTransfer.setData('text/plain', item.id)}
                />
              ))}
            </div>
          ) : (
            <Card className="bg-card border-border overflow-hidden">
              <div className="divide-y divide-border">
                {filtered.map(item => {
                  const displayType = toDisplayType(item.type)
                  const TypeIcon = displayType === 'video' ? Video : displayType === 'gif' ? FileImage : ImageIcon
                  return (
                    <div
                      key={item.id}
                      onClick={() => setActiveItem(item)}
                      onContextMenu={e => { e.preventDefault(); setContextMenu({ item, x: e.clientX, y: e.clientY }) }}
                      draggable
                      onDragStart={e => e.dataTransfer.setData('text/plain', item.id)}
                      className={cn('flex items-center gap-3 px-4 py-2.5 hover:bg-muted/20 cursor-pointer transition-colors group', selected.has(item.id) && 'bg-accent/5')}
                    >
                      <div onClick={e => { e.stopPropagation(); toggleSelect(item.id, e.shiftKey) }} className={cn('w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all', selected.has(item.id) ? 'bg-accent border-accent' : 'border-border/60 opacity-0 group-hover:opacity-100 hover:border-accent')}>
                        {selected.has(item.id) && <Check className="w-2.5 h-2.5 text-accent-foreground" />}
                      </div>
                      <div className="w-9 h-9 rounded border border-border bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {displayType === 'image' || displayType === 'gif' ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.url} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                        ) : <TypeIcon className="w-4 h-4 text-muted-foreground/40" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{item.filename}</p>
                        <p className="text-[10px] text-muted-foreground">{item.mimeType}</p>
                      </div>
                      {item.width && item.height && <span className="text-[10px] text-muted-foreground/60 tabular-nums hidden sm:block">{item.width}×{item.height}</span>}
                      <span className="text-[10px] font-mono text-muted-foreground tabular-nums">{formatSize(item.sizeBytes)}</span>
                      <Badge className="text-[10px] border-0 bg-muted text-muted-foreground capitalize hidden md:inline-flex">{displayType}</Badge>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={e => { e.stopPropagation(); openLightbox(item) }} className="w-6 h-6 flex items-center justify-center rounded text-muted-foreground/60 hover:text-foreground hover:bg-muted transition-colors" title="Preview"><Eye className="w-3 h-3" /></button>
                        <button onClick={e => { e.stopPropagation(); window.location.href = `/dashboard/compose?mediaUrl=${encodeURIComponent(item.url)}` }} className="w-6 h-6 flex items-center justify-center rounded text-muted-foreground/60 hover:text-foreground hover:bg-muted transition-colors" title="Use in Post"><Send className="w-3 h-3" /></button>
                        <button onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(item.url); toast.success('URL copied') }} className="w-6 h-6 flex items-center justify-center rounded text-muted-foreground/60 hover:text-foreground hover:bg-muted transition-colors" title="Copy URL"><Copy className="w-3 h-3" /></button>
                        <a href={item.url} download={item.filename} onClick={e => e.stopPropagation()} className="w-6 h-6 flex items-center justify-center rounded text-muted-foreground/60 hover:text-foreground hover:bg-muted transition-colors" title="Download"><ArrowDownToLine className="w-3 h-3" /></a>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          )}
        </div>

        {/* ── Bulk Actions Bar ──────────────────────────────────────────────── */}
        <div className={cn('absolute bottom-0 left-44 right-0 transition-all duration-300 ease-out pointer-events-none z-30', selected.size > 0 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0')}>
          <div className="mx-4 mb-4 pointer-events-auto">
            <div className="bg-card/95 backdrop-blur-sm border border-border rounded-xl shadow-2xl px-4 py-3 flex items-center gap-3">
              <div className="w-5 h-5 rounded bg-accent flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-accent-foreground" />
              </div>
              <span className="text-sm font-medium text-foreground tabular-nums">{selected.size} selected</span>
              <button onClick={() => setSelected(new Set(filtered.map(m => m.id)))} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Select all {filtered.length}</button>
              <div className="w-px h-4 bg-border" />
              <button onClick={() => { setSelected(new Set()); setShiftAnchor(null) }} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Clear</button>
              <div className="ml-auto flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5 border-border" onClick={() => { setMoveTarget('bulk'); setMoveItem(null) }}>
                  <FolderInput className="w-3.5 h-3.5" /> Move to…
                </Button>
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/8" onClick={handleDeleteSelected}>
                  <Trash2 className="w-3.5 h-3.5" /> Delete {selected.size}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Detail Panel ──────────────────────────────────────────────────── */}
      <div className={cn('transition-all duration-300 ease-out overflow-hidden flex-shrink-0', activeItem ? 'w-72' : 'w-0')}>
        {activeItem && (
          <DetailPanel
            item={activeItem}
            folders={folders}
            onClose={() => setActiveItem(null)}
            onDelete={() => handleDeleteSingle(activeItem)}
            onMove={targetFolder => { setMoveItem(activeItem); setMoveTarget('single'); handleMove(targetFolder) }}
            onRename={name => handleRename(activeItem, name)}
          />
        )}
      </div>

      {/* ── Lightbox ──────────────────────────────────────────────────────── */}
      {lightboxIndex !== null && (
        <Lightbox items={lightboxItems} index={lightboxIndex} onClose={() => setLightboxIndex(null)} onNavigate={setLightboxIndex} />
      )}

      {/* ── Context Menu ──────────────────────────────────────────────────── */}
      {contextMenu && (
        <ContextMenu
          item={contextMenu.item} x={contextMenu.x} y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onLightbox={() => openLightbox(contextMenu.item)}
          onDetail={() => setActiveItem(contextMenu.item)}
          onMove={() => { setMoveItem(contextMenu.item); setMoveTarget('single') }}
          onDelete={() => handleDeleteSingle(contextMenu.item)}
        />
      )}

      {/* ── New Folder Dialog ─────────────────────────────────────────────── */}
      <Dialog open={newFolderOpen} onOpenChange={setNewFolderOpen}>
        <DialogContent className="max-w-sm bg-card border-border">
          <DialogHeader><DialogTitle className="text-sm font-medium">New Folder</DialogTitle></DialogHeader>
          <div className="mt-2">
            <Label className="text-[11px] uppercase tracking-widest text-muted-foreground">Folder name</Label>
            <Input className="mt-1.5 h-8 text-sm bg-input border-border" value={newFolderName} onChange={e => setNewFolderName(e.target.value)} placeholder="e.g. Brand Assets" autoFocus onKeyDown={e => e.key === 'Enter' && handleCreateFolder()} />
          </div>
          <DialogFooter className="mt-2">
            <Button variant="outline" size="sm" onClick={() => setNewFolderOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleCreateFolder} disabled={!newFolderName.trim()}><Plus className="w-3.5 h-3.5 mr-1.5" /> Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Move to Folder Dialog ─────────────────────────────────────────── */}
      <MoveDialog
        open={moveTarget !== null}
        folders={folders}
        currentFolder={moveItem?.folder ?? activeItem?.folder ?? null}
        onClose={() => { setMoveTarget(null); setMoveItem(null) }}
        onMove={handleMove}
      />
    </div>
  )
}
