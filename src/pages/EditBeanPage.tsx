import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { BeanForm } from '@/features/inventory/components/BeanForm'
import { useCoffeeBeans } from '@/features/inventory/hooks/useCoffeeBeans'
import type { CoffeeBeanFormData } from '@/features/inventory/types'

export function EditBeanPage() {
  const { id } = useParams<{ id: string }>()
  const { beans } = useCoffeeBeans()
  const [initialData, setInitialData] = useState<Partial<CoffeeBeanFormData> | null>(null)

  useEffect(() => {
    if (beans.length > 0 && id) {
      const bean = beans.find((b) => b.id === id)
      if (bean) {
        setInitialData({
          name: bean.name,
          origin: bean.origin,
          roaster: bean.roaster,
          roastLevel: bean.roastLevel,
          roastDate: new Date(bean.roastDate),
          quantity: bean.quantity,
          totalQuantity: bean.totalQuantity,
          price: bean.price,
          notes: bean.notes,
        })
      }
    }
  }, [beans, id])

  if (!initialData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-coffee-300 border-t-coffee-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20">
      <main className="max-w-2xl mx-auto px-5 py-6">
        <BeanForm initialData={initialData} beanId={id} isEdit />
      </main>
    </div>
  )
}