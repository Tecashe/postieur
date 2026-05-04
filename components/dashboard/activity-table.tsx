'use client'

import { formatDistanceToNow } from 'date-fns'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { StatusBadge } from '@/components/common/status-badge'
import { PLATFORMS } from '@/lib/constants'
import type { ActivityItem } from '@/lib/types'

interface ActivityTableProps {
  items: ActivityItem[]
}

export function ActivityTable({ items }: ActivityTableProps) {
  return (
    <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
      <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
        <h3 className="text-base font-light text-zinc-900 dark:text-white">Recent Activity</h3>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="border-zinc-200 dark:border-zinc-800 hover:bg-transparent">
            <TableHead className="text-zinc-600 dark:text-zinc-400 font-medium">Content</TableHead>
            <TableHead className="text-zinc-600 dark:text-zinc-400 font-medium">Platform</TableHead>
            <TableHead className="text-zinc-600 dark:text-zinc-400 font-medium">Type</TableHead>
            <TableHead className="text-zinc-600 dark:text-zinc-400 font-medium">Status</TableHead>
            <TableHead className="text-right text-zinc-600 dark:text-zinc-400 font-medium">Engagement</TableHead>
            <TableHead className="text-right text-zinc-600 dark:text-zinc-400 font-medium">Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const platform = PLATFORMS[item.platform]
            const PlatformIcon = platform.icon

            return (
              <TableRow
                key={item.id}
                className="border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                <TableCell className="text-sm text-zinc-900 dark:text-zinc-100 font-medium">
                  <div className="truncate max-w-xs">{item.content}</div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <PlatformIcon className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">{platform.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-zinc-600 dark:text-zinc-400 capitalize">
                    {item.type}
                  </span>
                </TableCell>
                <TableCell>
                  {item.status && <StatusBadge status={item.status} />}
                </TableCell>
                <TableCell className="text-right">
                  {item.engagement && (
                    <span className="text-sm font-medium text-zinc-900 dark:text-white">
                      {item.engagement.toLocaleString()}
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right text-sm text-zinc-500 dark:text-zinc-400">
                  {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </Card>
  )
}
