'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Plus, Search, Grid3x3, List, Star, Trash2, Copy, Edit2, Eye, MoreVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const TEMPLATES = [
  {
    id: '1',
    name: 'Monday Motivation',
    description: 'Inspirational quote with morning routine',
    category: 'Motivation',
    platforms: ['Instagram', 'LinkedIn'],
    content: 'Start your week strong! 💪 What\'s your #1 goal this week?',
    usedCount: 24,
    lastUsed: '2024-05-02',
    starred: true,
  },
  {
    id: '2',
    name: 'Product Launch',
    description: 'Announcement template for new features',
    category: 'Product',
    platforms: ['Twitter', 'LinkedIn', 'Instagram'],
    content: 'We\'re excited to announce... 🚀',
    usedCount: 8,
    lastUsed: '2024-04-28',
    starred: false,
  },
  {
    id: '3',
    name: 'Friday Freebie',
    description: 'Giveaway and community engagement',
    category: 'Engagement',
    platforms: ['Instagram', 'TikTok'],
    content: 'It\'s Friday giveaway time! 🎁 RT to enter...',
    usedCount: 15,
    lastUsed: '2024-05-03',
    starred: true,
  },
  {
    id: '4',
    name: 'Blog Post Promo',
    description: 'Article sharing with callout',
    category: 'Content',
    platforms: ['LinkedIn', 'Twitter'],
    content: 'New article on the blog: [Link] Check it out!',
    usedCount: 32,
    lastUsed: '2024-05-01',
    starred: false,
  },
  {
    id: '5',
    name: 'User Spotlight',
    description: 'Feature customer success story',
    category: 'Social Proof',
    platforms: ['Instagram', 'LinkedIn'],
    content: 'Spotlight on one of our amazing customers...',
    usedCount: 12,
    lastUsed: '2024-04-25',
    starred: true,
  },
  {
    id: '6',
    name: 'Webinar Sign-up',
    description: 'Educational event promotion',
    category: 'Events',
    platforms: ['LinkedIn', 'Facebook'],
    content: 'Join us for an exclusive webinar! 📺 [Register]',
    usedCount: 7,
    lastUsed: '2024-04-20',
    starred: false,
  },
]

const CATEGORIES = ['All', 'Motivation', 'Product', 'Engagement', 'Content', 'Social Proof', 'Events']

export default function TemplatesPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [showStarredOnly, setShowStarredOnly] = useState(false)

  const filteredTemplates = TEMPLATES.filter(t => {
    const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         t.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStarred = !showStarredOnly || t.starred
    return matchesCategory && matchesSearch && matchesStarred
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light text-zinc-900 dark:text-white">Templates</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Create posts faster with reusable templates</p>
        </div>
        <Button size="sm" className="text-xs sm:text-sm">
          <Plus className="w-4 h-4 mr-2" />
          New Template
        </Button>
      </div>

      {/* Filters & Search */}
      <Card className="p-4 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
            />
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                className="text-xs"
              >
                {cat}
              </Button>
            ))}
          </div>

          {/* View Controls */}
          <div className="flex items-center justify-between pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''}
            </div>
            <div className="flex gap-2">
              <Button
                variant={showStarredOnly ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setShowStarredOnly(!showStarredOnly)}
                className="h-8 w-8 p-0"
                title={showStarredOnly ? 'Show all' : 'Show starred'}
              >
                <Star className="w-4 h-4" fill="currentColor" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="h-8 w-8 p-0"
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="h-8 w-8 p-0"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Templates Grid */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map(template => (
            <Card key={template.id} className="p-4 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-medium text-sm text-zinc-900 dark:text-white">{template.name}</h3>
                  <Badge variant="outline" className="mt-2 text-xs">{template.category}</Badge>
                </div>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
                  <Star className={cn('w-4 h-4', template.starred ? 'fill-emerald-500 text-emerald-500' : 'text-zinc-400')} />
                </Button>
              </div>

              <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-3">{template.description}</p>
              
              <div className="bg-zinc-50 dark:bg-zinc-800 p-3 rounded-lg mb-3 flex-1">
                <p className="text-xs text-zinc-700 dark:text-zinc-300 line-clamp-3">{template.content}</p>
              </div>

              <div className="flex flex-wrap gap-1 mb-3">
                {template.platforms.map(p => (
                  <Badge key={p} variant="secondary" className="text-xs">{p}</Badge>
                ))}
              </div>

              <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-3 pb-3 border-t border-zinc-200 dark:border-zinc-800 pt-3">
                Used {template.usedCount} times • Last used {new Date(template.lastUsed).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 text-xs h-8">
                  <Copy className="w-3 h-3 mr-1" />
                  Use
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600 dark:text-red-400">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Templates List */}
      {viewMode === 'list' && (
        <div className="space-y-2">
          {filteredTemplates.map(template => (
            <Card key={template.id} className="p-4 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-sm text-zinc-900 dark:text-white">{template.name}</h3>
                    {template.starred && <Star className="w-4 h-4 fill-emerald-500 text-emerald-500 flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-2">{template.description}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="text-xs">{template.category}</Badge>
                    {template.platforms.map(p => (
                      <span key={p} className="text-xs text-zinc-500 dark:text-zinc-400">{p}</span>
                    ))}
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">• Used {template.usedCount}x</span>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button variant="outline" size="sm" className="text-xs h-8">
                    <Copy className="w-3 h-3 mr-1" />
                    Use
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600 dark:text-red-400">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
