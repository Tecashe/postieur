'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, MoreVertical, CheckCircle2, AlertCircle, TrendingUp, Users, Activity } from 'lucide-react'
import { MOCK_CHANNELS } from '@/lib/mock-data'
import { PLATFORMS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function ChannelsPage() {
  const connectedChannels = MOCK_CHANNELS.filter(c => c.isConnected)
  const activeChannels = connectedChannels.filter(c => c.live)
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light text-zinc-900 dark:text-white">Channels</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Manage connected social media accounts</p>
        </div>
        <Button size="sm" className="text-xs sm:text-sm w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Connect Channel
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-medium">Connected</p>
              <p className="text-2xl sm:text-3xl font-light text-zinc-900 dark:text-white mt-2">{connectedChannels.length}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">of {MOCK_CHANNELS.length} total</p>
            </div>
            <CheckCircle2 className="w-10 h-10 text-emerald-500 flex-shrink-0" />
          </div>
        </Card>
        <Card className="p-4 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-medium">Active Now</p>
              <p className="text-2xl sm:text-3xl font-light text-zinc-900 dark:text-white mt-2">{activeChannels.length}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Posting available</p>
            </div>
            <Activity className="w-10 h-10 text-emerald-500 flex-shrink-0" />
          </div>
        </Card>
        <Card className="p-4 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-medium">Total Followers</p>
              <p className="text-2xl sm:text-3xl font-light text-zinc-900 dark:text-white mt-2">
                {(connectedChannels.reduce((sum, c) => sum + c.followers, 0) / 1000).toFixed(0)}K
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Combined reach</p>
            </div>
            <Users className="w-10 h-10 text-emerald-500 flex-shrink-0" />
          </div>
        </Card>
      </div>

      {/* Channels List */}
      <div className="space-y-3">
        {MOCK_CHANNELS.map((channel) => {
          const platform = PLATFORMS[channel.platform]
          const Icon = platform.icon
          
          return (
            <Card 
              key={channel.id}
              className={cn(
                'p-4 sm:p-6 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors',
                !channel.isConnected && 'opacity-75'
              )}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Platform Icon */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-zinc-600 dark:text-zinc-400" />
                  </div>
                  
                  {/* Channel Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm sm:text-base font-medium text-zinc-900 dark:text-white">{channel.handle}</h3>
                      {channel.live && (
                        <Badge className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-200 text-xs flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Live
                        </Badge>
                      )}
                      {!channel.isConnected && (
                        <Badge variant="outline" className="border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-200 text-xs">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Disconnected
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">{platform.label}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:flex sm:gap-6 gap-3 flex-shrink-0">
                  <div className="text-xs sm:text-sm">
                    <p className="text-zinc-600 dark:text-zinc-400 font-medium">Followers</p>
                    <p className="text-lg sm:text-xl font-light text-zinc-900 dark:text-white mt-1">
                      {(channel.followers / 1000).toFixed(0)}K
                    </p>
                  </div>
                  <div className="text-xs sm:text-sm">
                    <p className="text-zinc-600 dark:text-zinc-400 font-medium">Posts</p>
                    <p className="text-lg sm:text-xl font-light text-zinc-900 dark:text-white mt-1">
                      {Math.floor(Math.random() * 100) + 50}
                    </p>
                  </div>
                  <div className="text-xs sm:text-sm">
                    <p className="text-zinc-600 dark:text-zinc-400 font-medium">Engagement</p>
                    <p className="text-lg sm:text-xl font-light text-zinc-900 dark:text-white mt-1 flex items-center gap-1">
                      {(Math.random() * 10 + 2).toFixed(1)}%
                      <TrendingUp className="w-3 h-3 text-emerald-500" />
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-shrink-0 w-full sm:w-auto">
                  {channel.isConnected ? (
                    <>
                      <Button variant="outline" size="sm" className="flex-1 sm:flex-none text-xs sm:text-sm">
                        Settings
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Analytics</DropdownMenuItem>
                          <DropdownMenuItem>Edit Settings</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">Disconnect</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </>
                  ) : (
                    <Button size="sm" className="flex-1 sm:flex-none text-xs sm:text-sm">
                      Reconnect
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Disconnected Channels */}
      {MOCK_CHANNELS.filter(c => !c.isConnected).length > 0 && (
        <Card className="p-4 sm:p-6 border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-100">Disconnected Channels</h3>
              <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-200 mt-1">
                {MOCK_CHANNELS.filter(c => !c.isConnected).length} channel{MOCK_CHANNELS.filter(c => !c.isConnected).length !== 1 ? 's' : ''} need to be reconnected to continue posting.
              </p>
              <Button size="sm" variant="outline" className="mt-3 text-amber-900 dark:text-amber-100 border-amber-300 dark:border-amber-700 text-xs">
                Reconnect All
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
