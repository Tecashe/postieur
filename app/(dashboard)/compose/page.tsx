'use client'

import type { Metadata } from 'next'
import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, Clock, Zap, Plus, X, Image as ImageIcon } from 'lucide-react'
import { PLATFORMS } from '@/lib/constants'
import { MOCK_CHANNELS } from '@/lib/mock-data'

export default function ComposePage() {
  const [content, setContent] = useState('')
  const [selectedChannels, setSelectedChannels] = useState<string[]>([])
  const [scheduleMode, setScheduleMode] = useState<'now' | 'schedule' | 'queue'>('schedule')
  const [mediaPreview, setMediaPreview] = useState<string | null>(null)

  const handleChannelToggle = (channelId: string) => {
    setSelectedChannels(prev =>
      prev.includes(channelId)
        ? prev.filter(id => id !== channelId)
        : [...prev, channelId]
    )
  }

  const charCount = content.length
  const charLimit = 280 // typical social media limit

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Editor - Left Column */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="p-6 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <label className="text-sm font-medium text-zinc-900 dark:text-white block mb-3">
            Write your post
          </label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts, updates, or announcements..."
            className="min-h-40 border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 resize-none"
          />
          <div className="flex items-center justify-between mt-3">
            <p className={`text-sm ${charCount > charLimit ? 'text-red-600 dark:text-red-400' : 'text-zinc-500 dark:text-zinc-400'}`}>
              {charCount} / {charLimit}
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="text-zinc-600 dark:text-zinc-400">
                <ImageIcon className="w-4 h-4 mr-1" />
                Add Media
              </Button>
              <Button variant="ghost" size="sm" className="text-zinc-600 dark:text-zinc-400">
                <Zap className="w-4 h-4 mr-1" />
                AI Assist
              </Button>
            </div>
          </div>
        </Card>

        {/* Channel Selection */}
        <Card className="p-6 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <label className="text-sm font-medium text-zinc-900 dark:text-white block mb-4">
            Select Channels
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {MOCK_CHANNELS.filter(c => c.isConnected).map(channel => {
              const Icon = PLATFORMS[channel.platform].icon
              const isSelected = selectedChannels.includes(channel.id)

              return (
                <div
                  key={channel.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-zinc-900 dark:border-white bg-zinc-50 dark:bg-zinc-800'
                      : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                  }`}
                  onClick={() => handleChannelToggle(channel.id)}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => handleChannelToggle(channel.id)}
                    className="cursor-pointer"
                  />
                  <Icon className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">{channel.name}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{channel.handle}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Formatting Toolbar */}
        <Card className="p-4 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="border-zinc-200 dark:border-zinc-700">Bold</Button>
            <Button variant="outline" size="sm" className="border-zinc-200 dark:border-zinc-700">Italic</Button>
            <Button variant="outline" size="sm" className="border-zinc-200 dark:border-zinc-700">#Hashtag</Button>
            <Button variant="outline" size="sm" className="border-zinc-200 dark:border-zinc-700">@Mention</Button>
            <Button variant="outline" size="sm" className="border-zinc-200 dark:border-zinc-700">Link</Button>
            <Button variant="outline" size="sm" className="border-zinc-200 dark:border-zinc-700">Emoji</Button>
          </div>
        </Card>
      </div>

      {/* Schedule Panel - Right Column */}
      <div className="lg:col-span-1">
        <Card className="p-6 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-24">
          <h3 className="text-base font-light text-zinc-900 dark:text-white mb-4">Schedule</h3>

          {/* Tabs */}
          <Tabs value={scheduleMode} onValueChange={(v) => setScheduleMode(v as any)} className="mb-6">
            <TabsList className="grid w-full grid-cols-3 bg-zinc-100 dark:bg-zinc-800">
              <TabsTrigger value="now" className="text-xs">Now</TabsTrigger>
              <TabsTrigger value="schedule" className="text-xs">Schedule</TabsTrigger>
              <TabsTrigger value="queue" className="text-xs">Queue</TabsTrigger>
            </TabsList>

            <TabsContent value="now" className="space-y-4 mt-4">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Publish immediately to all selected channels</p>
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" disabled={selectedChannels.length === 0}>
                <Zap className="w-4 h-4 mr-2" />
                Publish Now
              </Button>
            </TabsContent>

            <TabsContent value="schedule" className="space-y-4 mt-4">
              <div>
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-2">Date</label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 border-zinc-200 dark:border-zinc-700">
                    <Calendar className="w-3 h-3 mr-1" />
                    May 20
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 border-zinc-200 dark:border-zinc-700">
                    <Clock className="w-3 h-3 mr-1" />
                    9:00 AM
                  </Button>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-2">Timezone</label>
                <select className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm">
                  <option>EST (UTC-5)</option>
                  <option>CST (UTC-6)</option>
                  <option>MST (UTC-7)</option>
                  <option>PST (UTC-8)</option>
                </select>
              </div>
              <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  <span className="font-medium">Best time:</span> Tuesday 2:30 PM
                </p>
              </div>
              <Button className="w-full" disabled={selectedChannels.length === 0}>
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Post
              </Button>
            </TabsContent>

            <TabsContent value="queue" className="space-y-4 mt-4">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Add to publishing queue</p>
              <Button className="w-full" variant="outline" className="border-zinc-200 dark:border-zinc-700" disabled={selectedChannels.length === 0}>
                <Plus className="w-4 h-4 mr-2" />
                Add to Queue
              </Button>
            </TabsContent>
          </Tabs>

          {/* Preview */}
          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4">
            <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-3">Preview</p>
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 bg-zinc-50 dark:bg-zinc-800 min-h-24">
              <p className="text-sm text-zinc-900 dark:text-white">{content || 'Your post preview will appear here'}</p>
              {selectedChannels.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {selectedChannels.map(channelId => {
                    const channel = MOCK_CHANNELS.find(c => c.id === channelId)
                    return channel ? (
                      <Badge key={channelId} variant="secondary" className="text-xs">
                        {channel.name}
                      </Badge>
                    ) : null
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Options */}
          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4 mt-4 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <Checkbox />
              <span className="text-zinc-600 dark:text-zinc-400">Require approval</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <Checkbox />
              <span className="text-zinc-600 dark:text-zinc-400">Add to analytics</span>
            </label>
          </div>
        </Card>
      </div>
    </div>
  )
}
