import type { Metadata } from 'next'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Upload, Search, Filter, Download, Trash2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Media Library',
  description: 'Manage your media files',
}

export default function MediaPage() {
  const mediaItems = Array.from({ length: 12 }).map((_, i) => ({
    id: `media-${i}`,
    name: `Image ${i + 1}`,
    type: i % 2 === 0 ? 'image' : 'video',
    size: Math.floor(Math.random() * 5000) + 500,
    date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-light text-zinc-900 dark:text-white">{mediaItems.length} Assets</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Manage and organize your media files</p>
        </div>
        <Button className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900">
          <Upload className="w-4 h-4 mr-2" />
          Upload
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <Input
              placeholder="Search media..."
              className="pl-9 w-full border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm"
            />
          </div>
          <div className="flex gap-3">
            <ToggleGroup type="single" defaultValue="all" className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-1">
              <ToggleGroupItem value="all">All</ToggleGroupItem>
              <ToggleGroupItem value="images">Images</ToggleGroupItem>
              <ToggleGroupItem value="videos">Videos</ToggleGroupItem>
            </ToggleGroup>
            <Button variant="outline" size="sm" className="border-zinc-200 dark:border-zinc-700">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Media Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {mediaItems.map((item) => (
          <div
            key={item.id}
            className="group relative aspect-square rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 overflow-hidden hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors cursor-pointer"
          >
            {/* Placeholder image */}
            <div className="w-full h-full bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-800 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl mb-2">
                  {item.type === 'image' ? '🖼️' : '🎬'}
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">{item.type}</p>
              </div>
            </div>

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-white hover:bg-white/20"
              >
                <Download className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-white hover:bg-white/20"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Checkbox */}
            <div className="absolute top-2 left-2">
              <Checkbox className="border-white" />
            </div>
          </div>
        ))}
      </div>

      {/* Upload Zone */}
      <Card className="p-12 border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 text-center hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors cursor-pointer">
        <Upload className="w-8 h-8 mx-auto text-zinc-400 mb-2" />
        <p className="font-medium text-zinc-900 dark:text-white">Drag and drop files here</p>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">or click to browse</p>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-3">Maximum 50MB per file</p>
      </Card>
    </div>
  )
}
