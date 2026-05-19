import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Coffee, Plus, ThermometerSun, Scale, Filter, Star, Calendar, Trash2, ChevronRight, Search, X } from 'lucide-react'
import { brewService } from '@/features/brew/services/brewService'
import type { BrewRecord } from '@/features/brew/types'
import { Button } from '@/components/ui/Button'
import { BottomNav } from '@/components/ui/BottomNav'

export function BrewPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [records, setRecords] = useState<BrewRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchKeyword, setSearchKeyword] = useState('')

  useEffect(() => {
    loadRecords()
  }, [])

  const loadRecords = async () => {
    setLoading(true)
    const data = await brewService.getAll()
    setRecords(data)
    setLoading(false)
  }

  const handleDelete = async (e: React.MouseEvent, record: BrewRecord) => {
    e.stopPropagation()
    if (!confirm('确定要删除这条手冲记录吗？')) return
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
          record.grinder.toLowerCase().includes(keyword) ||
          record.dripper.toLowerCase().includes(keyword) ||
          record.notes.toLowerCase().includes(keyword)
        )
      })
    : records

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-10 bg-cream-100/95 backdrop-blur-sm border-b border-coffee-300/60 shadow-[0_2px_8px_rgba(62,39,35,0.05)] px-5 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-3xl font-bold text-coffee-900 tracking-tight leading-tight">手冲记录</h1>
              <p className="text-sm text-coffee-600 mt-1">
                共 <span className="text-accent-500 font-semibold">{filteredRecords.length}</span> {searchKeyword ? `/${records.length}` : ''} 次记录
              </p>
              <div className="mt-3 w-12 h-0.5 bg-accent-400/40 rounded-full" />
            </div>
            <Link to="/brew/add">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                添加记录
              </Button>
            </Link>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-coffee-400 pointer-events-none" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="搜索豆名、研磨器、滤杯、笔记..."
              className="w-full pl-10 pr-10 py-2 rounded-lg bg-white border border-coffee-200 text-sm text-coffee-800 placeholder-coffee-400 focus:outline-none focus:ring-2 focus:ring-coffee-300 transition-all"
            />
            {searchKeyword && (
              <button
                onClick={() => setSearchKeyword('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-coffee-100 transition-colors"
              >
                <X className="w-4 h-4 text-coffee-400" />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-5 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-coffee-300 border-t-coffee-600 rounded-full animate-spin" />
            <p className="mt-3 text-sm text-coffee-500">加载中...</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-coffee-100 flex items-center justify-center">
              <Coffee className="w-10 h-10 text-coffee-400" />
            </div>
            <h3 className="text-lg font-medium text-coffee-700 mb-2">
              {searchKeyword ? '没有找到匹配的记录' : '还没有手冲记录'}
            </h3>
            <p className="text-sm text-coffee-500 mb-6 max-w-xs mx-auto leading-relaxed">
              {searchKeyword ? '换个关键词试试' : '每一杯手冲都是独一无二的。记录水温、研磨度、滤杯，找到你的黄金配比。'}
            </p>
            {searchKeyword ? (
              <Button onClick={() => setSearchKeyword('')}>
                <X className="w-4 h-4 mr-2" />
                清除搜索
              </Button>
            ) : (
              <Link to="/brew/add">
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
                onClick={() => navigate(`/brew/${record.id}`)}
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
                            i < record.rating ? 'fill-accent-400 text-accent-400' : 'text-coffee-200'
                          }`}
                        />
                      ))}
                    </div>
                    <button
                      onClick={(e) => handleDelete(e, record)}
                      className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-coffee-400 hover:text-red-500 transition-colors" />
                    </button>
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
                    <span className="text-coffee-700">{record.dripper || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Coffee className="w-4 h-4 text-coffee-500" />
                    <span className="text-coffee-700 truncate">{record.grinder || '-'}</span>
                  </div>
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
