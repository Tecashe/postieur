'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Plus, Clock, Trash2, Send, Edit2, Eye, MoreVertical, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { PLATFORMS } from '@/lib/constants'

const DRAFTS = [
  {
    id: '1',
    content: 'Excited to announce our new feature launch! Check out what we\'ve been working on for the past 3 months...',
    platforms: ['Twitter', 'LinkedIn'],
    lastEdited: new Date(Date.now() - 2 * 60 * 60 * 1000),
    wordCount: 45,
    charCount: 280,
    imageCount: 1,
  },
  {
    id: '2',
    content: 'Behind-the-scenes look at our team collaborating on the next big thing 🚀',
    platforms: ['Instagram', 'TikTok'],
    lastEdited: new Date(Date.now() - 8 * 60 * 60 * 1000),
    wordCount: 18,
    charCount: 95,
    imageCount: 3,
  },
  {
    id: '3',
    content: 'Join us for a live AMA session tomorrow at 2 PM EST! We\'ll be discussing product strategy, roadmap, and answering your questions...',
    platforms: ['LinkedIn', 'Twitter'],
    lastEdited: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    wordCount: 35,
    charCount: 198,
    imageCount: 0,
  },
  {
    id: '4',
    content: 'Customer spotlight: How [Company] increased their productivity by 40% using our platform',
    platforms: ['Instagram', 'LinkedIn'],
    lastEdited: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    wordCount: 20,
    charCount: 110,
    imageCount: 2,
  },
  {
    id: '5',
    content: 'New blog post: "5 Ways to Optimize Your Social Media Strategy in 2024" - [Link]',
    platforms: ['Twitter', 'LinkedIn', 'Facebook'],
    lastEdited: new Date(Date.now() - 5 * 60 * 60 * 1000),
    wordCount: 22,
    charCount: 125,
    imageCount: 1,
  },
  {
    id: '6',
    content: 'We\'re hiring! 👀 Looking for talented social media managers, content creators, and strategists. Check out our careers page for open positions!',
    platforms: ['Twitter', 'LinkedIn', 'Instagram'],
    lastEdited: new Date(Date.now() - 12 * 60 * 60 * 1000),
    wordCount: 32,
    charCount: 180,
    imageCount: 0,
  },
]

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default function DraftsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDrafts, setSelectedDrafts] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<'recent' | 'wordcount'>('recent')

  const filteredDrafts = DRAFTS.filter(d =>
    d.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const sortedDrafts = sortBy === 'recent'
    ? [...filteredDrafts].sort((a, b) => b.lastEdited.getTime() - a.lastEdited.getTime())
    : [...filteredDrafts].sort((a, b) => b.wordCount - a.wordCount)

  const handleSelectDraft = (draftId: string) => {
    setSelectedDrafts(prev =>
      prev.includes(draftId)
        ? prev.filter(id => id !== draftId)
        : [...prev, draftId]
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light text-zinc-900 dark:text-white">Drafts</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Work in progress posts ready to refine and publish</p>
        </div>
        <Button size="sm" className="text-xs sm:text-sm">
          <Plus className="w-4 h-4 mr-2" />
          New Draft
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-medium">Total Drafts</p>
          <p className="text-2xl sm:text-3xl font-light text-zinc-900 dark:text-white mt-2">{DRAFTS.length}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Ready to publish</p>
        </Card>
        <Card className="p-4 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-medium">Total Characters</p>
          <p className="text-2xl sm:text-3xl font-light text-zinc-900 dark:text-white mt-2">
            {DRAFTS.reduce((sum, d) => sum + d.charCount, 0).toLocaleString()}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Across all drafts</p>
        </Card>
        <Card className="p-4 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-medium">Attached Media</p>
          <p className="text-2xl sm:text-3xl font-light text-zinc-900 dark:text-white mt-2">
            {DRAFTS.reduce((sum, d) => sum + d.imageCount, 0)}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Images & videos</p>
        </Card>
      </div>

      {/* Controls */}
      <Card className="p-4 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
            <Input
              placeholder="Search drafts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
            />
          </div>
          <div className="flex gap-2">
            {['recent', 'wordcount'].map(option => (
              <Button
                key={option}
                variant={sortBy === option ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy(option as 'recent' | 'wordcount')}
                className="text-xs sm:text-sm"
              >
                {option === 'recent' ? 'Newest' : 'Longest'}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Drafts List */}
      <div className="space-y-3">
        {sortedDrafts.map(draft => {
          const getCharLimit = () => {
            if (draft.platforms.includes('Twitter')) return 280
            if (draft.platforms.includes('TikTok')) return 2200
            if (draft.platforms.includes('Instagram')) return 2200
            return 3000
          }
          const charLimit = getCharLimit()
          const charProgress = (draft.charCount / charLimit) * 100

          return (
            <Card
              key={draft.id}
              className={cn(
                'p-4 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors',
                selectedDrafts.includes(draft.id) && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950'
              )}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={selectedDrafts.includes(draft.id)}
                  onCheckedChange={() => handleSelectDraft(draft.id)}
                  className="mt-1"
                />

                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-900 dark:text-white line-clamp-2 font-medium">{draft.content}</p>

                  <div className="mt-2 space-y-2">
                    {/* Character count progress */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-zinc-600 dark:text-zinc-400">{draft.charCount} / {charLimit} characters</span>
                        <span className={cn(
                          'text-xs font-medium',
                          charProgress > 90 ? 'text-red-600 dark:text-red-400' : 'text-zinc-600 dark:text-zinc-400'
                        )}>
                          {Math.round(charProgress)}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full transition-all',
                            charProgress > 90 ? 'bg-red-500' : 'bg-emerald-500'
                          )}
                          style={{ width: `${Math.min(charProgress, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(draft.lastEdited)}
                      </span>
                      {draft.imageCount > 0 && (
                        <Badge variant="secondary" className="text-xs">{draft.imageCount} image{draft.imageCount > 1 ? 's' : ''}</Badge>
                      )}
                      <div className="flex gap-1">
                        {draft.platforms.map(platform => {
                          const Icon = PLATFORMS[platform].icon
                          return (
                            <div key={platform} className="flex items-center gap-0.5 px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded text-xs text-zinc-700 dark:text-zinc-300">
                              <Icon className="w-3 h-3" />
                              <span>{platform}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-1 flex-shrink-0">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Preview">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Edit">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-emerald-600 dark:text-emerald-400" title="Publish">
                    <Send className="w-4 h-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Convert to Template</DropdownMenuItem>
                      <DropdownMenuItem>Duplicate</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600 dark:text-red-400">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Bulk Actions */}
      {selectedDrafts.length > 0 && (
        <Card className="p-4 border-zinc-200 dark:border-zinc-800 bg-emerald-50 dark:bg-emerald-950 sticky bottom-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
              {selectedDrafts.length} draft{selectedDrafts.length !== 1 ? 's' : ''} selected
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedDrafts([])}>
                Clear
              </Button>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm">
                <Send className="w-4 h-4 mr-2" />
                Publish All
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
