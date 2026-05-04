import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { POST_STATUS_COLORS } from '@/lib/constants'
import type { PostStatus } from '@/lib/types'

interface StatusBadgeProps {
  status: PostStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const colors = POST_STATUS_COLORS[status]

  return (
    <Badge
      className={cn(
        'rounded-full border px-2.5 py-0.5 text-xs font-medium',
        colors.bg,
        colors.text,
        colors.border,
        className
      )}
      variant="outline"
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}
