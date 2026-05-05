'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Sparkles, RefreshCw, Copy, Check, Wand2, Mic, BookOpen,
  TrendingUp, MessageSquare, Hash, FileText, Layers, Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const CONTENT_TYPES = [
  { id: 'post', label: 'Social Post', icon: MessageSquare },
  { id: 'thread', label: 'Thread', icon: Layers },
  { id: 'caption', label: 'Caption', icon: FileText },
  { id: 'hashtags', label: 'Hashtags', icon: Hash },
  { id: 'bio', label: 'Bio', icon: BookOpen },
  { id: 'repurpose', label: 'Repurpose', icon: RefreshCw },
]

const TONES = ['Professional', 'Casual', 'Witty', 'Inspirational', 'Educational', 'Urgency', 'Storytelling']
const PLATFORMS_OPT = ['Instagram', 'LinkedIn', 'Twitter / X', 'TikTok', 'Facebook', 'YouTube']

const SAMPLE_RESULTS = [
  `🚀 Exciting news! After months of refinement, we're thrilled to announce our latest platform update. The wait is finally over — your social media management just got 10x more powerful. Here's what changed and why it matters for your growth strategy. 👇 #SocialMedia #Growth #ProductUpdate`,
  `We didn't set out to build the best social tool. We set out to solve a real problem: managing multiple platforms without losing your mind. Today's update is our most significant yet. Here's the full story.`,
  `3 things we changed that will save you hours every week:\n\n1. AI-powered scheduling now learns your audience's peak times\n2. Unified inbox so you never miss a message\n3. Cross-platform analytics in one dashboard\n\nThe best part? It all works automatically.`,
]

export default function AIStudioPage() {
  const [prompt, setPrompt] = useState('')
  const [contentType, setContentType] = useState('post')
  const [tone, setTone] = useState('Professional')
  const [platform, setPlatform] = useState('LinkedIn')
  const [generating, setGenerating] = useState(false)
  const [results, setResults] = useState<string[]>([])
  const [copied, setCopied] = useState<number | null>(null)
  const [brandVoice, setBrandVoice] = useState('')

  const handleGenerate = () => {
    setGenerating(true)
    setTimeout(() => {
      setResults(SAMPLE_RESULTS)
      setGenerating(false)
    }, 1800)
  }

  const handleCopy = (i: number, text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(i)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="space-y-5 pb-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-sm bg-accent/15 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h1 className="text-xl font-light text-foreground">AI Studio</h1>
          <p className="text-xs text-muted-foreground">Generate, repurpose, and optimize content with AI</p>
        </div>
      </div>

      <Tabs defaultValue="generate">
        <TabsList className="bg-muted/50 border border-border h-8 p-0.5">
          {[
            ['generate', 'Generate', Wand2],
            ['repurpose', 'Repurpose', RefreshCw],
            ['brand-voice', 'Brand Voice', Mic],
            ['trends', 'Trends', TrendingUp],
          ].map(([v, l, Icon]: any) => (
            <TabsTrigger key={v} value={v} className="h-7 text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm gap-1.5">
              <Icon className="w-3 h-3" />{l}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="generate" className="mt-4">
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-5">
            {/* Input panel */}
            <div className="space-y-4">
              <Card className="bg-card border-border shadow-sm p-5 space-y-4">
                {/* Content type */}
                <div>
                  <Label className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2 block">Content Type</Label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {CONTENT_TYPES.map(ct => (
                      <button key={ct.id} onClick={() => setContentType(ct.id)}
                        className={cn('flex flex-col items-center gap-1.5 p-2.5 rounded-sm border text-center transition-all',
                          contentType === ct.id ? 'bg-primary/8 border-primary/30 text-primary' : 'border-border text-muted-foreground hover:border-border hover:bg-muted/40 hover:text-foreground')}>
                        <ct.icon className="w-4 h-4" />
                        <span className="text-[10px] font-medium">{ct.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Prompt */}
                <div>
                  <Label className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2 block">Your Prompt</Label>
                  <Textarea
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    placeholder="Describe what you want to post about... e.g. 'Announce our new feature that helps teams schedule posts 5x faster'"
                    className="min-h-28 bg-input border-border text-sm font-light resize-none placeholder:text-muted-foreground/50"
                  />
                </div>

                {/* Options row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[11px] uppercase tracking-widest text-muted-foreground mb-1.5 block">Platform</Label>
                    <Select value={platform} onValueChange={setPlatform}>
                      <SelectTrigger className="h-8 text-xs bg-input border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PLATFORMS_OPT.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-[11px] uppercase tracking-widest text-muted-foreground mb-1.5 block">Tone</Label>
                    <Select value={tone} onValueChange={setTone}>
                      <SelectTrigger className="h-8 text-xs bg-input border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TONES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button onClick={handleGenerate} disabled={!prompt.trim() || generating} className="w-full gap-2">
                  {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {generating ? 'Generating...' : 'Generate 3 Variants'}
                </Button>
              </Card>

              {/* Results */}
              {results.length > 0 && (
                <div className="space-y-3">
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">Generated Variants</p>
                  {results.map((r, i) => (
                    <Card key={i} className="bg-card border-border shadow-sm p-4 group">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <span className="text-[11px] font-medium text-accent">Variant {i + 1}</span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground" onClick={() => handleCopy(i, r)}>
                            {copied === i ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                          </Button>
                          <Button variant="ghost" size="sm" className="h-6 text-[10px] text-accent hover:bg-accent/10 gap-1 px-2">
                            <Zap className="w-3 h-3" /> Use
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{r}</p>
                      <p className="text-[10px] text-muted-foreground mt-2">{r.length} characters</p>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Tips panel */}
            <div className="space-y-4">
              <Card className="bg-card border-border shadow-sm p-4">
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest mb-3">Quick Tips</p>
                <div className="space-y-3">
                  {[
                    ['Be specific', 'Include your target audience, the key message, and desired action.'],
                    ['Add context', 'Mention your product, industry, or topic for more accurate results.'],
                    ['Iterate', 'Generate multiple variants and pick the best one to refine.'],
                  ].map(([title, desc]) => (
                    <div key={title}>
                      <p className="text-xs font-medium text-foreground">{title}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{desc}</p>
                    </div>
                  ))}
                </div>
              </Card>
              <Card className="bg-accent/5 border-accent/20 shadow-sm p-4">
                <div className="flex gap-2.5">
                  <Sparkles className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-foreground">Pro tip</p>
                    <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                      Define your Brand Voice in the Brand Voice tab and all generated content will automatically match your style.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="repurpose" className="mt-4">
          <Card className="bg-card border-border shadow-sm p-6 text-center">
            <RefreshCw className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
            <h3 className="text-sm font-medium text-foreground mb-1">Repurpose Content</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">Paste a blog post, video transcript, or long-form content and AI will transform it into multiple social posts optimized for each platform.</p>
            <Button className="mt-4 gap-2 text-xs"><RefreshCw className="w-3.5 h-3.5" /> Start Repurposing</Button>
          </Card>
        </TabsContent>

        <TabsContent value="brand-voice" className="mt-4">
          <Card className="bg-card border-border shadow-sm p-6">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest mb-4">Define Your Brand Voice</p>
            <div className="max-w-lg space-y-4">
              <div>
                <Label className="text-xs">Brand Description</Label>
                <Textarea value={brandVoice} onChange={e => setBrandVoice(e.target.value)} placeholder="Describe your brand personality, values, and communication style..." className="mt-1.5 min-h-24 bg-input border-border text-sm resize-none" />
              </div>
              <Button className="gap-2 text-xs"><Mic className="w-3.5 h-3.5" /> Save Brand Voice</Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="mt-4">
          <Card className="bg-card border-border shadow-sm p-6 text-center">
            <TrendingUp className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
            <h3 className="text-sm font-medium text-foreground mb-1">Trending Topics</h3>
            <p className="text-xs text-muted-foreground">Connect your channels to get real-time trend analysis and content suggestions based on what's working in your niche.</p>
            <Button variant="outline" className="mt-4 text-xs border-border">Connect Channels</Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
