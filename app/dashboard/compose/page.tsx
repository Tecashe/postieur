'use client'

import { useState, useRef, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Clock, Zap, X, Image as ImageIcon, Smile, Hash, Link2, Sparkles,
  Plus, Send, Calendar, RefreshCw, AlignLeft, Layers, CheckCircle2,
  TrendingUp, BarChart3, ChevronDown, GripVertical, Minus, Globe,
} from 'lucide-react'
import { PLATFORMS, PLATFORM_CHAR_LIMITS } from '@/lib/constants'
import { MOCK_CHANNELS, MOCK_SIGNATURES } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import type { Platform } from '@/lib/types'

// ─── Sub-components ─────────────────────────────────────────────────────────

function CharArc({ value, max, size = 36 }: { value: number; max: number; size?: number }) {
  const pct = Math.min(value / max, 1)
  const r = (size - 4) / 2
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - pct)
  const color = pct > 1 ? '#ef4444' : pct > 0.9 ? '#f59e0b' : 'oklch(0.520 0.095 178)'
  const remaining = max - value

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor"
          strokeWidth="2.5" className="text-muted/40" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color}
          strokeWidth="2.5" strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.3s ease, stroke 0.3s ease' }} />
      </svg>
      <span className="absolute text-[9px] font-mono font-medium" style={{ color }}>
        {pct > 0.9 ? (remaining < 0 ? `+${Math.abs(remaining)}` : remaining) : ''}
      </span>
    </div>
  )
}

const TONES = ['Professional', 'Casual', 'Witty', 'Inspirational', 'Educational', 'Bold']
const HASHTAG_SUGGESTIONS = [
  { tag: '#innovation', score: 94 }, { tag: '#socialmedia', score: 91 }, { tag: '#marketing', score: 88 },
  { tag: '#growth', score: 85 }, { tag: '#content', score: 82 }, { tag: '#digital', score: 79 },
  { tag: '#business', score: 76 }, { tag: '#brand', score: 73 }, { tag: '#strategy', score: 70 },
]

const AI_VARIANTS = [
  "Thrilled to share something we've been building for months — the kind of update that genuinely changes how teams work. Here's what's new 🧵",
  "Big news dropping today. After countless iterations and user feedback sessions, we're finally ready to share what we've been building. This one matters.",
  "We asked ourselves: what if scheduling content was actually enjoyable? Today's announcement is our answer. Swipe to see what changed 👇",
]

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function ComposePage() {
  const [content, setContent] = useState('')
  const [selectedChannels, setSelectedChannels] = useState<string[]>(['inst-1', 'linked-1'])
  const [scheduleMode, setScheduleMode] = useState<'now' | 'schedule' | 'queue'>('schedule')
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('09:00')
  const [postType, setPostType] = useState<'post' | 'thread' | 'carousel'>('post')
  const [selectedTone, setSelectedTone] = useState('Professional')
  const [enableSignature, setEnableSignature] = useState(true)
  const [crossPostDelay, setCrossPostDelay] = useState('0')
  const [showAI, setShowAI] = useState(true)
  const [aiGenerating, setAiGenerating] = useState(false)
  const [showVariants, setShowVariants] = useState(false)
  const [mediaFiles, setMediaFiles] = useState<string[]>([])
  const [threadPosts, setThreadPosts] = useState<string[]>([''])
  const [activeThreadIdx, setActiveThreadIdx] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)

  const connectedChannels = MOCK_CHANNELS.filter(c => c.isConnected)

  const handleChannelToggle = (channelId: string) => {
    setSelectedChannels(prev =>
      prev.includes(channelId) ? prev.filter(id => id !== channelId) : [...prev, channelId]
    )
  }

  const selectedPlatforms = connectedChannels
    .filter(c => selectedChannels.includes(c.id))
    .map(c => c.platform)

  const strictestLimit = selectedPlatforms.length > 0
    ? Math.min(...selectedPlatforms.map(p => PLATFORM_CHAR_LIMITS[p] ?? 5000))
    : 5000

  const currentContent = postType === 'thread' ? threadPosts[activeThreadIdx] : content
  const charCount = currentContent.length
  const charPct = charCount / strictestLimit
  const isOverLimit = charPct > 1

  // Simulated content score
  const contentScore = content.length > 20
    ? Math.min(95, 42 + Math.floor(content.length / 8) + (selectedPlatforms.length * 5) + (enableSignature ? 8 : 0))
    : 0

  const handleSimulateAI = () => {
    setAiGenerating(true)
    setTimeout(() => { setAiGenerating(false); setShowVariants(true) }, 1400)
  }

  const handleMediaAdd = () => {
    setMediaFiles(prev => [...prev, `media-${prev.length + 1}.jpg`])
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-light text-foreground">Compose</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Create and schedule content across all your platforms</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="text-xs gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Load Draft
          </Button>
          <Button size="sm" className="text-xs gap-1.5" disabled={selectedChannels.length === 0 || (!content && postType !== 'thread')}>
            <Send className="w-3.5 h-3.5" />
            {scheduleMode === 'now' ? 'Publish Now' : scheduleMode === 'queue' ? 'Add to Queue' : 'Schedule'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
        {/* ─── Left Column ──────────────────────────────────────────────── */}
        <div className="space-y-4">

          {/* Post Type Toggle */}
          <div className="flex items-center gap-2">
            {(['post', 'thread', 'carousel'] as const).map(t => (
              <button
                key={t}
                onClick={() => setPostType(t)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-medium transition-all border',
                  postType === t
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card text-muted-foreground border-border hover:text-foreground hover:border-border'
                )}
              >
                {t === 'post' && <AlignLeft className="w-3.5 h-3.5" />}
                {t === 'thread' && <Layers className="w-3.5 h-3.5" />}
                {t === 'carousel' && <Layers className="w-3.5 h-3.5" />}
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
            <div className="flex-1" />
            <button
              onClick={() => setShowAI(!showAI)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-medium transition-all border',
                showAI ? 'bg-accent/15 text-accent border-accent/30' : 'text-muted-foreground border-border hover:text-foreground'
              )}
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI Copilot
            </button>
          </div>

          {/* Platform Tabs */}
          {selectedPlatforms.length > 0 && (
            <Card className="bg-card border-border p-0 overflow-hidden shadow-sm">
              <div className="flex items-center gap-0 border-b border-border overflow-x-auto">
                {connectedChannels.filter(c => selectedChannels.includes(c.id)).map((ch, i) => {
                  const plat = PLATFORMS[ch.platform]
                  const Icon = plat.icon
                  const limit = PLATFORM_CHAR_LIMITS[ch.platform] ?? 5000
                  const cnt = (postType === 'thread' ? threadPosts[activeThreadIdx] : content).length
                  return (
                    <div key={ch.id} className={cn(
                      'flex items-center gap-2 px-3 py-2.5 text-xs border-r border-border flex-shrink-0 transition-colors',
                      i === 0 ? 'bg-muted/30' : 'hover:bg-muted/20 cursor-pointer'
                    )}>
                      <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-foreground font-medium hidden sm:block">{plat.name}</span>
                      <CharArc value={cnt} max={limit} size={28} />
                    </div>
                  )
                })}
                <div className="flex-1" />
                <div className="px-3 text-[10px] text-muted-foreground flex-shrink-0">
                  Strictest limit: {strictestLimit.toLocaleString()} chars
                </div>
              </div>

              {/* Editor */}
              {postType === 'thread' ? (
                <div className="flex">
                  <div className="w-8 border-r border-border flex flex-col items-center py-3 gap-1">
                    {threadPosts.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveThreadIdx(i)}
                        className={cn(
                          'w-5 h-5 rounded-sm text-[10px] font-mono transition-colors',
                          activeThreadIdx === i ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
                        )}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setThreadPosts(prev => [...prev, ''])}
                      className="w-5 h-5 rounded-sm text-muted-foreground hover:text-accent hover:bg-accent/10 transition-colors flex items-center justify-center"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <Textarea
                    value={threadPosts[activeThreadIdx]}
                    onChange={e => {
                      const next = [...threadPosts]
                      next[activeThreadIdx] = e.target.value
                      setThreadPosts(next)
                    }}
                    placeholder={`Post ${activeThreadIdx + 1} of ${threadPosts.length}...`}
                    className="flex-1 min-h-40 border-0 rounded-none resize-none focus-visible:ring-0 bg-transparent text-foreground placeholder:text-muted-foreground/50 text-sm font-light"
                  />
                </div>
              ) : (
                <Textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="What do you want to share? Type your content here — hashtags, mentions, and links are supported..."
                  className="min-h-44 border-0 rounded-none resize-none focus-visible:ring-0 bg-transparent text-foreground placeholder:text-muted-foreground/50 text-sm font-light"
                />
              )}

              {/* Toolbar */}
              <div className="flex items-center gap-1 px-3 py-2 border-t border-border bg-muted/20">
                <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleMediaAdd} />
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground" onClick={() => fileRef.current?.click()}>
                  <ImageIcon className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground">
                  <Smile className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground">
                  <Hash className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground">
                  <Link2 className="w-3.5 h-3.5" />
                </Button>
                <Separator orientation="vertical" className="h-4 mx-1" />
                <Button variant="ghost" size="sm" className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground">
                  <Globe className="w-3 h-3 mr-1" /> Add location
                </Button>
                <div className="flex-1" />
                <span className={cn('text-[11px] font-mono', isOverLimit ? 'text-destructive' : charPct > 0.9 ? 'text-amber-500' : 'text-muted-foreground')}>
                  {charCount}/{strictestLimit}
                </span>
              </div>

              {/* Media Preview */}
              {mediaFiles.length > 0 && (
                <div className="px-3 pb-3 flex gap-2 flex-wrap border-t border-border pt-3">
                  {mediaFiles.map((f, i) => (
                    <div key={i} className="relative group w-16 h-16 rounded-sm border border-border bg-muted flex items-center justify-center overflow-hidden">
                      <ImageIcon className="w-5 h-5 text-muted-foreground" />
                      <button
                        onClick={() => setMediaFiles(prev => prev.filter((_, idx) => idx !== i))}
                        className="absolute inset-0 bg-background/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4 text-foreground" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={handleMediaAdd}
                    className="w-16 h-16 rounded-sm border border-dashed border-border hover:border-accent hover:bg-accent/5 flex items-center justify-center text-muted-foreground hover:text-accent transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              )}
            </Card>
          )}

          {selectedPlatforms.length === 0 && (
            <Card className="bg-card border-border border-dashed p-8 text-center shadow-sm">
              <p className="text-muted-foreground text-sm">Select channels on the right to start composing</p>
            </Card>
          )}

          {/* AI Copilot Panel */}
          {showAI && (
            <Card className="bg-card border-border shadow-sm overflow-hidden">
              <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border bg-accent/5">
                <Sparkles className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium text-foreground">AI Copilot</span>
                {contentScore > 0 && (
                  <div className="ml-auto flex items-center gap-1.5">
                    <span className="text-[10px] text-muted-foreground">Content score</span>
                    <div className="flex items-center gap-1">
                      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn('h-full rounded-full transition-all duration-500',
                            contentScore >= 80 ? 'bg-emerald-500' : contentScore >= 60 ? 'bg-amber-500' : 'bg-destructive'
                          )}
                          style={{ width: `${contentScore}%` }}
                        />
                      </div>
                      <span className={cn('text-xs font-mono font-medium',
                        contentScore >= 80 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600'
                      )}>{contentScore}</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-4 space-y-4">
                {/* Tone */}
                <div>
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest mb-2">Tone</p>
                  <div className="flex flex-wrap gap-1.5">
                    {TONES.map(t => (
                      <button
                        key={t}
                        onClick={() => setSelectedTone(t)}
                        className={cn(
                          'px-2.5 py-1 rounded-sm text-[11px] font-medium border transition-all',
                          selectedTone === t
                            ? 'bg-accent/15 text-accent border-accent/40'
                            : 'text-muted-foreground border-border hover:border-border hover:text-foreground'
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate Variants */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">Generate Variants</p>
                    <Button
                      variant="ghost" size="sm"
                      className="h-6 text-[11px] text-accent hover:bg-accent/10 gap-1"
                      onClick={handleSimulateAI}
                      disabled={aiGenerating}
                    >
                      {aiGenerating ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                      {aiGenerating ? 'Generating...' : '3 variants'}
                    </Button>
                  </div>
                  {showVariants && (
                    <div className="space-y-2">
                      {AI_VARIANTS.map((v, i) => (
                        <button
                          key={i}
                          onClick={() => { setContent(v); setShowVariants(false) }}
                          className="w-full text-left p-2.5 rounded-sm border border-border hover:border-accent/50 hover:bg-accent/5 transition-all text-xs text-muted-foreground hover:text-foreground group"
                        >
                          <span className="text-[10px] font-medium text-accent mr-1.5">V{i + 1}</span>
                          {v}
                          <span className="block text-[10px] text-accent mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            Click to use this variant →
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Hashtags */}
                <div>
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest mb-2">Hashtag Intelligence</p>
                  <div className="flex flex-wrap gap-1.5">
                    {HASHTAG_SUGGESTIONS.map(h => (
                      <button
                        key={h.tag}
                        onClick={() => setContent(prev => prev + ' ' + h.tag)}
                        className="flex items-center gap-1 px-2 py-0.5 rounded-sm border border-border hover:border-accent/50 hover:bg-accent/5 text-[11px] text-muted-foreground hover:text-accent transition-all"
                      >
                        {h.tag}
                        <span className="text-[9px] font-mono text-muted-foreground/60">{h.score}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* ─── Right Column ─────────────────────────────────────────────── */}
        <div className="space-y-4">

          {/* Channel Selector */}
          <Card className="bg-card border-border shadow-sm">
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <h3 className="text-sm font-medium text-foreground">Post to</h3>
              <button className="text-[11px] text-accent hover:underline">
                {selectedChannels.length === connectedChannels.length ? 'Deselect all' : 'Select all'}
              </button>
            </div>
            <div className="px-2 pb-2 space-y-0.5 max-h-72 overflow-y-auto">
              {connectedChannels.map(channel => {
                const plat = PLATFORMS[channel.platform]
                const Icon = plat.icon
                const selected = selectedChannels.includes(channel.id)
                return (
                  <button
                    key={channel.id}
                    onClick={() => handleChannelToggle(channel.id)}
                    className={cn(
                      'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-sm transition-all text-left',
                      selected ? 'bg-primary/8 text-foreground' : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                    )}
                  >
                    <div className={cn('w-4 h-4 rounded-sm border flex items-center justify-center flex-shrink-0 transition-all',
                      selected ? 'bg-primary border-primary' : 'border-border'
                    )}>
                      {selected && <CheckCircle2 className="w-3 h-3 text-primary-foreground" />}
                    </div>
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{channel.handle}</p>
                      <p className="text-[10px] text-muted-foreground">{channel.followers.toLocaleString()}</p>
                    </div>
                    {channel.live && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                  </button>
                )
              })}
            </div>
          </Card>

          {/* Schedule */}
          <Card className="bg-card border-border shadow-sm">
            <div className="px-4 pt-4 pb-2">
              <h3 className="text-sm font-medium text-foreground mb-3">Schedule</h3>
              <div className="flex border border-border rounded-sm overflow-hidden">
                {(['now', 'schedule', 'queue'] as const).map((m, i) => (
                  <button
                    key={m}
                    onClick={() => setScheduleMode(m)}
                    className={cn(
                      'flex-1 py-2 text-[11px] font-medium transition-all border-r border-border last:border-r-0',
                      scheduleMode === m ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                    )}
                  >
                    {m === 'now' ? 'Now' : m === 'schedule' ? 'Schedule' : 'Queue'}
                  </button>
                ))}
              </div>
            </div>

            {scheduleMode === 'schedule' && (
              <div className="px-4 pb-4 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-[10px]">Date</Label>
                    <Input
                      type="date"
                      value={scheduleDate}
                      onChange={e => setScheduleDate(e.target.value)}
                      className="h-8 text-xs bg-input border-border"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px]">Time</Label>
                    <Input
                      type="time"
                      value={scheduleTime}
                      onChange={e => setScheduleTime(e.target.value)}
                      className="h-8 text-xs bg-input border-border"
                    />
                  </div>
                </div>
              </div>
            )}
            {scheduleMode === 'queue' && (
              <div className="px-4 pb-4">
                <p className="text-[11px] text-muted-foreground">Will be added to the next available slot in your posting queue.</p>
              </div>
            )}
            {scheduleMode === 'now' && (
              <div className="px-4 pb-4">
                <p className="text-[11px] text-muted-foreground">Post will publish immediately to all selected channels.</p>
              </div>
            )}

            <Separator />

            {/* Cross-post delay */}
            <div className="px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-foreground">Cross-post delay</p>
                <p className="text-[10px] text-muted-foreground">Gap between platform posts</p>
              </div>
              <Select value={crossPostDelay} onValueChange={setCrossPostDelay}>
                <SelectTrigger className="w-24 h-7 text-xs bg-input border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Instant</SelectItem>
                  <SelectItem value="5">5 min</SelectItem>
                  <SelectItem value="15">15 min</SelectItem>
                  <SelectItem value="30">30 min</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Signature */}
            <div className="px-4 py-3 border-t border-border flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-foreground">Append signature</p>
                <p className="text-[10px] text-muted-foreground truncate max-w-[160px]">
                  {MOCK_SIGNATURES[0]?.content.slice(0, 40)}...
                </p>
              </div>
              <Switch
                checked={enableSignature}
                onCheckedChange={setEnableSignature}
                className="data-[state=checked]:bg-accent"
              />
            </div>

            <div className="px-4 pb-4">
              <Button
                className="w-full text-xs gap-1.5"
                disabled={selectedChannels.length === 0}
              >
                {scheduleMode === 'now' ? (
                  <><Send className="w-3.5 h-3.5" /> Publish Now</>
                ) : scheduleMode === 'queue' ? (
                  <><Zap className="w-3.5 h-3.5" /> Add to Queue</>
                ) : (
                  <><Calendar className="w-3.5 h-3.5" /> Schedule Post</>
                )}
              </Button>
            </div>
          </Card>

          {/* Post Info */}
          {selectedPlatforms.length > 0 && (
            <Card className="bg-card border-border shadow-sm p-4">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">Platform limits</h3>
              <div className="space-y-2">
                {selectedPlatforms.map(p => {
                  const limit = PLATFORM_CHAR_LIMITS[p] ?? 5000
                  const plat = PLATFORMS[p]
                  const Icon = plat.icon
                  return (
                    <div key={p} className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                      <span className="text-[11px] text-muted-foreground flex-1">{plat.name}</span>
                      <CharArc value={charCount} max={limit} size={24} />
                      <span className="text-[10px] font-mono text-muted-foreground w-12 text-right">
                        {(limit - charCount).toLocaleString()}
                      </span>
                    </div>
                  )
                })}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
