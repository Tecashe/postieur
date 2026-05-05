'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Inbox, RefreshCw, CheckCheck, Archive, MessageCircle, AtSign, Mail, Reply } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InboxMessage { id: string; platform: string; type: string; authorName: string; authorAvatar: string | null; content: string; postContent: string | null; sentiment: string; isRead: boolean; createdAt: string }

const PLATFORM_COLORS: Record<string, string> = { instagram: 'text-pink-500', linkedin: 'text-blue-600', x: 'text-zinc-900 dark:text-zinc-100', facebook: 'text-blue-700', tiktok: 'text-zinc-900' }
const TYPE_ICONS: Record<string, typeof MessageCircle> = { COMMENT: MessageCircle, MENTION: AtSign, DM: Mail, REPLY: Reply }
const SENTIMENT_COLORS: Record<string, string> = { POSITIVE: 'text-emerald-500', NEUTRAL: 'text-muted-foreground', NEGATIVE: 'text-destructive' }

export default function InboxPage() {
  const [messages, setMessages] = useState<InboxMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread' | 'archived'>('all')

  const load = useCallback(async () => {
    setLoading(true)
    const r = await fetch('/api/inbox?filter=' + filter).then(r => r.json())
    setMessages(r.messages ?? [])
    setLoading(false)
  }, [filter])
  useEffect(() => { load() }, [load])

  const handleMarkRead = async (id: string) => {
    await fetch('/api/inbox', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'mark-read', id }) })
    setMessages(prev => prev.map(m => m.id === id ? { ...m, isRead: true } : m))
  }

  const handleMarkAllRead = async () => {
    await fetch('/api/inbox', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'mark-all-read' }) })
    setMessages(prev => prev.map(m => ({ ...m, isRead: true })))
  }

  const handleArchive = async (id: string) => {
    await fetch('/api/inbox', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'archive', id }) })
    setMessages(prev => prev.filter(m => m.id !== id))
  }

  const unreadCount = messages.filter(m => !m.isRead).length

  return (
    <div className="space-y-5 pb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tabs value={filter} onValueChange={v => setFilter(v as 'all' | 'unread' | 'archived')}>
            <TabsList className="bg-muted/50 border border-border h-8 p-0.5">
              <TabsTrigger value="all" className="h-7 text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm">All</TabsTrigger>
              <TabsTrigger value="unread" className="h-7 text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm">Unread {unreadCount > 0 && <Badge className="ml-1 text-[9px] h-3.5 px-1 min-w-0">{unreadCount}</Badge>}</TabsTrigger>
              <TabsTrigger value="archived" className="h-7 text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm">Archived</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs h-7" onClick={load}><RefreshCw className="w-3.5 h-3.5" /> Refresh</Button>
          {unreadCount > 0 && <Button variant="outline" size="sm" className="gap-1.5 text-xs h-7" onClick={handleMarkAllRead}><CheckCheck className="w-3.5 h-3.5" /> Mark all read</Button>}
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({length:3}).map((_,i)=><div key={i} className="h-20 rounded-lg bg-muted/40 animate-pulse"/>)}</div>
      ) : messages.length === 0 ? (
        <Card className="p-12 text-center">
          <Inbox className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">No messages</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Comments, mentions and DMs from your connected accounts will appear here after OAuth setup</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {messages.map(m => {
            const Icon = TYPE_ICONS[m.type] ?? MessageCircle
            return (
              <Card key={m.id} className={cn('p-3.5', !m.isRead && 'border-primary/30 bg-primary/5')}>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium flex-shrink-0">{m.authorName[0]?.toUpperCase()}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium">{m.authorName}</span>
                      <span className={cn('text-[10px] font-medium', PLATFORM_COLORS[m.platform] ?? 'text-muted-foreground')}>{m.platform}</span>
                      <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground"><Icon className="w-3 h-3" />{m.type.toLowerCase()}</span>
                      {!m.isRead && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                    </div>
                    {m.postContent && <p className="text-[10px] text-muted-foreground mt-0.5 truncate">On: {m.postContent}</p>}
                    <p className="text-xs text-foreground mt-1">{m.content}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{new Date(m.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    {!m.isRead && <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleMarkRead(m.id)}><CheckCheck className="w-3 h-3" /></Button>}
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleArchive(m.id)}><Archive className="w-3 h-3" /></Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
