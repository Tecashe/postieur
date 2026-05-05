'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Key, Webhook, Plus, Copy, Eye, EyeOff, Trash2, Check,
  CheckCircle2, XCircle, RefreshCw, ExternalLink, Globe,
} from 'lucide-react'
import { MOCK_API_KEYS, MOCK_WEBHOOKS } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import type { APIKey, Webhook as WebhookType } from '@/lib/types'

function maskKey(key: string) {
  return key.slice(0, 8) + '•'.repeat(20) + key.slice(-4)
}

export default function APIPage() {
  const [visible, setVisible] = useState<Record<string, boolean>>({})
  const [copied, setCopied] = useState<string | null>(null)

  const toggleVisible = (id: string) => setVisible(prev => ({ ...prev, [id]: !prev[id] }))
  const handleCopy = (id: string, key: string) => {
    navigator.clipboard.writeText(key)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="space-y-5 pb-6">
      <Tabs defaultValue="keys">
        <div className="flex items-center justify-between mb-4">
          <TabsList className="bg-muted/50 border border-border h-8 p-0.5">
            <TabsTrigger value="keys" className="h-7 text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm gap-1.5">
              <Key className="w-3 h-3" /> API Keys
            </TabsTrigger>
            <TabsTrigger value="webhooks" className="h-7 text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm gap-1.5">
              <Globe className="w-3 h-3" /> Webhooks
            </TabsTrigger>
          </TabsList>
        </div>

        {/* API Keys */}
        <TabsContent value="keys" className="mt-0 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{MOCK_API_KEYS.length} key{MOCK_API_KEYS.length !== 1 ? 's' : ''} configured</p>
            <Button size="sm" className="gap-1.5 text-xs"><Plus className="w-3.5 h-3.5" /> Generate Key</Button>
          </div>
          {MOCK_API_KEYS.map(apiKey => (
            <Card key={apiKey.id} className="bg-card border-border shadow-sm p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="text-xs font-medium text-foreground">{apiKey.name}</h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Created {new Date(apiKey.createdAt).toLocaleDateString()}
                    {apiKey.lastUsedAt ? ` · Last used ${new Date(apiKey.lastUsedAt).toLocaleDateString()}` : ' · Never used'}
                  </p>
                </div>
                <Badge className={cn('text-[10px] border-0 flex-shrink-0',
                  apiKey.status === 'active' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-muted text-muted-foreground')}>
                  {apiKey.status}
                </Badge>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <code className="flex-1 bg-muted rounded-sm px-3 py-2 text-[11px] font-mono text-foreground">
                  {visible[apiKey.id] ? apiKey.key ?? apiKey.prefix : maskKey(apiKey.key ?? apiKey.prefix)}
                </code>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground" onClick={() => toggleVisible(apiKey.id)}>
                  {visible[apiKey.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground" onClick={() => handleCopy(apiKey.id, apiKey.key ?? apiKey.prefix)}>
                  {copied === apiKey.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {apiKey.scopes.map(scope => (
                  <Badge key={scope} className="bg-muted text-muted-foreground border-0 text-[10px]">{scope}</Badge>
                ))}
              </div>
            </Card>
          ))}

          <Card className="bg-muted/20 border-border border-dashed shadow-sm p-4">
            <p className="text-[11px] font-medium text-muted-foreground mb-2">API Documentation</p>
            <p className="text-[11px] text-muted-foreground mb-3">Use the REST API to create posts, manage channels, retrieve analytics and more from your own apps.</p>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs border-border">
              <ExternalLink className="w-3 h-3" /> View Docs
            </Button>
          </Card>
        </TabsContent>

        {/* Webhooks */}
        <TabsContent value="webhooks" className="mt-0 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{MOCK_WEBHOOKS.length} webhook{MOCK_WEBHOOKS.length !== 1 ? 's' : ''} configured</p>
            <Button size="sm" className="gap-1.5 text-xs"><Plus className="w-3.5 h-3.5" /> Add Webhook</Button>
          </div>
          {MOCK_WEBHOOKS.map(wh => (
            <Card key={wh.id} className="bg-card border-border shadow-sm p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-medium text-foreground">{wh.name}</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{wh.url}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge className={cn('text-[10px] border-0',
                    wh.status === 'active' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-muted text-muted-foreground')}>
                    {wh.status}
                  </Badge>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-4 text-[10px] text-muted-foreground mb-3">
                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" /> {wh.successCount} success
                </div>
                <div className="flex items-center gap-1 text-destructive">
                  <XCircle className="w-3 h-3" /> {wh.failureCount} failed
                </div>
                {wh.lastTriggeredAt && (
                  <div className="flex items-center gap-1">
                    <RefreshCw className="w-3 h-3" />
                    {new Date(wh.lastTriggeredAt).toLocaleDateString()}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {wh.events.map(ev => (
                  <Badge key={ev} className="bg-muted text-muted-foreground border-0 text-[10px]">{ev}</Badge>
                ))}
              </div>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
