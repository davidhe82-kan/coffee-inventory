import { supabase, isSupabaseConfigured } from '@/supabase'
import type { BrewRecord, NewBrewRecord } from '../types'

export const brewService = {
  async getAll(): Promise<BrewRecord[]> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('brew_records')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase error:', error)
        return []
      }

      return data.map((row) => ({
        id: row.id,
        beanId: row.bean_id,
        beanName: row.bean_name,
        beanWeight: row.bean_weight,
        waterTemp: row.water_temp,
        grinder: row.grinder,
        grindSetting: row.grind_setting,
        method: row.method,
        technique: row.technique,
        dripper: row.dripper,
        rating: row.rating,
        notes: row.notes,
        createdAt: new Date(row.created_at),
      }))
    }

    const stored = localStorage.getItem('brew_records')
    return stored ? JSON.parse(stored) : []
  },

  async getById(id: string): Promise<BrewRecord | null> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('brew_records')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !data) {
        const records = await this.getAll()
        return records.find((r) => r.id === id) || null
      }

      return {
        id: data.id,
        beanId: data.bean_id,
        beanName: data.bean_name,
        beanWeight: data.bean_weight,
        waterTemp: data.water_temp,
        grinder: data.grinder,
        grindSetting: data.grind_setting,
        method: data.method,
        technique: data.technique,
        dripper: data.dripper,
        rating: data.rating,
        notes: data.notes,
        createdAt: new Date(data.created_at),
      }
    }

    const records = await this.getAll()
    return records.find((r) => r.id === id) || null
  },

  async create(record: NewBrewRecord): Promise<BrewRecord> {
    const newRecord: BrewRecord = {
      ...record,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    }

    if (isSupabaseConfigured()) {
      const { error } = await supabase.from('brew_records').insert({
        id: newRecord.id,
        bean_id: record.beanId,
        bean_name: record.beanName,
        bean_weight: record.beanWeight,
        water_temp: record.waterTemp,
        grinder: record.grinder,
        grind_setting: record.grindSetting,
        method: record.method,
        technique: record.technique,
        dripper: record.dripper,
        rating: record.rating,
        notes: record.notes,
        created_at: newRecord.createdAt.toISOString(),
      })

      if (error) {
        console.error('Supabase error:', error)
      }
    }

    const records = await this.getAll()
    records.unshift(newRecord)
    localStorage.setItem('brew_records', JSON.stringify(records))

    return newRecord
  },

  async delete(id: string): Promise<void> {
    if (isSupabaseConfigured()) {
      await supabase.from('brew_records').delete().eq('id', id)
    }

    const records = await this.getAll()
    const filtered = records.filter((r) => r.id !== id)
    localStorage.setItem('brew_records', JSON.stringify(filtered))
  },
}