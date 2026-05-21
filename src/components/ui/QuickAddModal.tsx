import { useState } from 'react'
import { Coffee, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { parseCoffeeBeanText } from '@/lib/parseCoffeeBeanText'
import { coffeeBeanService } from '@/features/inventory/services/coffeeBeanService'

interface QuickAddModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function QuickAddModal({ isOpen, onClose, onSuccess }: QuickAddModalProps) {
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [preview, setPreview] = useState<ReturnType<typeof parseCoffeeBeanText>>()
  const [submitting, setSubmitting] = useState(false)

  const handleTextChange = (value: string) => {
    setText(value)
    setError('')
    setPreview(undefined)

    if (value.trim()) {
      const result = parseCoffeeBeanText(value)
      setPreview(result)
    }
  }

  const handleSubmit = async () => {
    if (!preview?.success || !preview.data) {
      setError('解析失败，请检查格式')
      return
    }

    try {
      setSubmitting(true)
      await coffeeBeanService.create({
        name: preview.data.name!,
        origin: preview.data.origin || '',
        roaster: preview.data.roaster || '',
        roastLevel: preview.data.roastLevel || 'medium',
        roastDate: preview.data.roastDate || new Date(),
        quantity: preview.data.quantity || 0,
        totalQuantity: preview.data.totalQuantity || 0,
        price: preview.data.price || 0,
        notes: preview.data.notes || '',
      })
      onSuccess()
      onClose()
      setText('')
      setPreview(undefined)
    } catch (err) {
      setError('保存失败')
    } finally {
      setSubmitting(false)
    }
  }

  const modalFooter = (
    <>
      <Button variant="secondary" className="flex-1" onClick={onClose}>
        取消
      </Button>
      <Button
        className="flex-1"
        onClick={handleSubmit}
        disabled={!preview?.success || submitting}
      >
        {submitting ? '添加中...' : '添加'}
      </Button>
    </>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2">
          <Coffee className="w-5 h-5 text-coffee-600" />
          快捷添加咖啡豆
        </span>
      }
      footer={modalFooter}
    >
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-coffee-700 block mb-1.5">
            粘贴咖啡豆信息
          </label>
          <textarea
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="品名：xxx
净含量：xx克
产地：xxx
烘焙程度：浅焙/中焙/深焙
烘焙日期：2026-01-01
价格：xx元"
            rows={10}
            className="w-full px-4 py-3 rounded-lg border border-coffee-300 bg-cream-50 text-coffee-900 placeholder:text-coffee-400 focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 transition-colors resize-none font-mono text-sm"
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {preview && (
          <div className="bg-coffee-50 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex items-center gap-2 text-green-700 font-medium mb-3">
              <CheckCircle className="w-4 h-4" />
              预览
            </div>
            {preview.data?.name && (
              <div className="flex justify-between">
                <span className="text-coffee-500">品名</span>
                <span className="font-medium">{preview.data.name}</span>
              </div>
            )}
            {preview.data?.origin && (
              <div className="flex justify-between">
                <span className="text-coffee-500">产地</span>
                <span>{preview.data.origin}</span>
              </div>
            )}
            {preview.data?.quantity && preview.data.quantity > 0 && (
              <div className="flex justify-between">
                <span className="text-coffee-500">净含量</span>
                <span>{preview.data.quantity}g</span>
              </div>
            )}
            {preview.data?.price && preview.data.price > 0 && (
              <div className="flex justify-between">
                <span className="text-coffee-500">价格</span>
                <span>¥{preview.data.price}</span>
              </div>
            )}
            {preview.data?.notes && (
              <div className="mt-2 pt-2 border-t border-coffee-200 text-coffee-600 text-xs">
                {preview.data.notes}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}
