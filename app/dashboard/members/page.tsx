'use client'

import { useState } from 'react'
import { useOrganization, useUser } from '@clerk/nextjs'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  UserPlus, Search, Shield, Edit3, Crown, Trash2, Mail, Clock, ChevronDown, Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type ClerkRole = 'org:owner' | 'org:admin' | 'org:member'

const ROLE_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  'org:owner':  { label: 'Owner',  icon: Crown,  color: 'text-primary bg-primary/10' },
  'org:admin':  { label: 'Admin',  icon: Shield, color: 'text-accent bg-accent/10' },
  'org:member': { label: 'Member', icon: Edit3,  color: 'text-foreground bg-muted' },
}

const ASSIGNABLE_ROLES: ClerkRole[] = ['org:admin', 'org:member']

const INVITE_ROLES: { value: ClerkRole; label: string; Icon: React.ElementType; desc: string }[] = [
  { value: 'org:admin',  label: 'Admin',  Icon: Shield, desc: 'Manage members & content' },
  { value: 'org:member', label: 'Member', Icon: Edit3,  desc: 'Create & schedule posts' },
]

export default function MembersPage() {
  const { user } = useUser()
  const { organization, memberships, invitations } = useOrganization({
    memberships: { infinite: true },
    invitations: { infinite: true },
  })

  const [search, setSearch] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<ClerkRole>('org:member')
  const [inviting, setInviting] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [inviteSuccess, setInviteSuccess] = useState(false)
  const [updatingRole, setUpdatingRole] = useState<string | null>(null)

  const members = memberships?.data ?? []
  const pendingInvites = invitations?.data ?? []

  // Determine the current user's role in this org
  const myMembership = members.find((m) => m.publicUserData?.userId === user?.id)
  const myRole = myMembership?.role ?? 'org:viewer'
  const canManageRoles = myRole === 'org:owner' || myRole === 'org:admin'

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
    'org:member': members.filter((m) => m.role === 'org:member').length,
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

  async function handleRoleChange(membershipId: string, newRole: ClerkRole) {
    const membership = members.find((m) => m.id === membershipId)
    if (!membership) return
    setUpdatingRole(membershipId)
    try {
      await membership.update({ role: newRole })
      memberships?.revalidate?.()
    } catch (err) {
      console.error('Failed to update role:', err)
    } finally {
      setUpdatingRole(null)
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
      {/* Stats */}
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
          {/* Members table */}
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
                  const RoleIcon = cfg.icon
                  const name = [publicUserData?.firstName, publicUserData?.lastName].filter(Boolean).join(' ') || 'User'
                  const email = publicUserData?.identifier ?? ''
                  const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
                  const isCurrentUser = publicUserData?.userId === user?.id
                  const isOwner = role === 'org:owner'
                  const canChangeThisRole = canManageRoles && !isCurrentUser && !isOwner
                  const isUpdating = updatingRole === membership.id

                  return (
                    <div key={membership.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/20 transition-colors">
                      {/* Avatar */}
                      <div className="w-9 h-9 rounded-sm bg-primary/10 flex items-center justify-center text-xs font-medium text-primary flex-shrink-0 overflow-hidden">
                        {publicUserData?.imageUrl
                          ? <img src={publicUserData.imageUrl} alt={name} className="w-full h-full object-cover" />
                          : initials}
                      </div>

                      {/* Name + email */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {name}
                          {isCurrentUser && <span className="ml-1 text-[10px] text-muted-foreground">(you)</span>}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{email}</p>
                      </div>

                      {/* Role — clickable dropdown if can manage */}
                      {canChangeThisRole ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              disabled={isUpdating}
                              className={cn(
                                'flex items-center gap-1 px-2 py-1 rounded-sm text-[10px] font-medium border-0 transition-colors',
                                cfg.color,
                                'hover:opacity-80 disabled:opacity-50'
                              )}
                            >
                              <RoleIcon className="w-2.5 h-2.5" />
                              {isUpdating ? '…' : cfg.label}
                              <ChevronDown className="w-2.5 h-2.5 ml-0.5" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-36">
                            <div className="px-2 py-1">
                              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Change role</p>
                            </div>
                            {ASSIGNABLE_ROLES.map((r) => {
                              const rcfg = ROLE_CONFIG[r]
                              const RIcon = rcfg.icon
                              return (
                                <DropdownMenuItem
                                  key={r}
                                  onClick={() => handleRoleChange(membership.id, r)}
                                  className="flex items-center gap-2 text-xs"
                                >
                                  <RIcon className="w-3.5 h-3.5 text-muted-foreground" />
                                  {rcfg.label}
                                  {role === r && <Check className="w-3 h-3 ml-auto text-primary" />}
                                </DropdownMenuItem>
                              )
                            })}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleRemove(publicUserData?.userId ?? '')}
                              className="text-destructive focus:text-destructive focus:bg-destructive/10 text-xs"
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-2" />
                              Remove member
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <Badge className={cn('text-[10px] border-0 gap-1 flex-shrink-0', cfg.color)}>
                          <RoleIcon className="w-2.5 h-2.5" />{cfg.label}
                        </Badge>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </Card>

          {/* Pending invitations */}
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
                      {canManageRoles && (
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive flex-shrink-0" onClick={() => handleRevoke(invite.id)}>
                          Revoke
                        </Button>
                      )}
                    </div>
                  )
                })}
              </div>
            </Card>
          )}
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          {/* Invite form — only for admins/owners */}
          {canManageRoles && (
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
                    {INVITE_ROLES.map(({ value, label, Icon, desc }) => (
                      <button key={value} type="button" onClick={() => setInviteRole(value)}
                        className={cn('flex flex-col gap-0.5 px-3 py-2 rounded-sm border text-xs transition-all text-left',
                          inviteRole === value ? 'border-accent/40 bg-accent/5 text-accent' : 'border-border text-muted-foreground hover:text-foreground')}>
                        <span className="flex items-center gap-1.5"><Icon className="w-3.5 h-3.5" />{label}</span>
                        <span className="text-[10px] opacity-70">{desc}</span>
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
          )}

          {/* Role reference card */}
          <Card className="bg-card border-border shadow-sm p-5">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">Role Permissions</h3>
            <div className="space-y-0">
              {([
                ['org:owner',  'Owner',  'Full control, billing, delete workspace'],
                ['org:admin',  'Admin',  'Manage members, all content access'],
                ['org:editor', 'Editor', 'Create & schedule posts'],
                ['org:viewer', 'Viewer', 'View-only access'],
              ] as [string, string, string][]).map(([roleKey, label, desc]) => {
                const cfg = ROLE_CONFIG[roleKey]
                const Icon = cfg.icon
                const isMyRole = roleKey === myRole
                return (
                  <div key={roleKey} className={cn('flex items-start gap-3 py-2.5 border-b border-border last:border-0', isMyRole && 'opacity-100')}>
                    <div className={cn('w-5 h-5 rounded-sm flex items-center justify-center flex-shrink-0 mt-0.5', cfg.color)}>
                      <Icon className="w-3 h-3" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-medium text-foreground">{label}</p>
                        {isMyRole && <span className="text-[9px] bg-primary/10 text-primary px-1 py-0.5 rounded-sm font-medium">you</span>}
                      </div>
                      <p className="text-[11px] text-muted-foreground">{desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

