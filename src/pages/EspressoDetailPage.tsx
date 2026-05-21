import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom'
import { ArrowLeft, Edit2, Trash2, Coffee, Scale, Star, RotateCcw, Timer, Zap } from 'lucide-react'
import { brewService } from '@/features/brew/services/brewService'
import { coffeeBeanService } from '@/features/inventory/services/coffeeBeanService'
import type { BrewRecord } from '@/features/brew/types'
import { Button } from '@/components/ui/Button'
import { BottomNav } from '@/components/ui/BottomNav'

export function EspressoDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const [record, setRecord] = useState<BrewRecord | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRecord()
  }, [id])

  const loadRecord = async () => {
    if (!id) return
    setLoading(true)
    const data = await brewService.getById(id)
    setRecord(data)
    setLoading(false)
  }

  const handleDelete = async () => {
    if (!record || !confirm('确定要删除这条意式记录吗？')) return
    await brewService.delete(record.id)

    const bean = await coffeeBeanService.getById(record.beanId)
    if (bean) {
      await coffeeBeanService.updateQuantity(bean.id, bean.quantity + record.beanWeight)
    }

    navigate('/espresso')
  }

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Shanghai',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-coffee-300 border-t-coffee-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (!record) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-medium text-coffee-700 mb-2">记录不存在</h2>
          <Link to="/espresso" className="text-coffee-500 hover:text-coffee-700">
            返回列表
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-10 bg-cream-100/95 backdrop-blur-sm border-b border-coffee-300/60 shadow-[0_2px_8px_rgba(62,39,35,0.05)] px-5 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link to="/espresso" className="flex items-center gap-2 text-coffee-700 hover:text-coffee-900">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">返回</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to={`/espresso/${record.id}/edit`}>
              <Button variant="ghost" size="sm">
                <Edit2 className="w-4 h-4" />
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-6 space-y-5">
        <div className="bg-white rounded-xl border border-coffee-100 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-coffee-900">{record.beanName}</h1>
              <p className="text-sm text-coffee-500 mt-1">{formatDateTime(record.createdAt)}</p>
            </div>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-6 h-6 ${
                    i < record.rating ? 'fill-amber-400 text-amber-400' : 'text-coffee-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-coffee-100 p-6">
          <h2 className="text-lg font-semibold text-coffee-800 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            萃取参数
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-cream-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-coffee-500 mb-1">
                <Scale className="w-4 h-4" />
                <span className="text-xs">粉量</span>
              </div>
              <p className="text-xl font-semibold text-coffee-900">{record.beanWeight}<span className="text-sm font-normal text-coffee-500"> g</span></p>
            </div>

            {record.yieldWeight && (
              <div className="bg-cream-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-coffee-500 mb-1">
                  <Scale className="w-4 h-4" />
                  <span className="text-xs">液重</span>
                </div>
                <p className="text-xl font-semibold text-coffee-900">{record.yieldWeight}<span className="text-sm font-normal text-coffee-500"> g</span></p>
              </div>
            )}

            {record.brewTime && (
              <div className="bg-cream-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-coffee-500 mb-1">
                  <Timer className="w-4 h-4" />
                  <span className="text-xs">时间</span>
                </div>
                <p className="text-xl font-semibold text-coffee-900">{record.brewTime}<span className="text-sm font-normal text-coffee-500"> s</span></p>
              </div>
            )}

            {record.pressure && (
              <div className="bg-cream-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-coffee-500 mb-1">
                  <Zap className="w-4 h-4" />
                  <span className="text-xs">压力</span>
                </div>
                <p className="text-xl font-semibold text-coffee-900">{record.pressure}<span className="text-sm font-normal text-coffee-500"> bar</span></p>
              </div>
            )}

            {record.temperature && (
              <div className="bg-cream-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-coffee-500 mb-1">
                  <Zap className="w-4 h-4" />
                  <span className="text-xs">水温</span>
                </div>
                <p className="text-xl font-semibold text-coffee-900">{record.temperature}<span className="text-sm font-normal text-coffee-500"> °C</span></p>
              </div>
            )}

            {record.machine && (
              <div className="bg-cream-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-coffee-500 mb-1">
                  <Coffee className="w-4 h-4" />
                  <span className="text-xs">机器</span>
                </div>
                <p className="text-base font-medium text-coffee-900">{record.machine}</p>
              </div>
            )}

            {record.grinder && (
              <div className="bg-cream-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-coffee-500 mb-1">
                  <RotateCcw className="w-4 h-4" />
                  <span className="text-xs">磨豆机</span>
                </div>
                <p className="text-base font-medium text-coffee-900">{record.grinder}</p>
              </div>
            )}

            {record.grindSetting && (
              <div className="bg-cream-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-coffee-500 mb-1">
                  <Scale className="w-4 h-4" />
                  <span className="text-xs">刻度</span>
                </div>
                <p className="text-base font-medium text-coffee-900">{record.grindSetting}</p>
              </div>
            )}

            {record.method && (
              <div className="bg-cream-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-coffee-500 mb-1">
                  <Coffee className="w-4 h-4" />
                  <span className="text-xs">冲煮方式</span>
                </div>
                <p className="text-base font-medium text-coffee-900">{record.method}</p>
              </div>
            )}
          </div>
        </div>

        {record.notes && (
          <div className="bg-white rounded-xl border border-coffee-100 p-6">
            <h2 className="text-lg font-semibold text-coffee-800 mb-3 flex items-center gap-2">
              <Star className="w-5 h-5" />
              感受与笔记
            </h2>
            <p className="text-coffee-600 leading-relaxed whitespace-pre-line">{record.notes}</p>
          </div>
        )}
      </main>

      <BottomNav currentPath={location.pathname} />
    </div>
  )
}
