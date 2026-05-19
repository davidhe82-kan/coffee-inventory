import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Coffee, Scale, ThermometerSun, Filter, Star, Save } from 'lucide-react'
import { brewService } from '@/features/brew/services/brewService'
import { coffeeBeanService } from '@/features/inventory/services/coffeeBeanService'
import type { NewBrewRecord } from '@/features/brew/types'
import type { CoffeeBean } from '@/features/inventory/types'
import { Button } from '@/components/ui/Button'

const GRINDERS = ['迈赫迪 E65S', '迈赫迪 EK43', 'Fellow Ode', 'Baratza Sette', 'Comandante', '其他']
const DRIPPERS = ['V60', 'Kalita Wave', 'Chemex', 'Melitta', 'Hario Switch', '其他']
const METHODS = ['手冲', '浸泡', '点滴', '冷萃', '冰滴', '其他']

export function AddBrewPage() {
  const navigate = useNavigate()
  const [beans, setBeans] = useState<CoffeeBean[]>([])
  const [selectedBean, setSelectedBean] = useState<CoffeeBean | null>(null)
  
  const [form, setForm] = useState({
    beanWeight: 15,
    waterTemp: 92,
    grinder: '',
    grindSetting: '',
    method: '',
    technique: '',
    dripper: '',
    rating: 3,
    notes: '',
  })

  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadBeans()
  }, [])

  const loadBeans = async () => {
    const data = await coffeeBeanService.getAll()
    setBeans(data)
    if (data.length > 0) {
      setSelectedBean(data[0])
    }
  }

  const handleSubmit = async () => {
    if (!selectedBean) return

    setSubmitting(true)
    
    const record: NewBrewRecord = {
      beanId: selectedBean.id,
      beanName: selectedBean.name,
      beanWeight: form.beanWeight,
      waterTemp: form.waterTemp,
      grinder: form.grinder,
      grindSetting: form.grindSetting,
      method: form.method,
      technique: form.technique,
      dripper: form.dripper,
      rating: form.rating,
      notes: form.notes,
    }

    await brewService.create(record)

    const newQuantity = Math.max(0, selectedBean.quantity - form.beanWeight)
    await coffeeBeanService.updateQuantity(selectedBean.id, newQuantity)

    navigate('/brew')
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 bg-cream-100/95 backdrop-blur-sm border-b border-coffee-300/60 shadow-[0_2px_8px_rgba(62,39,35,0.05)] px-5 py-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/brew')}
              className="p-2 -ml-2 rounded-lg hover:bg-coffee-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-coffee-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-coffee-900">添加手冲记录</h1>
              <p className="text-sm text-coffee-600">记录这次萃取的参数和感受</p>
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
          <select
            value={selectedBean?.id || ''}
            onChange={(e) => {
              const bean = beans.find((b) => b.id === e.target.value)
              setSelectedBean(bean || null)
            }}
            className="w-full px-4 py-3 rounded-lg border border-coffee-200 bg-cream-50 text-coffee-900 focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500"
          >
            <option value="">选择咖啡豆</option>
            {beans.map((bean) => (
              <option key={bean.id} value={bean.id}>
                {bean.name} ({bean.origin})
              </option>
            ))}
          </select>
        </div>

        <div className="bg-white rounded-xl border border-coffee-100 p-5">
          <h3 className="font-medium text-coffee-800 mb-4 flex items-center gap-2">
            <Scale className="w-4 h-4" />
            萃取参数
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-coffee-700 mb-2">豆量 (g)</label>
              <input
                type="number"
                value={form.beanWeight}
                onChange={(e) => setForm({ ...form, beanWeight: Number(e.target.value) })}
                className="w-full px-4 py-3 rounded-lg border border-coffee-200 bg-cream-50 text-coffee-900 focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500"
                min="1"
                max="50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-coffee-700 mb-2">
                <ThermometerSun className="w-4 h-4 inline mr-1" />
                水温 (°C)
              </label>
              <input
                type="number"
                value={form.waterTemp}
                onChange={(e) => setForm({ ...form, waterTemp: Number(e.target.value) })}
                className="w-full px-4 py-3 rounded-lg border border-coffee-200 bg-cream-50 text-coffee-900 focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500"
                min="70"
                max="100"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-coffee-100 p-5">
          <h3 className="font-medium text-coffee-800 mb-4 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            器具设置
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-coffee-700 mb-2">磨豆机</label>
              <select
                value={form.grinder}
                onChange={(e) => setForm({ ...form, grinder: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-coffee-200 bg-cream-50 text-coffee-900 focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500"
              >
                <option value="">选择磨豆机</option>
                {GRINDERS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-coffee-700 mb-2">研磨刻度</label>
              <input
                type="text"
                value={form.grindSetting}
                onChange={(e) => setForm({ ...form, grindSetting: e.target.value })}
                placeholder="如: 8, 中粗, 18格"
                className="w-full px-4 py-3 rounded-lg border border-coffee-200 bg-cream-50 text-coffee-900 placeholder:text-coffee-400 focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-coffee-700 mb-2">滤杯</label>
              <select
                value={form.dripper}
                onChange={(e) => setForm({ ...form, dripper: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-coffee-200 bg-cream-50 text-coffee-900 focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500"
              >
                <option value="">选择滤杯</option>
                {DRIPPERS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-coffee-100 p-5">
          <h3 className="font-medium text-coffee-800 mb-4">冲煮方法</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-coffee-700 mb-2">冲煮方式</label>
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
            
            <div>
              <label className="block text-sm font-medium text-coffee-700 mb-2">手法描述</label>
              <textarea
                value={form.technique}
                onChange={(e) => setForm({ ...form, technique: e.target.value })}
                placeholder="描述你的冲煮手法，如: 中心注水，三段式..."
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-coffee-200 bg-cream-50 text-coffee-900 placeholder:text-coffee-400 focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 resize-none"
              />
            </div>
          </div>
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
          <Button variant="ghost" onClick={() => navigate('/brew')} className="flex-1 border border-coffee-300">
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={!selectedBean || submitting} className="flex-1">
            <Save className="w-4 h-4 mr-2" />
            {submitting ? '保存中...' : '保存记录'}
          </Button>
        </div>
      </main>
    </div>
  )
}