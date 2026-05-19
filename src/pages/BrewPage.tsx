import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Coffee, Plus, ThermometerSun, Scale, Filter, Star, Calendar } from 'lucide-react'
import { brewService } from '@/features/brew/services/brewService'
import type { BrewRecord } from '@/features/brew/types'
import { Button } from '@/components/ui/Button'
import { BottomNav } from '@/components/ui/BottomNav'

export function BrewPage() {
  const location = useLocation()
  const [records, setRecords] = useState<BrewRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRecords()
  }, [])

  const loadRecords = async () => {
    setLoading(true)
    const data = await brewService.getAll()
    setRecords(data)
    setLoading(false)
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-10 bg-cream-100/95 backdrop-blur-sm border-b border-coffee-200 px-5 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-coffee-900">手冲记录</h1>
              <p className="text-sm text-coffee-600 mt-0.5">共 {records.length} 次记录</p>
            </div>
            <Link to="/brew/add">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                添加记录
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-5 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-coffee-300 border-t-coffee-600 rounded-full animate-spin" />
            <p className="mt-3 text-sm text-coffee-500">加载中...</p>
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-coffee-100 flex items-center justify-center">
              <Coffee className="w-10 h-10 text-coffee-400" />
            </div>
            <h3 className="text-lg font-medium text-coffee-700 mb-2">还没有手冲记录</h3>
            <p className="text-sm text-coffee-500 mb-6">记录你的每一次完美萃取</p>
            <Link to="/brew/add">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                添加第一条记录
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {records.map((record) => (
              <div
                key={record.id}
                className="bg-white rounded-xl border border-coffee-100 p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-coffee-900 text-lg">{record.beanName}</h3>
                    <div className="flex items-center gap-2 text-sm text-coffee-500 mt-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(record.createdAt)}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < record.rating ? 'fill-amber-400 text-amber-400' : 'text-coffee-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Scale className="w-4 h-4 text-coffee-500" />
                    <span className="text-coffee-700">{record.beanWeight}g</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <ThermometerSun className="w-4 h-4 text-coffee-500" />
                    <span className="text-coffee-700">{record.waterTemp}°C</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Filter className="w-4 h-4 text-coffee-500" />
                    <span className="text-coffee-700">{record.dripper}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Coffee className="w-4 h-4 text-coffee-500" />
                    <span className="text-coffee-700">{record.grinder}</span>
                  </div>
                </div>

                {record.notes && (
                  <div className="mt-3 pt-3 border-t border-coffee-100">
                    <p className="text-sm text-coffee-600">{record.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav currentPath={location.pathname} />
    </div>
  )
}