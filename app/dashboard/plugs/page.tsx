'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Zap, Plus, Settings, CheckCircle2, XCircle, Globe, ArrowRight,
  Clock, Tag, RefreshCw, Star,
} from 'lucide-react'
import { MOCK_PLUGS } from '@/lib/mock-data'
import { PLATFORMS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { Plug } from '@/lib/types'

const GLOBAL_PLUGS = MOCK_PLUGS.filter(p => p.type === 'global')
const MY_PLUGS = MOCK_PLUGS.filter(p => p.type === 'internal')

export default function PlugsPage() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>(
    Object.fromEntries(MOCK_PLUGS.map(p => [p.id, p.enabled ?? p.isActive]))
  )

  const toggle = (id: string) => setEnabled(prev => ({ ...prev, [id]: !prev[id] }))

  const PlugCard = ({ plug }: { plug: Plug }) => (
    <Card className={cn(
      'bg-card border-border shadow-sm p-4 transition-all',
      enabled[plug.id] ? 'border-accent/20' : 'opacity-70'
    )}>
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-sm bg-muted flex items-center justify-center flex-shrink-0">
          <Zap className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2 min-w-0">
              <h3 className="text-xs font-medium text-foreground truncate">{plug.name}</h3>
              {plug.type === 'global' && <Star className="w-3 h-3 text-amber-500 flex-shrink-0" />}
            </div>
            <Switch
              checked={!!enabled[plug.id]}
              onCheckedChange={() => toggle(plug.id)}
              className="data-[state=checked]:bg-accent flex-shrink-0 scale-90"
            />
          </div>
          <p className="text-[11px] text-muted-foreground mb-3 leading-relaxed">{plug.description}</p>
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
            <div className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              {plug.runCount} runs
            </div>
            {plug.trigger && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {plug.trigger}
              </div>
            )}
            <div className={cn('flex items-center gap-1', enabled[plug.id] ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground')}>
              <div className={cn('w-1.5 h-1.5 rounded-full', enabled[plug.id] ? 'bg-emerald-500' : 'bg-muted-foreground/40')} />
              {enabled[plug.id] ? 'Active' : 'Inactive'}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )

  return (
    <div className="space-y-6 pb-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-card border-border shadow-sm p-4">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">My Plugs</p>
          <p className="text-2xl font-light text-foreground mt-1">{MY_PLUGS.length}</p>
        </Card>
        <Card className="bg-accent/5 border-accent/20 shadow-sm p-4">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">Active</p>
          <p className="text-2xl font-light text-accent mt-1">{Object.values(enabled).filter(Boolean).length}</p>
        </Card>
        <Card className="bg-card border-border shadow-sm p-4">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">Total Runs</p>
          <p className="text-2xl font-light text-foreground mt-1">{MOCK_PLUGS.reduce((s, p) => s + (p.runCount ?? p.triggerCount ?? 0), 0).toLocaleString()}</p>
        </Card>
      </div>

      {/* My Plugs */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-foreground">My Automation Plugs</h2>
          <Button size="sm" className="gap-1.5 text-xs"><Plus className="w-3.5 h-3.5" /> New Plug</Button>
        </div>
        {MY_PLUGS.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {MY_PLUGS.map(p => <PlugCard key={p.id} plug={p} />)}
          </div>
        ) : (
          <Card className="bg-card border-border border-dashed shadow-sm p-8 text-center">
            <Zap className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-3">No plugs yet. Create your first automation.</p>
            <Button size="sm" className="gap-1.5 text-xs"><Plus className="w-3.5 h-3.5" /> Create Plug</Button>
          </Card>
        )}
      </div>

      {/* Global Plugs */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-sm font-medium text-foreground">Marketplace Plugs</h2>
          <Badge className="bg-accent/10 text-accent border-0 text-[10px]">Community</Badge>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {GLOBAL_PLUGS.map(p => <PlugCard key={p.id} plug={p} />)}
        </div>
      </div>
    </div>
  )
}
