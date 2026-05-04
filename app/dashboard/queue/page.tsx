'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { GripVertical, Trash2, Eye, Send, Clock, Zap } from 'lucide-react'
import { MOCK_SCHEDULED_POSTS, PLATFORMS } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

export default function QueuePage() {
  const [sortBy, setSortBy] = useState<'date' | 'platform'>('date')
  const [selectedPosts, setSelectedPosts] = useState<string[]>([])

  const scheduledPosts = MOCK_SCHEDULED_POSTS.filter(p => p.status === 'scheduled').slice(0, 10)
  
  const sortedPosts = sortBy === 'date' 
    ? [...scheduledPosts].sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime())
    : [...scheduledPosts].sort((a, b) => a.platform.localeCompare(b.platform))

  const handleSelectPost = (postId: string) => {
    setSelectedPosts(prev =>
      prev.includes(postId)
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light text-zinc-900 dark:text-white">Queue</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Manage scheduled posts and optimize timing</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="text-xs sm:text-sm">
            <Zap className="w-4 h-4 mr-2" />
            Auto-optimize
          </Button>
          <Button size="sm" className="text-xs sm:text-sm">
            <Send className="w-4 h-4 mr-2" />
            Post Now
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-medium">Scheduled</p>
          <p className="text-2xl sm:text-3xl font-light text-zinc-900 dark:text-white mt-2">{scheduledPosts.length}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Next 30 days</p>
        </Card>
        <Card className="p-4 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-medium">This Week</p>
          <p className="text-2xl sm:text-3xl font-light text-zinc-900 dark:text-white mt-2">
            {scheduledPosts.filter(p => {
              const date = new Date(p.scheduledFor)
              const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
              return date <= weekFromNow
            }).length}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Posting soon</p>
        </Card>
        <Card className="p-4 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-medium">Selected</p>
          <p className="text-2xl sm:text-3xl font-light text-zinc-900 dark:text-white mt-2">{selectedPosts.length}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">For bulk actions</p>
        </Card>
      </div>

      {/* Controls */}
      <Card className="p-4 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <Input 
              placeholder="Search posts..." 
              className="border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
            />
          </div>
          <div className="flex gap-2">
            {['date', 'platform'].map(option => (
              <Button
                key={option}
                variant={sortBy === option ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy(option as 'date' | 'platform')}
                className="capitalize text-xs sm:text-sm"
              >
                {option}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Queue Items */}
      <div className="space-y-2">
        {sortedPosts.map((post) => {
          const Icon = PLATFORMS[post.platform].icon
          const scheduledDate = new Date(post.scheduledFor)
          const isToday = scheduledDate.toDateString() === new Date().toDateString()
          const isTomorrow = scheduledDate.toDateString() === new Date(Date.now() + 24 * 60 * 60 * 1000).toDateString()
          
          return (
            <Card 
              key={post.id}
              className={cn(
                'p-4 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-move',
                selectedPosts.includes(post.id) && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950'
              )}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={selectedPosts.includes(post.id)}
                  onCheckedChange={() => handleSelectPost(post.id)}
                  className="mt-1"
                />
                <GripVertical className="w-4 h-4 text-zinc-400 dark:text-zinc-600 mt-1 flex-shrink-0" />
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 dark:text-white line-clamp-2">{post.content}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge className="flex items-center gap-1 text-xs">
                      <Icon className="w-3 h-3" />
                      {PLATFORMS[post.platform].label}
                    </Badge>
                    <span className="text-xs text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {isToday ? 'Today' : isTomorrow ? 'Tomorrow' : scheduledDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {scheduledDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Preview">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 dark:text-red-400 hover:text-red-700" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Bulk Actions */}
      {selectedPosts.length > 0 && (
        <Card className="p-4 border-zinc-200 dark:border-zinc-800 bg-emerald-50 dark:bg-emerald-950 sticky bottom-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
              {selectedPosts.length} post{selectedPosts.length !== 1 ? 's' : ''} selected
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedPosts([])}>
                Clear
              </Button>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <Send className="w-4 h-4 mr-2" />
                Post All
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
