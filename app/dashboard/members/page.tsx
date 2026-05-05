'use client'

import { useState } from 'react'
import { useOrganization, useUser } from '@clerk/nextjs'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  UserPlus, Search, Shield, Edit3, Eye, Crown, Trash2, Mail, Clock,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type ClerkRole = 'org:owner' | 'org:admin' | 'org:editor' | 'org:viewer'

const ROLE_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  'org:owner':  { label: 'Owner',  icon: Crown,  color: 'text-primary bg-primary/10' },
  'org:admin':  { label: 'Admin',  icon: Shield, color: 'text-accent bg-accent/10' },
  'org:editor': { label: 'Editor', icon: Edit3,  color: 'text-foreground bg-muted' },
  'org:viewer': { label: 'Viewer', icon: Eye,    color: 'text-muted-foreground bg-muted/60' },
}

const INVITE_ROLES: { value: ClerkRole; label: string; Icon: React.ElementType }[] = [
  { value: 'org:admin',  label: 'Admin',  Icon: Shield },
  { value: 'org:editor', label: 'Editor', Icon: Edit3 },
  { value: 'org:viewer', label: 'Viewer', Icon: Eye },
]

export default function MembersPage() {
  const { user } = useUser()
  const { organization, memberships, invitations } = useOrganization({
    memberships: { infinite: true },
    invitations: { infinite: true },
  })

  const [search, setSearch] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<ClerkRole>('org:editor')
  const [inviting, setInviting] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [inviteSuccess, setInviteSuccess] = useState(false)

  const members = memberships?.data ?? []
  const pendingInvites = invitations?.data ?? []

  const filtered = members.filter((m) => {
    if (!search) return true
    const name = [m.publicUserData?.firstName, m.publicUserData?.lastName].filter(Boolean).join(' ')
    const email = m.publicUserData?.identifier ?? ''
    return (
      name.toLowerCase().includes(search.toLowerCase()) ||
      email.toLowerCase().includes(search.toLowerCase())
    )
  })

  const roleCounts: Record<string, number> = {
    'org:owner':  members.filter((m) => m.role === 'org:owner').length,
    'org:admin':  members.filter((m) => m.role === 'org:admin').length,
    'org:editor': members.filter((m) => m.role === 'org:editor').length,
    'org:viewer': members.filter((m) => m.role === 'org:viewer').length,
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!organization || !inviteEmail.trim()) return
    setInviting(true)
    setInviteError(null)
    setInviteSuccess(false)
    try {
      await organization.inviteMember({ emailAddress: inviteEmail.trim(), role: inviteRole })
      setInviteEmail('')
      setInviteSuccess(true)
      invitations?.revalidate?.()
    } catch (err: unknown) {
      setInviteError(err instanceof Error ? err.message : 'Failed to send invitation')
    } finally {
      setInviting(false)
    }
  }

  async function handleRevoke(invitationId: string) {
    const invite = pendingInvites.find((i) => i.id === invitationId)
    if (invite) { try { await invite.revoke(); invitations?.revalidate?.() } catch {} }
  }

  async function handleRemove(userId: string) {
    const membership = members.find((m) => m.publicUserData?.userId === userId)
    if (membership) { try { await membership.destroy(); memberships?.revalidate?.() } catch {} }
  }

  return (
    <div className="space-y-5 pb-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Object.entries(ROLE_CONFIG).map(([role, cfg]) => {
          const Icon = cfg.icon
          return (
            <Card key={role} className="bg-card border-border shadow-sm p-4">
              <div className="flex items-center gap-2 mb-1">
                <Icon className={cn('w-3.5 h-3.5', cfg.color.split(' ')[0])} />
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">{cfg.label}s</p>
              </div>
              <p className="text-2xl font-light text-foreground">{roleCounts[role] ?? 0}</p>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
        <div className="space-y-4">
          <Card className="bg-card border-border shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-3 border-b border-border">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search members..." className="pl-8 h-8 text-xs bg-input border-border" />
              </div>
              <p className="text-xs text-muted-foreground ml-auto">{members.length} member{members.length !== 1 ? 's' : ''}</p>
            </div>
            {memberships?.isLoading ? (
              <div className="px-5 py-8 text-center text-sm text-muted-foreground">Loading members…</div>
            ) : filtered.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-muted-foreground">No members found.</div>
            ) : (
              <div className="divide-y divide-border">
                {filtered.map((membership) => {
                  const { publicUserData, role } = membership
                  const cfg = ROLE_CONFIG[role] ?? ROLE_CONFIG['org:viewer']
                  const Icon = cfg.icon
                  const name = [publicUserData?.firstName, publicUserData?.lastName].filter(Boolean).join(' ') || 'User'
                  const email = publicUserData?.identifier ?? ''
                  const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
                  const isCurrentUser = publicUserData?.userId === user?.id
                  return (
                    <div key={membership.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/20 transition-colors">
                      <div className="w-9 h-9 rounded-sm bg-primary/10 flex items-center justify-center text-xs font-medium text-primary flex-shrink-0 overflow-hidden">
                        {publicUserData?.imageUrl
                          ? <img src={publicUserData.imageUrl} alt={name} className="w-full h-full object-cover" />
                          : initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {name}{isCurrentUser && <span className="ml-1 text-[10px] text-muted-foreground">(you)</span>}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{email}</p>
                      </div>
                      <Badge className={cn('text-[10px] border-0 gap-1 flex-shrink-0', cfg.color)}>
                        <Icon className="w-2.5 h-2.5" />{cfg.label}
                      </Badge>
                      {!isCurrentUser && role !== 'org:owner' && (
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive flex-shrink-0" onClick={() => handleRemove(publicUserData?.userId ?? '')} title="Remove">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </Card>

          {pendingInvites.length > 0 && (
            <Card className="bg-card border-border shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3 border-b border-border">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                <h3 className="text-sm font-medium text-foreground">Pending Invitations ({pendingInvites.length})</h3>
              </div>
              <div className="divide-y divide-border">
                {pendingInvites.map((invite) => {
                  const cfg = ROLE_CONFIG[invite.role] ?? ROLE_CONFIG['org:editor']
                  const Icon = cfg.icon
                  return (
                    <div key={invite.id} className="flex items-center gap-4 px-5 py-3 hover:bg-muted/20 transition-colors">
                      <div className="w-9 h-9 rounded-sm bg-muted flex items-center justify-center flex-shrink-0">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground truncate">{invite.emailAddress}</p>
                        <p className="text-[11px] text-muted-foreground">Invited · pending acceptance</p>
                      </div>
                      <Badge className={cn('text-[10px] border-0 gap-1 flex-shrink-0', cfg.color)}>
                        <Icon className="w-2.5 h-2.5" />{cfg.label}
                      </Badge>
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive flex-shrink-0" onClick={() => handleRevoke(invite.id)}>
                        Revoke
                      </Button>
                    </div>
                  )
                })}
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card className="bg-card border-border shadow-sm p-5">
            <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-muted-foreground" />Invite Team Member
            </h3>
            <form onSubmit={handleInvite} className="space-y-3">
              <div>
                <Label className="text-xs">Email Address</Label>
                <Input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="colleague@company.com" type="email" className="mt-1 h-8 text-xs bg-input border-border" required />
              </div>
              <div>
                <Label className="text-xs">Role</Label>
                <div className="grid grid-cols-2 gap-1.5 mt-1">
                  {INVITE_ROLES.map(({ value, label, Icon }) => (
                    <button key={value} type="button" onClick={() => setInviteRole(value)}
                      className={cn('flex items-center gap-2 px-3 py-2 rounded-sm border text-xs transition-all text-left',
                        inviteRole === value ? 'border-accent/40 bg-accent/5 text-accent' : 'border-border text-muted-foreground hover:text-foreground')}>
                      <Icon className="w-3.5 h-3.5" />{label}
                    </button>
                  ))}
                </div>
              </div>
              {inviteError && <p className="text-xs text-destructive">{inviteError}</p>}
              {inviteSuccess && <p className="text-xs text-emerald-600 dark:text-emerald-400">Invitation sent!</p>}
              <Button type="submit" className="w-full text-xs gap-1.5" disabled={!inviteEmail || inviting || !organization}>
                <Mail className="w-3.5 h-3.5" />{inviting ? 'Sending…' : 'Send Invitation'}
              </Button>
            </form>
          </Card>

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
