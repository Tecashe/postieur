import type { Metadata } from 'next'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, MoreVertical, CheckCircle2, AlertCircle } from 'lucide-react'
import { MOCK_CHANNELS } from '@/lib/mock-data'
import { PLATFORMS } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Channels',
  description: 'Manage connected social channels',
}

export default function ChannelsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-light text-zinc-900 dark:text-white">Connected Channels</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            {MOCK_CHANNELS.filter(c => c.isConnected).length} of {MOCK_CHANNELS.length} connected
          </p>
        </div>
        <Button className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900">
          <Plus className="w-4 h-4 mr-2" />
          Connect Channel
        </Button>
      </div>

      {/* Channels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_CHANNELS.map(channel => {
          const Icon = PLATFORMS[channel.platform].icon
          return (
            <Card
              key={channel.id}
              className="p-6 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800">
                    <Icon className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-zinc-900 dark:text-white">{channel.name}</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{channel.handle}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>

              {/* Status */}
              <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800">
                {channel.isConnected ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Connected</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Disconnected</span>
                  </>
                )}
              </div>

              {/* Stats */}
              <div className="space-y-2 mb-4 flex-1">
                <div className="flex justify-between items-center">
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">Followers</p>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                    {(channel.followers / 1000).toFixed(0)}K
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">Last Sync</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {channel.lastSyncedAt.toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Action */}
              {channel.isConnected ? (
                <Button variant="outline" size="sm" className="w-full border-zinc-200 dark:border-zinc-700">
                  Manage
                </Button>
              ) : (
                <Button size="sm" className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900">
                  Connect
                </Button>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
