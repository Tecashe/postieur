'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, Clock, Zap, Plus, X, Image as ImageIcon, Link as LinkIcon, Smile, Hash } from 'lucide-react'
import { PLATFORMS } from '@/lib/constants'
import { MOCK_CHANNELS } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

export default function ComposePage() {
  const [content, setContent] = useState('')
  const [selectedChannels, setSelectedChannels] = useState<string[]>([])
  const [scheduleMode, setScheduleMode] = useState<'now' | 'schedule' | 'queue'>('schedule')
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('09:00')
  const [mediaFiles, setMediaFiles] = useState<string[]>([])

  const handleChannelToggle = (channelId: string) => {
    setSelectedChannels(prev =>
      prev.includes(channelId)
        ? prev.filter(id => id !== channelId)
        : [...prev, channelId]
    )
  }

  const charCounts: Record<string, number> = {
    instagram: 2200,
    twitter: 280,
    linkedin: 3000,
    tiktok: 2200,
  }

  const currentLimit = selectedChannels.length > 0 
    ? Math.min(...selectedChannels.map(ch => charCounts[ch] || 280))
    : 280

  const charCount = content.length
  const charWarning = charCount > currentLimit * 0.9
  const charError = charCount > currentLimit

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-light text-zinc-900 dark:text-white">Create Post</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Write and schedule content across platforms</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor - Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Content Editor */}
          <Card className="p-6 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <label className="text-sm font-semibold text-zinc-900 dark:text-white block mb-3">
              Post Content
            </label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts, updates, or announcements... Use #hashtags and @mentions"
              className="min-h-48 border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 resize-none"
            />
            
            {/* Character Counter */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className={cn(
                  'w-2 h-2 rounded-full',
                  charError ? 'bg-red-500' : charWarning ? 'bg-amber-500' : 'bg-emerald-500'
                )} />
                <p className={cn(
                  'text-sm',
                  charError 
                    ? 'text-red-600 dark:text-red-400' 
                    : charWarning 
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-zinc-600 dark:text-zinc-400'
                )}>
                  {charCount} / {currentLimit} characters
                  {charError && ` (${charCount - currentLimit} over)`}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Add emoji">
                  <Smile className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Add hashtag">
                  <Hash className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Add link">
                  <LinkIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Media Preview */}
            {mediaFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Attached Media ({mediaFiles.length})</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {mediaFiles.map((file, idx) => (
                    <div key={idx} className="relative rounded-lg border border-zinc-200 dark:border-zinc-800 p-3 bg-zinc-50 dark:bg-zinc-800 flex flex-col items-center justify-center gap-2 group">
                      <ImageIcon className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 text-center truncate">{`media-${idx + 1}`}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => setMediaFiles(mediaFiles.filter((_, i) => i !== idx))}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Platform Selection */}
          <Card className="p-6 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <label className="text-sm font-semibold text-zinc-900 dark:text-white block mb-4">
              Post to Channels
            </label>
            <div className="space-y-3">
              {MOCK_CHANNELS.slice(0, 8).map((channel) => {
                const platform = PLATFORMS[channel.platform]
                const Icon = platform.icon
                return (
                  <label
                    key={channel.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    <Checkbox
                      checked={selectedChannels.includes(channel.id)}
                      onCheckedChange={() => handleChannelToggle(channel.id)}
                      className="h-5 w-5"
                    />
                    <Icon className="w-4 h-4 flex-shrink-0 text-zinc-600 dark:text-zinc-400" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">{channel.handle}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">{channel.followers.toLocaleString()} followers</p>
                    </div>
                    {channel.live && (
                      <Badge className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-200 text-xs">
                        Live
                      </Badge>
                    )}
                  </label>
                )
              })}
            </div>
          </Card>

          {/* AI Assistant Card */}
          <Card className="p-6 border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-emerald-50 dark:from-emerald-950 to-zinc-50 dark:to-zinc-900">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-1">AI Writing Assistant</h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-3">Get suggestions to improve engagement</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="text-xs border-emerald-300 dark:border-emerald-700">
                    Improve tone
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs border-emerald-300 dark:border-emerald-700">
                    Add hashtags
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs border-emerald-300 dark:border-emerald-700">
                    Make shorter
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar - Right Column */}
        <div className="space-y-6">
          {/* Scheduling */}
          <Card className="p-6 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <label className="text-sm font-semibold text-zinc-900 dark:text-white block mb-4">
              Schedule
            </label>
            
            <Tabs 
              value={scheduleMode} 
              onValueChange={(value) => setScheduleMode(value as 'now' | 'schedule' | 'queue')}
              className="w-full mb-4"
            >
              <TabsList className="w-full grid grid-cols-3 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800">
                <TabsTrigger value="now" className="text-xs">Post Now</TabsTrigger>
                <TabsTrigger value="schedule" className="text-xs">Schedule</TabsTrigger>
                <TabsTrigger value="queue" className="text-xs">Queue</TabsTrigger>
              </TabsList>

              <TabsContent value="now" className="mt-4 space-y-3">
                <p className="text-xs text-zinc-600 dark:text-zinc-400">Post will be published immediately</p>
                <Button className="w-full" disabled={!content || selectedChannels.length === 0}>
                  Publish Now
                </Button>
              </TabsContent>

              <TabsContent value="schedule" className="mt-4 space-y-3">
                <div>
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-2">Date</label>
                  <Input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-2">Time</label>
                  <Input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                  />
                </div>
                <Button className="w-full" disabled={!content || !scheduleDate || selectedChannels.length === 0}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule
                </Button>
              </TabsContent>

              <TabsContent value="queue" className="mt-4 space-y-3">
                <p className="text-xs text-zinc-600 dark:text-zinc-400">Add to queue and post based on optimal engagement times</p>
                <Button className="w-full" disabled={!content || selectedChannels.length === 0}>
                  <Zap className="w-4 h-4 mr-2" />
                  Queue Post
                </Button>
              </TabsContent>
            </Tabs>
          </Card>

          {/* Preview */}
          <Card className="p-6 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">Preview</h3>
            <div className="space-y-3">
              {selectedChannels.length === 0 ? (
                <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center py-4">Select channels to see preview</p>
              ) : (
                selectedChannels.slice(0, 2).map((channelId) => {
                  const channel = MOCK_CHANNELS.find(c => c.id === channelId)
                  const platform = channel ? PLATFORMS[channel.platform] : null
                  if (!channel || !platform) return null

                  return (
                    <div key={channelId} className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-3 bg-zinc-50 dark:bg-zinc-800">
                      <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2">{platform.label}</p>
                      <p className="text-sm text-zinc-900 dark:text-white line-clamp-4">
                        {content || 'Your content will appear here...'}
                      </p>
                    </div>
                  )
                })
              )}
              {selectedChannels.length > 2 && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center">+{selectedChannels.length - 2} more channels</p>
              )}
            </div>
          </Card>

          {/* Analytics */}
          <Card className="p-6 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">Expected Performance</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">Potential reach</p>
                <p className="text-xl font-light text-zinc-900 dark:text-white">
                  {selectedChannels.length > 0 
                    ? (selectedChannels.reduce((sum, id) => {
                        const channel = MOCK_CHANNELS.find(c => c.id === id)
                        return sum + (channel?.followers || 0)
                      }, 0) * 0.15).toLocaleString('en-US', {maximumFractionDigits: 0})
                    : '0'
                  }
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">Best time to post</p>
                <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">9:00 AM EST</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
