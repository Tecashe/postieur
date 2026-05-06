'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Bot, Send, RefreshCw, Sparkles, User, Trash2, Copy, Check, Wrench } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
  role: 'user' | 'assistant'
  content: string
  id: string
  streaming?: boolean
  toolsUsed?: string[]
}

const SUGGESTIONS = [
  'Write a LinkedIn post about AI in marketing',
  'What are the best times to post on Instagram?',
  'Give me 5 viral hook ideas for Twitter/X',
  'Analyze this post and improve it',
  'Create a 7-day content calendar for a SaaS product',
  'What hashtags should I use for B2B content?',
]

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={handleCopy} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-muted">
      {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-muted-foreground" />}
    </button>
  )
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user'
  return (
    <div className={cn('flex gap-3 group', isUser && 'flex-row-reverse')}>
      <div className={cn(
        'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0',
        isUser ? 'bg-primary text-primary-foreground' : 'bg-accent/15 text-accent'
      )}>
        {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
      </div>
      <div className={cn('max-w-[75%] space-y-1', isUser && 'items-end flex flex-col')}>
        {msg.toolsUsed && msg.toolsUsed.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-1">
            {msg.toolsUsed.map(t => (
              <span key={t} className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded bg-accent/10 text-accent border border-accent/20">
                <Wrench className="w-2.5 h-2.5" /> {t}
              </span>
            ))}
          </div>
        )}
        <div className={cn(
          'px-3.5 py-2.5 rounded-xl text-sm leading-relaxed',
          isUser
            ? 'bg-primary text-primary-foreground rounded-tr-sm'
            : 'bg-muted/60 text-foreground rounded-tl-sm border border-border'
        )}>
          <p className="whitespace-pre-wrap">
            {msg.content}
            {msg.streaming && <span className="inline-block w-1.5 h-4 bg-accent ml-0.5 animate-pulse rounded-sm" />}
          </p>
        </div>
        {!isUser && !msg.streaming && <CopyButton text={msg.content} />}
      </div>
    </div>
  )
}

export default function AIAgentPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = useCallback(async (text?: string) => {
    const userText = (text ?? input).trim()
    if (!userText || loading) return

    const userMsg: Message = { role: 'user', content: userText, id: crypto.randomUUID() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    // Add a streaming placeholder for the assistant reply
    const assistantId = crypto.randomUUID()
    setMessages(prev => [...prev, { role: 'assistant', content: '', id: assistantId, streaming: true }])

    try {
      const res = await fetch('/api/ai/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      })

      if (!res.ok || !res.body) throw new Error('Request failed')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      const toolsUsed: string[] = []

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const raw = line.slice(6).trim()
          if (!raw) continue
          try {
            const event = JSON.parse(raw) as { type: string; content?: string; message?: string; name?: string; tools?: string[] }

            if (event.type === 'token' && event.content) {
              setMessages(prev => prev.map(m =>
                m.id === assistantId ? { ...m, content: m.content + event.content! } : m
              ))
            } else if (event.type === 'tool_start' && event.tools) {
              event.tools.forEach(t => { if (!toolsUsed.includes(t)) toolsUsed.push(t) })
            } else if (event.type === 'done') {
              setMessages(prev => prev.map(m =>
                m.id === assistantId
                  ? { ...m, content: event.content ?? m.content, streaming: false, toolsUsed }
                  : m
              ))
            } else if (event.type === 'error') {
              setMessages(prev => prev.map(m =>
                m.id === assistantId
                  ? { ...m, content: `Error: ${event.message ?? 'Unknown error'}`, streaming: false }
                  : m
              ))
            }
          } catch {}
        }
      }

      // Ensure streaming cursor is removed
      setMessages(prev => prev.map(m =>
        m.id === assistantId ? { ...m, streaming: false, toolsUsed } : m
      ))
    } catch (err) {
      setMessages(prev => prev.map(m =>
        m.id === assistantId
          ? { ...m, content: `Sorry, something went wrong: ${err instanceof Error ? err.message : 'Unknown error'}`, streaming: false }
          : m
      ))
    } finally {
      setLoading(false)
      textareaRef.current?.focus()
    }
  }, [input, loading, messages])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const isEmpty = messages.length === 0

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)]">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center">
            <Bot className="w-4 h-4 text-accent" />
          </div>
          <div>
            <p className="text-sm font-medium">AI Social Media Agent</p>
            <p className="text-[10px] text-muted-foreground">Powered by GPT-4o mini</p>
          </div>
        </div>
        {!isEmpty && (
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-7 text-muted-foreground" onClick={() => setMessages([])}>
            <Trash2 className="w-3.5 h-3.5" /> Clear chat
          </Button>
        )}
      </div>

      {/* Messages */}
      <Card className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {isEmpty ? (
          <div className="h-full flex flex-col items-center justify-center gap-6">
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-7 h-7 text-accent" />
              </div>
              <p className="font-medium text-sm">How can I help you today?</p>
              <p className="text-xs text-muted-foreground mt-1">Ask me anything about social media strategy, content creation, or analytics.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-left px-3 py-2.5 rounded-lg border border-border hover:border-accent/40 hover:bg-accent/5 text-xs text-muted-foreground hover:text-foreground transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}
            {loading && messages[messages.length - 1]?.role !== 'assistant' && (
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-accent/15 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-3.5 h-3.5 text-accent" />
                </div>
                <div className="bg-muted/60 border border-border px-3.5 py-2.5 rounded-xl rounded-tl-sm">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </>
        )}
      </Card>

      {/* Input */}
      <div className="pt-3 flex-shrink-0">
        <div className="flex gap-2 items-end">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about social media… (Enter to send, Shift+Enter for new line)"
            className="flex-1 min-h-[44px] max-h-32 text-sm resize-none"
            rows={1}
          />
          <Button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            size="icon"
            className="h-11 w-11 flex-shrink-0"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5">AI can make mistakes. Always review content before publishing.</p>
      </div>
    </div>
  )
}
