import { useState, useEffect, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { useCoffeeBeans } from '../hooks/useCoffeeBeans'
import { coffeeBeanService } from '../services/coffeeBeanService'
import type { CoffeeBeanFormData, RoastLevel } from '../types'
import { parseBestPeriod, formatBestPeriod } from '@/lib/utils'
import { ArrowLeft, Save } from 'lucide-react'

interface BeanFormProps {
  initialData?: Partial<CoffeeBeanFormData>
  beanId?: string
  isEdit?: boolean
}

function stripBestPeriodFromNotes(notes: string): string {
  return notes.replace(/\s*\|?\s*最佳饮用期[：:]\s*\d+\s*天~\s*\d+\s*天\s*\|?\s*/, '')
    .replace(/\s*\|?\s*最佳饮用期[：:]\s*\d+\s*天\s*\|?\s*/, '')
    .trim()
}

export function BeanForm({ initialData, beanId, isEdit = false }: BeanFormProps) {
  const navigate = useNavigate()
  const { addBean, updateBean } = useCoffeeBeans()
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<{
    origins: string[]
    roasters: string[]
    farms: string[]
    beanVarieties: string[]
    processingMethods: string[]
  }>({ origins: [], roasters: [], farms: [], beanVarieties: [], processingMethods: [] })

  const rawNotes = initialData?.notes || ''
  const period = parseBestPeriod(rawNotes)
  const cleanedNotes = stripBestPeriodFromNotes(rawNotes)

  const [formData, setFormData] = useState<CoffeeBeanFormData>({
    name: initialData?.name || '',
    origin: initialData?.origin || '',
    roaster: initialData?.roaster || '',
    farm: initialData?.farm || '',
    beanVariety: initialData?.beanVariety || '',
    processingMethod: initialData?.processingMethod || '',
    roastLevel: initialData?.roastLevel || 'medium',
    roastDate: initialData?.roastDate || new Date(),
    quantity: initialData?.quantity || 0,
    totalQuantity: initialData?.totalQuantity || 0,
    price: initialData?.price || 0,
    notes: cleanedNotes,
    restDays: initialData?.restDays || period.restDays,
    bestDays: initialData?.bestDays || period.bestDays,
  })

  useEffect(() => {
    const loadSuggestions = async () => {
      const beans = await coffeeBeanService.getAll()
      const origins = [...new Set(beans.map((b) => b.origin).filter(Boolean))]
      const roasters = [...new Set(beans.map((b) => b.roaster).filter(Boolean))]
      const farms = [...new Set(beans.map((b) => b.farm || '').filter(Boolean))]
      const beanVarieties = [...new Set(beans.map((b) => b.beanVariety).filter(Boolean))]
      const processingMethods = [...new Set(beans.map((b) => b.processingMethod).filter(Boolean))]
      setSuggestions({ origins, roasters, farms, beanVarieties, processingMethods })
    }
    loadSuggestions()
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    try {
      setLoading(true)
      const periodText = formatBestPeriod(formData.restDays || 7, formData.bestDays || 90)
      const finalNotes = formData.notes.trim()
        ? `${formData.notes.trim()} | ${periodText}`
        : periodText

      if (isEdit && beanId) {
        await updateBean(beanId, { ...formData, notes: finalNotes })
        navigate(`/bean/${beanId}`)
      } else {
        const newBean = await addBean({ ...formData, notes: finalNotes })
        navigate(`/bean/${newBean.id}`)
      }
    } catch (error) {
      console.error('Failed to save bean:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: keyof CoffeeBeanFormData, value: string | number | Date) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => navigate(isEdit ? `/bean/${beanId}` : '/')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回
        </Button>
        <h2 className="text-xl font-semibold text-coffee-800">
          {isEdit ? '编辑咖啡豆' : '添加新咖啡豆'}
        </h2>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Input
          label="咖啡豆名称 *"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="例如：耶加雪菲"
          required
          className="md:col-span-2"
        />

        <div>
          <label className="text-sm font-medium text-coffee-700 block mb-1.5">产地</label>
          <input
            type="text"
            value={formData.origin}
            onChange={(e) => handleChange('origin', e.target.value)}
            placeholder="例如：埃塞俄比亚"
            list="origin-suggestions"
            className="w-full px-4 py-2.5 rounded-lg border border-coffee-300 bg-cream-50 text-coffee-900 placeholder:text-coffee-400 focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 transition-colors duration-200"
          />
          <datalist id="origin-suggestions">
            {suggestions.origins.map((v) => <option key={v} value={v} />)}
          </datalist>
        </div>

        <div>
          <label className="text-sm font-medium text-coffee-700 block mb-1.5">烘焙商</label>
          <input
            type="text"
            value={formData.roaster}
            onChange={(e) => handleChange('roaster', e.target.value)}
            placeholder="例如：%ARABICA"
            list="roaster-suggestions"
            className="w-full px-4 py-2.5 rounded-lg border border-coffee-300 bg-cream-50 text-coffee-900 placeholder:text-coffee-400 focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 transition-colors duration-200"
          />
          <datalist id="roaster-suggestions">
            {suggestions.roasters.map((v) => <option key={v} value={v} />)}
          </datalist>
        </div>

        <div>
          <label className="text-sm font-medium text-coffee-700 block mb-1.5">庄园/生产地点</label>
          <input
            type="text"
            value={formData.farm}
            onChange={(e) => handleChange('farm', e.target.value)}
            placeholder="例如：索菲亚庄园"
            list="farm-suggestions"
            className="w-full px-4 py-2.5 rounded-lg border border-coffee-300 bg-cream-50 text-coffee-900 placeholder:text-coffee-400 focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 transition-colors duration-200"
          />
          <datalist id="farm-suggestions">
            {suggestions.farms.map((v) => <option key={v} value={v} />)}
          </datalist>
        </div>

        <div>
          <label className="text-sm font-medium text-coffee-700 block mb-1.5">豆种</label>
          <input
            type="text"
            value={formData.beanVariety}
            onChange={(e) => handleChange('beanVariety', e.target.value)}
            placeholder="例如：埃塞俄比亚原生种、卡杜拉、艺伎"
            list="bean-variety-suggestions"
            className="w-full px-4 py-2.5 rounded-lg border border-coffee-300 bg-cream-50 text-coffee-900 placeholder:text-coffee-400 focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 transition-colors duration-200"
          />
          <datalist id="bean-variety-suggestions">
            {suggestions.beanVarieties.map((v) => <option key={v} value={v} />)}
          </datalist>
        </div>

        <div>
          <label className="text-sm font-medium text-coffee-700 block mb-1.5">处理法</label>
          <input
            type="text"
            value={formData.processingMethod}
            onChange={(e) => handleChange('processingMethod', e.target.value)}
            placeholder="例如：水洗、日晒、蜜处理、厌氧"
            list="processing-method-suggestions"
            className="w-full px-4 py-2.5 rounded-lg border border-coffee-300 bg-cream-50 text-coffee-900 placeholder:text-coffee-400 focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 transition-colors duration-200"
          />
          <datalist id="processing-method-suggestions">
            {suggestions.processingMethods.map((v) => <option key={v} value={v} />)}
          </datalist>
        </div>

        <Select
          label="烘焙程度"
          value={formData.roastLevel}
          onChange={(e) => handleChange('roastLevel', e.target.value as RoastLevel)}
          options={[
            { value: 'light', label: '浅烘' },
            { value: 'medium', label: '中烘' },
            { value: 'dark', label: '深烘' },
          ]}
        />

        <Input
          label="购入日期"
          type="date"
          value={formData.roastDate instanceof Date ? formData.roastDate.toISOString().split('T')[0] : ''}
          onChange={(e) => handleChange('roastDate', new Date(e.target.value))}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="当前库存 (g)"
            type="number"
            value={formData.quantity}
            onChange={(e) => handleChange('quantity', Number(e.target.value))}
            onFocus={(e) => e.target.select()}
            min={0}
          />
          <Input
            label="总购入量 (g)"
            type="number"
            value={formData.totalQuantity}
            onChange={(e) => {
              const v = Number(e.target.value)
              setFormData((prev) => ({
                ...prev,
                totalQuantity: v,
                ...(!isEdit ? { quantity: v } : {}),
              }))
            }}
            onFocus={(e) => e.target.select()}
            min={0}
          />
        </div>

        <Input
          label="价格 (元)"
          type="number"
          value={formData.price}
          onChange={(e) => handleChange('price', Number(e.target.value))}
          min={0}
          step={0.01}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="养豆期 (天)"
            type="number"
            value={formData.restDays}
            onChange={(e) => handleChange('restDays', Number(e.target.value))}
            min={0}
            max={90}
          />
          <Input
            label="最佳饮用期截止 (天)"
            type="number"
            value={formData.bestDays}
            onChange={(e) => handleChange('bestDays', Number(e.target.value))}
            min={(formData.restDays || 7) + 1}
            max={365}
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-sm font-medium text-coffee-700 block mb-1.5">
            风味备注
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="描述这款咖啡的风味特点..."
            rows={3}
            className="w-full px-4 py-2.5 rounded-lg border border-coffee-300 bg-cream-50 text-coffee-900 placeholder:text-coffee-400 focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 transition-colors duration-200 resize-none"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button variant="ghost" onClick={() => navigate(isEdit ? `/bean/${beanId}` : '/')} className="flex-1 border border-coffee-300">
          取消
        </Button>
        <Button onClick={handleSubmit} disabled={loading || !formData.name.trim() || (formData.bestDays || 90) <= (formData.restDays || 7)} className="flex-1">
          <Save className="w-4 h-4 mr-2" />
          {loading ? '保存中...' : '保存'}
        </Button>
      </div>
    </form>
  )
}
