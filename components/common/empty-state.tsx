import { Button } from '@/components/ui/button'
import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="rounded-lg bg-zinc-100 dark:bg-zinc-800 p-3 mb-4">
        <Icon className="w-8 h-8 text-zinc-600 dark:text-zinc-400" />
      </div>
      <h3 className="text-lg font-light text-zinc-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 max-w-sm">{description}</p>
      {action && (
        <Button className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}
