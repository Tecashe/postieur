'use client'

import type { Metadata } from 'next'
import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, Plus, Grid3X3, Calendar as CalendarIcon } from 'lucide-react'
import { MOCK_SCHEDULED_POSTS, PLATFORMS } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

type ViewMode = 'month' | 'week' | 'day'

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 4, 1))
  const [viewMode, setViewMode] = useState<ViewMode>('month')

  const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()
  const daysInCurrentMonth = daysInMonth(currentDate)

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })

  // Group posts by date
  const postsByDate = useMemo(() => {
    const grouped: Record<string, typeof MOCK_SCHEDULED_POSTS> = {}
    MOCK_SCHEDULED_POSTS.forEach(post => {
      const date = new Date(post.scheduledFor).toDateString()
      if (!grouped[date]) grouped[date] = []
      grouped[date].push(post)
    })
    return grouped
  }, [])

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const days = []
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null)
  }
  for (let i = 1; i <= daysInCurrentMonth; i++) {
    days.push(i)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light text-zinc-900 dark:text-white">{monthName}</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Schedule and manage your posts</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <ToggleGroup 
            type="single" 
            value={viewMode} 
            onValueChange={(value) => value && setViewMode(value as ViewMode)}
            className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-1"
          >
            <ToggleGroupItem value="month" aria-label="Month view" className="text-xs sm:text-sm">Month</ToggleGroupItem>
            <ToggleGroupItem value="week" aria-label="Week view" className="text-xs sm:text-sm">Week</ToggleGroupItem>
            <ToggleGroupItem value="day" aria-label="Day view" className="text-xs sm:text-sm">Day</ToggleGroupItem>
          </ToggleGroup>
          <Button size="sm" className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            New Post
          </Button>
        </div>
      </div>

      {/* Calendar */}
      <Card className="p-4 sm:p-6 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-zinc-900 dark:text-white">{monthName}</h2>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={previousMonth}
              className="border-zinc-200 dark:border-zinc-700 h-9 w-9 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="border-zinc-200 dark:border-zinc-700 px-3"
            >
              Today
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={nextMonth}
              className="border-zinc-200 dark:border-zinc-700 h-9 w-9 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div 
              key={day} 
              className="text-center text-xs sm:text-sm font-semibold text-zinc-600 dark:text-zinc-400 py-3"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, idx) => {
            const dateStr = day ? new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString() : ''
            const posts = dateStr ? postsByDate[dateStr] || [] : []
            const isToday = day === new Date().getDate() && 
                           currentDate.getMonth() === new Date().getMonth() &&
                           currentDate.getFullYear() === new Date().getFullYear()

            return (
              <div
                key={idx}
                className={cn(
                  'min-h-24 sm:min-h-32 border rounded-lg p-2 transition-colors cursor-pointer',
                  day 
                    ? 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                    : 'border-transparent bg-zinc-50 dark:bg-transparent'
                )}
              >
                {day && (
                  <div className="space-y-1 h-full flex flex-col">
                    <div className={cn(
                      'text-xs sm:text-sm font-semibold',
                      isToday 
                        ? 'text-white bg-zinc-900 dark:bg-white dark:text-zinc-900 w-6 h-6 rounded-full flex items-center justify-center'
                        : 'text-zinc-700 dark:text-zinc-300'
                    )}>
                      {day}
                    </div>
                    <div className="space-y-1 flex-1 overflow-hidden">
                      {posts.slice(0, 2).map((post, i) => (
                        <div 
                          key={i}
                          className="text-xs px-1.5 py-1 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-200 truncate hover:bg-emerald-200 dark:hover:bg-emerald-900 transition-colors"
                          title={post.content.substring(0, 50)}
                        >
                          {PLATFORMS[post.platform].label}
                        </div>
                      ))}
                      {posts.length > 2 && (
                        <div className="text-xs text-zinc-500 dark:text-zinc-400 px-1.5 py-1">
                          +{posts.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-4 text-center">
          {Object.values(postsByDate).flat().length} posts scheduled this month
        </p>
      </Card>

      {/* Upcoming Posts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-4 sm:p-6 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-light text-zinc-900 dark:text-white">Upcoming Posts</h3>
              <Badge variant="outline" className="text-xs">Next 30 days</Badge>
            </div>
            <div className="space-y-3">
              {MOCK_SCHEDULED_POSTS.slice(0, 5).map((post) => {
                const Icon = PLATFORMS[post.platform].icon
                const date = new Date(post.scheduledFor)
                const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                
                return (
                  <div 
                    key={post.id}
                    className="flex items-start gap-3 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors group cursor-pointer"
                  >
                    <Icon className="w-5 h-5 flex-shrink-0 text-zinc-600 dark:text-zinc-400 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white line-clamp-2">
                        {post.content}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{dateStr}</p>
                    </div>
                    <Badge className={cn(
                      'flex-shrink-0 text-xs',
                      post.status === 'scheduled' && 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-200',
                      post.status === 'draft' && 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                    )}>
                      {post.status}
                    </Badge>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>

        {/* Stats */}
        <div className="space-y-4">
          <Card className="p-4 sm:p-6 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-4">This Month</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">Scheduled</p>
                <p className="text-2xl font-light text-zinc-900 dark:text-white">
                  {Object.values(postsByDate).flat().filter(p => p.status === 'scheduled').length}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">Draft</p>
                <p className="text-2xl font-light text-zinc-900 dark:text-white">
                  {Object.values(postsByDate).flat().filter(p => p.status === 'draft').length}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">Total Days Active</p>
                <p className="text-2xl font-light text-zinc-900 dark:text-white">
                  {Object.keys(postsByDate).length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-6 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-4">Platforms</h3>
            <div className="space-y-2">
              {['Instagram', 'LinkedIn', 'Twitter', 'TikTok'].map(platform => (
                <div key={platform} className="flex items-center justify-between text-sm">
                  <span className="text-zinc-600 dark:text-zinc-400">{platform}</span>
                  <span className="font-medium text-zinc-900 dark:text-white">
                    {Object.values(postsByDate).flat().filter(p => p.platform === platform.toLowerCase() || p.platform.includes(platform.toLowerCase())).length}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
