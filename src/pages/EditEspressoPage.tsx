import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Coffee, Star, Save, ChevronRight, Timer, Zap } from 'lucide-react'
import { brewService } from '@/features/brew/services/brewService'
import { coffeeBeanService } from '@/features/inventory/services/coffeeBeanService'
import type { NewBrewRecord } from '@/features/brew/types'
import type { CoffeeBean } from '@/features/inventory/types'
import { Button } from '@/components/ui/Button'
import { BottomNav } from '@/components/ui/BottomNav'
import { BeanPickerSheet } from '@/components/ui/BeanPickerSheet'
import { parseBestPeriod, getFreshnessStatus, getFreshnessLabel } from '@/lib/utils'

const DEFAULT_GRINDERS = ['迈赫迪 E65S', '迈赫迪 EK43', 'Fellow Ode', 'Baratza Sette', 'Comandante', 'Mahlkonig Peak', 'Mahlkonig K30']
const DEFAULT_MACHINES = ['La Marzocco', 'Slayer', 'Slayer Steam', 'Synesso', 'Victoria Arduino', 'Nuova Simonelli', 'Rancilio', '其他']
const METHODS = ['浓缩', '双份浓缩', '拿铁', '卡布', '其他']

export function EditEspressoPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const [beans, setBeans] = useState<CoffeeBean[]>([])
  const [selectedBean, setSelectedBean] = useState<CoffeeBean | null>(null)
  const [showBeanSheet, setShowBeanSheet] = useState(false)
  const [loading, setLoading] = useState(true)
  const [grinderSuggestions, setGrinderSuggestions] = useState<string[]>(DEFAULT_GRINDERS)
  const [machineSuggestions, setMachineSuggestions] = useState<string[]>(DEFAULT_MACHINES)

  const [form, setForm] = useState({
    beanWeight: 18,
    machine: '',
    grinder: '',
    grindSetting: '',
    yieldWeight: 36,
    brewTime: 28,
    pressure: 9,
    temperature: 93,
    method: '',
    rating: 3,
    notes: '',
  })

  const [submitting, setSubmitting] = useState(false)
  const [originalBeanId, setOriginalBeanId] = useState('')
  const [originalBeanWeight, setOriginalBeanWeight] = useState(0)

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    if (!id) return
    const [beansData, records] = await Promise.all([
      coffeeBeanService.getAll(),
      brewService.getAll(),
    ])
    setBeans(beansData)

    const record = await brewService.getById(id)
    if (record) {
      setForm({
        beanWeight: record.beanWeight,
        machine: record.machine || '',
        grinder: record.grinder,
        grindSetting: record.grindSetting,
        yieldWeight: record.yieldWeight || 36,
        brewTime: record.brewTime || 28,
        pressure: record.pressure || 9,
        temperature: record.temperature || 93,
        method: record.method,
        rating: record.rating,
        notes: record.notes,
      })
      const bean = beansData.find((b) => b.id === record.beanId) || null
      setSelectedBean(bean)
      setOriginalBeanId(record.beanId)
      setOriginalBeanWeight(record.beanWeight)
    }

    // 从历史记录里收集磨豆机和机器
    const grinders = new Set<string>(DEFAULT_GRINDERS)
    const machines = new Set<string>(DEFAULT_MACHINES)

    records.forEach((r) => {
      if (r.grinder) grinders.add(r.grinder)
      if (r.machine) machines.add(r.machine)
    })

    setGrinderSuggestions(Array.from(grinders))
    setMachineSuggestions(Array.from(machines))

    setLoading(false)
  }

  const handleSubmit = async () => {
    if (!id || !selectedBean) return
    setSubmitting(true)

    const record: Partial<NewBrewRecord> = {
      beanId: selectedBean.id,
      beanName: selectedBean.name,
      beanWeight: form.beanWeight,
      brewType: 'espresso',
      machine: form.machine,
      grinder: form.grinder,
      grindSetting: form.grindSetting,
      yieldWeight: form.yieldWeight,
      brewTime: form.brewTime,
      pressure: form.pressure,
      temperature: form.temperature,
      method: form.method,
      rating: form.rating,
      notes: form.notes,
    }

    await brewService.update(id, record)

    const sameBean = selectedBean.id === originalBeanId
    if (sameBean) {
      const delta = originalBeanWeight - form.beanWeight
      if (delta !== 0) {
        const bean = await coffeeBeanService.getById(selectedBean.id)
        if (bean) {
          await coffeeBeanService.updateQuantity(bean.id, Math.max(0, bean.quantity + delta))
        }
      }
    } else {
      const oldBean = await coffeeBeanService.getById(originalBeanId)
      if (oldBean) {
        await coffeeBeanService.updateQuantity(oldBean.id, oldBean.quantity + originalBeanWeight)
      }
      const newBean = await coffeeBeanService.getById(selectedBean.id)
      if (newBean) {
        await coffeeBeanService.updateQuantity(newBean.id, Math.max(0, newBean.quantity - form.beanWeight))
      }
    }

    navigate(`/espresso/${id}`)
  }

  const renderSelectedBean = () => {
    if (!selectedBean) {
      return (
        <button
          onClick={() => setShowBeanSheet(true)}
          className="w-full flex items-center gap-3 px-4 py-4 rounded-lg border-2 border-dashed border-coffee-300 text-coffee-500 hover:border-coffee-500 hover:text-coffee-700 transition-colors"
        >
          <Coffee className="w-5 h-5" />
          <span>点击选择咖啡豆</span>
        </button>
      )
    }

    const bestPeriod = parseBestPeriod(selectedBean.notes)
    const freshness = getFreshnessStatus(selectedBean.roastDate, bestPeriod)
    const freshnessLabel = getFreshnessLabel(freshness)

    return (
      <button
        onClick={() => setShowBeanSheet(true)}
        className="w-full text-left p-4 rounded-lg border border-coffee-200 bg-white hover:border-coffee-400 hover:bg-cream-50 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-coffee-900">{selectedBean.name}</div>
            <div className="text-sm text-coffee-500 mt-0.5">
              {selectedBean.origin || '未知产地'} · {selectedBean.quantity}g
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-medium px-2 py-1 rounded-full ${
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
            <ChevronRight className="w-4 h-4 text-coffee-400" />
          </div>
        </div>
      </button>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-coffee-300 border-t-coffee-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-10 bg-cream-100/95 backdrop-blur-sm border-b border-coffee-300/60 shadow-[0_2px_8px_rgba(62,39,35,0.05)] px-5 py-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/espresso/${id}`)}
              className="p-2 -ml-2 rounded-lg hover:bg-coffee-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-coffee-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-coffee-900">编辑意式记录</h1>
              <p className="text-sm text-coffee-600">修改萃取参数和感受</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-6 space-y-6">
        <div className="bg-white rounded-xl border border-coffee-100 p-5">
          <h3 className="font-medium text-coffee-800 mb-4 flex items-center gap-2">
            <Coffee className="w-4 h-4" />
            咖啡豆
          </h3>
          {renderSelectedBean()}
        </div>

        <div className="bg-white rounded-xl border border-coffee-100 p-5">
          <h3 className="font-medium text-coffee-800 mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            萃取参数
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-coffee-700 mb-2">粉量 (g)</label>
              <input
                type="number"
                value={form.beanWeight}
                onChange={(e) => setForm({ ...form, beanWeight: Number(e.target.value) })}
                className="w-full px-4 py-3 rounded-lg border border-coffee-200 bg-cream-50 text-coffee-900 focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500"
                min="10"
                max="30"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-coffee-700 mb-2">液重 (g)</label>
              <input
                type="number"
                value={form.yieldWeight}
                onChange={(e) => setForm({ ...form, yieldWeight: Number(e.target.value) })}
                className="w-full px-4 py-3 rounded-lg border border-coffee-200 bg-cream-50 text-coffee-900 focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500"
                min="15"
                max="60"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-coffee-700 mb-2 flex items-center gap-1">
                <Timer className="w-4 h-4" />
                时间 (s)
              </label>
              <input
                type="number"
                value={form.brewTime}
                onChange={(e) => setForm({ ...form, brewTime: Number(e.target.value) })}
                className="w-full px-4 py-3 rounded-lg border border-coffee-200 bg-cream-50 text-coffee-900 focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500"
                min="15"
                max="50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-coffee-700 mb-2">压力 (bar)</label>
              <input
                type="number"
                value={form.pressure}
                onChange={(e) => setForm({ ...form, pressure: Number(e.target.value) })}
                className="w-full px-4 py-3 rounded-lg border border-coffee-200 bg-cream-50 text-coffee-900 focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500"
                min="6"
                max="12"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-coffee-700 mb-2">水温 (°C)</label>
              <input
                type="number"
                value={form.temperature}
                onChange={(e) => setForm({ ...form, temperature: Number(e.target.value) })}
                className="w-full px-4 py-3 rounded-lg border border-coffee-200 bg-cream-50 text-coffee-900 focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500"
                min="85"
                max="98"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-coffee-100 p-5">
          <h3 className="font-medium text-coffee-800 mb-4">器具设置</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-coffee-700 mb-2">咖啡机</label>
              <input
                type="text"
                value={form.machine}
                onChange={(e) => setForm({ ...form, machine: e.target.value })}
                placeholder="输入或选择机器"
                list="machine-suggestions"
                className="w-full px-4 py-3 rounded-lg border border-coffee-200 bg-cream-50 text-coffee-900 placeholder:text-coffee-400 focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500"
              />
              <datalist id="machine-suggestions">
                {machineSuggestions.map((m) => <option key={m} value={m} />)}
              </datalist>
            </div>

            <div>
              <label className="block text-sm font-medium text-coffee-700 mb-2">磨豆机</label>
              <input
                type="text"
                value={form.grinder}
                onChange={(e) => setForm({ ...form, grinder: e.target.value })}
                placeholder="输入或选择磨豆机"
                list="grinder-suggestions"
                className="w-full px-4 py-3 rounded-lg border border-coffee-200 bg-cream-50 text-coffee-900 placeholder:text-coffee-400 focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500"
              />
              <datalist id="grinder-suggestions">
                {grinderSuggestions.map((g) => <option key={g} value={g} />)}
              </datalist>
            </div>

            <div>
              <label className="block text-sm font-medium text-coffee-700 mb-2">研磨刻度</label>
              <input
                type="text"
                value={form.grindSetting}
                onChange={(e) => setForm({ ...form, grindSetting: e.target.value })}
                placeholder="如: 2.0, 1.8, 中细"
                className="w-full px-4 py-3 rounded-lg border border-coffee-200 bg-cream-50 text-coffee-900 placeholder:text-coffee-400 focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-coffee-100 p-5">
          <h3 className="font-medium text-coffee-800 mb-4">冲煮方式</h3>
          <select
            value={form.method}
            onChange={(e) => setForm({ ...form, method: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border border-coffee-200 bg-cream-50 text-coffee-900 focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500"
          >
            <option value="">选择方式</option>
            {METHODS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div className="bg-white rounded-xl border border-coffee-100 p-5">
          <h3 className="font-medium text-coffee-800 mb-4 flex items-center gap-2">
            <Star className="w-4 h-4" />
            评价
          </h3>

          <div className="flex items-center gap-2 mb-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <button
                key={i}
                onClick={() => setForm({ ...form, rating: i + 1 })}
                className="p-2 rounded-lg hover:bg-coffee-100 transition-colors"
              >
                <Star
                  className={`w-8 h-8 ${
                    i < form.rating ? 'fill-amber-400 text-amber-400' : 'text-coffee-300'
                  }`}
                />
              </button>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-coffee-700 mb-2">感受与笔记</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="记录这次萃取的风味感受..."
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-coffee-200 bg-cream-50 text-coffee-900 placeholder:text-coffee-400 focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => navigate(`/espresso/${id}`)} className="flex-1 border border-coffee-300">
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={!selectedBean || submitting} className="flex-1">
            <Save className="w-4 h-4 mr-2" />
            {submitting ? '保存中...' : '保存修改'}
          </Button>
        </div>
      </main>

      <BeanPickerSheet
        isOpen={showBeanSheet}
        onClose={() => setShowBeanSheet(false)}
        beans={beans}
        selectedBeanId={selectedBean?.id}
        onSelect={(bean) => setSelectedBean(bean)}
      />

      <BottomNav currentPath={location.pathname} />
    </div>
  )
}
