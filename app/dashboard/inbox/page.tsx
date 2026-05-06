'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Inbox, RefreshCw, CheckCheck, Archive, MessageCircle, AtSign, Mail, Reply,
  SendHorizonal, ChevronDown, ChevronUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface InboxMessage {
  id: string; platform: string; type: string; authorName: string
  authorAvatar: string | null; content: string; postContent: string | null
  sentiment: string; isRead: boolean; createdAt: string
  replyText: string | null; repliedAt: string | null
}

const PLATFORM_COLORS: Record<string, string> = {
  instagram: 'text-pink-500', linkedin: 'text-blue-600',
  x: 'text-foreground', facebook: 'text-blue-700', tiktok: 'text-foreground',
}
const TYPE_ICONS: Record<string, typeof MessageCircle> = {
  COMMENT: MessageCircle, MENTION: AtSign, DM: Mail, REPLY: Reply,
}
const SENTIMENT_DOT: Record<string, string> = {
  POSITIVE: 'bg-emerald-500', NEUTRAL: 'bg-muted-foreground/40', NEGATIVE: 'bg-destructive',
}

// ── Single message card ──────────────────────────────────────────────────────
function MessageCard({
  m,
  onMarkRead,
  onArchive,
  onReplySent,
}: {
  m: InboxMessage
  onMarkRead: (id: string) => void
  onArchive: (id: string) => void
  onReplySent: (id: string, text: string, repliedAt: string) => void
}) {
  const [showReply, setShowReply] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const Icon = TYPE_ICONS[m.type] ?? MessageCircle

  const handleSendReply = async () => {
    if (!replyText.trim() || sending) return
    setSending(true)
    try {
      const res = await fetch('/api/inbox', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reply', id: m.id, replyText: replyText.trim() }),
      })
      if (!res.ok) throw new Error('Failed')
      const data = await res.json() as { repliedAt: string }
      onReplySent(m.id, replyText.trim(), data.repliedAt)
      setReplyText('')
      setShowReply(false)
      toast.success('Reply sent')
    } catch {
      toast.error('Failed to send reply')
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSendReply()
    }
  }

  // Auto-focus textarea when reply opens
  useEffect(() => {
    if (showReply) setTimeout(() => textareaRef.current?.focus(), 50)
  }, [showReply])

  return (
    <Card
      className={cn(
        'bg-card border-border transition-all',
        !m.isRead && 'border-accent/30 bg-accent/3',
      )}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold flex-shrink-0 text-foreground select-none">
            {m.authorName[0]?.toUpperCase()}
          </div>

          {/* Body */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-sm font-medium text-foreground">{m.authorName}</span>
              <span className={cn('text-[10px] font-medium uppercase tracking-wide', PLATFORM_COLORS[m.platform] ?? 'text-muted-foreground')}>
                {m.platform}
              </span>
              <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                <Icon className="w-3 h-3" />{m.type.toLowerCase()}
              </span>
              {/* Sentiment dot */}
              <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', SENTIMENT_DOT[m.sentiment] ?? 'bg-muted-foreground/40')} title={m.sentiment.toLowerCase()} />
              {!m.isRead && <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />}
            </div>

            {m.postContent && (
              <p className="text-[10px] text-muted-foreground mb-0.5 truncate">
                On: {m.postContent}
              </p>
            )}
            <p className="text-xs text-foreground leading-relaxed">{m.content}</p>
            <p className="text-[10px] text-muted-foreground mt-1">
              {new Date(m.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>

            {/* Existing reply preview */}
            {m.replyText && (
              <div className="mt-2.5 pl-3 border-l-2 border-accent/30">
                <p className="text-[10px] text-muted-foreground mb-0.5">You replied:</p>
                <p className="text-xs text-foreground/80">{m.replyText}</p>
                {m.repliedAt && (
                  <p className="text-[9px] text-muted-foreground/60 mt-0.5">
                    {new Date(m.repliedAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </div>
            )}

            {/* Reply toggle */}
            <button
              onClick={() => setShowReply(v => !v)}
              className="flex items-center gap-1 mt-2 text-[11px] text-accent hover:text-accent/80 transition-colors"
            >
              <Reply className="w-3 h-3" />
              {showReply ? 'Cancel' : (m.replyText ? 'Edit reply' : 'Reply')}
              {showReply ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-1 flex-shrink-0">
            {!m.isRead && (
              <button
                onClick={() => onMarkRead(m.id)}
                className="flex items-center justify-center w-6 h-6 rounded-sm text-muted-foreground/50 hover:text-foreground hover:bg-muted/60 transition-colors"
                title="Mark as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => onArchive(m.id)}
              className="flex items-center justify-center w-6 h-6 rounded-sm text-muted-foreground/50 hover:text-foreground hover:bg-muted/60 transition-colors"
              title="Archive"
            >
              <Archive className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Inline reply composer */}
        {showReply && (
          <div className="mt-3 ml-11 space-y-2">
            <textarea
              ref={textareaRef}
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Reply to ${m.authorName}… (⌘↵ to send)`}
              rows={3}
              className={cn(
                'w-full resize-none rounded-lg px-3 py-2.5 text-xs',
                'bg-input border border-border text-foreground placeholder:text-muted-foreground/50',
                'outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent/40',
                'transition-all',
              )}
            />
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-muted-foreground/60">⌘ ↵ to send</p>
              <Button
                size="sm"
                className="h-7 text-xs gap-1.5"
                onClick={handleSendReply}
                disabled={!replyText.trim() || sending}
              >
                {sending
                  ? <RefreshCw className="w-3 h-3 animate-spin" />
                  : <SendHorizonal className="w-3 h-3" />
                }
                Send
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function InboxPage() {
  const [messages, setMessages] = useState<InboxMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread' | 'archived'>('all')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await fetch('/api/inbox?filter=' + filter).then(r => r.json()) as { messages: InboxMessage[] }
      setMessages(r.messages ?? [])
    } catch {
      toast.error('Failed to load inbox')
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => { load() }, [load])

  const handleMarkRead = async (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, isRead: true } : m))
    try {
      await fetch('/api/inbox', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'mark-read', id }) })
    } catch {
      await load()
    }
  }

  const handleMarkAllRead = async () => {
    setMessages(prev => prev.map(m => ({ ...m, isRead: true })))
    try {
      await fetch('/api/inbox', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'mark-all-read' }) })
      toast.success('All messages marked as read')
    } catch {
      await load()
    }
  }

  const handleArchive = async (id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id))
    try {
      await fetch('/api/inbox', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'archive', id }) })
    } catch {
      await load()
    }
  }

  const handleReplySent = (id: string, text: string, repliedAt: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, replyText: text, repliedAt, isRead: true } : m))
  }

  const unreadCount = messages.filter(m => !m.isRead).length

  return (
    <div className="space-y-5 pb-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <Tabs value={filter} onValueChange={v => setFilter(v as 'all' | 'unread' | 'archived')}>
          <TabsList className="bg-muted/50 border border-border h-8 p-0.5">
            <TabsTrigger value="all" className="h-7 text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm">
              All
            </TabsTrigger>
            <TabsTrigger value="unread" className="h-7 text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm">
              Unread
              {unreadCount > 0 && (
                <Badge className="ml-1.5 text-[9px] h-3.5 px-1 min-w-0 border-0 bg-accent text-accent-foreground">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="archived" className="h-7 text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm">
              Archived
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs h-7 border-border" onClick={load}>
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" className="gap-1.5 text-xs h-7 border-border" onClick={handleMarkAllRead}>
              <CheckCheck className="w-3.5 h-3.5" /> Mark all read
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 rounded-lg bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : messages.length === 0 ? (
        <Card className="p-12 text-center bg-card border-border">
          <Inbox className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground font-medium">
            {filter === 'archived' ? 'No archived messages' : 'No messages'}
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1 max-w-xs mx-auto">
            {filter === 'all'
              ? 'Comments, mentions and DMs from your connected accounts will appear here'
              : filter === 'unread'
              ? 'All caught up!'
              : 'Archived messages will appear here'}
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {messages.map(m => (
            <MessageCard
              key={m.id}
              m={m}
              onMarkRead={handleMarkRead}
              onArchive={handleArchive}
              onReplySent={handleReplySent}
            />
          ))}
        </div>
      )}
    </div>
  )
}
