import type { Metadata } from 'next'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, MoreVertical } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Members',
  description: 'Manage team members',
}

const MOCK_MEMBERS = [
  { id: '1', name: 'Sarah Chen', email: 'sarah@company.com', initials: 'SC', role: 'Admin', joined: '2024-01-15' },
  { id: '2', name: 'Alex Rivera', email: 'alex@company.com', initials: 'AR', role: 'Editor', joined: '2024-02-01' },
  { id: '3', name: 'Jordan Park', email: 'jordan@company.com', initials: 'JP', role: 'Viewer', joined: '2024-03-10' },
  { id: '4', name: 'Casey Morgan', email: 'casey@company.com', initials: 'CM', role: 'Editor', joined: '2024-03-15' },
]

export default function MembersPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-light text-zinc-900 dark:text-white">{MOCK_MEMBERS.length} Team Members</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Manage who has access to your workspace</p>
        </div>
        <Button className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900">
          <Plus className="w-4 h-4 mr-2" />
          Invite Member
        </Button>
      </div>

      {/* Members Table */}
      <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-200 dark:border-zinc-800 hover:bg-transparent">
              <TableHead className="text-zinc-600 dark:text-zinc-400 font-medium">Member</TableHead>
              <TableHead className="text-zinc-600 dark:text-zinc-400 font-medium">Role</TableHead>
              <TableHead className="text-zinc-600 dark:text-zinc-400 font-medium">Joined</TableHead>
              <TableHead className="text-right text-zinc-600 dark:text-zinc-400 font-medium">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_MEMBERS.map(member => (
              <TableRow
                key={member.id}
                className="border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white text-xs font-semibold">
                        {member.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">{member.name}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">{member.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      member.role === 'Admin'
                        ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-200 border-blue-200 dark:border-blue-800'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700'
                    }
                  >
                    {member.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-zinc-600 dark:text-zinc-400">
                  {new Date(member.joined).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Invitations Pending */}
      <Card className="p-6 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <h3 className="text-base font-light text-zinc-900 dark:text-white mb-4">Pending Invitations</h3>
        <div className="space-y-3">
          {[
            { email: 'newmember@company.com', sentDate: '2024-04-01' },
            { email: 'another@company.com', sentDate: '2024-04-02' },
          ].map((inv, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-lg border border-zinc-200 dark:border-zinc-800"
            >
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-white">{inv.email}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Sent {inv.sentDate}</p>
              </div>
              <Button variant="outline" size="sm" className="border-zinc-200 dark:border-zinc-700">
                Resend
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
