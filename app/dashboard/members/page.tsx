'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  UserPlus, Search, MoreVertical, Shield, Edit3, Eye, Crown, Trash2, Mail,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type Role = 'owner' | 'admin' | 'editor' | 'viewer'

const ROLE_CONFIG: Record<Role, { label: string; icon: React.ElementType; color: string }> = {
  owner:  { label: 'Owner',  icon: Crown,  color: 'text-primary bg-primary/10' },
  admin:  { label: 'Admin',  icon: Shield, color: 'text-accent bg-accent/10' },
  editor: { label: 'Editor', icon: Edit3,  color: 'text-foreground bg-muted' },
  viewer: { label: 'Viewer', icon: Eye,    color: 'text-muted-foreground bg-muted/60' },
}

const MOCK_MEMBERS = [
  { id: '1', name: 'Stephen Macharia', email: 'stephen@caelpost.com', role: 'owner' as Role, initials: 'SM', lastActive: '2m ago' },
  { id: '2', name: 'Aisha Nkrumah',    email: 'aisha@company.com',    role: 'admin' as Role, initials: 'AN', lastActive: '1h ago' },
  { id: '3', name: 'Luca Ferretti',    email: 'luca@company.com',     role: 'editor' as Role, initials: 'LF', lastActive: '3h ago' },
  { id: '4', name: 'Sara Lindqvist',   email: 'sara@company.com',     role: 'editor' as Role, initials: 'SL', lastActive: '1d ago' },
  { id: '5', name: 'James Okonkwo',    email: 'james@company.com',    role: 'viewer' as Role, initials: 'JO', lastActive: '3d ago' },
]

export default function MembersPage() {
  const [search, setSearch] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<Role>('editor')

  const filtered = MOCK_MEMBERS.filter(m =>
    !search || m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-5 pb-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {(Object.entries(ROLE_CONFIG) as [Role, typeof ROLE_CONFIG[Role]][]).map(([role, cfg]) => {
          const Icon = cfg.icon
          const count = MOCK_MEMBERS.filter(m => m.role === role).length
          return (
            <Card key={role} className="bg-card border-border shadow-sm p-4">
              <div className="flex items-center gap-2 mb-1">
                <Icon className={cn('w-3.5 h-3.5', cfg.color.split(' ')[0])} />
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">{cfg.label}s</p>
              </div>
              <p className="text-2xl font-light text-foreground">{count}</p>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
        {/* Members table */}
        <Card className="bg-card border-border shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-3 border-b border-border">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search members..." className="pl-8 h-8 text-xs bg-input border-border" />
            </div>
          </div>
          <div className="divide-y divide-border">
            {filtered.map(member => {
              const cfg = ROLE_CONFIG[member.role]
              const Icon = cfg.icon
              return (
                <div key={member.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/20 transition-colors">
                  <div className="w-9 h-9 rounded-sm bg-primary/10 flex items-center justify-center text-xs font-medium text-primary flex-shrink-0">
                    {member.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{member.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                  </div>
                  <div className="text-[10px] text-muted-foreground hidden sm:block">{member.lastActive}</div>
                  <Badge className={cn('text-[10px] border-0 gap-1 flex-shrink-0', cfg.color)}>
                    <Icon className="w-2.5 h-2.5" />
                    {cfg.label}
                  </Badge>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground flex-shrink-0">
                    <MoreVertical className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Invite panel */}
        <div className="space-y-4">
          <Card className="bg-card border-border shadow-sm p-5">
            <h3 className="text-sm font-medium text-foreground mb-4">Invite Team Member</h3>
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Email Address</Label>
                <Input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="colleague@company.com" className="mt-1 h-8 text-xs bg-input border-border" />
              </div>
              <div>
                <Label className="text-xs">Role</Label>
                <div className="grid grid-cols-2 gap-1.5 mt-1">
                  {(['admin', 'editor', 'viewer'] as Role[]).map(role => {
                    const cfg = ROLE_CONFIG[role]
                    const Icon = cfg.icon
                    return (
                      <button key={role} onClick={() => setInviteRole(role)}
                        className={cn(
                          'flex items-center gap-2 px-3 py-2 rounded-sm border text-xs transition-all text-left',
                          inviteRole === role ? 'border-accent/40 bg-accent/5 text-accent' : 'border-border text-muted-foreground hover:border-border hover:text-foreground'
                        )}>
                        <Icon className="w-3.5 h-3.5" />
                        {cfg.label}
                      </button>
                    )
                  })}
                </div>
              </div>
              <Button className="w-full text-xs gap-1.5" disabled={!inviteEmail}>
                <Mail className="w-3.5 h-3.5" /> Send Invitation
              </Button>
            </div>
          </Card>

          {/* Role permissions */}
          <Card className="bg-card border-border shadow-sm p-5">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">Role Permissions</h3>
            <div className="space-y-2">
              {([['Admin', 'Full access, manage team'], ['Editor', 'Create & schedule posts'], ['Viewer', 'View-only access']] as [string, string][]).map(([role, desc]) => (
                <div key={role} className="flex gap-3 py-2 border-b border-border last:border-0">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-foreground">{role}</p>
                    <p className="text-[11px] text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
