'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
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
import {
  GripVertical, Plus, Clock, Trash2, Zap, LayoutGrid, List,
  CheckCircle2, XCircle, ShieldAlert, RefreshCw, Pencil, CalendarClock,
  ArrowDown,
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { PLATFORMS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { Post } from '@/lib/types'

type QueueSlot = { id: string; dayOfWeek: number; hour: number; minute: number; platforms: string[]; isActive: boolean }
type PendingPost = { id: string; content: string; createdAt: string; channels: Array<{ channel: { platform: string } }>; approvalNote?: string }
// Post extended with all channel platforms
type QueuePost = Post & { allPlatforms: string[] }

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// ── Sortable row ────────────────────────────────────────────────────────────
function SortableRow({
  post, onRemove, isRemoving,
}: {
  post: QueuePost
  onRemove: (id: string) => void
  isRemoving: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: post.id })
  const style = { transform: CSS.Transform.toString(transform), transition }
  const dt = post.scheduledAt ? new Date(post.scheduledAt) : null
  const uniquePlatforms = [...new Set(post.allPlatforms)]

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-3 px-4 py-3 border-b border-border last:border-b-0 transition-all bg-card group',
        isDragging ? 'shadow-lg opacity-95 z-10 relative rounded-md ring-1 ring-accent/30' : 'hover:bg-muted/20',
        isRemoving && 'opacity-40 pointer-events-none',
      )}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
        className="text-muted-foreground/30 hover:text-muted-foreground cursor-grab active:cursor-grabbing transition-colors flex-shrink-0 touch-none"
      >
        <GripVertical className="w-4 h-4" />
      </button>

      {/* Platform icons */}
      <div className="flex gap-0.5 flex-shrink-0">
        {uniquePlatforms.slice(0, 4).map(pl => {
          const Icon = PLATFORMS[pl as keyof typeof PLATFORMS]?.icon
          return Icon ? <Icon key={pl} className="w-3.5 h-3.5 text-muted-foreground/70" /> : null
        })}
        {uniquePlatforms.length > 4 && (
          <span className="text-[10px] text-muted-foreground ml-0.5">+{uniquePlatforms.length - 4}</span>
        )}
      </div>

      {/* Content + time */}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-foreground line-clamp-1 leading-relaxed">{post.content}</p>
        <div className="flex items-center gap-1 mt-0.5">
          <CalendarClock className="w-2.5 h-2.5 text-muted-foreground/50 flex-shrink-0" />
          <p className="text-[10px] text-muted-foreground">
            {dt
              ? `${dt.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })} · ${dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
              : 'No time set'}
          </p>
        </div>
      </div>

      {/* Status badge */}
      <Badge className={cn(
        'text-[10px] border-0 flex-shrink-0',
        'bg-accent/10 text-accent',
      )}>
        Scheduled
      </Badge>

      {/* Row actions — visible on hover */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <Link
          href={`/dashboard/compose?edit=${post.id}`}
          className="flex items-center justify-center w-6 h-6 rounded-sm text-muted-foreground/50 hover:text-foreground hover:bg-muted/60 transition-colors"
          aria-label="Edit post"
        >
          <Pencil className="w-3 h-3" />
        </Link>
        <button
          onClick={() => onRemove(post.id)}
          className="flex items-center justify-center w-6 h-6 rounded-sm text-muted-foreground/50 hover:text-destructive hover:bg-destructive/8 transition-colors"
          aria-label="Remove from queue"
          disabled={isRemoving}
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function QueuePage() {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const [posts, setPosts] = useState<QueuePost[]>([])
  const [viewMode, setViewMode] = useState<'list' | 'slots'>('list')
  const [autoQueue, setAutoQueue] = useState(true)
  const [loading, setLoading] = useState(true)
  const [reorderSaving, setReorderSaving] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)
  // Keep a stable ref to previous posts list for rollback
  const prevPostsRef = useRef<QueuePost[]>([])

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
        const mapped = data.map(p => ({
          id: p.id,
          content: p.content,
          platforms: [p.channels[0]?.channel?.platform ?? 'twitter'] as Post['platforms'],
          allPlatforms: [...new Set(p.channels.map(c => c.channel.platform))],
          scheduledAt: p.scheduledAt ? new Date(p.scheduledAt) : new Date(),
          status: 'scheduled' as const,
          mediaUrls: p.mediaUrls,
        }))
        setPosts(mapped)
        prevPostsRef.current = mapped
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

  // ── Drag-reorder with persistence ──────────────────────────────────────────
  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIdx = posts.findIndex(p => p.id === active.id)
    const newIdx = posts.findIndex(p => p.id === over.id)
    if (oldIdx === -1 || newIdx === -1) return

    // Optimistic reorder
    const reordered = arrayMove(posts, oldIdx, newIdx)
    prevPostsRef.current = posts          // save for rollback
    setPosts(reordered)

    // Re-slot scheduledAt values: assign sorted timestamps to new order
    const sortedTimes = [...posts]
      .sort((a, b) => (a.scheduledAt?.getTime() ?? 0) - (b.scheduledAt?.getTime() ?? 0))
      .map(p => p.scheduledAt)
    const withNewTimes = reordered.map((p, i) => ({ ...p, scheduledAt: sortedTimes[i] ?? p.scheduledAt }))
    setPosts(withNewTimes)

    setReorderSaving(true)
    try {
      const res = await fetch('/api/posts/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds: reordered.map(p => p.id) }),
      })
      if (!res.ok) throw new Error('Save failed')
      toast.success('Queue order saved', { duration: 2000 })
    } catch {
      // Rollback to pre-drag state
      setPosts(prevPostsRef.current)
      toast.error('Failed to save queue order — changes reverted')
    } finally {
      setReorderSaving(false)
    }
  }, [posts])

  // ── Remove from queue (unschedule → DRAFT) ─────────────────────────────────
  const handleRemove = useCallback(async (id: string) => {
    const prev = posts
    setRemovingId(id)
    // Optimistic removal
    setPosts(items => items.filter(p => p.id !== id))
    prevPostsRef.current = prev

    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'DRAFT', scheduledAt: null }),
      })
      if (!res.ok) throw new Error('Failed')
      toast.success('Post moved to Drafts')
    } catch {
      // Rollback
      setPosts(prevPostsRef.current)
      toast.error('Failed to remove post — try again')
    } finally {
      setRemovingId(null)
    }
  }, [posts])

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
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground">{posts.length} post{posts.length !== 1 ? 's' : ''} in queue</p>
              {reorderSaving && (
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <RefreshCw className="w-3 h-3 animate-spin" /> Saving order…
                </span>
              )}
              {!reorderSaving && posts.length > 0 && (
                <span className="text-[10px] text-muted-foreground/50 flex items-center gap-1">
                  <ArrowDown className="w-2.5 h-2.5" /> Drag to reorder
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground">Auto-fill</Label>
              <Switch checked={autoQueue} onCheckedChange={setAutoQueue} className="data-[state=checked]:bg-accent scale-90" />
            </div>
          </div>

          <Card className="bg-card border-border shadow-sm overflow-hidden">
            {loading ? (
              <div className="space-y-px">
                {[1,2,3].map(i => <div key={i} className="h-[58px] bg-muted/20 animate-pulse" />)}
              </div>
            ) : posts.length === 0 ? (
              <div className="py-16 text-center">
                <Clock className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Queue is empty</p>
                <Button asChild variant="ghost" size="sm" className="mt-3 text-xs text-accent hover:bg-accent/5">
                  <Link href="/dashboard/compose">Schedule your first post</Link>
                </Button>
              </div>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} modifiers={[restrictToVerticalAxis]} onDragEnd={handleDragEnd}>
                <SortableContext items={posts.map(p => p.id)} strategy={verticalListSortingStrategy}>
                  {posts.map(post => (
                    <SortableRow
                      key={post.id}
                      post={post}
                      onRemove={handleRemove}
                      isRemoving={removingId === post.id}
                    />
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
