'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Plus, Clock } from 'lucide-react'
import Link from 'next/link'
import { MOCK_POSTS } from '@/lib/mock-data'
import { PLATFORMS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { Post } from '@/lib/types'

type ViewMode = 'month' | 'week'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const WEEKDAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

function PostChip({ post }: { post: Post }) {
  const Icon = PLATFORMS[post.platforms[0]]?.icon
  return (
    <div className={cn(
      'flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] text-[9px] truncate',
      post.status === 'scheduled' ? 'bg-accent/15 text-accent' :
      post.status === 'published' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
      'bg-muted text-muted-foreground'
    )}>
      {Icon && <Icon className="w-2.5 h-2.5 flex-shrink-0" />}
      <span className="truncate">{post.content.slice(0, 22)}</span>
    </div>
  )
}

export default function CalendarPage() {
  const today = new Date()
  const [view, setView] = useState<ViewMode>('month')
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selected, setSelected] = useState<Post | null>(null)

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1) }
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1) }

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  const getPostsForDay = (day: number) =>
    MOCK_POSTS.filter(p => {
      if (!p.scheduledAt) return false
      const d = new Date(p.scheduledAt)
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day
    })

  const cells = Array.from({ length: firstDay + daysInMonth }, (_, i) => i < firstDay ? null : i - firstDay + 1)

  return (
    <div className="space-y-4 pb-6">
      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground" onClick={prevMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium text-foreground w-36 text-center">{MONTHS[month]} {year}</span>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground" onClick={nextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground" onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth()) }}>
          Today
        </Button>
        <div className="flex-1" />
        <div className="flex rounded-sm overflow-hidden border border-border">
          {(['month', 'week'] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={cn('px-3 py-1.5 text-xs font-medium capitalize transition-colors border-r border-border last:border-r-0',
                view === v ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted/60')}>
              {v}
            </button>
          ))}
        </div>
        <Button asChild size="sm" className="gap-1.5 text-xs">
          <Link href="/dashboard/compose"><Plus className="w-3.5 h-3.5" /> New Post</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_260px] gap-4">
        {/* Calendar grid */}
        <Card className="bg-card border-border shadow-sm overflow-hidden">
          {/* Header row */}
          <div className="grid grid-cols-7 border-b border-border">
            {WEEKDAYS.map(d => (
              <div key={d} className="py-2.5 text-center text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                {d}
              </div>
            ))}
          </div>
          {/* Day cells */}
          <div className="grid grid-cols-7">
            {cells.map((day, idx) => {
              const posts = day ? getPostsForDay(day) : []
              const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
              return (
                <div
                  key={idx}
                  className={cn(
                    'min-h-[90px] border-r border-b border-border p-1.5 last-of-type:border-r-0 transition-colors',
                    day ? 'cursor-pointer hover:bg-muted/20' : 'bg-muted/10',
                    idx % 7 === 6 ? 'border-r-0' : ''
                  )}
                >
                  {day && (
                    <>
                      <div className={cn(
                        'w-5 h-5 rounded-sm flex items-center justify-center text-[11px] font-medium mb-1',
                        isToday ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                      )}>
                        {day}
                      </div>
                      <div className="space-y-0.5">
                        {posts.slice(0, 2).map(p => <PostChip key={p.id} post={p} />)}
                        {posts.length > 2 && (
                          <div className="text-[9px] text-muted-foreground px-1">+{posts.length - 2} more</div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </Card>

        {/* Side panel */}
        <div className="space-y-4">
          {/* Legend */}
          <Card className="bg-card border-border shadow-sm p-4">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest mb-3">Legend</p>
            <div className="space-y-2">
              {[
                { label: 'Scheduled', color: 'bg-accent/15 text-accent' },
                { label: 'Published', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
                { label: 'Draft', color: 'bg-muted text-muted-foreground' },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-2">
                  <div className={cn('w-3 h-3 rounded-[2px]', l.color.split(' ')[0])} />
                  <span className="text-xs text-muted-foreground">{l.label}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Upcoming this week */}
          <Card className="bg-card border-border shadow-sm">
            <div className="px-4 py-3 border-b border-border">
              <h3 className="text-sm font-medium text-foreground">This Week</h3>
            </div>
            <div className="divide-y divide-border">
              {MOCK_POSTS.filter(p => p.status === 'scheduled').slice(0, 5).map(post => {
                const Icon = PLATFORMS[post.platforms[0]]?.icon
                const dt = new Date(post.scheduledAt ?? Date.now())
                return (
                  <div key={post.id} className="px-4 py-2.5 flex items-center gap-2.5 hover:bg-muted/20 transition-colors">
                    {Icon && <Icon className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground truncate">{post.content.slice(0, 40)}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {dt.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                        {' '}{dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          <Card className="bg-accent/5 border-accent/20 shadow-sm p-4">
            <div className="flex gap-2.5">
              <Clock className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-foreground">Optimal slots</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">Best windows this week: Tue 10am, Thu 2pm, Fri 9am</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
