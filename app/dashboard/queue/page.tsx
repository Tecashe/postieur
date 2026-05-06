'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import {
  GripVertical, Plus, Clock, Trash2, Zap, LayoutGrid, List,
  Calendar, CheckCircle2, XCircle, ShieldAlert,
} from 'lucide-react'
import Link from 'next/link'
import { PLATFORMS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { Post } from '@/lib/types'

type QueueSlot = { id: string; dayOfWeek: number; hour: number; minute: number; platforms: string[]; isActive: boolean }
type PendingPost = { id: string; content: string; createdAt: string; channels: Array<{ channel: { platform: string } }>; approvalNote?: string }

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// ── Sortable row ────────────────────────────────────────────────────────────
function SortableRow({ post, onRemove }: { post: Post; onRemove: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: post.id })
  const style = { transform: CSS.Transform.toString(transform), transition }
  const Icon = PLATFORMS[post.platforms[0]]?.icon
  const dt = new Date(post.scheduledAt ?? Date.now())

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-3 px-4 py-3 border-b border-border last:border-b-0 transition-all bg-card',
        isDragging ? 'shadow-md opacity-90 z-10 relative rounded-sm' : 'hover:bg-muted/20'
      )}
    >
      <button {...attributes} {...listeners} className="text-muted-foreground/40 hover:text-muted-foreground cursor-grab active:cursor-grabbing">
        <GripVertical className="w-4 h-4" />
      </button>
      {Icon && <Icon className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-foreground line-clamp-1">{post.content}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          {dt.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
          {' · '}{dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      <Badge className={cn('text-[10px] border-0 flex-shrink-0',
        post.status === 'scheduled' ? 'bg-accent/10 text-accent' :
        post.status === 'published' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
        'bg-muted text-muted-foreground')}>
        {post.status}
      </Badge>
      <button onClick={() => onRemove(post.id)} className="text-muted-foreground/40 hover:text-destructive transition-colors ml-1">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function QueuePage() {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const [posts, setPosts] = useState<Post[]>([])
  const [viewMode, setViewMode] = useState<'list' | 'slots'>('list')
  const [autoQueue, setAutoQueue] = useState(true)
  const [loading, setLoading] = useState(true)

  // ── Queue slots ─────────────────────────────────────────────────────────────
  const [slots, setSlots] = useState<QueueSlot[]>([])
  const [slotsLoading, setSlotsLoading] = useState(true)
  const [addSlotOpen, setAddSlotOpen] = useState(false)
  const [slotDay, setSlotDay] = useState(1)
  const [slotHour, setSlotHour] = useState(9)
  const [slotMinute, setSlotMinute] = useState(0)
  const [slotPlatforms, setSlotPlatforms] = useState<string[]>([])
  const [slotSaving, setSlotSaving] = useState(false)

  // ── Pending approval ────────────────────────────────────────────────────────
  const [pendingPosts, setPendingPosts] = useState<PendingPost[]>([])
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectNote, setRejectNote] = useState('')
  const [actionBusy, setActionBusy] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/posts?status=SCHEDULED&limit=50')
      .then(r => r.json())
      .then((data: Array<{
        id: string; content: string; scheduledAt: string | null; status: string
        mediaUrls: string[]; channels: Array<{ channel: { platform: string } }>
        analytics: null
      }>) => {
        setPosts(data.map(p => ({
          id: p.id,
          content: p.content,
          platforms: (p.channels.map(c => c.channel.platform) as Post['platforms']).slice(0, 1),
          scheduledAt: p.scheduledAt ? new Date(p.scheduledAt) : new Date(),
          status: 'scheduled' as const,
          mediaUrls: p.mediaUrls,
        })))
      })
      .catch(() => {})
      .finally(() => setLoading(false))

    // Load slots
    setSlotsLoading(true)
    fetch('/api/queue-slots')
      .then(r => r.json())
      .then((d: { slots: QueueSlot[] }) => setSlots(d.slots ?? []))
      .catch(() => {})
      .finally(() => setSlotsLoading(false))

    // Load pending approval posts
    fetch('/api/posts?status=PENDING_APPROVAL&limit=20')
      .then(r => r.json())
      .then((data: PendingPost[]) => setPendingPosts(data ?? []))
      .catch(() => {})
  }, [])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setPosts(items => {
        const oldIdx = items.findIndex(i => i.id === active.id)
        const newIdx = items.findIndex(i => i.id === over.id)
        return arrayMove(items, oldIdx, newIdx)
      })
    }
  }

  const handleRemove = (id: string) => setPosts(items => items.filter(i => i.id !== id))

  async function handleAddSlot() {
    if (slotPlatforms.length === 0) return
    setSlotSaving(true)
    try {
      const res = await fetch('/api/queue-slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dayOfWeek: slotDay, hour: slotHour, minute: slotMinute, platforms: slotPlatforms }),
      })
      const d = await res.json() as { slot: QueueSlot }
      if (d.slot) setSlots(prev => [d.slot, ...prev])
      setAddSlotOpen(false)
      setSlotPlatforms([])
    } catch { /* ignore */ }
    finally { setSlotSaving(false) }
  }

  async function handleDeleteSlot(id: string) {
    await fetch(`/api/queue-slots/${id}`, { method: 'DELETE' })
    setSlots(prev => prev.filter(s => s.id !== id))
  }

  async function handleApprove(postId: string) {
    setActionBusy(postId + 'approve')
    try {
      await fetch(`/api/posts/${postId}/approve`, { method: 'PATCH' })
      setPendingPosts(prev => prev.filter(p => p.id !== postId))
    } catch { /* ignore */ }
    finally { setActionBusy(null) }
  }

  async function handleReject(postId: string) {
    setActionBusy(postId + 'reject')
    try {
      await fetch(`/api/posts/${postId}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: rejectNote }),
      })
      setPendingPosts(prev => prev.filter(p => p.id !== postId))
      setRejectingId(null)
      setRejectNote('')
    } catch { /* ignore */ }
    finally { setActionBusy(null) }
  }

  return (
    <div className="space-y-5 pb-6">
      {/* Pending Approval banner */}
      {pendingPosts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            <p className="text-sm font-medium text-foreground">Pending Approval ({pendingPosts.length})</p>
          </div>
          <div className="space-y-2">
            {pendingPosts.map(p => {
              const platforms = [...new Set(p.channels.map(c => c.channel.platform))]
              return (
                <Card key={p.id} className="bg-amber-500/5 border-amber-500/20 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground line-clamp-2 mb-1">{p.content}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                          {platforms.map(pl => {
                            const Icon = PLATFORMS[pl as keyof typeof PLATFORMS]?.icon
                            return Icon ? <Icon key={pl} className="w-3 h-3 text-muted-foreground" /> : null
                          })}
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(p.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      {rejectingId === p.id && (
                        <div className="mt-2 flex gap-2">
                          <Input
                            value={rejectNote}
                            onChange={e => setRejectNote(e.target.value)}
                            placeholder="Rejection note (optional)…"
                            className="h-7 text-xs bg-input border-border flex-1"
                          />
                          <Button size="sm" variant="outline" className="h-7 text-xs border-destructive/30 text-destructive" onClick={() => handleReject(p.id)} disabled={!!actionBusy}>Send</Button>
                          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setRejectingId(null)}>Cancel</Button>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <Button size="sm" className="h-7 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => handleApprove(p.id)} disabled={!!actionBusy}>
                        <CheckCircle2 className="w-3 h-3" /> Approve
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 text-xs gap-1 border-destructive/30 text-destructive hover:bg-destructive/5" onClick={() => setRejectingId(p.id)}>
                        <XCircle className="w-3 h-3" /> Reject
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button asChild size="sm" className="gap-1.5 text-xs">
          <Link href="/dashboard/compose"><Plus className="w-3.5 h-3.5" /> Add Post</Link>
        </Button>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <div className="flex rounded-sm overflow-hidden border border-border">
            <button onClick={() => setViewMode('list')} className={cn('px-3 py-1.5 transition-colors', viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted/60')}>
              <List className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setViewMode('slots')} className={cn('px-3 py-1.5 transition-colors border-l border-border', viewMode === 'slots' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted/60')}>
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-5">
        {/* Queue list */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{posts.length} posts in queue · Drag to reorder</p>
            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground">Auto-fill</Label>
              <Switch checked={autoQueue} onCheckedChange={setAutoQueue} className="data-[state=checked]:bg-accent scale-90" />
            </div>
          </div>

          <Card className="bg-card border-border shadow-sm overflow-hidden">
            {loading ? (
              <div className="space-y-px">
                {[1,2,3].map(i => <div key={i} className="h-14 bg-muted/20 animate-pulse" />)}
              </div>
            ) : posts.length === 0 ? (
              <div className="py-16 text-center">
                <Clock className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Queue is empty</p>
                <Button asChild variant="ghost" size="sm" className="mt-3 text-xs text-accent hover:bg-accent/5">
                  <Link href="/dashboard/compose">Add your first post</Link>
                </Button>
              </div>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} modifiers={[restrictToVerticalAxis]} onDragEnd={handleDragEnd}>
                <SortableContext items={posts.map(p => p.id)} strategy={verticalListSortingStrategy}>
                  {posts.map(post => (
                    <SortableRow key={post.id} post={post} onRemove={handleRemove} />
                  ))}
                </SortableContext>
              </DndContext>
            )}
          </Card>
        </div>

        {/* Queue slots */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Time Slots</p>
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1 border-border" onClick={() => setAddSlotOpen(true)}>
              <Plus className="w-3 h-3" /> Add
            </Button>
          </div>
          <Card className="bg-card border-border shadow-sm">
            {slotsLoading ? (
              <div className="space-y-px p-2">{[1,2,3].map(i => <div key={i} className="h-10 rounded-sm bg-muted/30 animate-pulse" />)}</div>
            ) : slots.length === 0 ? (
              <div className="py-8 text-center">
                <Clock className="w-6 h-6 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">No time slots configured</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {slots.map(slot => {
                  const h = slot.hour % 12 || 12
                  const ampm = slot.hour < 12 ? 'AM' : 'PM'
                  const mm = String(slot.minute).padStart(2, '0')
                  return (
                    <div key={slot.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/20 transition-colors group">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs text-foreground">{DAY_NAMES[slot.dayOfWeek]} · {h}:{mm} {ampm}</p>
                        <p className="text-[10px] text-muted-foreground">{slot.platforms.length} platform{slot.platforms.length !== 1 ? 's' : ''}</p>
                      </div>
                      <div className="flex gap-0.5 mr-1">
                        {slot.platforms.slice(0, 3).map(p => {
                          const Icon = PLATFORMS[p as keyof typeof PLATFORMS]?.icon
                          return Icon ? <Icon key={p} className="w-3 h-3 text-muted-foreground/60" /> : null
                        })}
                      </div>
                      <button onClick={() => handleDeleteSlot(slot.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground/50 hover:text-destructive transition-all">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>

          <Card className="bg-accent/5 border-accent/20 shadow-sm p-4">
            <div className="flex gap-2.5">
              <Zap className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-foreground">Queue Intelligence</p>
                <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">Auto-schedule fills your queue at optimal times based on historical engagement patterns.</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Add slot dialog */}
      <Dialog open={addSlotOpen} onOpenChange={setAddSlotOpen}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm font-medium">Add Time Slot</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <Label className="text-[11px] uppercase tracking-widest text-muted-foreground">Day of Week</Label>
              <select
                value={slotDay}
                onChange={e => setSlotDay(Number(e.target.value))}
                className="mt-1.5 w-full h-8 px-3 text-xs bg-input border border-border rounded-sm text-foreground outline-none focus:ring-1 focus:ring-ring"
              >
                {DAY_NAMES.map((d, i) => <option key={i} value={i}>{d}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-[11px] uppercase tracking-widest text-muted-foreground">Hour (0-23)</Label>
                <Input type="number" min={0} max={23} value={slotHour} onChange={e => setSlotHour(Number(e.target.value))} className="mt-1.5 h-8 text-xs bg-input border-border" />
              </div>
              <div>
                <Label className="text-[11px] uppercase tracking-widest text-muted-foreground">Minute</Label>
                <select value={slotMinute} onChange={e => setSlotMinute(Number(e.target.value))} className="mt-1.5 w-full h-8 px-3 text-xs bg-input border border-border rounded-sm text-foreground outline-none focus:ring-1 focus:ring-ring">
                  {[0, 15, 30, 45].map(m => <option key={m} value={m}>{String(m).padStart(2, '0')}</option>)}
                </select>
              </div>
            </div>
            <div>
              <Label className="text-[11px] uppercase tracking-widest text-muted-foreground mb-1.5 block">Platforms</Label>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(PLATFORMS).map(([key, plat]) => {
                  const Icon = plat.icon
                  const active = slotPlatforms.includes(key)
                  return (
                    <button
                      key={key}
                      onClick={() => setSlotPlatforms(prev => active ? prev.filter(p => p !== key) : [...prev, key])}
                      className={cn(
                        'flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm text-[11px] border transition-all',
                        active ? 'bg-accent/15 text-accent border-accent/40' : 'text-muted-foreground border-border hover:text-foreground',
                      )}
                    >
                      <Icon className="w-3 h-3" />{plat.name}
                    </button>
                  )
                })}
              </div>
            </div>
            <Button onClick={handleAddSlot} disabled={slotSaving || slotPlatforms.length === 0} className="w-full text-xs">
              {slotSaving ? 'Saving…' : 'Add Slot'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
