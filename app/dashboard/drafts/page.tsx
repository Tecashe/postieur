'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Edit3, Trash2, Send, Clock, Plus, Sparkles } from 'lucide-react'
import { PLATFORMS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { deletePost, updatePost } from '@/lib/actions/posts'
import { toast } from 'sonner'

type DbPost = {
  id: string; content: string; status: string; scheduledAt: string | null
  createdAt: string; updatedAt: string; mediaUrls: string[]; labels: string[]
  channels: Array<{ channel: { platform: string } }>
}

export default function DraftsPage() {
  const [search, setSearch] = useState('')
  const [drafts, setDrafts] = useState<DbPost[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [schedulingId, setSchedulingId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/posts?status=DRAFT&limit=100')
      .then(r => r.json())
      .then((data: DbPost[]) => setDrafts(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = drafts.filter(d =>
    !search || d.content.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      await deletePost(id)
      setDrafts(prev => prev.filter(d => d.id !== id))
      toast.success('Draft deleted')
    } catch {
      toast.error('Failed to delete draft')
    } finally {
      setDeletingId(null)
    }
  }

  const handleScheduleNow = async (id: string) => {
    // Schedules for 1 hour from now
    setSchedulingId(id)
    try {
      const scheduledAt = new Date(Date.now() + 60 * 60 * 1000).toISOString()
      await updatePost(id, { status: 'SCHEDULED', scheduledAt })
      setDrafts(prev => prev.filter(d => d.id !== id))
      toast.success('Moved to queue — scheduled for 1 hour from now')
    } catch {
      toast.error('Failed to schedule')
    } finally {
      setSchedulingId(null)
    }
  }

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search drafts..." className="pl-8 h-8 text-xs bg-input border-border" />
        </div>
        <p className="text-xs text-muted-foreground">{filtered.length} draft{filtered.length !== 1 ? 's' : ''}</p>
        <div className="flex-1" />
        <Button asChild size="sm" className="gap-1.5 text-xs">
          <Link href="/dashboard/compose"><Plus className="w-3.5 h-3.5" /> New Draft</Link>
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1,2,3].map(i => <div key={i} className="h-44 rounded-sm bg-muted/30 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="bg-card border-border shadow-sm p-12 text-center">
          <Edit3 className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No drafts yet</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Posts you save without scheduling will appear here</p>
          <Button asChild variant="ghost" size="sm" className="mt-4 text-xs text-accent hover:bg-accent/5 gap-1">
            <Link href="/dashboard/compose"><Sparkles className="w-3 h-3" /> Start writing</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(draft => {
            const platforms = draft.channels.map(c => c.channel.platform)
            const wordCount = draft.content.trim().split(/\s+/).filter(Boolean).length
            const charCount = draft.content.length
            const relTime = new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
              -Math.round((Date.now() - new Date(draft.updatedAt).getTime()) / 60000),
              'minutes'
            )
            return (
              <Card key={draft.id} className={cn('bg-card border-border shadow-sm p-4 hover:border-border/80 flex flex-col group transition-all', deletingId === draft.id && 'opacity-50')}>
                {/* Platform badges */}
                <div className="flex items-center gap-1.5 mb-3">
                  <div className="flex gap-0.5">
                    {platforms.slice(0, 4).map(p => {
                      const Icon = PLATFORMS[p as keyof typeof PLATFORMS]?.icon
                      return Icon ? <Icon key={p} className="w-3.5 h-3.5 text-muted-foreground/60" /> : null
                    })}
                    {platforms.length === 0 && <span className="text-[10px] text-muted-foreground/50">No channels</span>}
                    {platforms.length > 4 && <span className="text-[10px] text-muted-foreground">+{platforms.length - 4}</span>}
                  </div>
                  <div className="flex-1" />
                  <Badge className="text-[10px] border-0 bg-muted text-muted-foreground">Draft</Badge>
                </div>

                {/* Content */}
                <p className="text-xs text-foreground line-clamp-4 flex-1 leading-relaxed">{draft.content}</p>

                {/* Labels */}
                {draft.labels?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {draft.labels.map(label => (
                      <Badge key={label} className="text-[10px] border border-border bg-muted/50 text-muted-foreground font-normal px-1.5 h-4">
                        {label}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Meta */}
                <div className="flex items-center gap-2 mt-3 text-[10px] text-muted-foreground/70">
                  <span>{wordCount}w</span>
                  <span>·</span>
                  <span>{charCount} chars</span>
                  <span>·</span>
                  <span>{relTime}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border">
                  <Clock className="w-3 h-3 text-muted-foreground/60" />
                  <span className="text-[10px] text-muted-foreground flex-1">
                    {draft.updatedAt ? new Date(draft.updatedAt).toLocaleDateString() : 'Unsaved'}
                  </span>
                  <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground gap-1">
                    <Link href={`/dashboard/compose?edit=${draft.id}`}><Edit3 className="w-3 h-3" /> Edit</Link>
                  </Button>
                  <Button
                    variant="ghost" size="sm"
                    className="h-7 px-2 text-[11px] text-muted-foreground hover:text-accent gap-1"
                    onClick={() => handleScheduleNow(draft.id)}
                    disabled={schedulingId === draft.id}
                  >
                    <Send className="w-3 h-3" /> {schedulingId === draft.id ? '…' : 'Schedule'}
                  </Button>
                  <Button
                    variant="ghost" size="sm"
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(draft.id)}
                    disabled={deletingId === draft.id}
                  >
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
