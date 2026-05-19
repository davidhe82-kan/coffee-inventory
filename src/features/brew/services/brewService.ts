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
        createdAt: new Date(row.created_at + '+08:00'),
      }))
    }

    const stored = localStorage.getItem('brew_records')
    if (!stored) return []
    return JSON.parse(stored).map((row: BrewRecord) => ({
      ...row,
      createdAt: new Date(row.createdAt),
    }))
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
        createdAt: new Date(data.created_at + '+08:00'),
      }))
    }

    const records = await this.getAll()
    const stored = localStorage.getItem('brew_records')
    if (!stored) return null
    const parsed = JSON.parse(stored).map((row: BrewRecord) => ({
      ...row,
      createdAt: new Date(row.createdAt),
    }))
    return parsed.find((r: BrewRecord) => r.id === id) || null
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

  async update(id: string, record: Partial<NewBrewRecord>): Promise<void> {
    if (isSupabaseConfigured()) {
      const updateData: Record<string, unknown> = {}
      if (record.beanId !== undefined) updateData.bean_id = record.beanId
      if (record.beanName !== undefined) updateData.bean_name = record.beanName
      if (record.beanWeight !== undefined) updateData.bean_weight = record.beanWeight
      if (record.waterTemp !== undefined) updateData.water_temp = record.waterTemp
      if (record.grinder !== undefined) updateData.grinder = record.grinder
      if (record.grindSetting !== undefined) updateData.grind_setting = record.grindSetting
      if (record.method !== undefined) updateData.method = record.method
      if (record.technique !== undefined) updateData.technique = record.technique
      if (record.dripper !== undefined) updateData.dripper = record.dripper
      if (record.rating !== undefined) updateData.rating = record.rating
      if (record.notes !== undefined) updateData.notes = record.notes

      const { error } = await supabase
        .from('brew_records')
        .update(updateData)
        .eq('id', id)

      if (error) {
        console.error('Supabase update error:', error)
      }
    }

    const records = await this.getAll()
    const index = records.findIndex((r) => r.id === id)
    if (index !== -1) {
      records[index] = { ...records[index], ...record }
      localStorage.setItem('brew_records', JSON.stringify(records))
    }
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