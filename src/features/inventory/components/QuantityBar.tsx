import { cn, formatQuantity } from '@/lib/utils'

interface QuantityBarProps {
  current: number
  total: number
  className?: string
}

export function QuantityBar({ current, total, className }: QuantityBarProps) {
  const percent = total > 0 ? Math.round((current / total) * 100) : 0

  const getBarColor = () => {
    if (percent > 50) return 'bg-green-500'
    if (percent > 20) return 'bg-amber-500'
    return 'bg-red-500'
  }

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-coffee-700">{formatQuantity(current)}</span>
        <span className="text-coffee-500">剩余 {percent}%</span>
      </div>
      <div className="h-2 bg-coffee-200 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500 ease-out', getBarColor())}
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="text-xs text-coffee-400">共 {formatQuantity(total)}</div>
    </div>
  )
}