import { useState, useEffect, useRef } from 'react'
import { X, Search, AlertCircle } from 'lucide-react'
import type { CoffeeBean } from '@/features/inventory/types'
import { parseBestPeriod, getFreshnessStatus, getFreshnessLabel } from '@/lib/utils'

interface BeanPickerSheetProps {
  isOpen: boolean
  onClose: () => void
  beans: CoffeeBean[]
  selectedBeanId?: string
  onSelect: (bean: CoffeeBean) => void
}

export function BeanPickerSheet({
  isOpen,
  onClose,
  beans,
  selectedBeanId,
  onSelect,
}: BeanPickerSheetProps) {
  const [search, setSearch] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setSearch('')
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  if (!isOpen) return null

  const filtered = beans.filter((bean) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      bean.name.toLowerCase().includes(q) ||
      bean.origin.toLowerCase().includes(q) ||
      bean.roaster.toLowerCase().includes(q)
    )
  })

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" />
      <div className="relative bg-cream-100 rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col animate-slide-up">
        <div className="flex items-center justify-between px-5 py-4 border-b border-coffee-200">
          <h2 className="text-lg font-bold text-coffee-900">选择咖啡豆</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-coffee-100 transition-colors"
          >
            <X className="w-5 h-5 text-coffee-500" />
          </button>
        </div>

        <div className="px-5 pt-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-coffee-400" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索豆名、产地、烘焙商..."
              className="w-full pl-9 pr-4 py-3 rounded-xl bg-white border border-coffee-200 text-coffee-900 placeholder:text-coffee-400 focus:outline-none focus:ring-2 focus:ring-coffee-500"
            />
          </div>
          {search && (
            <p className="text-xs text-coffee-500 mt-2">
              找到 {filtered.length} 个结果
            </p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-8 space-y-2">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="w-10 h-10 text-coffee-300 mb-3" />
              <p className="text-sm text-coffee-500">没有找到匹配的咖啡豆</p>
            </div>
          ) : (
            filtered.map((bean) => {
              const bestPeriod = parseBestPeriod(bean.notes)
              const freshness = getFreshnessStatus(bean.roastDate, bestPeriod)
              const freshnessLabel = getFreshnessLabel(freshness)
              const isSelected = bean.id === selectedBeanId
              return (
                <button
                  key={bean.id}
                  onClick={() => {
                    onSelect(bean)
                    onClose()
                  }}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    isSelected
                      ? 'border-coffee-500 bg-coffee-50 ring-1 ring-coffee-500'
                      : 'border-coffee-200 bg-white hover:border-coffee-400 hover:bg-cream-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-coffee-900 truncate">{bean.name}</span>
                        {isSelected && (
                          <span className="flex-shrink-0 text-xs font-medium text-coffee-600 bg-coffee-100 px-2 py-0.5 rounded-full">
                            已选
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-coffee-500">
                        {bean.origin || '未知产地'} · {bean.roaster || '未知烘焙商'}
                      </p>
                      <p className="text-xs text-coffee-400 mt-1">
                        剩余 <span className="font-medium text-coffee-600">{bean.quantity}g</span>
                        {bean.totalQuantity > 0 && (
                          <span className="ml-1 text-coffee-400">
                            / {bean.totalQuantity}g
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <span
                        className={`inline-block text-xs font-medium px-2 py-1 rounded-full ${
                          freshness === 'good'
                            ? 'bg-green-100 text-green-700'
                            : freshness === 'resting'
                            ? 'bg-teal-100 text-teal-700'
                            : freshness === 'aging'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {freshnessLabel}
                      </span>
                    </div>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
