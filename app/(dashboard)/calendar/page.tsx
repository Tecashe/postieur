import type { Metadata } from 'next'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Calendar',
  description: 'Schedule and manage posts with drag-and-drop calendar',
}

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-light text-zinc-900 dark:text-white">May 2024</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Drag posts to reschedule</p>
        </div>
        <div className="flex items-center gap-3">
          <ToggleGroup type="single" defaultValue="month" className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-1">
            <ToggleGroupItem value="month" aria-label="Month view">Month</ToggleGroupItem>
            <ToggleGroupItem value="week" aria-label="Week view">Week</ToggleGroupItem>
            <ToggleGroupItem value="day" aria-label="Day view">Day</ToggleGroupItem>
          </ToggleGroup>
          <Button size="sm" asChild>
            <span className="cursor-pointer">
              <Plus className="w-4 h-4 mr-1" />
              New Post
            </span>
          </Button>
        </div>
      </div>

      {/* Calendar Card */}
      <Card className="p-8 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 min-h-96">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-medium text-zinc-900 dark:text-white">May 2024</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="border-zinc-200 dark:border-zinc-700">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" className="border-zinc-200 dark:border-zinc-700">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-zinc-600 dark:text-zinc-400 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid placeholder */}
        <div className="grid grid-cols-7 gap-2 h-80">
          {Array.from({ length: 35 }).map((_, i) => (
            <div
              key={i}
              className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 bg-zinc-50 dark:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors cursor-pointer flex items-center justify-center text-xs text-zinc-400"
            >
              {i < 10 ? `${25 + i}` : i < 25 ? `${i - 10}` : ''}
            </div>
          ))}
        </div>

        {/* Help text */}
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-4 text-center">
          Click on a date or drag posts to reschedule
        </p>
      </Card>

      {/* Queued Posts Section */}
      <Card className="p-6 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <h3 className="text-base font-light text-zinc-900 dark:text-white mb-4">Queued for This Week</h3>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
              <div className="w-1 h-8 rounded-full bg-zinc-300 dark:bg-zinc-700" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                  Sample post content {i + 1}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">May {15 + i} at 9:00 AM</p>
              </div>
              <span className="text-xs px-2 py-1 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-200">
                Scheduled
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
