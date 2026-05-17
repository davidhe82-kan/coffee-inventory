import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import type { Transaction } from '../types'
import { ArrowDownLeft, ArrowUpRight, Minus } from 'lucide-react'

interface TransactionListProps {
  transactions: Transaction[]
  className?: string
}

export function TransactionList({ transactions, className }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className={cn('py-8 text-center text-coffee-500', className)}>
        <p className="text-sm">暂无操作记录</p>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {transactions.map((tx) => {
        const Icon = tx.type === 'add' ? ArrowDownLeft : tx.type === 'consume' ? ArrowUpRight : Minus
        const iconColor = tx.type === 'add' ? 'text-green-600' : tx.type === 'consume' ? 'text-orange-600' : 'text-coffee-500'
        const bgColor = tx.type === 'add' ? 'bg-green-50' : tx.type === 'consume' ? 'bg-orange-50' : 'bg-coffee-50'
        const label = tx.type === 'add' ? '入库' : tx.type === 'consume' ? '出库' : '调整'
        const amountColor = tx.type === 'add' ? 'text-green-600' : 'text-orange-600'

        return (
          <div
            key={tx.id}
            className="flex items-center gap-3 p-3 rounded-lg bg-cream-50 border border-coffee-100"
          >
            <div className={cn('p-2 rounded-full', bgColor)}>
              <Icon className={cn('w-4 h-4', iconColor)} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={cn('text-sm font-medium', amountColor)}>
                  {tx.type === 'add' ? '+' : '-'}{tx.amount}g
                </span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-coffee-100 text-coffee-600">
                  {label}
                </span>
              </div>
              {tx.notes && (
                <p className="text-xs text-coffee-500 mt-0.5 truncate">{tx.notes}</p>
              )}
            </div>
            <span className="text-xs text-coffee-400">
              {format(new Date(tx.timestamp), 'M月d日 HH:mm')}
            </span>
          </div>
        )
      })}
    </div>
  )
}