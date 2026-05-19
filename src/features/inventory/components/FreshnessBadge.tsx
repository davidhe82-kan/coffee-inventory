import { memo } from 'react'
import { cn } from '@/lib/utils'
import type { FreshnessStatus, BestPeriod } from '@/features/inventory/types'
import { Sparkles, Clock, AlertTriangle, Leaf } from 'lucide-react'

interface FreshnessBadgeProps {
  status: FreshnessStatus
  days: number
  bestPeriod?: BestPeriod
  className?: string
}

export const FreshnessBadge = memo(function FreshnessBadge({ status, days, bestPeriod, className }: FreshnessBadgeProps) {
  const statusStyles = {
    resting: 'bg-teal-100 text-teal-800 border-teal-200',
    good: 'bg-green-100 text-green-800 border-green-200',
    aging: 'bg-orange-100 text-orange-800 border-orange-200',
    expired: 'bg-red-100 text-red-800 border-red-200',
  }

  const iconColors = {
    resting: 'text-teal-600',
    good: 'text-green-600',
    aging: 'text-orange-600',
    expired: 'text-red-600',
  }

  const icons: Record<FreshnessStatus, typeof Sparkles> = {
    resting: Leaf,
    good: Sparkles,
    aging: Clock,
    expired: AlertTriangle,
  }

  const labels: Record<FreshnessStatus, string> = {
    resting: '养豆中',
    good: '最佳饮用期',
    aging: '已过最佳期',
    expired: '已过期',
  }

  const Icon = icons[status]

  const tooltip = bestPeriod && status === 'resting'
    ? `建议再等 ${bestPeriod.restDays - days} 天`
    : undefined

  return (
    <div
      title={tooltip}
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium border',
        statusStyles[status],
        className
      )}
    >
      <Icon className={cn('w-4 h-4', iconColors[status])} />
      <span>{labels[status]}</span>
      <span className="text-xs opacity-75">· {days}天</span>
    </div>
  )
})
