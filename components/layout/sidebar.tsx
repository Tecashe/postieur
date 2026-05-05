'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { SIDEBAR_SECTIONS, CHANNELS_NAV } from '@/lib/constants'
import { PLATFORMS } from '@/lib/constants'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { MOCK_USER } from '@/lib/mock-data'
import { useSidebar } from '@/hooks/use-sidebar'
import { useIsMobile } from '@/hooks/use-mobile'

import {
  ChevronDown,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  CircleDashed,
} from 'lucide-react'

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { isCollapsed, toggle } = useSidebar()
  const isMobile = useIsMobile()
  const { theme, setTheme } = useTheme()

  const collapsed = !isMobile && isCollapsed

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  return (
    <TooltipProvider delayDuration={0}>
      <div className={cn(
        'border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#09090b] flex flex-col h-full transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] relative',
        collapsed ? 'w-[80px]' : (isMobile ? 'w-full' : 'w-[260px]')
      )}>
        {/* Header / Logo */}
        <div className={cn('h-16 flex items-center border-b border-zinc-200/50 dark:border-zinc-800/50 px-4', collapsed && 'justify-center')}>
          <div className="flex items-center gap-3 w-full">
            <div className="w-8 h-8 rounded-xl bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center flex-shrink-0 shadow-sm ring-1 ring-zinc-900/10 dark:ring-white/10">
              <span className="text-white dark:text-zinc-900 font-bold text-sm">P</span>
            </div>
            {!collapsed && (
              <div className="flex-1 flex items-center justify-between min-w-0">
                <span className="font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight truncate">Caelpost</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg ml-1">
                      <ChevronDown className="w-4 h-4 text-zinc-500" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 rounded-xl">
                    <DropdownMenuItem className="rounded-lg">Workspace 1</DropdownMenuItem>
                    <DropdownMenuItem className="rounded-lg">Workspace 2</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800 scrollbar-track-transparent py-4 flex flex-col gap-6">
          {SIDEBAR_SECTIONS.map((section) => (
            <div key={section.title} className="px-3">
              {!collapsed && (
                <p className="px-3 text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
                  {section.title}
                </p>
              )}
              <nav className="space-y-0.5">
                {section.items.map((item) => {
                  const active = isActive(item.href)
                  const Icon = item.icon

                  const LinkContent = (
                    <Link
                      href={item.href}
                      onClick={() => isMobile && onClose()}
                      className={cn(
                        'group flex items-center rounded-xl transition-all duration-200 relative outline-none',
                        collapsed ? 'justify-center h-12 w-12 mx-auto' : 'px-3 py-2.5 w-full',
                        active
                          ? 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-50 font-medium'
                          : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-200'
                      )}
                    >
                      {active && !collapsed && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-zinc-900 dark:bg-white rounded-r-full" />
                      )}
                      
                      <div className={cn(
                        'flex items-center justify-center transition-transform duration-200',
                        !active && 'group-hover:scale-110'
                      )}>
                        <Icon className={cn('w-[18px] h-[18px]', active ? 'text-zinc-900 dark:text-zinc-50' : 'text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-300')} />
                      </div>
                      
                      {!collapsed && (
                        <span className="ml-3 text-sm">{item.label}</span>
                      )}
                    </Link>
                  )

                  return collapsed ? (
                    <Tooltip key={item.href}>
                      <TooltipTrigger asChild>
                        {LinkContent}
                      </TooltipTrigger>
                      <TooltipContent side="right" sideOffset={10} className="font-medium rounded-lg">
                        {item.label}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <div key={item.href}>{LinkContent}</div>
                  )
                })}
              </nav>
            </div>
          ))}

          {/* Channels Section */}
          <div className="px-3 mt-2">
            {!collapsed && (
              <p className="px-3 text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
                Channels
              </p>
            )}
            <nav className="space-y-0.5">
              {CHANNELS_NAV.map((channel) => {
                const Icon = PLATFORMS[channel.platform]?.icon || CircleDashed
                
                const LinkContent = (
                  <Link
                    href={`/dashboard/channels/${channel.id}`}
                    onClick={() => isMobile && onClose()}
                    className={cn(
                      'group flex items-center rounded-xl transition-all duration-200 relative outline-none',
                      collapsed ? 'justify-center h-12 w-12 mx-auto' : 'px-3 py-2.5 w-full',
                      'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-200'
                    )}
                  >
                    <div className="relative flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
                      <Icon className="w-[18px] h-[18px] text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-300" />
                      {channel.live && collapsed && (
                        <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#09090b]" />
                      )}
                    </div>
                    
                    {!collapsed && (
                      <div className="ml-3 flex-1 flex items-center justify-between min-w-0">
                        <span className="text-sm truncate">{channel.handle}</span>
                        {channel.live && (
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0 animate-pulse ml-2" />
                        )}
                      </div>
                    )}
                  </Link>
                )

                return collapsed ? (
                  <Tooltip key={channel.id}>
                    <TooltipTrigger asChild>
                      {LinkContent}
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={10} className="font-medium rounded-lg">
                      {channel.handle}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <div key={channel.id}>{LinkContent}</div>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-zinc-200/50 dark:border-zinc-800/50">
          <div className={cn('flex items-center gap-1 mb-2', collapsed ? 'flex-col' : '')}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className={cn(
                    'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all duration-200',
                    collapsed ? 'w-10 h-10 p-0 mb-1' : 'w-10 h-10 p-0'
                  )}
                >
                  <Sun className="w-[18px] h-[18px] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute w-[18px] h-[18px] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={10} className="rounded-lg">
                Toggle theme
              </TooltipContent>
            </Tooltip>

            {!isMobile && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggle}
                    className={cn(
                      'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all duration-200',
                      collapsed ? 'w-10 h-10 p-0' : 'w-10 h-10 p-0'
                    )}
                  >
                    {collapsed ? <ChevronRight className="w-[18px] h-[18px]" /> : <ChevronLeft className="w-[18px] h-[18px]" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={10} className="rounded-lg">
                  {collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={cn(
                'w-full flex items-center gap-3 p-2 rounded-xl transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800/80 outline-none',
                collapsed ? 'justify-center' : ''
              )}>
                <Avatar className={cn("flex-shrink-0 border border-zinc-200 dark:border-zinc-800", collapsed ? 'w-10 h-10' : 'w-9 h-9')}>
                  <AvatarFallback className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                    {MOCK_USER.initials}
                  </AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{MOCK_USER.name}</p>
                      <p className="text-[11px] text-zinc-500 truncate">{MOCK_USER.email}</p>
                    </div>
                    <MoreVertical className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                  </>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side={collapsed ? "right" : "bottom"} className="w-56 rounded-xl" sideOffset={10}>
              <DropdownMenuItem className="rounded-lg cursor-pointer">Profile Settings</DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg cursor-pointer">Billing</DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg cursor-pointer text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-950 focus:text-red-600">Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </TooltipProvider>
  )
}
