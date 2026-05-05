'use client'

import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Bell, Menu, Search, Settings2, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

interface HeaderProps {
  onSidebarToggle: () => void
}

const BREADCRUMBS: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/calendar': 'Calendar',
  '/dashboard/compose': 'Compose',
  '/dashboard/queue': 'Queue',
  '/dashboard/analytics': 'Analytics',
  '/dashboard/media': 'Media Library',
  '/dashboard/channels': 'Channels',
  '/dashboard/members': 'Members',
  '/dashboard/settings': 'Settings',
  '/dashboard/drafts': 'Drafts',
  '/dashboard/templates': 'Templates',
}

export function Header({ onSidebarToggle }: HeaderProps) {
  const pathname = usePathname()
  const title = BREADCRUMBS[pathname as keyof typeof BREADCRUMBS] || 'Dashboard'

  return (
    <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-10">
      <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left: Menu + Title */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden h-8 w-8 p-0"
            onClick={onSidebarToggle}
          >
            <Menu className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-lg font-light text-zinc-900 dark:text-white">{title}</h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Manage your social presence</p>
          </div>
        </div>

        {/* Right: Search + Notif + Upgrade + Menu */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="hidden sm:block relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <Input
              placeholder="Search posts..."
              className="w-48 pl-9 h-9 border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm"
            />
          </div>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 relative">
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
                <p className="text-sm font-medium">Notifications</p>
              </div>
              <DropdownMenuItem>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Post published successfully</p>
                  <p className="text-xs text-zinc-500">2 hours ago</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div className="space-y-1">
                  <p className="text-sm font-medium">New comment on your post</p>
                  <p className="text-xs text-zinc-500">4 hours ago</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Scheduled post queued</p>
                  <p className="text-xs text-zinc-500">1 day ago</p>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Upgrade Button */}
          <Button
            variant="outline"
            size="sm"
            asChild
            className="hidden sm:flex gap-1 border-zinc-200 dark:border-zinc-700"
          >
            <Link href="/upgrade">
              Upgrade <ArrowUpRight className="w-3 h-3" />
            </Link>
          </Button>

          {/* Settings Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Settings2 className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Account Settings</DropdownMenuItem>
              <DropdownMenuItem>Preferences</DropdownMenuItem>
              <DropdownMenuItem>Keyboard Shortcuts</DropdownMenuItem>
              <DropdownMenuItem>Help & Support</DropdownMenuItem>
              <DropdownMenuItem>Sign Out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
