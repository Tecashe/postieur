import { Card } from '@/components/ui/card'
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface KPICardProps {
  label: string
  value: string | number
  unit?: string
  change?: {
    value: number
    isPositive: boolean
  }
  icon?: LucideIcon
  trend?: 'up' | 'down'
}

export function KPICard({
  label,
  value,
  unit,
  change,
  icon: Icon,
  trend,
}: KPICardProps) {
  return (
    <Card className="p-6 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
          <div className="mt-2 flex items-baseline gap-1">
            <p className="text-3xl font-light text-zinc-900 dark:text-white">{value}</p>
            {unit && <span className="text-sm text-zinc-500 dark:text-zinc-400">{unit}</span>}
          </div>
          {change && (
            <div
              className={cn(
                'mt-2 text-sm font-medium flex items-center gap-1',
                change.isPositive
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-red-600 dark:text-red-400'
              )}
            >
              {change.isPositive ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              {change.isPositive ? '+' : '-'}
              {Math.abs(change.value)}% from last week
            </div>
          )}
        </div>
        {Icon && (
          <div className="ml-4 p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800">
            <Icon className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          </div>
        )}
      </div>
    </Card>
  )
}
