import { memo } from 'react'
import { cn } from '@/lib/utils'
import type { FreshnessStatus } from '@/features/inventory/types'
import { Flame } from 'lucide-react'

interface FreshnessBadgeProps {
  status: FreshnessStatus
  days: number
  bestPeriod?: number
  className?: string
}

export const FreshnessBadge = memo(function FreshnessBadge({ status, days, bestPeriod: _bestPeriod = 90, className }: FreshnessBadgeProps) {
  const statusStyles = {
    fresh: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    good: 'bg-green-100 text-green-800 border-green-200',
    aging: 'bg-orange-100 text-orange-800 border-orange-200',
    expired: 'bg-red-100 text-red-800 border-red-200',
  }

  const flameColors = {
    fresh: 'text-emerald-600',
    good: 'text-green-600',
    aging: 'text-orange-600',
    expired: 'text-red-600',
  }

  const labels: Record<FreshnessStatus, string> = {
    fresh: '新鲜',
    good: '最佳饮用期',
    aging: '接近过期',
    expired: '已过期',
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium border',
        statusStyles[status],
        className
      )}
    >
      <Flame className={cn('w-4 h-4', flameColors[status])} />
      <span>{labels[status]}</span>
      <span className="text-xs opacity-75">· {days}天</span>
    </div>
  )
})