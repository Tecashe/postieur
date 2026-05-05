'use client'

import { Heart, MessageCircle, Repeat2, Bookmark, BarChart2, Share2, ThumbsUp, Send, Image as ImageIcon, MoreHorizontal, Globe, Plus, PlayCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Types ─────────────────────────────────────────────────────────────────────

interface PreviewProps {
  content: string
  handle: string
  displayName?: string
  avatar?: string
  mediaFiles?: string[]
  threadPosts?: string[]
  isThread?: boolean
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function RichText({ text, linkColor = '#1d9bf0' }: { text: string; linkColor?: string }) {
  if (!text) return <span className="opacity-40">Nothing to preview yet…</span>
  const tokens = text.split(/(\s+)/g)
  return (
    <>
      {tokens.map((token, i) => {
        if (token.startsWith('#') || token.startsWith('@')) {
          return <span key={i} style={{ color: linkColor }}>{token}</span>
        }
        if (/^https?:\/\//.test(token)) {
          return <span key={i} style={{ color: linkColor }} className="underline decoration-1">{token}</span>
        }
        return <span key={i}>{token}</span>
      })}
    </>
  )
}

function TimeAgo() {
  return <span>Just now</span>
}

function MediaGrid({ files }: { files: string[] }) {
  if (!files.length) return null
  return (
    <div className={cn('mt-2 rounded-xl overflow-hidden grid gap-0.5', files.length === 1 ? 'grid-cols-1' : 'grid-cols-2')}>
      {files.slice(0, 4).map((_, i) => (
        <div key={i} className="aspect-square bg-muted flex items-center justify-center">
          <ImageIcon className="w-6 h-6 text-muted-foreground/50" />
        </div>
      ))}
    </div>
  )
}

// ── X (Twitter) Preview ───────────────────────────────────────────────────────

export function XPreview({ content, handle, displayName, avatar, mediaFiles = [], isThread, threadPosts = [] }: PreviewProps) {
  const posts = isThread && threadPosts.length > 0 ? threadPosts : [content]
  const name = displayName || handle.replace('@', '')

  return (
    <div className="bg-white dark:bg-black rounded-xl border border-[#2f3336] overflow-hidden font-[system-ui,-apple-system] text-[#0f1419] dark:text-[#e7e9ea] w-full">
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-[#2f3336]/30">
        <span className="text-[13px] font-bold text-[#0f1419] dark:text-white">Post Preview</span>
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current text-[#0f1419] dark:text-white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
      </div>

      {/* Thread or single post */}
      <div className="divide-y divide-[#2f3336]/20">
        {posts.map((post, idx) => (
          <div key={idx} className="px-4 py-3 flex gap-3">
            {/* Avatar + thread line */}
            <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 flex items-center justify-center text-sm font-semibold text-white flex-shrink-0">
                {name[0]?.toUpperCase()}
              </div>
              {isThread && idx < posts.length - 1 && (
                <div className="w-0.5 flex-1 min-h-4 bg-[#2f3336] mt-1" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              {/* Name row */}
              <div className="flex items-center gap-1 flex-wrap mb-1">
                <span className="text-[15px] font-bold text-[#0f1419] dark:text-white truncate">{name}</span>
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#1d9bf0] flex-shrink-0"><path fill="currentColor" d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91-1.01-1.01-2.52-1.27-3.91-.81C14.67 2.88 13.43 2 12 2s-2.67.88-3.34 2.19c-1.39-.46-2.9-.2-3.91.81-1.01 1.01-1.27 2.52-.81 3.91C2.88 9.33 2 10.57 2 12s.88 2.67 2.19 3.34c-.46 1.39-.2 2.9.81 3.91 1.01 1.01 2.52 1.27 3.91.81C9.33 21.12 10.57 22 12 22s2.67-.88 3.34-2.19c1.39.46 2.9.2 3.91-.81 1.01-1.01 1.27-2.52.81-3.91C21.12 14.67 22 13.43 22 12zm-6.44-3.56L10.41 14.7l-2.4-2.4a1 1 0 0 0-1.41 1.41l3.1 3.1a1 1 0 0 0 1.41 0l6.1-6.86a1 1 0 0 0-1.65-1.01z" /></svg>
                <span className="text-[15px] text-[#536471] dark:text-[#71767b]">{handle} · <TimeAgo /></span>
              </div>

              {/* Content */}
              <p className="text-[15px] leading-normal whitespace-pre-wrap break-words mb-2">
                <RichText text={post} linkColor="#1d9bf0" />
              </p>

              {/* Media */}
              {idx === 0 && <MediaGrid files={mediaFiles} />}

              {/* Actions */}
              <div className="flex items-center justify-between mt-3 text-[#536471] dark:text-[#71767b] max-w-[280px]">
                {[
                  { icon: <MessageCircle className="w-4 h-4" />, val: '12' },
                  { icon: <Repeat2 className="w-4 h-4" />, val: '48' },
                  { icon: <Heart className="w-4 h-4" />, val: '241' },
                  { icon: <BarChart2 className="w-4 h-4" />, val: '3.2K' },
                  { icon: <Bookmark className="w-4 h-4" />, val: '' },
                  { icon: <Share2 className="w-4 h-4" />, val: '' },
                ].map((action, i) => (
                  <button key={i} className="flex items-center gap-1 text-xs hover:text-[#1d9bf0] transition-colors group">
                    <span className="group-hover:bg-[#1d9bf0]/10 p-1.5 rounded-full transition-colors">{action.icon}</span>
                    {action.val && <span>{action.val}</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── LinkedIn Preview ───────────────────────────────────────────────────────────

export function LinkedInPreview({ content, handle, displayName, mediaFiles = [] }: PreviewProps) {
  const name = displayName || handle.replace('@', '').replace(/-/g, ' ')
  const isLong = content.length > 300
  const visible = isLong ? content.slice(0, 300) + '…' : content

  return (
    <div className="bg-white dark:bg-[#1b1f23] rounded-xl border border-[#e0e0e0] dark:border-[#38434f] overflow-hidden font-[system-ui] text-[#000000e6] dark:text-[#ffffffcc] w-full">
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 flex items-center justify-center text-base font-bold text-white flex-shrink-0">
          {name[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold text-[#000000e6] dark:text-white leading-tight">{name}</p>
          <p className="text-[12px] text-[#666666] dark:text-[#aaaaaa] leading-tight">Social Media Manager · 2nd</p>
          <p className="text-[12px] text-[#666666] dark:text-[#aaaaaa] flex items-center gap-1"><TimeAgo /> · <Globe className="w-3 h-3" /></p>
        </div>
        <button className="text-[#0a66c2] text-[14px] font-semibold flex items-center gap-1"><Plus className="w-4 h-4" />Follow</button>
        <MoreHorizontal className="w-5 h-5 text-[#666666]" />
      </div>

      {/* Content */}
      <div className="px-4 pb-3 text-[14px] leading-relaxed whitespace-pre-wrap break-words">
        {content ? (
          <>
            <RichText text={visible} linkColor="#0a66c2" />
            {isLong && <button className="text-[#666666] dark:text-[#aaaaaa] hover:text-[#0a66c2] font-semibold ml-1">…see more</button>}
          </>
        ) : (
          <span className="opacity-40">Nothing to preview yet…</span>
        )}
      </div>

      {/* Media */}
      {mediaFiles.length > 0 && (
        <div className="border-t border-[#e0e0e0] dark:border-[#38434f]">
          <div className="aspect-video bg-muted flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-muted-foreground/50" />
          </div>
        </div>
      )}

      {/* Reactions */}
      <div className="px-4 py-1.5 flex items-center justify-between text-[12px] text-[#666666] dark:text-[#aaaaaa] border-t border-[#e0e0e0] dark:border-[#38434f]">
        <span className="flex items-center gap-1">
          <span className="flex">
            {['👍','❤️','💡'].map((e,i) => (
              <span key={i} className="w-4 h-4 rounded-full border border-white dark:border-[#1b1f23] -ml-1 first:ml-0 text-[10px] flex items-center justify-center bg-blue-500">{e}</span>
            ))}
          </span>
          <span className="ml-1">241 reactions</span>
        </span>
        <span>48 comments · 12 reposts</span>
      </div>

      {/* Action row */}
      <div className="px-2 py-1 flex items-center justify-around border-t border-[#e0e0e0] dark:border-[#38434f]">
        {[
          { icon: <ThumbsUp className="w-4 h-4" />, label: 'Like' },
          { icon: <MessageCircle className="w-4 h-4" />, label: 'Comment' },
          { icon: <Repeat2 className="w-4 h-4" />, label: 'Repost' },
          { icon: <Send className="w-4 h-4" />, label: 'Send' },
        ].map((a) => (
          <button key={a.label} className="flex items-center gap-1.5 px-3 py-2 rounded text-[13px] font-semibold text-[#666666] dark:text-[#aaaaaa] hover:bg-[#f3f2ef] dark:hover:bg-[#2b2f33] transition-colors">
            {a.icon} {a.label}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Instagram Preview ─────────────────────────────────────────────────────────

export function InstagramPreview({ content, handle, displayName, mediaFiles = [] }: PreviewProps) {
  const name = displayName || handle.replace('@', '')

  return (
    <div className="bg-white dark:bg-[#000] rounded-xl border border-[#dbdbdb] dark:border-[#262626] overflow-hidden font-[system-ui] text-[#000] dark:text-white w-full">
      {/* Header */}
      <div className="px-3 py-2.5 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full p-0.5 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 flex-shrink-0">
          <div className="w-full h-full rounded-full bg-white dark:bg-[#000] flex items-center justify-center text-xs font-bold">
            {name[0]?.toUpperCase()}
          </div>
        </div>
        <div className="flex-1">
          <p className="text-[13px] font-semibold leading-none">{handle}</p>
          <p className="text-[11px] text-[#8e8e8e] leading-none mt-0.5">Sponsored</p>
        </div>
        <MoreHorizontal className="w-5 h-5 text-[#262626] dark:text-white" />
      </div>

      {/* Media */}
      <div className="aspect-square bg-gradient-to-br from-muted to-muted/50 flex flex-col items-center justify-center border-y border-[#dbdbdb] dark:border-[#262626]">
        {mediaFiles.length > 0 ? (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <ImageIcon className="w-10 h-10 text-muted-foreground/40" />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground/50">
            <ImageIcon className="w-10 h-10" />
            <p className="text-xs">Add media</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-3 py-2 flex items-center gap-3">
        <Heart className="w-6 h-6 text-[#262626] dark:text-white" />
        <MessageCircle className="w-6 h-6 text-[#262626] dark:text-white" />
        <Send className="w-6 h-6 text-[#262626] dark:text-white" />
        <Bookmark className="w-6 h-6 text-[#262626] dark:text-white ml-auto" />
      </div>

      {/* Likes */}
      <div className="px-3 pb-1 text-[13px] font-semibold text-[#000] dark:text-white">
        241 likes
      </div>

      {/* Caption */}
      <div className="px-3 pb-3 text-[14px] leading-normal">
        {content ? (
          <><span className="font-semibold mr-1">{handle}</span>
          <RichText text={content.slice(0, 200) + (content.length > 200 ? '…' : '')} linkColor="#00376b" /></>
        ) : (
          <span className="opacity-40">{handle} Caption will appear here…</span>
        )}
      </div>
    </div>
  )
}

// ── Facebook Preview ──────────────────────────────────────────────────────────

export function FacebookPreview({ content, handle, displayName, mediaFiles = [] }: PreviewProps) {
  const name = displayName || handle

  return (
    <div className="bg-white dark:bg-[#242526] rounded-xl border border-[#dddfe2] dark:border-[#3a3b3c] overflow-hidden font-[system-ui] text-[#050505] dark:text-[#e4e6eb] w-full shadow-sm">
      <div className="px-4 py-3 flex items-center gap-2.5">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 flex items-center justify-center font-bold text-white flex-shrink-0">
          {name[0]?.toUpperCase()}
        </div>
        <div className="flex-1">
          <p className="text-[15px] font-semibold">{name}</p>
          <p className="text-[12px] text-[#65676b] dark:text-[#b0b3b8] flex items-center gap-1"><TimeAgo /> · <Globe className="w-3 h-3" /></p>
        </div>
        <MoreHorizontal className="w-5 h-5 text-[#65676b] dark:text-[#b0b3b8]" />
      </div>

      {content ? (
        <div className="px-4 pb-3 text-[15px] leading-relaxed whitespace-pre-wrap break-words">
          <RichText text={content.slice(0, 500)} linkColor="#1877f2" />
        </div>
      ) : (
        <div className="px-4 pb-3 text-[15px] opacity-40">Nothing to preview yet…</div>
      )}

      {mediaFiles.length > 0 && (
        <div className="aspect-video bg-muted flex items-center justify-center">
          <ImageIcon className="w-8 h-8 text-muted-foreground/50" />
        </div>
      )}

      {/* Reaction summary */}
      <div className="px-4 py-1.5 flex items-center justify-between text-[13px] text-[#65676b] dark:text-[#b0b3b8] border-t border-[#dddfe2] dark:border-[#3a3b3c]">
        <span className="flex items-center gap-1">👍❤️😂 <span className="ml-1">241</span></span>
        <span>48 comments · 12 shares</span>
      </div>

      {/* Action row */}
      <div className="px-2 py-0.5 flex items-center justify-around border-t border-[#dddfe2] dark:border-[#3a3b3c]">
        {[
          { icon: <ThumbsUp className="w-4 h-4" />, label: 'Like' },
          { icon: <MessageCircle className="w-4 h-4" />, label: 'Comment' },
          { icon: <Share2 className="w-4 h-4" />, label: 'Share' },
        ].map((a) => (
          <button key={a.label} className="flex items-center gap-2 px-4 py-2.5 rounded text-[13px] font-semibold text-[#65676b] dark:text-[#b0b3b8] hover:bg-[#f2f2f2] dark:hover:bg-[#3a3b3c] transition-colors flex-1 justify-center">
            {a.icon} {a.label}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Threads Preview ───────────────────────────────────────────────────────────

export function ThreadsPreview({ content, handle, displayName, mediaFiles = [] }: PreviewProps) {
  const name = displayName || handle.replace('@', '')

  return (
    <div className="bg-white dark:bg-[#101010] rounded-xl border border-[#e0e0e0] dark:border-[#333333] overflow-hidden font-[system-ui] text-[#000] dark:text-white w-full">
      <div className="px-4 py-3 flex gap-3">
        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 flex items-center justify-center text-sm font-bold text-white">
            {name[0]?.toUpperCase()}
          </div>
          <div className="w-0.5 flex-1 min-h-8 bg-[#e0e0e0] dark:bg-[#333333]" />
          <div className="w-5 h-5 rounded-full bg-[#e0e0e0] dark:bg-[#333333] flex items-center justify-center">
            <Plus className="w-3 h-3 text-[#666666] dark:text-[#aaaaaa]" />
          </div>
        </div>
        <div className="flex-1 pb-3 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[15px] font-semibold">{handle}</span>
            <div className="flex items-center gap-2 text-[#666666] dark:text-[#aaaaaa]">
              <span className="text-[13px]"><TimeAgo /></span>
              <MoreHorizontal className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[15px] leading-normal whitespace-pre-wrap break-words mb-3">
            <RichText text={content} linkColor="#0095f6" />
          </p>
          <MediaGrid files={mediaFiles} />
          <div className="flex items-center gap-3 mt-3 text-[#666666] dark:text-[#aaaaaa]">
            <Heart className="w-5 h-5" />
            <MessageCircle className="w-5 h-5" />
            <Repeat2 className="w-5 h-5" />
            <Send className="w-5 h-5" />
          </div>
        </div>
      </div>
      <div className="px-4 pb-3 text-[13px] text-[#666666] dark:text-[#aaaaaa] flex items-center gap-2">
        <div className="w-5 h-5 rounded-full bg-[#e0e0e0] dark:bg-[#333333]" />
        <span>Reply to this thread</span>
        <span className="ml-auto">241 likes</span>
      </div>
    </div>
  )
}

// ── Bluesky Preview ───────────────────────────────────────────────────────────

export function BlueskyPreview({ content, handle, displayName, mediaFiles = [] }: PreviewProps) {
  const name = displayName || handle.replace('@', '')

  return (
    <div className="bg-white dark:bg-[#161e27] rounded-xl border border-[#e0e6ef] dark:border-[#2e4052] overflow-hidden font-[system-ui] text-[#1c2128] dark:text-[#d8dde2] w-full">
      <div className="px-4 py-3 flex gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
          {name[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 flex-wrap mb-1">
            <span className="text-[15px] font-bold">{name}</span>
            <span className="text-[14px] text-[#66788f]">{handle} · <TimeAgo /></span>
          </div>
          <p className="text-[15px] leading-normal whitespace-pre-wrap break-words mb-2">
            <RichText text={content} linkColor="#0085ff" />
          </p>
          <MediaGrid files={mediaFiles} />
          <div className="flex items-center gap-4 mt-3 text-[#66788f]">
            {[
              { icon: <MessageCircle className="w-4 h-4" />, val: '4' },
              { icon: <Repeat2 className="w-4 h-4" />, val: '12' },
              { icon: <Heart className="w-4 h-4" />, val: '89' },
              { icon: <MoreHorizontal className="w-4 h-4" />, val: '' },
            ].map((a, i) => (
              <button key={i} className="flex items-center gap-1 text-[13px] hover:text-[#0085ff] transition-colors">
                {a.icon} {a.val}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── TikTok Preview ────────────────────────────────────────────────────────────

export function TikTokPreview({ content, handle, displayName }: PreviewProps) {
  const name = displayName || handle.replace('@', '')

  return (
    <div className="bg-[#121212] rounded-xl border border-[#2f2f2f] overflow-hidden font-[system-ui] text-white w-full">
      {/* Video placeholder */}
      <div className="relative aspect-[9/16] max-h-64 bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] flex items-center justify-center">
        <PlayCircle className="w-12 h-12 text-white/30" />
        {/* Right-side actions */}
        <div className="absolute right-3 bottom-16 flex flex-col items-center gap-4 text-white">
          <div className="flex flex-col items-center gap-0.5">
            <Heart className="w-7 h-7" />
            <span className="text-[11px]">241K</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <MessageCircle className="w-7 h-7" />
            <span className="text-[11px]">4.8K</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <Bookmark className="w-7 h-7" />
            <span className="text-[11px]">12K</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <Share2 className="w-7 h-7" />
            <span className="text-[11px]">1.2K</span>
          </div>
        </div>
      </div>
      {/* Bottom caption */}
      <div className="px-3 py-2.5">
        <p className="text-[13px] font-semibold mb-0.5">@{name}</p>
        <p className="text-[13px] leading-normal text-[#ccc] line-clamp-2">
          {content ? <RichText text={content.slice(0, 150)} linkColor="#fe2c55" /> : <span className="opacity-40">Caption…</span>}
        </p>
      </div>
    </div>
  )
}

// ── Generic Preview ───────────────────────────────────────────────────────────

export function GenericPreview({ content, handle, mediaFiles = [] }: PreviewProps) {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden w-full">
      <div className="p-4 flex gap-3">
        <div className="w-10 h-10 rounded-sm bg-primary/10 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
          {handle[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-foreground">{handle}</span>
            <span className="text-xs text-muted-foreground"><TimeAgo /></span>
          </div>
          <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap break-words">
            {content || <span className="opacity-40">Nothing to preview yet…</span>}
          </p>
          <MediaGrid files={mediaFiles} />
        </div>
      </div>
    </div>
  )
}

// ── Dispatcher ───────────────────────────────────────────────────────────────

interface PlatformPreviewProps extends PreviewProps {
  platform: string
}

export function PlatformPreview({ platform, ...props }: PlatformPreviewProps) {
  switch (platform) {
    case 'x':         return <XPreview {...props} />
    case 'linkedin':  return <LinkedInPreview {...props} />
    case 'instagram': return <InstagramPreview {...props} />
    case 'facebook':  return <FacebookPreview {...props} />
    case 'threads':   return <ThreadsPreview {...props} />
    case 'bluesky':   return <BlueskyPreview {...props} />
    case 'tiktok':    return <TikTokPreview {...props} />
    default:          return <GenericPreview {...props} />
  }
}
