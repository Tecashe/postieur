'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Bell, Menu, Search, Sparkles, ArrowUpRight, CheckCircle2, AlertCircle, Clock, Info } from 'lucide-react'
import Link from 'next/link'

interface HeaderProps {
  onSidebarToggle: () => void
}

const BREADCRUMBS: Record<string, { title: string; description: string }> = {
  '/dashboard':           { title: 'Dashboard',    description: 'Overview of your social presence' },
  '/dashboard/calendar':  { title: 'Calendar',     description: 'Plan and visualize your content' },
  '/dashboard/compose':   { title: 'Compose',      description: 'Create and schedule new posts' },
  '/dashboard/queue':     { title: 'Queue',        description: 'Manage your posting schedule' },
  '/dashboard/analytics': { title: 'Analytics',    description: 'Track performance and growth' },
  '/dashboard/media':     { title: 'Media Library',description: 'Your images, videos and assets' },
  '/dashboard/channels':  { title: 'Channels',     description: 'Connected social accounts' },
  '/dashboard/members':   { title: 'Members',      description: 'Team access and permissions' },
  '/dashboard/settings':  { title: 'Settings',     description: 'Workspace preferences' },
  '/dashboard/drafts':    { title: 'Drafts',       description: 'Work in progress posts' },
  '/dashboard/templates': { title: 'Templates',    description: 'Reusable post templates' },
  '/dashboard/inbox':     { title: 'Inbox',        description: 'All messages and mentions' },
  '/dashboard/campaigns': { title: 'Campaigns',    description: 'Content campaigns and goals' },
  '/dashboard/link-in-bio': { title: 'Link in Bio', description: 'Your bio page and link tree' },
  '/dashboard/ai-studio': { title: 'AI Studio',    description: 'AI-powered content creation' },
  '/dashboard/plugs':     { title: 'Plugs',        description: 'Automation triggers and actions' },
  '/dashboard/rss':       { title: 'RSS Auto-post', description: 'Auto-post from RSS feeds' },
  '/dashboard/api':       { title: 'API & Webhooks', description: 'Integrate and automate' },
}

type DbNotification = {
  id: string
  type: string
  title: string
  body: string | null
  isRead: boolean
  createdAt: string
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function notifIcon(type: string) {
  if (type === 'POST_PUBLISHED') return <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-500" />
  if (type === 'POST_FAILED') return <AlertCircle className="w-4 h-4 flex-shrink-0 text-destructive" />
  if (type === 'QUEUE_EMPTY') return <Clock className="w-4 h-4 flex-shrink-0 text-amber-500" />
  return <Info className="w-4 h-4 flex-shrink-0 text-accent" />
}

export function Header({ onSidebarToggle }: HeaderProps) {
  const pathname = usePathname()
  const page = BREADCRUMBS[pathname] ?? { title: 'Dashboard', description: 'Manage your social presence' }

  const [notifications, setNotifications] = useState<DbNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)

  const fetchNotifications = useCallback(() => {
    fetch('/api/notifications?limit=8')
      .then(r => r.json())
      .then((d: { notifications: DbNotification[]; unreadCount: number }) => {
        setNotifications(d.notifications ?? [])
        setUnreadCount(d.unreadCount ?? 0)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetchNotifications()
    // Refresh every 60 seconds
    const interval = setInterval(fetchNotifications, 60000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  const handleOpenChange = async (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen && unreadCount > 0) {
      // Mark all read when closing
      await fetch('/api/notifications', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: '{}' })
        .catch(() => {})
      setUnreadCount(0)
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    }
  }

  return (
    <header className="h-14 border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-10">
      <div className="h-full px-4 sm:px-5 flex items-center justify-between gap-4">
        {/* Left */}
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden h-8 w-8 p-0 text-muted-foreground"
            onClick={onSidebarToggle}
          >
            <Menu className="w-4 h-4" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-sm font-medium text-foreground leading-none truncate">{page.title}</h1>
            <p className="text-[11px] text-muted-foreground mt-0.5 truncate hidden sm:block">{page.description}</p>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Search */}
          <div className="hidden md:block relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
            <Input
              placeholder="Search posts, channels..."
              className="w-52 pl-8 h-8 bg-muted/50 border-border/60 text-xs placeholder:text-muted-foreground/50 focus-visible:bg-card"
            />
          </div>

          {/* Compose shortcut */}
          <Button variant="default" size="sm" asChild className="hidden sm:flex h-8 text-xs gap-1.5">
            <Link href="/dashboard/compose">
              <Sparkles className="w-3.5 h-3.5" />
              Compose
            </Link>
          </Button>

          {/* Notifications */}
          <DropdownMenu open={open} onOpenChange={handleOpenChange}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 relative text-muted-foreground hover:text-foreground">
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-accent rounded-full" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="px-3 py-2.5 border-b border-border flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Notifications</span>
                {unreadCount > 0 && (
                  <Badge className="bg-accent/15 text-accent border-0 text-[10px] px-1.5 py-0 h-4">{unreadCount} new</Badge>
                )}
              </div>
              {notifications.length === 0 ? (
                <div className="px-3 py-6 text-center text-xs text-muted-foreground">No notifications yet</div>
              ) : notifications.map(n => (
                <DropdownMenuItem key={n.id} className={cn('px-3 py-2.5 gap-3 cursor-pointer', !n.isRead && 'bg-accent/5')}>
                  {notifIcon(n.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-normal text-foreground leading-snug">{n.title}</p>
                    {n.body && <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{n.body}</p>}
                    <p className="text-[10px] text-muted-foreground mt-0.5">{timeAgo(n.createdAt)}</p>
                  </div>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="justify-center text-xs text-accent">
                <Link href="/dashboard/settings">View all settings</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Upgrade */}
          <Button variant="outline" size="sm" asChild className="hidden lg:flex h-8 text-xs gap-1 border-primary/30 text-primary hover:bg-primary/5">
            <Link href="/dashboard/settings">
              Upgrade <ArrowUpRight className="w-3 h-3" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}

