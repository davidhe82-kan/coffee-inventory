import { supabase, isSupabaseConfigured } from '@/supabase'
import { localStorageService } from '@/lib/localStorageService'
import type { CoffeeBean, CoffeeBeanFormData } from '../types'

export const coffeeBeanService = {
  async getAll(): Promise<CoffeeBean[]> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('coffee_beans')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase error:', error)
        // 确保所有 bean 都有 farm 字段，保持向后兼容
        return localStorageService.getAllBeans().map((bean) => ({
          ...bean,
          farm: bean.farm || '',
        })) as CoffeeBean[]
      }

      if (!data || data.length === 0) {
        // 确保所有 bean 都有 farm 字段，保持向后兼容
        return localStorageService.getAllBeans().map((bean) => ({
          ...bean,
          farm: bean.farm || '',
        })) as CoffeeBean[]
      }

      return data.map((row) => ({
        id: row.id,
        name: row.name,
        origin: row.origin || '',
        roaster: row.roaster || '',
        farm: row.farm || '',
        beanVariety: row.bean_variety || '',
        processingMethod: row.processing_method || '',
        roastLevel: row.roast_level || 'medium',
        roastDate: new Date(row.roast_date + 'Z'),
        quantity: row.quantity || 0,
        totalQuantity: row.total_quantity || 0,
        price: row.price || 0,
        notes: row.notes || '',
        isArchived: row.is_archived || false,
        createdAt: new Date(row.created_at + 'Z'),
        updatedAt: new Date(row.updated_at + 'Z'),
      }))
    }

    return localStorageService.getAllBeans()
  },

  async getById(id: string): Promise<CoffeeBean | null> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('coffee_beans')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !data) {
        const beans = localStorageService.getAllBeans()
        return beans.find((b) => b.id === id) || null
      }

      return {
        id: data.id,
        name: data.name,
        origin: data.origin || '',
        roaster: data.roaster || '',
        beanVariety: data.bean_variety || '',
        processingMethod: data.processing_method || '',
        roastLevel: data.roast_level || 'medium',
        roastDate: new Date(data.roast_date + 'Z'),
        quantity: data.quantity || 0,
        totalQuantity: data.total_quantity || 0,
        price: data.price || 0,
        notes: data.notes || '',
        isArchived: data.is_archived || false,
        createdAt: new Date(data.created_at + 'Z'),
        updatedAt: new Date(data.updated_at + 'Z'),
      }
    }

    const beans = localStorageService.getAllBeans()
    const bean = beans.find((b) => b.id === id)
    if (!bean) return null
    // 确保有 farm 字段，保持向后兼容
    return { ...bean, farm: bean.farm || '' } as CoffeeBean
  },

  async create(data: CoffeeBeanFormData): Promise<CoffeeBean> {
    const now = new Date().toISOString()
    const docData = {
      name: data.name,
      origin: data.origin || '',
      roaster: data.roaster || '',
      farm: data.farm || '',
      bean_variety: data.beanVariety || '',
      processing_method: data.processingMethod || '',
      roast_level: data.roastLevel,
      roast_date: data.roastDate.toISOString(),
      quantity: data.quantity,
      total_quantity: data.totalQuantity,
      price: data.price,
      notes: data.notes || '',
      is_archived: false,
      created_at: now,
      updated_at: now,
    }

    if (isSupabaseConfigured()) {
      const { data: result, error } = await supabase
        .from('coffee_beans')
        .insert(docData)
        .select()
        .single()

      if (error) {
        console.error('Supabase create error:', error)
        throw new Error('Failed to create bean in Supabase')
      }

      return {
        id: result.id,
        name: result.name,
        origin: result.origin || '',
        roaster: result.roaster || '',
        farm: result.farm || '',
        beanVariety: result.bean_variety || '',
        processingMethod: result.processing_method || '',
        roastLevel: result.roast_level,
        roastDate: new Date(result.roast_date),
        quantity: result.quantity,
        totalQuantity: result.total_quantity,
        price: result.price,
        notes: result.notes || '',
        isArchived: result.is_archived || false,
        createdAt: new Date(result.created_at),
        updatedAt: new Date(result.updated_at),
      }
    }

    return localStorageService.addBean({
      name: data.name,
      origin: data.origin || '',
      roaster: data.roaster || '',
      farm: data.farm || '',
      beanVariety: data.beanVariety || '',
      processingMethod: data.processingMethod || '',
      roastLevel: data.roastLevel,
      roastDate: data.roastDate,
      quantity: data.quantity,
      totalQuantity: data.totalQuantity,
      price: data.price,
      notes: data.notes || '',
    })
  },

  async update(id: string, data: Partial<CoffeeBeanFormData>): Promise<void> {
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (data.name !== undefined) updateData.name = data.name
    if (data.origin !== undefined) updateData.origin = data.origin
    if (data.roaster !== undefined) updateData.roaster = data.roaster
    if (data.farm !== undefined) updateData.farm = data.farm
    if (data.beanVariety !== undefined) updateData.bean_variety = data.beanVariety
    if (data.processingMethod !== undefined) updateData.processing_method = data.processingMethod
    if (data.roastLevel !== undefined) updateData.roast_level = data.roastLevel
    if (data.quantity !== undefined) updateData.quantity = data.quantity
    if (data.totalQuantity !== undefined) updateData.total_quantity = data.totalQuantity
    if (data.price !== undefined) updateData.price = data.price
    if (data.notes !== undefined) updateData.notes = data.notes
    if (data.roastDate !== undefined) updateData.roast_date = data.roastDate.toISOString()

    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('coffee_beans')
        .update(updateData)
        .eq('id', id)

      if (error) {
        console.error('Supabase update error:', error)
      }
    }
  },

  async updateQuantity(id: string, quantity: number): Promise<void> {
    const allBeans = localStorageService.getAllBeans()
    const beanIndex = allBeans.findIndex((b) => b.id === id)
    if (beanIndex !== -1) {
      allBeans[beanIndex].quantity = quantity
      allBeans[beanIndex].updatedAt = new Date()
      localStorage.setItem('coffee_beans_local', JSON.stringify(allBeans))
    }

    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('coffee_beans')
        .update({
          quantity,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (error) {
        console.error('Supabase updateQuantity error:', error)
      }
    }
  },

  async archiveBean(id: string, archive: boolean): Promise<void> {
    const allBeans = localStorageService.getAllBeans()
    const beanIndex = allBeans.findIndex((b) => b.id === id)
    if (beanIndex !== -1) {
      allBeans[beanIndex].isArchived = archive
      allBeans[beanIndex].updatedAt = new Date()
      localStorage.setItem('coffee_beans_local', JSON.stringify(allBeans))
    }

    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('coffee_beans')
        .update({
          is_archived: archive,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (error) {
        console.error('Supabase archiveBean error:', error)
      }
    }
  },

  async delete(id: string): Promise<void> {
    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('coffee_beans')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Supabase delete error:', error)
      }
    }
  },

  async addSampleBean(): Promise<CoffeeBean> {
    return this.create({
      name: 'Laners 翼神传说',
      origin: '巴拿马',
      roaster: '',
      farm: '索菲亚',
      beanVariety: '瑰夏',
      processingMethod: '日晒',
      roastLevel: 'light',
      roastDate: new Date('2026-04-20'),
      quantity: 15,
      totalQuantity: 15,
      price: 87,
      notes: '风味：荔枝花、血橙、荔枝 | 最佳饮用期：7天~90天',
    })
  },
}
