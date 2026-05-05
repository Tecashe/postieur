'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Plus, Copy, Edit3, Trash2, Tag } from 'lucide-react'
import { PLATFORMS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { Platform } from '@/lib/types'

const MOCK_TEMPLATES = [
  {
    id: '1', name: 'Product Launch', category: 'Marketing',
    content: '🚀 Exciting news! We are launching {product_name} — the {adjective} solution for {target_audience}. {cta}',
    platforms: ['instagram', 'linkedin', 'x'] as Platform[],
    usageCount: 24, tags: ['launch', 'product', 'announcement'],
  },
  {
    id: '2', name: 'Weekly Tip', category: 'Education',
    content: '💡 This week\'s tip: {tip_content}\n\nSave this for later! What\'s your biggest challenge with {topic}? Let us know below. 👇',
    platforms: ['instagram', 'facebook', 'linkedin'] as Platform[],
    usageCount: 18, tags: ['tip', 'education', 'engagement'],
  },
  {
    id: '3', name: 'Behind the Scenes', category: 'Brand',
    content: 'Take a peek behind the curtain at {company}! 🎬\n\n{bts_description}\n\nDrop a ❤️ if you love seeing how the magic happens!',
    platforms: ['instagram', 'tiktok'] as Platform[],
    usageCount: 11, tags: ['bts', 'brand', 'authentic'],
  },
  {
    id: '4', name: 'Testimonial Highlight', category: 'Social Proof',
    content: '⭐ "{testimonial_quote}" — {customer_name}, {customer_title}\n\nJoin {number}+ happy customers. {cta}',
    platforms: ['instagram', 'linkedin', 'facebook', 'x'] as Platform[],
    usageCount: 32, tags: ['testimonial', 'social-proof'],
  },
  {
    id: '5', name: 'Q&A Thread', category: 'Engagement',
    content: 'I get asked "{question}" a lot. Here\'s my honest answer 🧵\n\n1/ {answer_start}',
    platforms: ['x', 'threads'] as Platform[],
    usageCount: 7, tags: ['thread', 'qa', 'engagement'],
  },
  {
    id: '6', name: 'Industry News', category: 'Thought Leadership',
    content: '📰 Big news in {industry}: {news_headline}\n\nHere\'s what this means for {audience}: {analysis}\n\nThoughts? 👇',
    platforms: ['linkedin', 'x'] as Platform[],
    usageCount: 15, tags: ['news', 'thought-leadership'],
  },
]

const CATEGORIES = ['All', ...Array.from(new Set(MOCK_TEMPLATES.map(t => t.category)))]

export default function TemplatesPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')

  const filtered = MOCK_TEMPLATES.filter(t =>
    (category === 'All' || t.category === category) &&
    (!search || t.name.toLowerCase().includes(search.toLowerCase()) || t.content.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="space-y-4 pb-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-sm min-w-0">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search templates..." className="pl-8 h-8 text-xs bg-input border-border" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              className={cn('px-3 py-1.5 text-xs rounded-sm border transition-all',
                category === cat ? 'border-accent/40 bg-accent/5 text-accent' : 'border-border text-muted-foreground hover:text-foreground')}>
              {cat}
            </button>
          ))}
        </div>
        <Button size="sm" className="gap-1.5 text-xs ml-auto"><Plus className="w-3.5 h-3.5" /> New Template</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(tpl => (
          <Card key={tpl.id} className="bg-card border-border shadow-sm p-4 flex flex-col hover:border-border transition-all group">
            <div className="flex items-start gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{tpl.name}</p>
                <Badge className="mt-0.5 text-[10px] border-0 bg-accent/10 text-accent">{tpl.category}</Badge>
              </div>
              <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"><Copy className="w-3 h-3" /></Button>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"><Edit3 className="w-3 h-3" /></Button>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"><Trash2 className="w-3 h-3" /></Button>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground line-clamp-3 leading-relaxed flex-1 font-mono bg-muted/30 rounded-sm p-2">{tpl.content}</p>

            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
              <div className="flex gap-0.5 flex-1">
                {tpl.platforms.slice(0, 4).map(p => {
                  const Icon = PLATFORMS[p]?.icon
                  return Icon ? <Icon key={p} className="w-3 h-3 text-muted-foreground/50" /> : null
                })}
              </div>
              <span className="text-[10px] text-muted-foreground">{tpl.usageCount} uses</span>
            </div>

            <div className="flex flex-wrap gap-1 mt-2">
              {tpl.tags.slice(0, 3).map(tag => (
                <span key={tag} className="inline-flex items-center gap-0.5 text-[9px] text-muted-foreground/60 bg-muted/40 px-1.5 py-0.5 rounded-sm">
                  <Tag className="w-2 h-2" />{tag}
                </span>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
