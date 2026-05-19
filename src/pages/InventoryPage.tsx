import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Plus, SortAsc, Coffee, Clipboard } from 'lucide-react'
import { BeanCard } from '@/features/inventory/components/BeanCard'
import { useCoffeeBeans } from '@/features/inventory/hooks/useCoffeeBeans'
import { Button } from '@/components/ui/Button'
import { QuickAddModal } from '@/components/ui/QuickAddModal'
import { coffeeBeanService } from '@/features/inventory/services/coffeeBeanService'

type SortOption = 'date' | 'name' | 'quantity' | 'pricePerGram'
type SortDirection = 'asc' | 'desc'

export function InventoryPage() {
  const { beans, loading, refresh } = useCoffeeBeans()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortOption>('date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [adding, setAdding] = useState(false)
  const [showQuickAdd, setShowQuickAdd] = useState(false)

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
          result = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
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
      <header className="sticky top-0 z-10 bg-cream-100/95 backdrop-blur-sm border-b border-coffee-200 px-5 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-coffee-900">咖啡豆库存</h1>
              <p className="text-sm text-coffee-600 mt-0.5">
                共 {beans.length} 种咖啡豆
              </p>
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
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-coffee-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="搜索咖啡豆..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-coffee-200 bg-cream-50 text-coffee-900 placeholder:text-coffee-400 focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 transition-colors"
              />
            </div>
            <select
              value={sort}
              onChange={(e) => {
                const newSort = e.target.value as SortOption
                if (newSort === 'date') {
                  setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
                } else {
                  setSort(newSort)
                }
              }}
              className="px-3 py-2 rounded-lg border border-coffee-200 bg-cream-50 text-coffee-700 focus:outline-none focus:ring-2 focus:ring-coffee-500 cursor-pointer appearance-none pr-8 bg-[url('data:image/svg+xml;utf8,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 24 24%27 stroke=%27%235d4037%27%3E%3Cpath stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%272%27 d=%27M19 9l-7 7-7-7%27/%3E%3C/svg%3E')] bg-[length:1rem] bg-[right_0.5rem_center] bg-no-repeat"
            >
              <option value="date">按日期 {sortDirection === 'desc' ? '↓' : '↑'}</option>
              <option value="name">按名称</option>
              <option value="quantity">按库存</option>
              <option value="pricePerGram">按克单价</option>
            </select>
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
            <p className="text-sm text-coffee-500 mb-6">
              {search ? '试试其他关键词' : '粘贴咖啡豆信息快速添加'}
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
    </div>
  )
}