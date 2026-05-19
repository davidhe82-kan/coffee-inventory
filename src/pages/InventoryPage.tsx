import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Search, Plus, SortAsc, Coffee, Clipboard } from 'lucide-react'
import { BeanCard } from '@/features/inventory/components/BeanCard'
import { useCoffeeBeans } from '@/features/inventory/hooks/useCoffeeBeans'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { QuickAddModal } from '@/components/ui/QuickAddModal'
import { BottomNav } from '@/components/ui/BottomNav'
import { coffeeBeanService } from '@/features/inventory/services/coffeeBeanService'

type SortOption = 'date' | 'name' | 'quantity' | 'pricePerGram'
type SortDirection = 'asc' | 'desc'
type SortValue = `${SortOption}:${SortDirection}`

export function InventoryPage() {
  const { beans, loading, refresh } = useCoffeeBeans()
  const navigate = useNavigate()
  const location = useLocation()
  const [search, setSearch] = useState('')
  const [sortValue, setSortValue] = useState<SortValue>('date:desc')
  const [adding, setAdding] = useState(false)
  const [showQuickAdd, setShowQuickAdd] = useState(false)

  const parseSortValue = (value: SortValue): [SortOption, SortDirection] => {
    const [sort, direction] = value.split(':') as [SortOption, SortDirection]
    return [sort, direction]
  }

  const [sort, sortDirection] = parseSortValue(sortValue)

  const filteredBeans = beans
    .filter((bean) => {
      if (!search) return true
      const query = search.toLowerCase()
      return (
        bean.name.toLowerCase().includes(query) ||
        bean.origin.toLowerCase().includes(query) ||
        bean.roaster.toLowerCase().includes(query)
      )
    })
    .sort((a, b) => {
      let result = 0
      switch (sort) {
        case 'date':
          result = new Date(a.roastDate).getTime() - new Date(b.roastDate).getTime()
          break
        case 'name':
          result = a.name.localeCompare(b.name)
          break
        case 'quantity':
          result = a.quantity - b.quantity
          break
        case 'pricePerGram':
          const priceA = a.totalQuantity > 0 ? a.price / a.totalQuantity : Infinity
          const priceB = b.totalQuantity > 0 ? b.price / b.totalQuantity : Infinity
          result = priceA - priceB
          break
      }
      return sortDirection === 'asc' ? result : -result
    })

  const handleAddSample = async () => {
    try {
      setAdding(true)
      await coffeeBeanService.addSampleBean()
      await refresh()
    } catch (error) {
      console.error('Failed to add sample bean:', error)
    } finally {
      setAdding(false)
    }
  }

  const handleQuickAddSuccess = async () => {
    await refresh()
  }

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-10 bg-cream-100/95 backdrop-blur-sm border-b border-coffee-300/60 shadow-[0_2px_8px_rgba(62,39,35,0.05)] px-5 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-coffee-900 tracking-tight leading-tight">咖啡豆库存</h1>
              <p className="text-sm text-coffee-600 mt-1">
                共 <span className="text-accent-500 font-semibold">{beans.length}</span> 种咖啡豆
              </p>
              <div className="mt-3 w-12 h-0.5 bg-accent-400/40 rounded-full" />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowQuickAdd(true)}
              >
                <Clipboard className="w-4 h-4 mr-2" />
                粘贴添加
              </Button>
              {beans.length === 0 && !loading && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleAddSample}
                  disabled={adding}
                >
                  <Coffee className="w-4 h-4 mr-2" />
                  {adding ? '添加中...' : '示例'}
                </Button>
              )}
              <Link to="/add">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  添加
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                icon={<Search className="w-4 h-4" />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="搜索咖啡豆..."
              />
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={sort}
                onChange={(e) => {
                  const newSort = e.target.value as SortOption
                  setSortValue(`${newSort}:${sortDirection}`)
                }}
                options={[
                  { value: 'date', label: '按烘焙日期' },
                  { value: 'name', label: '按名称' },
                  { value: 'quantity', label: '按库存' },
                  { value: 'pricePerGram', label: '按克单价' },
                ]}
              />
              <button
                onClick={() => {
                  setSortValue(`${sort}:${sortDirection === 'asc' ? 'desc' : 'asc'}`)
                }}
                className="px-3 py-2 rounded-lg border border-coffee-200 bg-cream-50 text-coffee-700 hover:bg-coffee-100 font-bold"
              >
                {sortDirection === 'desc' ? '↓' : '↑'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-5 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-coffee-300 border-t-coffee-600 rounded-full animate-spin" />
            <p className="mt-3 text-sm text-coffee-500">加载中...</p>
          </div>
        ) : filteredBeans.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-coffee-100 flex items-center justify-center">
              <SortAsc className="w-10 h-10 text-coffee-400" />
            </div>
            <h3 className="text-lg font-medium text-coffee-700 mb-2">
              {search ? '没有找到匹配的咖啡豆' : '还没有咖啡豆'}
            </h3>
            <p className="text-sm text-coffee-500 mb-6 max-w-xs mx-auto leading-relaxed">
              {search ? '试试其他关键词' : '你的咖啡角还空着。从第一包豆子开始，记录每一杯的香气。'}
            </p>
            {!search && (
              <div className="flex items-center justify-center gap-3">
                <Button onClick={() => setShowQuickAdd(true)}>
                  <Clipboard className="w-4 h-4 mr-2" />
                  粘贴添加
                </Button>
                <Link to="/add">
                  <Button variant="secondary">
                    <Plus className="w-4 h-4 mr-2" />
                    手动添加
                  </Button>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredBeans.map((bean, index) => (
              <BeanCard
                key={bean.id}
                bean={bean}
                onClick={() => navigate(`/bean/${bean.id}`)}
                className={`stagger-${Math.min(index + 1, 5)}`}
              />
            ))}
          </div>
        )}
      </main>

      <QuickAddModal
        isOpen={showQuickAdd}
        onClose={() => setShowQuickAdd(false)}
        onSuccess={handleQuickAddSuccess}
      />

      <BottomNav currentPath={location.pathname} />
    </div>
  )
}