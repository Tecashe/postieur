import type { Metadata } from 'next'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GripVertical, Trash2, Eye, Plus } from 'lucide-react'
import { MOCK_POSTS, MOCK_CHANNELS } from '@/lib/mock-data'
import { PLATFORMS } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Queue',
  description: 'Manage your publishing queue',
}

export default function QueuePage() {
  const queuedPosts = MOCK_POSTS.filter(p => p.status === 'scheduled').slice(0, 8)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-light text-zinc-900 dark:text-white">{queuedPosts.length} Posts in Queue</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Drag to reorder. Posts are published chronologically.</p>
        </div>
        <Button className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900">
          <Plus className="w-4 h-4 mr-2" />
          New Post
        </Button>
      </div>

      {/* Queue List */}
      <div className="space-y-3">
        {queuedPosts.map((post, idx) => {
          const channels = post.platforms
            .map(p => MOCK_CHANNELS.find(c => c.platform === p))
            .filter(Boolean)

          return (
            <Card key={post.id} className="p-4 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
              <div className="flex items-start gap-3">
                {/* Drag Handle */}
                <div className="pt-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-grab active:cursor-grabbing">
                  <GripVertical className="w-5 h-5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white line-clamp-2">{post.content}</p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {channels.map(channel => {
                          if (!channel) return null
                          const Icon = PLATFORMS[channel.platform].icon
                          return (
                            <div key={channel.id} className="flex items-center gap-1 px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800">
                              <Icon className="w-3 h-3 text-zinc-600 dark:text-zinc-400" />
                              <span className="text-xs text-zinc-600 dark:text-zinc-400">{channel.name}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-medium text-zinc-900 dark:text-white">
                        {new Date(post.scheduledAt).toLocaleDateString()} {new Date(post.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">#{idx + 1} in queue</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-1 flex-shrink-0">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Empty State Info */}
      {queuedPosts.length === 0 && (
        <Card className="p-12 border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 text-center">
          <p className="text-zinc-600 dark:text-zinc-400">No posts in queue. Start by composing a new post.</p>
        </Card>
      )}

      {/* Stats */}
      <Card className="p-6 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 grid grid-cols-3 gap-6">
        <div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Total Scheduled</p>
          <p className="text-2xl font-light text-zinc-900 dark:text-white mt-2">{queuedPosts.length}</p>
        </div>
        <div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">This Week</p>
          <p className="text-2xl font-light text-zinc-900 dark:text-white mt-2">{Math.ceil(queuedPosts.length / 2)}</p>
        </div>
        <div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Avg. Daily</p>
          <p className="text-2xl font-light text-zinc-900 dark:text-white mt-2">
            {(queuedPosts.length / 7).toFixed(1)}
          </p>
        </div>
      </Card>
    </div>
  )
}
