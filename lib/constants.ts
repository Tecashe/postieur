import { LucideIcon, Instagram, Linkedin, Twitter, Facebook, Music2, Youtube, PinIcon, Dribbble } from 'lucide-react'
import { Platform } from './types'

export const PLATFORMS: Record<Platform, { name: string; icon: LucideIcon; color: string; handle?: string }> = {
  instagram: {
    name: 'Instagram',
    icon: Instagram,
    color: 'bg-pink-500',
  },
  linkedin: {
    name: 'LinkedIn',
    icon: Linkedin,
    color: 'bg-blue-600',
  },
  x: {
    name: 'X (Twitter)',
    icon: Twitter,
    color: 'bg-black',
  },
  facebook: {
    name: 'Facebook',
    icon: Facebook,
    color: 'bg-blue-600',
  },
  tiktok: {
    name: 'TikTok',
    icon: Music2,
    color: 'bg-black',
  },
  youtube: {
    name: 'YouTube',
    icon: Youtube,
    color: 'bg-red-600',
  },
  pinterest: {
    name: 'Pinterest',
    icon: PinIcon,
    color: 'bg-red-600',
  },
  bluesky: {
    name: 'Bluesky',
    icon: Dribbble,
    color: 'bg-blue-400',
  },
}

export const POST_STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  scheduled: {
    bg: 'bg-blue-50 dark:bg-blue-950',
    text: 'text-blue-700 dark:text-blue-200',
    border: 'border-blue-200 dark:border-blue-800',
  },
  published: {
    bg: 'bg-emerald-50 dark:bg-emerald-950',
    text: 'text-emerald-700 dark:text-emerald-200',
    border: 'border-emerald-200 dark:border-emerald-800',
  },
  pending: {
    bg: 'bg-amber-50 dark:bg-amber-950',
    text: 'text-amber-700 dark:text-amber-200',
    border: 'border-amber-200 dark:border-amber-800',
  },
  draft: {
    bg: 'bg-zinc-100 dark:bg-zinc-800',
    text: 'text-zinc-700 dark:text-zinc-300',
    border: 'border-zinc-200 dark:border-zinc-700',
  },
  failed: {
    bg: 'bg-red-50 dark:bg-red-950',
    text: 'text-red-700 dark:text-red-200',
    border: 'border-red-200 dark:border-red-800',
  },
}

export const TIMEZONES = [
  'UTC',
  'EST',
  'CST',
  'MST',
  'PST',
  'GMT',
  'CET',
  'IST',
  'JST',
  'AEST',
]

export const DATE_FORMATS = {
  full: 'EEEE, MMMM d, yyyy',
  date: 'MMM d, yyyy',
  time: 'h:mm a',
  dateTime: 'MMM d, yyyy h:mm a',
}

export const CHANNELS_NAV = [
  {
    id: 'instagram',
    name: 'Instagram',
    platform: 'instagram' as Platform,
    handle: '@company.pro',
    icon: 'instagram',
    live: true,
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    platform: 'linkedin' as Platform,
    handle: 'company-page',
    icon: 'linkedin',
    live: true,
  },
  {
    id: 'twitter',
    name: 'X',
    platform: 'x' as Platform,
    handle: '@company',
    icon: 'twitter',
    live: false,
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    platform: 'tiktok' as Platform,
    handle: '@company',
    icon: 'music2',
    live: true,
  },
  {
    id: 'youtube',
    name: 'YouTube',
    platform: 'youtube' as Platform,
    handle: '@company',
    icon: 'youtube',
    live: false,
  },
]

export const SIDEBAR_SECTIONS = [
  {
    title: 'WORKSPACE',
    items: [
      { label: 'Dashboard', href: '/', icon: 'LayoutDashboard' },
      { label: 'Calendar', href: '/calendar', icon: 'CalendarDays' },
      { label: 'Compose', href: '/compose', icon: 'PenSquare' },
      { label: 'Queue', href: '/queue', icon: 'ListOrdered' },
      { label: 'Analytics', href: '/analytics', icon: 'BarChart3' },
    ],
  },
  {
    title: 'LIBRARY',
    items: [
      { label: 'Media Library', href: '/media', icon: 'Image' },
      { label: 'Templates', href: '/templates', icon: 'LayoutTemplate' },
      { label: 'Drafts', href: '/drafts', icon: 'FileEdit' },
    ],
  },
  {
    title: 'SETTINGS',
    items: [
      { label: 'Channels', href: '/channels', icon: 'Radio' },
      { label: 'Members', href: '/members', icon: 'Users' },
      { label: 'Settings', href: '/settings', icon: 'Settings' },
    ],
  },
]
