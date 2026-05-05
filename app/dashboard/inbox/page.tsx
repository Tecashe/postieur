'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  MessageCircle, Heart, AtSign, Reply, UserCheck, CheckCheck,
  Search, Filter, RefreshCw, Smile, Meh, Frown, Archive,
} from 'lucide-react'
import { MOCK_INBOX } from '@/lib/mock-data'
import { PLATFORMS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { InboxMessage } from '@/lib/types'

const FILTERS = ['All', 'Comments', 'Mentions', 'DMs', 'Unread'] as const
type Filter = typeof FILTERS[number]

function SentimentIcon({ sentiment }: { sentiment: InboxMessage['sentiment'] }) {
  if (sentiment === 'positive') return <Smile className="w-3.5 h-3.5 text-emerald-500" />
  if (sentiment === 'negative') return <Frown className="w-3.5 h-3.5 text-destructive" />
  return <Meh className="w-3.5 h-3.5 text-muted-foreground" />
}

export default function InboxPage() {
  const [filter, setFilter] = useState<Filter>('All')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<InboxMessage | null>(MOCK_INBOX[0] ?? null)
  const [reply, setReply] = useState('')

  const filtered = MOCK_INBOX.filter(m => {
    if (filter === 'Unread' && m.isRead) return false
    if (filter === 'Comments' && m.type !== 'comment') return false
    if (filter === 'Mentions' && m.type !== 'mention') return false
    if (filter === 'DMs' && m.type !== 'dm') return false
    if (search && !m.content.toLowerCase().includes(search.toLowerCase()) && !(m.authorName ?? m.author?.name ?? '').toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="space-y-4 pb-6">
      {/* Stats strip */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total', value: MOCK_INBOX.length, icon: MessageCircle },
          { label: 'Unread', value: MOCK_INBOX.filter(m => !m.isRead).length, icon: MessageCircle, accent: true },
          { label: 'Comments', value: MOCK_INBOX.filter(m => m.type === 'comment').length, icon: MessageCircle },
          { label: 'Mentions', value: MOCK_INBOX.filter(m => m.type === 'mention').length, icon: AtSign },
        ].map(s => (
          <Card key={s.label} className={cn('bg-card border-border shadow-sm p-4', s.accent && 'border-accent/30 bg-accent/5')}>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">{s.label}</p>
            <p className={cn('text-2xl font-light mt-1', s.accent ? 'text-accent' : 'text-foreground')}>{s.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-4" style={{ height: 'calc(100vh - 280px)', minHeight: 500 }}>
        {/* Message list */}
        <Card className="bg-card border-border shadow-sm flex flex-col overflow-hidden">
          <div className="p-3 border-b border-border space-y-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
              <Input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search messages..." className="pl-8 h-8 text-xs bg-input border-border" />
            </div>
            <div className="flex gap-1 overflow-x-auto pb-0.5">
              {FILTERS.map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={cn('px-2.5 py-1 rounded-sm text-[11px] font-medium whitespace-nowrap transition-colors border',
                    filter === f ? 'bg-primary text-primary-foreground border-primary' : 'text-muted-foreground border-border hover:text-foreground')}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-border">
            {filtered.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">No messages</div>
            ) : filtered.map(msg => {
              const plat = PLATFORMS[msg.platform]
              const Icon = plat?.icon
              return (
                <button key={msg.id} onClick={() => setSelected(msg)}
                  className={cn('w-full text-left px-3 py-3 hover:bg-muted/30 transition-colors',
                    selected?.id === msg.id ? 'bg-muted/50' : '',
                    !msg.isRead ? 'border-l-2 border-l-accent' : 'border-l-2 border-l-transparent')}>
                  <div className="flex items-start gap-2">
                    <div className="w-7 h-7 rounded-sm bg-muted flex items-center justify-center text-[11px] font-medium text-muted-foreground flex-shrink-0">
                      {(msg.authorName ?? msg.author?.name ?? '?').charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-xs font-medium text-foreground truncate">{msg.authorName ?? msg.author?.name}</span>
                        {Icon && <Icon className="w-3 h-3 text-muted-foreground/60 flex-shrink-0" />}
                        <SentimentIcon sentiment={msg.sentiment} />
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-2">{msg.content}</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-0.5">{new Date(msg.createdAt ?? msg.timestamp).toLocaleDateString()}</p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </Card>

        {/* Message thread */}
        {selected ? (
          <Card className="bg-card border-border shadow-sm flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-sm bg-muted flex items-center justify-center text-[12px] font-medium text-muted-foreground">
                  {(selected.authorName ?? selected.author?.name ?? '?').charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground">{selected.authorName ?? selected.author?.name}</p>
                  <div className="flex items-center gap-1">
                    {(() => { const Icon = PLATFORMS[selected.platform]?.icon; return Icon ? <Icon className="w-3 h-3 text-muted-foreground/60" /> : null })()}
                    <p className="text-[10px] text-muted-foreground capitalize">{selected.type}</p>
                    <span className="text-[10px] text-muted-foreground">·</span>
                    <SentimentIcon sentiment={selected.sentiment} />
                    <span className="text-[10px] text-muted-foreground capitalize">{selected.sentiment}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground" title="Assign">
                  <UserCheck className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground" title="Resolve">
                  <CheckCheck className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground" title="Archive">
                  <Archive className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <div className="max-w-xl">
                <div className="bg-muted/40 rounded-sm p-4">
                  <p className="text-sm text-foreground leading-relaxed">{selected.content}</p>
                  {selected.postContent && (
                    <div className="mt-3 pl-3 border-l-2 border-border">
                      <p className="text-[11px] text-muted-foreground italic">In reply to: {selected.postContent.slice(0, 80)}...</p>
                    </div>
                  )}
                  <p className="text-[10px] text-muted-foreground mt-2">{new Date(selected.createdAt ?? selected.timestamp).toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Textarea
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  placeholder="Write a reply..."
                  className="flex-1 min-h-0 h-10 resize-none text-xs bg-input border-border py-2.5"
                  rows={1}
                />
                <Button size="sm" className="gap-1.5 text-xs" disabled={!reply.trim()}>
                  <Reply className="w-3.5 h-3.5" /> Send
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="bg-card border-border shadow-sm flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Select a message to view</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
