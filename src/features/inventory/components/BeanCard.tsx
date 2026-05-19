import { memo } from 'react'
import { format, differenceInDays } from 'date-fns'
import { Card } from '@/components/ui/Card'
import { FreshnessBadge } from './FreshnessBadge'
import { QuantityBar } from './QuantityBar'
import { cn, getRoastLevelLabel, parseBestPeriod, getFreshnessStatus, calculatePricePerGram } from '@/lib/utils'
import type { CoffeeBean } from '@/features/inventory/types'
import { MapPin, Building2 } from 'lucide-react'

interface BeanCardProps {
  bean: CoffeeBean
  onClick?: () => void
  className?: string
}

export const BeanCard = memo(function BeanCard({ bean, onClick, className }: BeanCardProps) {
  const roastDate = new Date(bean.roastDate)
  const days = differenceInDays(new Date(), roastDate)
  const bestPeriod = parseBestPeriod(bean.notes)
  const freshness = getFreshnessStatus(roastDate, bestPeriod)

  const roastBorderColor: Record<string, string> = {
    light: 'border-l-amber-300',
    medium: 'border-l-coffee-400',
    dark: 'border-l-coffee-800',
  }

  return (
    <Card
      hover
      className={cn('p-5 animate-fade-in border-l-4 rounded-l-none', roastBorderColor[bean.roastLevel] || 'border-l-coffee-400', className)}
      onClick={onClick}
    >
      <h3 className="text-lg font-semibold text-coffee-900 truncate pr-6">{bean.name}</h3>

      <FreshnessBadge status={freshness} days={days} bestPeriod={bestPeriod} className="mt-2.5" />

      {(bean.origin || bean.roaster) && (
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-3 text-sm text-coffee-600">
          {bean.origin && (
            <div className={cn('flex items-center gap-1.5 min-w-0', !bean.roaster && 'col-span-2')}>
              <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-coffee-400" />
              <span className="truncate">{bean.origin}</span>
            </div>
          )}
          {bean.roaster && (
            <div className={cn('flex items-center gap-1.5 min-w-0', !bean.origin && 'col-span-2')}>
              <Building2 className="w-3.5 h-3.5 flex-shrink-0 text-coffee-400" />
              <span className="truncate">{bean.roaster}</span>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 mt-3">
        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-coffee-100 text-coffee-700">
          {getRoastLevelLabel(bean.roastLevel)}
        </span>
        <span className="text-xs text-coffee-500">
          烘焙于 {format(roastDate, 'M月d日')}
        </span>
        <span className="ml-auto text-xs text-coffee-500">
          {calculatePricePerGram(bean.price, bean.totalQuantity)}
        </span>
      </div>

      <QuantityBar current={bean.quantity} total={bean.totalQuantity} />
    </Card>
  )
})