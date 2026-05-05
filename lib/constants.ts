import {
  LucideIcon, Instagram, Linkedin, Twitter, Facebook, Music2,
  Youtube, PinIcon, Dribbble, MessageSquare, MessageCircle,
  Hash, Send, BookOpen, Code, FileText, Globe, AtSign, Share2,
  Tv, Camera, Phone, Zap, Rocket,
  LayoutDashboard, CalendarDays, PenLine, ListOrdered, BarChart3,
  ImageIcon, LayoutTemplate, FilePen, Radio, Users, Settings,
  Inbox, Target, Link2, Sparkles, Rss, Key, Bot, Palette,
} from 'lucide-react'
import { Platform } from './types'

export const PLATFORMS: Record<Platform, { name: string; icon: LucideIcon; color: string; colorHex: string }> = {
  instagram: { name: 'Instagram',   icon: Instagram,      color: 'bg-pink-500',    colorHex: '#E4405F' },
  linkedin:  { name: 'LinkedIn',    icon: Linkedin,       color: 'bg-blue-600',    colorHex: '#0A66C2' },
  x:         { name: 'X (Twitter)', icon: Twitter,        color: 'bg-zinc-900',    colorHex: '#000000' },
  facebook:  { name: 'Facebook',    icon: Facebook,       color: 'bg-blue-700',    colorHex: '#1877F2' },
  tiktok:    { name: 'TikTok',      icon: Music2,         color: 'bg-zinc-900',    colorHex: '#010101' },
  youtube:   { name: 'YouTube',     icon: Youtube,        color: 'bg-red-600',     colorHex: '#FF0000' },
  pinterest: { name: 'Pinterest',   icon: PinIcon,        color: 'bg-red-500',     colorHex: '#E60023' },
  bluesky:   { name: 'Bluesky',     icon: Dribbble,       color: 'bg-sky-500',     colorHex: '#0085FF' },
  discord:   { name: 'Discord',     icon: MessageSquare,  color: 'bg-indigo-500',  colorHex: '#5865F2' },
  reddit:    { name: 'Reddit',      icon: MessageCircle,  color: 'bg-orange-500',  colorHex: '#FF4500' },
  threads:   { name: 'Threads',     icon: AtSign,         color: 'bg-zinc-800',    colorHex: '#101010' },
  mastodon:  { name: 'Mastodon',    icon: Globe,          color: 'bg-violet-600',  colorHex: '#6364FF' },
  telegram:  { name: 'Telegram',    icon: Send,           color: 'bg-sky-400',     colorHex: '#26A5E4' },
  slack:     { name: 'Slack',       icon: Hash,           color: 'bg-yellow-600',  colorHex: '#4A154B' },
  medium:    { name: 'Medium',      icon: BookOpen,       color: 'bg-zinc-900',    colorHex: '#000000' },
  devto:     { name: 'Dev.to',      icon: Code,           color: 'bg-zinc-900',    colorHex: '#0A0A0A' },
  hashnode:  { name: 'Hashnode',    icon: FileText,       color: 'bg-blue-500',    colorHex: '#2962FF' },
  wordpress: { name: 'WordPress',   icon: Globe,          color: 'bg-blue-700',    colorHex: '#21759B' },
  dribbble:  { name: 'Dribbble',    icon: Dribbble,       color: 'bg-pink-400',    colorHex: '#EA4C89' },
  warpcast:  { name: 'Warpcast',    icon: Rocket,         color: 'bg-purple-600',  colorHex: '#8A63D2' },
  vk:        { name: 'VK',          icon: Share2,         color: 'bg-blue-500',    colorHex: '#0077FF' },
  nostr:     { name: 'Nostr',       icon: Zap,            color: 'bg-yellow-500',  colorHex: '#F7931A' },
  twitch:    { name: 'Twitch',      icon: Tv,             color: 'bg-purple-500',  colorHex: '#9146FF' },
  snapchat:  { name: 'Snapchat',    icon: Camera,         color: 'bg-yellow-400',  colorHex: '#FFFC00' },
}

export const PLATFORM_CHAR_LIMITS: Partial<Record<Platform, number>> = {
  x: 280,
  instagram: 2200,
  facebook: 63206,
  linkedin: 3000,
  tiktok: 2200,
  youtube: 5000,
  threads: 500,
  mastodon: 500,
  bluesky: 300,
  discord: 2000,
  reddit: 40000,
  telegram: 4096,
  slack: 40000,
  medium: 100000,
  devto: 100000,
  hashnode: 100000,
  wordpress: 100000,
}

export const POST_STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  scheduled: {
    bg: 'bg-blue-50 dark:bg-blue-950/50',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800',
  },
  published: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/50',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800',
  },
  pending: {
    bg: 'bg-amber-50 dark:bg-amber-950/50',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800',
  },
  draft: {
    bg: 'bg-muted',
    text: 'text-muted-foreground',
    border: 'border-border',
  },
  failed: {
    bg: 'bg-destructive/10',
    text: 'text-destructive',
    border: 'border-destructive/30',
  },
}

export const TIMEZONES = [
  'UTC', 'EST', 'CST', 'MST', 'PST', 'GMT', 'CET', 'IST', 'JST', 'AEST',
]

export const DATE_FORMATS = {
  full: 'EEEE, MMMM d, yyyy',
  date: 'MMM d, yyyy',
  time: 'h:mm a',
  dateTime: 'MMM d, yyyy h:mm a',
}

export const CHANNELS_NAV = [
  { id: 'instagram', platform: 'instagram' as Platform, handle: '@company.pro', live: true },
  { id: 'linkedin', platform: 'linkedin' as Platform, handle: 'company-page', live: true },
  { id: 'twitter', platform: 'x' as Platform, handle: '@company', live: false },
  { id: 'tiktok', platform: 'tiktok' as Platform, handle: '@company', live: true },
  { id: 'youtube', platform: 'youtube' as Platform, handle: '@company', live: false },
]

export const SIDEBAR_SECTIONS: { title: string; items: { label: string; href: string; icon: LucideIcon; badge?: string }[] }[] = [
  {
    title: 'WORKSPACE',
    items: [
      { label: 'Dashboard',  href: '/dashboard',           icon: LayoutDashboard },
      { label: 'Calendar',   href: '/dashboard/calendar',  icon: CalendarDays },
      { label: 'Compose',    href: '/dashboard/compose',   icon: PenLine },
      { label: 'Queue',      href: '/dashboard/queue',     icon: ListOrdered },
      { label: 'Analytics',  href: '/dashboard/analytics', icon: BarChart3 },
      { label: 'Inbox',      href: '/dashboard/inbox',     icon: Inbox, badge: '3' },
    ],
  },
  {
    title: 'GROW',
    items: [
      { label: 'Campaigns',   href: '/dashboard/campaigns',    icon: Target },
      { label: 'Link in Bio', href: '/dashboard/link-in-bio',  icon: Link2 },
      { label: 'AI Studio',   href: '/dashboard/ai-studio',    icon: Sparkles },
      { label: 'AI Agent',    href: '/dashboard/ai-agent',     icon: Bot },
    ],
  },
  {
    title: 'AUTOMATE',
    items: [
      { label: 'Plugs',          href: '/dashboard/plugs', icon: Zap },
      { label: 'RSS Auto-post',  href: '/dashboard/rss',   icon: Rss },
      { label: 'API & Webhooks', href: '/dashboard/api',   icon: Key },
    ],
  },
  {
    title: 'LIBRARY',
    items: [
      { label: 'Media Library', href: '/dashboard/media',      icon: ImageIcon },
      { label: 'Templates',     href: '/dashboard/templates',  icon: LayoutTemplate },
      { label: 'Drafts',        href: '/dashboard/drafts',     icon: FilePen },
      { label: 'Design Studio', href: '/dashboard/design',     icon: Palette },
    ],
  },
  {
    title: 'SETTINGS',
    items: [
      { label: 'Channels', href: '/dashboard/channels', icon: Radio },
      { label: 'Members',  href: '/dashboard/members',  icon: Users },
      { label: 'Settings', href: '/dashboard/settings', icon: Settings },
    ],
  },
]

