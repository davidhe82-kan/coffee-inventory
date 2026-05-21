import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Coffee, Plus, Star, Calendar, Trash2, ChevronRight, Search, X, Timer } from 'lucide-react'
import { brewService } from '@/features/brew/services/brewService'
import type { BrewRecord } from '@/features/brew/types'
import { Button } from '@/components/ui/Button'
import { BottomNav } from '@/components/ui/BottomNav'

export function EspressoPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [records, setRecords] = useState<BrewRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchKeyword, setSearchKeyword] = useState('')

  useEffect(() => {
    loadRecords()
  }, [])

  const loadRecords = async () => {
    setLoading(true)
    const data = await brewService.getAll('espresso')
    setRecords(data)
    setLoading(false)
  }

  const handleDelete = async (e: React.MouseEvent, record: BrewRecord) => {
    e.stopPropagation()
    if (!confirm('确定要删除这条意式记录吗？')) return
    await brewService.delete(record.id)
    setRecords((prev) => prev.filter((r) => r.id !== record.id))
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Shanghai',
    })
  }

  const filteredRecords = searchKeyword.trim()
    ? records.filter((record) => {
        const keyword = searchKeyword.toLowerCase()
        return (
          record.beanName.toLowerCase().includes(keyword) ||
          (record.machine?.toLowerCase().includes(keyword) || '') ||
          (record.grinder?.toLowerCase().includes(keyword) || '') ||
          record.notes.toLowerCase().includes(keyword)
        )
      })
    : records

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-coffee-300 border-t-coffee-600 rounded-full animate-spin" />
          <p className="text-sm text-coffee-500">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-10 bg-cream-100/95 backdrop-blur-sm border-b border-coffee-300/60 shadow-[0_2px_8px_rgba(62,39,35,0.05)] px-5 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-3xl font-bold text-coffee-900 tracking-tight leading-tight">意式记录</h1>
              <p className="text-sm text-coffee-600 mt-1">
                共 <span className="text-accent-500 font-semibold">{filteredRecords.length}</span> {searchKeyword ? `/${records.length}` : ''} 次记录
              </p>
              <div className="mt-3 w-8 h-0.5 bg-accent-400/40 rounded-full" />
            </div>
            <Link to="/espresso/add">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                添加记录
              </Button>
            </Link>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-coffee-400" />
            <input
              type="text"
              placeholder="搜索咖啡豆、机器..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-coffee-200 bg-white text-coffee-900 placeholder:text-coffee-400 focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 transition-all"
            />
            {searchKeyword && (
              <button
                onClick={() => setSearchKeyword('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-coffee-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-coffee-400" />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-5 py-6">
        {filteredRecords.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-coffee-100 rounded-full flex items-center justify-center mb-6">
              <Coffee className="w-10 h-10 text-coffee-400" />
            </div>
            <h3 className="text-lg font-medium text-coffee-700 mb-2">
              {searchKeyword ? '没有找到匹配的记录' : '还没有意式记录'}
            </h3>
            <p className="text-sm text-coffee-500 mb-6 max-w-xs mx-auto leading-relaxed">
              {searchKeyword ? '换个关键词试试' : '记录每一杯意式的参数，找到你的黄金萃取！'}
            </p>
            {searchKeyword ? (
              <Button onClick={() => setSearchKeyword('')}>
                <X className="w-4 h-4 mr-2" />
                清除搜索
              </Button>
            ) : (
              <Link to="/espresso/add">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  添加第一条记录
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRecords.map((record) => (
              <div
                key={record.id}
                onClick={() => navigate(`/espresso/${record.id}`)}
                className="bg-white rounded-xl border border-coffee-100 p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer relative group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-coffee-900 text-lg truncate">{record.beanName}</h3>
                      <ChevronRight className="w-5 h-5 text-coffee-300 flex-shrink-0" />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-coffee-500 mt-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(record.createdAt)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < record.rating ? 'fill-amber-400 text-amber-400' : 'text-coffee-200'
                          }`}
                        />
                      ))}
                    </div>
                    <button
                      onClick={(e) => handleDelete(e, record)}
                      className="p-1.5 rounded-lg text-coffee-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {record.machine && (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-coffee-100 text-coffee-700">
                      {record.machine}
                    </span>
                  )}
                  {record.beanWeight && (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-cream-100 text-cream-700">
                      {record.beanWeight}g 粉
                    </span>
                  )}
                  {record.yieldWeight && (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700">
                      {record.yieldWeight}g 液
                    </span>
                  )}
                  {record.brewTime && (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-700 flex items-center gap-1">
                      <Timer className="w-3 h-3" />
                      {record.brewTime}s
                    </span>
                  )}
                </div>
                {record.notes && (
                  <div className="mt-3 pt-3 border-t border-coffee-100">
                    <p className="text-sm text-coffee-600 line-clamp-2">{record.notes}</p>
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
