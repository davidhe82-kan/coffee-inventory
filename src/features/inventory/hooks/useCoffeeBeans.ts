import { useState, useEffect, useCallback } from 'react'
import { coffeeBeanService } from '../services/coffeeBeanService'
import type { CoffeeBean, CoffeeBeanFormData } from '../types'

export function useCoffeeBeans() {
  const [beans, setBeans] = useState<CoffeeBean[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBeans = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await coffeeBeanService.getAll()
      setBeans(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch beans')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBeans()
  }, [fetchBeans])

  const addBean = useCallback(async (data: CoffeeBeanFormData) => {
    const newBean = await coffeeBeanService.create(data)
    setBeans((prev) => [newBean, ...prev])
    return newBean
  }, [])

  const updateBean = useCallback(async (id: string, data: Partial<CoffeeBeanFormData>) => {
    await coffeeBeanService.update(id, data)
    setBeans((prev) =>
      prev.map((bean) =>
        bean.id === id ? { ...bean, name: data.name ?? bean.name, origin: data.origin ?? bean.origin, roaster: data.roaster ?? bean.roaster, quantity: data.quantity ?? bean.quantity, totalQuantity: data.totalQuantity ?? bean.totalQuantity, price: data.price ?? bean.price, notes: data.notes ?? bean.notes } : bean
      )
    )
  }, [])

  const deleteBean = useCallback(async (id: string) => {
    await coffeeBeanService.delete(id)
    setBeans((prev) => prev.filter((bean) => bean.id !== id))
  }, [])

  const getBeanById = useCallback((id: string) => {
    return beans.find((bean) => bean.id === id) || null
  }, [beans])

  return {
    beans,
    loading,
    error,
    addBean,
    updateBean,
    deleteBean,
    getBeanById,
    refresh: fetchBeans,
  }
}