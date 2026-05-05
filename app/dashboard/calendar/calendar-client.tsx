'use client'

import { useState, useMemo } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from '@dnd-kit/core'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ChevronLeft, ChevronRight, Plus, Clock, Calendar as CalIcon,
  TrendingUp, CheckCircle2, AlarmClock, FileEdit, X, ExternalLink,
  Sparkles,
} from 'lucide-react'
import Link from 'next/link'
import { MOCK_POSTS } from '@/lib/mock-data'
import { PLATFORMS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { Post } from '@/lib/types'
import { reschedulePost } from '@/lib/actions/posts'
import { toast } from 'sonner'

// ── Constants ─────────────────────────────────────────────────────────────────

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const WEEKDAYS_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const WEEKDAYS_FULL  = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const HOURS = Array.from({ length: 14 }, (_, i) => i + 7) // 7am–8pm

// ── Helpers ───────────────────────────────────────────────────────────────────

function getDaysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate() }
function getFirstDay(y: number, m: number) { return new Date(y, m, 1).getDay() }
function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}
function fmtTime(d: Date) { return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
function fmtDate(d: Date) { return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }) }

// ── Post Chip (draggable) ──────────────────────────────────────────────────────

function PostChip({ post, onSelect }: { post: Post; onSelect: (p: Post) => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: post.id })
  const Icon = PLATFORMS[post.platforms[0]]?.icon

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={(e) => { e.stopPropagation(); onSelect(post) }}
      className={cn(
        'flex items-center gap-1 px-1.5 py-0.5 rounded-[3px] text-[9px] truncate cursor-grab active:cursor-grabbing transition-opacity select-none',
        isDragging ? 'opacity-40' : 'opacity-100',
        post.status === 'scheduled'
          ? 'bg-accent/15 text-accent border border-accent/20 hover:bg-accent/25'
          : post.status === 'published'
          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
          : 'bg-muted text-muted-foreground border border-border hover:bg-muted/80'
      )}
    >
      {Icon && <Icon className="w-2.5 h-2.5 flex-shrink-0" />}
      <span className="truncate">{post.content.slice(0, 24)}</span>
    </div>
  )
}

// ── Droppable Day Cell ─────────────────────────────────────────────────────────

function DayCell({
  day, date, posts, isToday, isOtherMonth, onSelectPost, onNewPost,
}: {
  day: number | null
  date?: Date
  posts: Post[]
  isToday: boolean
  isOtherMonth?: boolean
  onSelectPost: (p: Post) => void
  onNewPost?: (date: Date) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: date ? date.toISOString() : `empty-${day}` })

  return (
    <div
      ref={setNodeRef}
      onClick={() => { if (date && onNewPost) onNewPost(date) }}
      className={cn(
        'min-h-[100px] border-r border-b border-border p-1.5 transition-colors relative group',
        day ? 'cursor-pointer' : 'bg-muted/5 cursor-default',
        isOtherMonth && 'opacity-40',
        isOver && 'bg-accent/5 border-accent/40',
        'last-in-[.grid]:border-r-0'
      )}
    >
      {day && (
        <>
          <div className={cn(
            'w-5 h-5 rounded-sm flex items-center justify-center text-[11px] font-medium mb-1 transition-colors',
            isToday
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground group-hover:text-foreground'
          )}>
            {day}
          </div>
          <div className="space-y-0.5">
            {posts.slice(0, 3).map(p => (
              <PostChip key={p.id} post={p} onSelect={onSelectPost} />
            ))}
            {posts.length > 3 && (
              <div className="text-[9px] text-muted-foreground px-1 font-medium">+{posts.length - 3} more</div>
            )}
          </div>
          {/* Quick add on hover */}
          <button
            onClick={(e) => { e.stopPropagation(); if (date && onNewPost) onNewPost(date) }}
            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity w-4 h-4 rounded-sm bg-primary/10 hover:bg-primary/20 flex items-center justify-center"
          >
            <Plus className="w-2.5 h-2.5 text-primary" />
          </button>
        </>
      )}
    </div>
  )
}

// ── Week View ─────────────────────────────────────────────────────────────────

function WeekView({ weekStart, posts, onSelectPost, onNewPost }: {
  weekStart: Date
  posts: Post[]
  onSelectPost: (p: Post) => void
  onNewPost: (date: Date) => void
}) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    return d
  })
  const today = new Date()

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[600px]">
        {/* Day headers */}
        <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border">
          <div />
          {days.map((d, i) => {
            const isToday = isSameDay(d, today)
            return (
              <div key={i} className="py-2 text-center border-l border-border first:border-l-0">
                <p className="text-[10px] font-medium text-muted-foreground uppercase">{WEEKDAYS_SHORT[d.getDay()]}</p>
                <div className={cn(
                  'mx-auto mt-0.5 w-6 h-6 rounded-full flex items-center justify-center text-[13px] font-semibold',
                  isToday ? 'bg-primary text-primary-foreground' : 'text-foreground'
                )}>
                  {d.getDate()}
                </div>
              </div>
            )
          })}
        </div>

        {/* Time slots */}
        <div className="max-h-[500px] overflow-y-auto">
          {HOURS.map(hour => (
            <div key={hour} className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border/50 min-h-[48px]">
              <div className="px-2 py-1 text-[10px] text-muted-foreground text-right flex-shrink-0 border-r border-border/50">
                {hour === 12 ? '12pm' : hour > 12 ? `${hour - 12}pm` : `${hour}am`}
              </div>
              {days.map((d, di) => {
                const slotPosts = posts.filter(p => {
                  if (!p.scheduledAt) return false
                  const pd = new Date(p.scheduledAt)
                  return isSameDay(pd, d) && pd.getHours() === hour
                })
                const { setNodeRef, isOver } = useDroppable({ id: `${d.toISOString()}-${hour}` }) // eslint-disable-line
                return (
                  <div
                    key={di}
                    ref={setNodeRef}
                    onClick={() => { const date = new Date(d); date.setHours(hour, 0, 0, 0); onNewPost(date) }}
                    className={cn(
                      'border-l border-border/50 p-0.5 cursor-pointer hover:bg-muted/20 transition-colors',
                      isOver && 'bg-accent/5'
                    )}
                  >
                    {slotPosts.map(p => {
                      const Icon = PLATFORMS[p.platforms[0]]?.icon
                      return (
                        <div
                          key={p.id}
                          onClick={(e) => { e.stopPropagation(); onSelectPost(p) }}
                          className={cn(
                            'text-[9px] px-1 py-0.5 rounded-[2px] truncate cursor-pointer mb-0.5 flex items-center gap-1',
                            p.status === 'scheduled'
                              ? 'bg-accent/20 text-accent'
                              : p.status === 'published'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : 'bg-muted text-muted-foreground'
                          )}
                        >
                          {Icon && <Icon className="w-2 h-2 flex-shrink-0" />}
                          <span className="truncate">{p.content.slice(0, 20)}</span>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Post Detail Drawer ─────────────────────────────────────────────────────────

function PostDetail({ post, onClose }: { post: Post; onClose: () => void }) {
  const platforms = post.platforms.map(p => PLATFORMS[p]).filter(Boolean)

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <Card className="relative z-50 bg-card border-border shadow-2xl w-full max-w-md rounded-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
          <div className="flex items-center gap-2.5">
            <div className="flex gap-1">
              {platforms.map(({ icon: Icon, color }, i) => (
                <span key={i} className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: `${color}20` }}>
                  <Icon className="w-3 h-3" style={{ color }} />
                </span>
              ))}
            </div>
            <Badge variant="outline" className={cn(
              'text-[10px] capitalize',
              post.status === 'scheduled' ? 'border-accent/40 text-accent' :
              post.status === 'published' ? 'border-emerald-500/40 text-emerald-600 dark:text-emerald-400' :
              'border-border text-muted-foreground'
            )}>
              {post.status}
            </Badge>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <p className="text-sm text-foreground leading-relaxed">{post.content}</p>

          {post.scheduledAt && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <AlarmClock className="w-3.5 h-3.5" />
              <span>{fmtDate(new Date(post.scheduledAt))} at {fmtTime(new Date(post.scheduledAt))}</span>
            </div>
          )}

          {post.engagement && (
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'Likes', val: post.engagement.likes },
                { label: 'Comments', val: post.engagement.comments },
                { label: 'Shares', val: post.engagement.shares },
                { label: 'Reach', val: post.engagement.impressions },
              ].map(m => (
                <div key={m.label} className="bg-muted/40 rounded-sm p-2 text-center">
                  <p className="text-sm font-semibold text-foreground">{m.val?.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">{m.label}</p>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <Button asChild size="sm" variant="outline" className="flex-1 text-xs gap-1.5">
              <Link href={`/dashboard/compose?edit=${post.id}`}>
                <FileEdit className="w-3 h-3" /> Edit
              </Link>
            </Button>
            <Button asChild size="sm" className="flex-1 text-xs gap-1.5">
              <Link href="/dashboard/analytics">
                <ExternalLink className="w-3 h-3" /> Analytics
              </Link>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

// ── Optimal Time Badge ────────────────────────────────────────────────────────

const OPTIMAL_TIMES = [
  { day: 'Tuesday',   time: '10:00 AM', platform: 'LinkedIn', lift: '+34%' },
  { day: 'Thursday',  time: '2:00 PM',  platform: 'Instagram', lift: '+28%' },
  { day: 'Friday',    time: '9:00 AM',  platform: 'X', lift: '+22%' },
  { day: 'Wednesday', time: '6:00 PM',  platform: 'TikTok', lift: '+41%' },
]

// ── Main Component ────────────────────────────────────────────────────────────

export default function CalendarClient({ initialPosts }: { initialPosts?: Post[] }) {
  const today = new Date()
  const [view, setView] = useState<'month' | 'week'>('month')
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [posts, setPosts] = useState<Post[]>(initialPosts ?? MOCK_POSTS)
  const [draggingPost, setDraggingPost] = useState<Post | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  // Navigation
  const prevPeriod = () => {
    if (view === 'month') {
      if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1)
    } else {
      setWeekOffset(w => w - 1)
    }
  }
  const nextPeriod = () => {
    if (view === 'month') {
      if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1)
    } else {
      setWeekOffset(w => w + 1)
    }
  }
  const [weekOffset, setWeekOffset] = useState(0)

  // Week start (Monday)
  const weekStart = useMemo(() => {
    const d = new Date(today)
    const day = d.getDay()
    const diff = d.getDate() - day + (weekOffset * 7)
    d.setDate(diff)
    d.setHours(0, 0, 0, 0)
    return d
  }, [weekOffset]) // eslint-disable-line

  // Month cells
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDay(year, month)
  const lastDay = getDaysInMonth(year, month - 1 < 0 ? 11 : month - 1)

  const cells = useMemo(() => {
    const arr: Array<{ day: number; date: Date; isOtherMonth: boolean }> = []
    // Previous month overflow
    for (let i = firstDay - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, lastDay - i)
      arr.push({ day: lastDay - i, date: d, isOtherMonth: true })
    }
    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      arr.push({ day: d, date: new Date(year, month, d), isOtherMonth: false })
    }
    // Next month overflow (fill to complete last row)
    const remaining = 7 - (arr.length % 7)
    if (remaining < 7) {
      for (let d = 1; d <= remaining; d++) {
        arr.push({ day: d, date: new Date(year, month + 1, d), isOtherMonth: true })
      }
    }
    return arr
  }, [year, month, firstDay, daysInMonth, lastDay])

  const getPostsForDate = (date: Date) =>
    posts.filter(p => p.scheduledAt && isSameDay(new Date(p.scheduledAt), date))

  // Stats
  const scheduledCount = posts.filter(p => p.status === 'scheduled').length
  const publishedCount = posts.filter(p => p.status === 'published').length
  const draftCount = posts.filter(p => p.status === 'draft').length
  const monthPosts = posts.filter(p => {
    if (!p.scheduledAt) return false
    const d = new Date(p.scheduledAt)
    return d.getFullYear() === year && d.getMonth() === month
  })

  // Drag handlers
  const handleDragStart = ({ active }: DragStartEvent) => {
    const post = posts.find(p => p.id === active.id)
    setDraggingPost(post ?? null)
  }
  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setDraggingPost(null)
    if (!over || !over.id) return
    const isoStr = over.id.toString().split('-').slice(0, 3).join('-') // ISO date prefix
    const dropDate = new Date(isoStr)
    if (isNaN(dropDate.getTime())) return
    setPosts(prev => prev.map(p => {
      if (p.id !== active.id || !p.scheduledAt) return p
      const orig = new Date(p.scheduledAt)
      const next = new Date(dropDate)
      next.setHours(orig.getHours(), orig.getMinutes())
      const updated = { ...p, scheduledAt: next, status: 'scheduled' as Post['status'] }
      // Persist to DB (non-blocking)
      reschedulePost(p.id, next).catch(() => toast.error('Failed to save new date'))
      return updated
    }))
  }

  const handleNewPost = (date: Date) => {
    const iso = date.toISOString()
    window.location.href = `/dashboard/compose?date=${iso}`
  }

  const label = view === 'month'
    ? `${MONTHS[month]} ${year}`
    : (() => {
        const end = new Date(weekStart); end.setDate(weekStart.getDate() + 6)
        return `${weekStart.toLocaleDateString([], { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}`
      })()

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="space-y-4 pb-6">

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'This Month', val: monthPosts.length, icon: <CalIcon className="w-4 h-4" />, color: 'text-primary' },
            { label: 'Scheduled', val: scheduledCount, icon: <AlarmClock className="w-4 h-4" />, color: 'text-accent' },
            { label: 'Published', val: publishedCount, icon: <CheckCircle2 className="w-4 h-4" />, color: 'text-emerald-500' },
            { label: 'Drafts', val: draftCount, icon: <FileEdit className="w-4 h-4" />, color: 'text-muted-foreground' },
          ].map(s => (
            <Card key={s.label} className="bg-card border-border shadow-sm px-4 py-3 flex items-center gap-3">
              <span className={s.color}>{s.icon}</span>
              <div>
                <p className="text-lg font-semibold text-foreground">{s.val}</p>
                <p className="text-[11px] text-muted-foreground">{s.label}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* ── Toolbar ── */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground" onClick={prevPeriod}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium text-foreground min-w-[160px] text-center">{label}</span>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground" onClick={nextPeriod}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <Button
            variant="ghost" size="sm"
            className="text-xs text-muted-foreground hover:text-foreground"
            onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth()); setWeekOffset(0) }}
          >
            Today
          </Button>
          <div className="flex-1" />
          <div className="flex rounded-sm overflow-hidden border border-border">
            {(['month', 'week'] as const).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium capitalize transition-colors border-r border-border last:border-r-0',
                  view === v ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted/60'
                )}
              >
                {v}
              </button>
            ))}
          </div>
          <Button asChild size="sm" className="gap-1.5 text-xs h-8">
            <Link href="/dashboard/compose"><Plus className="w-3.5 h-3.5" />New Post</Link>
          </Button>
        </div>

        {/* ── Main layout ── */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_260px] gap-4 items-start">

          {/* Calendar */}
          <Card className="bg-card border-border shadow-sm overflow-hidden">
            {view === 'month' ? (
              <>
                {/* Weekday headers */}
                <div className="grid grid-cols-7 border-b border-border bg-muted/20">
                  {WEEKDAYS_SHORT.map(d => (
                    <div key={d} className="py-2 text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                      {d}
                    </div>
                  ))}
                </div>
                {/* Day grid */}
                <div className="grid grid-cols-7">
                  {cells.map((cell, idx) => (
                    <DayCell
                      key={idx}
                      day={cell.day}
                      date={cell.date}
                      posts={getPostsForDate(cell.date)}
                      isToday={isSameDay(cell.date, today)}
                      isOtherMonth={cell.isOtherMonth}
                      onSelectPost={setSelectedPost}
                      onNewPost={handleNewPost}
                    />
                  ))}
                </div>
              </>
            ) : (
              <WeekView
                weekStart={weekStart}
                posts={posts}
                onSelectPost={setSelectedPost}
                onNewPost={handleNewPost}
              />
            )}
          </Card>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Legend */}
            <Card className="bg-card border-border shadow-sm p-4">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">Status</p>
              <div className="space-y-2">
                {[
                  { label: 'Scheduled', cls: 'bg-accent/15 border-accent/20' },
                  { label: 'Published', cls: 'bg-emerald-500/10 border-emerald-500/20' },
                  { label: 'Draft',     cls: 'bg-muted border-border' },
                ].map(l => (
                  <div key={l.label} className="flex items-center gap-2">
                    <div className={cn('w-3 h-1.5 rounded-sm border', l.cls)} />
                    <span className="text-xs text-muted-foreground">{l.label}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-3 flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-sm bg-primary mr-0.5" />
                Drag chips to reschedule
              </p>
            </Card>

            {/* Upcoming */}
            <Card className="bg-card border-border shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <h3 className="text-xs font-semibold text-foreground">Upcoming</h3>
                <Badge variant="outline" className="text-[10px] h-4 px-1.5">{scheduledCount}</Badge>
              </div>
              <div className="divide-y divide-border max-h-[280px] overflow-y-auto">
                {posts
                  .filter(p => p.status === 'scheduled' && p.scheduledAt && new Date(p.scheduledAt) >= today)
                  .sort((a, b) => new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime())
                  .slice(0, 8)
                  .map(post => {
                    const Icon = PLATFORMS[post.platforms[0]]?.icon
                    const dt = new Date(post.scheduledAt!)
                    const isThisWeek = (dt.getTime() - today.getTime()) < 7 * 86400000
                    return (
                      <button
                        key={post.id}
                        onClick={() => setSelectedPost(post)}
                        className="w-full px-4 py-2.5 flex items-center gap-2.5 hover:bg-muted/20 transition-colors text-left"
                      >
                        {Icon && <Icon className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-foreground truncate">{post.content.slice(0, 38)}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {fmtDate(dt)} · {fmtTime(dt)}
                          </p>
                        </div>
                        {isThisWeek && (
                          <span className="text-[9px] bg-accent/10 text-accent px-1.5 py-0.5 rounded-sm flex-shrink-0">Soon</span>
                        )}
                      </button>
                    )
                  })}
              </div>
            </Card>

            {/* AI Best Times */}
            <Card className="bg-card border-border shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-accent" />
                <h3 className="text-xs font-semibold text-foreground">Best Times to Post</h3>
                <Badge variant="outline" className="ml-auto text-[9px] h-4 px-1.5 border-accent/30 text-accent">AI</Badge>
              </div>
              <div className="divide-y divide-border">
                {OPTIMAL_TIMES.map((slot, i) => (
                  <div key={i} className="px-4 py-2.5 flex items-center gap-2.5">
                    <TrendingUp className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground">{slot.day} · {slot.time}</p>
                      <p className="text-[10px] text-muted-foreground">{slot.platform}</p>
                    </div>
                    <span className="text-[10px] font-medium text-emerald-500">{slot.lift}</span>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2.5 border-t border-border">
                <p className="text-[10px] text-muted-foreground">Based on your account engagement patterns</p>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Drag overlay */}
      <DragOverlay>
        {draggingPost && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-sm text-[10px] bg-primary text-primary-foreground shadow-lg cursor-grabbing opacity-90 max-w-[180px] truncate">
            {PLATFORMS[draggingPost.platforms[0]]?.icon && (() => {
              const Icon = PLATFORMS[draggingPost.platforms[0]].icon
              return <Icon className="w-3 h-3 flex-shrink-0" />
            })()}
            {draggingPost.content.slice(0, 28)}
          </div>
        )}
      </DragOverlay>

      {/* Post detail modal */}
      {selectedPost && <PostDetail post={selectedPost} onClose={() => setSelectedPost(null)} />}
    </DndContext>
  )
}
