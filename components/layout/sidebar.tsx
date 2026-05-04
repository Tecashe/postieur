'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { SIDEBAR_SECTIONS, CHANNELS_NAV } from '@/lib/constants'
import { PLATFORMS } from '@/lib/constants'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ChevronDown, MoreVertical, ChevronLeft, ChevronRight } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MOCK_USER } from '@/lib/mock-data'
import { useSidebar } from '@/hooks/use-sidebar'

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { isCollapsed, toggle } = useSidebar()

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/' || pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  return (
    <div className={cn(
      'border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col h-full transition-all duration-300 ease-out',
      isCollapsed ? 'w-20' : 'w-60'
    )}>
      {/* Header / Logo */}
      <div className={cn('border-b border-zinc-200 dark:border-zinc-800', isCollapsed ? 'p-4' : 'p-6')}>
        <div className="flex items-center justify-between">
          <div className={cn('flex items-center gap-2', isCollapsed && 'justify-center w-full')}>
            <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-white flex items-center justify-center flex-shrink-0">
              <span className="text-white dark:text-zinc-900 font-bold text-sm">S</span>
            </div>
            {!isCollapsed && <span className="font-semibold text-zinc-900 dark:text-white">Social</span>}
          </div>
          {!isCollapsed && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Workspace 1</DropdownMenuItem>
                <DropdownMenuItem>Workspace 2</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        {!isCollapsed && <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{MOCK_USER.workspace}</p>}
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700 scrollbar-track-transparent">
        {SIDEBAR_SECTIONS.map((section, idx) => (
          <div key={section.title} className={cn(idx > 0 && 'mt-2')}>
            {!isCollapsed && (
              <div className="px-4 py-3">
                <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  {section.title}
                </p>
              </div>
            )}
            <nav className={cn('space-y-1', isCollapsed ? 'px-1' : 'px-2')}>
              {section.items.map((item) => {
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={isCollapsed ? item.label : undefined}
                    className={cn(
                      'rounded-lg transition-all duration-150 flex items-center justify-center',
                      isCollapsed ? 'w-12 h-10 px-3 py-2' : 'px-3 py-2 text-sm gap-2',
                      active
                        ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-medium'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                    )}
                  >
                    {!isCollapsed && item.label}
                  </Link>
                )
              })}
            </nav>
          </div>
        ))}

        {/* Channels Section */}
        {!isCollapsed && (
          <div className="mt-4">
            <div className="px-4 py-3">
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Channels
              </p>
            </div>
            <nav className="space-y-1 px-2">
              {CHANNELS_NAV.map((channel) => {
                const Icon = PLATFORMS[channel.platform].icon
                return (
                  <Link
                    key={channel.id}
                    href={`/channels/${channel.id}`}
                    className={cn(
                      'px-3 py-2 rounded-lg text-sm transition-all duration-150 flex items-center gap-2 group',
                      'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                    )}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="flex-1 truncate">{channel.handle}</span>
                    {channel.live && (
                      <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 group-hover:animate-pulse" />
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>
        )}
      </div>

      {/* Footer / User and Toggle */}
      <div className="border-t border-zinc-200 dark:border-zinc-800 p-3 space-y-2">
        {!isCollapsed && (
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarFallback className="bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white text-xs font-semibold">
                {MOCK_USER.initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">{MOCK_USER.name}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{MOCK_USER.email}</p>
            </div>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggle}
          className={cn(
            'w-full transition-all duration-300 flex items-center justify-center gap-2',
            isCollapsed ? 'h-10' : 'h-10 justify-start px-3'
          )}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span className="text-sm">Collapse</span>
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
