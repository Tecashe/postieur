'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { SIDEBAR_SECTIONS, CHANNELS_NAV } from '@/lib/constants'
import { PLATFORMS } from '@/lib/constants'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useUser, useOrganizationList, useClerk, useOrganization } from '@clerk/nextjs'
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
  Check,
  Building2,
} from 'lucide-react'

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { isCollapsed, toggle } = useSidebar()
  const isMobile = useIsMobile()
  const { theme, setTheme } = useTheme()
  const { user } = useUser()
  const { signOut } = useClerk()
  const { userMemberships, setActive } = useOrganizationList({
    userMemberships: { infinite: true },
  })
  const { organization: activeOrg } = useOrganization()

  const collapsed = !isMobile && isCollapsed

  const userInitials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.firstName?.[0]?.toUpperCase() ?? '?'

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  return (
    <TooltipProvider delayDuration={0}>
      <div className={cn(
        'border-r border-border bg-sidebar flex flex-col h-full transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] relative',
        collapsed ? 'w-[72px]' : (isMobile ? 'w-full' : 'w-[248px]')
      )}>
        {/* Header / Logo */}
        <div className={cn('h-16 flex items-center border-b border-border/50 px-4', collapsed && 'justify-center px-0')}>
          <div className="flex items-center gap-3 w-full">
            <div className="w-8 h-8 rounded-sm flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden ring-1 ring-border">
              {activeOrg?.hasImage
                ? <Image src={activeOrg.imageUrl} alt={activeOrg.name} width={32} height={32} className="object-cover" />
                : <Image src="/apple-touch-icon.png" alt="Caelpost Logo" width={32} height={32} className="object-cover" />}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="w-full flex items-center justify-between gap-1 group outline-none">
                      <div className="min-w-0">
                        <p className="font-serif font-normal text-foreground tracking-tight truncate text-base leading-tight text-left">
                          {activeOrg?.name ?? 'Caelpost'}
                        </p>
                        {activeOrg?.slug && (
                          <p className="text-[10px] text-muted-foreground/60 truncate text-left leading-tight">
                            {activeOrg.slug}
                          </p>
                        )}
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 group-hover:text-foreground transition-colors" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    <div className="px-2 py-1.5">
                      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Workspaces</p>
                    </div>
                    {userMemberships?.data?.map((membership) => {
                      const isActiveOrg = membership.organization.id === activeOrg?.id
                      return (
                        <DropdownMenuItem
                          key={membership.organization.id}
                          onClick={() => setActive?.({ organization: membership.organization })}
                          className="flex items-center gap-2"
                        >
                          <div className="w-5 h-5 rounded-sm bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {membership.organization.hasImage
                              ? <Image src={membership.organization.imageUrl} alt={membership.organization.name} width={20} height={20} className="object-cover" />
                              : <Building2 className="w-3 h-3 text-primary" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm truncate">{membership.organization.name}</p>
                            {membership.organization.slug && (
                              <p className="text-[10px] text-muted-foreground truncate">{membership.organization.slug}</p>
                            )}
                          </div>
                          {isActiveOrg && <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
                        </DropdownMenuItem>
                      )
                    })}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/onboarding')} className="text-muted-foreground">
                      + New Workspace
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-3 flex flex-col gap-4">
          {SIDEBAR_SECTIONS.map((section) => (
            <div key={section.title} className="px-2">
              {!collapsed && (
                <p className="px-2 text-[10px] font-medium text-muted-foreground/60 uppercase tracking-widest mb-1.5">
                  {section.title}
                </p>
              )}
              {collapsed && <div className="h-px bg-border/50 my-1.5 mx-2" />}
              <nav className="space-y-px">
                {section.items.map((item) => {
                  const active = isActive(item.href)
                  const Icon = item.icon

                  const LinkContent = (
                    <Link
                      href={item.href}
                      onClick={() => isMobile && onClose()}
                      className={cn(
                        'group flex items-center rounded-sm transition-all duration-150 relative outline-none',
                        collapsed ? 'justify-center h-10 w-10 mx-auto' : 'px-2.5 py-2 w-full',
                        active
                          ? 'bg-primary/8 text-primary'
                          : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                      )}
                    >
                      {active && !collapsed && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-primary rounded-r-full" />
                      )}
                      <div className={cn('flex items-center justify-center', !active && 'group-hover:scale-105 transition-transform duration-150')}>
                        <Icon className={cn('w-4 h-4', active ? 'text-primary' : 'text-muted-foreground/70 group-hover:text-foreground')} />
                      </div>
                      {!collapsed && (
                        <span className={cn('ml-2.5 text-[13px] font-normal flex-1', active && 'font-medium')}>{item.label}</span>
                      )}
                      {!collapsed && item.badge && (
                        <span className="ml-auto text-[10px] font-medium bg-accent/15 text-accent px-1.5 py-0.5 rounded-sm">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  )

                  return collapsed ? (
                    <Tooltip key={item.href}>
                      <TooltipTrigger asChild>{LinkContent}</TooltipTrigger>
                      <TooltipContent side="right" sideOffset={12}>
                        <span>{item.label}</span>
                        {item.badge && <span className="ml-2 text-accent">{item.badge} new</span>}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <div key={item.href}>{LinkContent}</div>
                  )
                })}
              </nav>
            </div>
          ))}

          {/* Connected Channels */}
          <div className="px-2">
            {!collapsed ? (
              <p className="px-2 text-[10px] font-medium text-muted-foreground/60 uppercase tracking-widest mb-1.5">
                Channels
              </p>
            ) : (
              <div className="h-px bg-border/50 my-1.5 mx-2" />
            )}
            <nav className="space-y-px">
              {CHANNELS_NAV.map((channel) => {
                const Icon = PLATFORMS[channel.platform]?.icon || CircleDashed
                const LinkContent = (
                  <Link
                    href={`/dashboard/channels`}
                    onClick={() => isMobile && onClose()}
                    className={cn(
                      'group flex items-center rounded-sm transition-all duration-150 relative outline-none',
                      collapsed ? 'justify-center h-10 w-10 mx-auto' : 'px-2.5 py-1.5 w-full',
                      'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                    )}
                  >
                    <div className="relative flex items-center justify-center">
                      <Icon className="w-[15px] h-[15px] text-muted-foreground/60 group-hover:text-foreground transition-colors" />
                      {channel.live && collapsed && (
                        <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500 ring-[1.5px] ring-sidebar" />
                      )}
                    </div>
                    {!collapsed && (
                      <div className="ml-2.5 flex-1 flex items-center justify-between min-w-0">
                        <span className="text-[12px] truncate">{channel.handle}</span>
                        {channel.live ? (
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0 animate-pulse ml-2" />
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30 flex-shrink-0 ml-2" />
                        )}
                      </div>
                    )}
                  </Link>
                )
                return collapsed ? (
                  <Tooltip key={channel.id}>
                    <TooltipTrigger asChild>{LinkContent}</TooltipTrigger>
                    <TooltipContent side="right" sideOffset={12}>{channel.handle}</TooltipContent>
                  </Tooltip>
                ) : (
                  <div key={channel.id}>{LinkContent}</div>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Footer */}
        <div className="p-2 border-t border-border/50">
          <div className={cn('flex items-center gap-1 mb-1.5', collapsed ? 'flex-col' : '')}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="w-9 h-9 p-0 text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-sm"
                >
                  <Sun className="w-4 h-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute w-4 h-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={12}>Toggle theme</TooltipContent>
            </Tooltip>
            {!isMobile && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggle}
                    className="w-9 h-9 p-0 text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-sm"
                  >
                    {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={12}>
                  {collapsed ? 'Expand' : 'Collapse'}
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={cn(
                'w-full flex items-center gap-2.5 p-2 rounded-sm transition-colors hover:bg-muted/60 outline-none',
                collapsed ? 'justify-center' : ''
              )}>
                <Avatar className="flex-shrink-0 w-7 h-7 border border-border">
                  {user?.imageUrl && (
                    <AvatarImage src={user.imageUrl} alt={user.fullName ?? 'User'} />
                  )}
                  <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-[12px] font-medium text-foreground truncate">
                        {user?.fullName ?? user?.firstName ?? 'User'}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {user?.primaryEmailAddress?.emailAddress ?? ''}
                      </p>
                    </div>
                    <MoreVertical className="w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0" />
                  </>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side={collapsed ? 'right' : 'bottom'} className="w-52" sideOffset={8}>
              <DropdownMenuItem>Profile Settings</DropdownMenuItem>
              <DropdownMenuItem>Billing &amp; Plans</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive focus:bg-destructive/10"
                onClick={() => signOut({ redirectUrl: '/sign-in' })}
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </TooltipProvider>
  )
}
