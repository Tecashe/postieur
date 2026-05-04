'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Plus, MoreVertical, Mail, Clock, Trash2, Shield } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const MOCK_MEMBERS = [
  { id: '1', name: 'Sarah Chen', email: 'sarah@company.com', initials: 'SC', role: 'Admin', status: 'active', joined: '2024-01-15', lastActive: 'Today' },
  { id: '2', name: 'Alex Rivera', email: 'alex@company.com', initials: 'AR', role: 'Editor', status: 'active', joined: '2024-02-01', lastActive: '2 hours ago' },
  { id: '3', name: 'Jordan Park', email: 'jordan@company.com', initials: 'JP', role: 'Viewer', status: 'inactive', joined: '2024-03-10', lastActive: '5 days ago' },
  { id: '4', name: 'Casey Morgan', email: 'casey@company.com', initials: 'CM', role: 'Editor', status: 'active', joined: '2024-03-15', lastActive: 'Yesterday' },
  { id: '5', name: 'Morgan Lee', email: 'morgan@company.com', initials: 'ML', role: 'Viewer', status: 'active', joined: '2024-04-01', lastActive: '30 minutes ago' },
]

const roleColors: Record<string, { bg: string; text: string }> = {
  Admin: { bg: 'bg-purple-100 dark:bg-purple-950', text: 'text-purple-700 dark:text-purple-200' },
  Editor: { bg: 'bg-blue-100 dark:bg-blue-950', text: 'text-blue-700 dark:text-blue-200' },
  Viewer: { bg: 'bg-zinc-100 dark:bg-zinc-800', text: 'text-zinc-700 dark:text-zinc-200' },
}

export default function MembersPage() {
  const activeMembers = MOCK_MEMBERS.filter(m => m.status === 'active')
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light text-zinc-900 dark:text-white">Team Members</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Manage team access and permissions</p>
        </div>
        <Button size="sm" className="text-xs sm:text-sm w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Invite Member
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-medium">Total Members</p>
          <p className="text-2xl sm:text-3xl font-light text-zinc-900 dark:text-white mt-2">{MOCK_MEMBERS.length}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{activeMembers.length} active</p>
        </Card>
        <Card className="p-4 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-medium">Admins</p>
          <p className="text-2xl sm:text-3xl font-light text-zinc-900 dark:text-white mt-2">
            {MOCK_MEMBERS.filter(m => m.role === 'Admin').length}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Full access</p>
        </Card>
        <Card className="p-4 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-medium">Pending Invites</p>
          <p className="text-2xl sm:text-3xl font-light text-zinc-900 dark:text-white mt-2">2</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Awaiting acceptance</p>
        </Card>
      </div>

      {/* Members List */}
      <div className="space-y-3">
        {MOCK_MEMBERS.map((member) => {
          const colors = roleColors[member.role]
          
          return (
            <Card
              key={member.id}
              className="p-4 sm:p-6 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Member Info */}
                <div className="flex items-center gap-4 flex-1">
                  <Avatar className="w-12 h-12 flex-shrink-0">
                    <AvatarFallback className="bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white text-sm font-semibold">
                      {member.initials}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm sm:text-base font-medium text-zinc-900 dark:text-white">{member.name}</h3>
                      <Badge className={`${colors.bg} ${colors.text} text-xs`}>
                        {member.role === 'Admin' && <Shield className="w-3 h-3 mr-1" />}
                        {member.role}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={member.status === 'active' ? 'border-emerald-300 dark:border-emerald-700' : 'border-zinc-300 dark:border-zinc-700'}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full mr-2 ${member.status === 'active' ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
                        {member.status === 'active' ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1 flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {member.email}
                    </p>
                  </div>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-2 sm:flex gap-3 flex-shrink-0 text-xs sm:text-sm">
                  <div>
                    <p className="text-zinc-600 dark:text-zinc-400 font-medium">Joined</p>
                    <p className="text-zinc-900 dark:text-white mt-0.5">
                      {new Date(member.joined).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-zinc-600 dark:text-zinc-400 font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Active
                    </p>
                    <p className="text-zinc-900 dark:text-white mt-0.5">{member.lastActive}</p>
                  </div>
                </div>

                {/* Actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Change Role</DropdownMenuItem>
                    <DropdownMenuItem>Resend Invite</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">Remove Member</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Pending Invites */}
      <Card className="p-4 sm:p-6 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <h3 className="text-base font-light text-zinc-900 dark:text-white mb-4">Pending Invitations</h3>
        <div className="space-y-3">
          {[
            { email: 'emma@company.com', role: 'Editor', sentDate: '2024-05-01' },
            { email: 'james@company.com', role: 'Viewer', sentDate: '2024-05-02' },
          ].map((invite, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-4 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800">
              <div className="flex-1">
                <p className="text-sm font-medium text-zinc-900 dark:text-white">{invite.email}</p>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                  Invited as <Badge variant="outline" className="text-xs ml-1">{invite.role}</Badge> on {new Date(invite.sentDate).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                  Resend
                </Button>
                <Button variant="ghost" size="sm" className="text-red-600 dark:text-red-400 text-xs sm:text-sm">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Roles & Permissions */}
      <Card className="p-4 sm:p-6 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <h3 className="text-base font-light text-zinc-900 dark:text-white mb-4">Roles & Permissions</h3>
        <div className="space-y-3">
          {[
            { role: 'Admin', description: 'Full access to all features, settings, and team management', color: 'purple' },
            { role: 'Editor', description: 'Can create, edit, and publish posts across all channels', color: 'blue' },
            { role: 'Viewer', description: 'Read-only access to analytics and scheduled content', color: 'zinc' },
          ].map((item) => (
            <div key={item.role} className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <Badge className={`bg-${item.color}-100 dark:bg-${item.color}-950 text-${item.color}-700 dark:text-${item.color}-200`}>
                    {item.role}
                  </Badge>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
