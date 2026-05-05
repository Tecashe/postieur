'use client'

import { useState, useEffect } from 'react'
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
import { Label } from '@/components/ui/label'
import {
  GripVertical, Plus, Clock, Trash2, Zap, LayoutGrid, List, Settings,
  Calendar,
} from 'lucide-react'
import Link from 'next/link'
import { PLATFORMS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { Post } from '@/lib/types'

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

export default function QueuePage() {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const [posts, setPosts] = useState<Post[]>([])
  const [viewMode, setViewMode] = useState<'list' | 'slots'>('list')
  const [autoQueue, setAutoQueue] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/posts?status=SCHEDULED&limit=50')
      .then(r => r.json())
      .then((data: Array<{
        id: string; content: string; scheduledAt: string | null; status: string
        mediaUrls: string[]; channels: Array<{ channel: { platform: string } }>
        analytics: { likes: number; comments: number; shares: number; impressions: number } | null
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

  return (
    <div className="space-y-5 pb-6">
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
          <Button variant="outline" size="sm" className="gap-1.5 text-xs border-border">
            <Settings className="w-3.5 h-3.5" /> Slot Config
          </Button>
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
            {posts.length === 0 ? (
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
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Time Slots</p>
          <Card className="bg-card border-border shadow-sm">
            <div className="divide-y divide-border">
              {[
                { id: '1', day: 'Mon', time: '9:00 AM', platforms: ['x', 'linkedin'] },
                { id: '2', day: 'Mon', time: '12:00 PM', platforms: ['instagram'] },
                { id: '3', day: 'Tue', time: '10:00 AM', platforms: ['x'] },
                { id: '4', day: 'Wed', time: '2:00 PM', platforms: ['linkedin', 'facebook'] },
                { id: '5', day: 'Thu', time: '11:00 AM', platforms: ['instagram', 'threads'] },
                { id: '6', day: 'Fri', time: '9:00 AM', platforms: ['x', 'linkedin'] },
                { id: '7', day: 'Fri', time: '3:00 PM', platforms: ['instagram'] },
                { id: '8', day: 'Sat', time: '10:00 AM', platforms: ['facebook'] },
              ].map(slot => (
                <div key={slot.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/20 transition-colors">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-foreground">{slot.day} · {slot.time}</p>
                    <p className="text-[10px] text-muted-foreground">{slot.platforms.length} platform{slot.platforms.length !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="flex gap-0.5">
                    {slot.platforms.slice(0, 3).map(p => {
                      const Icon = PLATFORMS[p as keyof typeof PLATFORMS]?.icon
                      return Icon ? <Icon key={p} className="w-3 h-3 text-muted-foreground/60" /> : null
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div className="px-4 py-2.5 border-t border-border">
              <Button variant="ghost" size="sm" className="w-full text-xs text-accent hover:bg-accent/5 gap-1">
                <Plus className="w-3 h-3" /> Add time slot
              </Button>
            </div>
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
    </div>
  )
}
