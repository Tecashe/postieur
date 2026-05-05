'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Edit3, Trash2, Send, Clock } from 'lucide-react'
import { MOCK_POSTS } from '@/lib/mock-data'
import { PLATFORMS } from '@/lib/constants'
import { cn } from '@/lib/utils'

export default function DraftsPage() {
  const [search, setSearch] = useState('')
  const drafts = MOCK_POSTS.filter(p => p.status === 'draft').filter(d =>
    !search || d.content.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4 pb-6">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search drafts..." className="pl-8 h-8 text-xs bg-input border-border" />
        </div>
        <p className="text-xs text-muted-foreground">{drafts.length} draft{drafts.length !== 1 ? 's' : ''}</p>
      </div>

      {drafts.length === 0 ? (
        <Card className="bg-card border-border shadow-sm p-12 text-center">
          <Edit3 className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No drafts yet</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Posts you save without scheduling will appear here</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {drafts.map(draft => {
            const platforms = draft.platforms ?? []
            return (
              <Card key={draft.id} className="bg-card border-border shadow-sm p-4 hover:border-border flex flex-col">
                <div className="flex items-start gap-2 mb-3">
                  <div className="flex gap-0.5 flex-wrap flex-1">
                    {platforms.slice(0, 3).map(p => {
                      const Icon = PLATFORMS[p]?.icon
                      return Icon ? <Icon key={p} className="w-3.5 h-3.5 text-muted-foreground/60" /> : null
                    })}
                    {platforms.length > 3 && <span className="text-[10px] text-muted-foreground">+{platforms.length - 3}</span>}
                  </div>
                  <Badge className="text-[10px] border-0 bg-muted text-muted-foreground flex-shrink-0">Draft</Badge>
                </div>

                <p className="text-xs text-foreground line-clamp-4 flex-1 leading-relaxed">{draft.content}</p>

                <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border">
                  <Clock className="w-3 h-3 text-muted-foreground/60" />
                  <span className="text-[10px] text-muted-foreground flex-1">
                    {draft.scheduledAt ? new Date(draft.scheduledAt).toLocaleDateString() : 'Unsaved'}
                  </span>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground">
                    <Edit3 className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-accent">
                    <Send className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
