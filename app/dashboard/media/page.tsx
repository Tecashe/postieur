'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Upload, Search, Filter, Download, Trash2, Image as ImageIcon, Video, MoreVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function MediaPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video'>('all')

  const mediaItems = Array.from({ length: 24 }).map((_, i) => ({
    id: `media-${i}`,
    name: `${i % 2 === 0 ? 'Campaign' : 'Product'} ${Math.floor(i / 2) + 1}`,
    type: i % 3 === 0 ? 'video' : 'image',
    size: Math.floor(Math.random() * 5000) + 500,
    date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    uses: Math.floor(Math.random() * 15) + 1,
  }))

  const filteredItems = filterType === 'all' ? mediaItems : mediaItems.filter(item => item.type === filterType)

  const handleSelectItem = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    )
  }

  const totalSize = mediaItems.reduce((sum, item) => sum + item.size, 0)
  const usedStorage = Math.floor((totalSize / 5000) * 100)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light text-zinc-900 dark:text-white">Media Library</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Upload and manage your images and videos</p>
        </div>
        <Button size="sm" className="text-xs sm:text-sm w-full sm:w-auto">
          <Upload className="w-4 h-4 mr-2" />
          Upload Files
        </Button>
      </div>

      {/* Storage */}
      <Card className="p-4 sm:p-6 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Storage Used</p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{usedStorage}% of 5 GB</p>
        </div>
        <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2">
          <div 
            className="bg-emerald-500 h-2 rounded-full transition-all"
            style={{ width: `${usedStorage}%` }}
          />
        </div>
      </Card>

      {/* Controls */}
      <Card className="p-4 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex-1 w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <Input
                placeholder="Search media..."
                className="pl-10 border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm"
              />
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant={filterType === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('all')}
              className="flex-1 sm:flex-none text-xs"
            >
              All
            </Button>
            <Button
              variant={filterType === 'image' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('image')}
              className="flex-1 sm:flex-none text-xs"
            >
              <ImageIcon className="w-3 h-3 mr-1" />
              Images
            </Button>
            <Button
              variant={filterType === 'video' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('video')}
              className="flex-1 sm:flex-none text-xs"
            >
              <Video className="w-3 h-3 mr-1" />
              Videos
            </Button>
          </div>
        </div>
      </Card>

      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{filteredItems.length} items</p>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="h-8 w-8 p-0"
          >
            ⊞
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="h-8 w-8 p-0"
          >
            ≡
          </Button>
        </div>
      </div>

      {/* Media Grid */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={cn(
                'rounded-lg border-2 overflow-hidden transition-all cursor-pointer group',
                selectedItems.includes(item.id)
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950'
                  : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
              )}
            >
              <div
                className="aspect-square bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 flex items-center justify-center group-hover:opacity-80 transition-opacity relative"
              >
                {item.type === 'video' ? (
                  <Video className="w-8 h-8 text-zinc-500 dark:text-zinc-400" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-zinc-500 dark:text-zinc-400" />
                )}
                <Checkbox
                  checked={selectedItems.includes(item.id)}
                  onCheckedChange={() => handleSelectItem(item.id)}
                  className="absolute top-2 right-2"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <p className="text-xs font-medium text-zinc-900 dark:text-white truncate">{item.name}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">{(item.size / 1000).toFixed(1)} MB</span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">{item.uses} uses</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              className={cn(
                'p-4 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors',
                selectedItems.includes(item.id) && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950'
              )}
            >
              <div className="flex items-center gap-4">
                <Checkbox
                  checked={selectedItems.includes(item.id)}
                  onCheckedChange={() => handleSelectItem(item.id)}
                />
                <div className="w-16 h-16 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
                  {item.type === 'video' ? (
                    <Video className="w-6 h-6 text-zinc-500 dark:text-zinc-400" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-zinc-500 dark:text-zinc-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-zinc-900 dark:text-white">{item.name}</p>
                  <div className="flex items-center gap-4 mt-1 flex-wrap">
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">{(item.size / 1000).toFixed(1)} MB</span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">{item.date.toLocaleDateString()}</span>
                    <Badge className="text-xs">{item.uses} uses</Badge>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Download</DropdownMenuItem>
                    <DropdownMenuItem>Duplicate</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <Card className="p-4 border-zinc-200 dark:border-zinc-800 bg-emerald-50 dark:bg-emerald-950 sticky bottom-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
              {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedItems([])}>
                Clear
              </Button>
              <Button variant="outline" size="sm" className="text-red-600 dark:text-red-400 border-red-300 dark:border-red-700">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
              <Button size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
