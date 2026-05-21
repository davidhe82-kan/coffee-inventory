import { supabase, isSupabaseConfigured } from '@/supabase'
import type { BrewRecord, NewBrewRecord, BrewType } from '../types'

export const brewService = {
  async getAll(brewType?: BrewType): Promise<BrewRecord[]> {
    if (isSupabaseConfigured()) {
      let query = supabase
        .from('brew_records')
        .select('*')
        .order('created_at', { ascending: false })

      if (brewType) {
        query = query.eq('brew_type', brewType)
      }

      const { data, error } = await query

      if (error) {
        console.error('Supabase error:', error)
        const records = this.getLocalRecords()
        return brewType ? records.filter(r => r.brewType === brewType) : records
      }

      const mapped = data.map((row) => ({
        id: row.id,
        beanId: row.bean_id,
        beanName: row.bean_name,
        beanWeight: row.bean_weight,
        brewType: row.brew_type || 'pour-over',
        waterTemp: row.water_temp,
        dripper: row.dripper,
        technique: row.technique,
        machine: row.machine,
        yieldWeight: row.yield_weight,
        brewTime: row.brew_time,
        pressure: row.pressure,
        temperature: row.temperature,
        grinder: row.grinder,
        grindSetting: row.grind_setting,
        method: row.method,
        rating: row.rating,
        notes: row.notes,
        createdAt: new Date(row.created_at + 'Z'),
      }))

      return brewType ? mapped.filter(r => r.brewType === brewType) : mapped
    }

    const records = this.getLocalRecords()
    return brewType ? records.filter(r => r.brewType === brewType) : records
  },

  getLocalRecords(): BrewRecord[] {
    const stored = localStorage.getItem('brew_records')
    if (!stored) return []
    return JSON.parse(stored).map((row: any) => ({
      ...row,
      brewType: row.brewType || 'pour-over',
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
        brewType: data.brew_type || 'pour-over',
        waterTemp: data.water_temp,
        dripper: data.dripper,
        technique: data.technique,
        machine: data.machine,
        yieldWeight: data.yield_weight,
        brewTime: data.brew_time,
        pressure: data.pressure,
        temperature: data.temperature,
        grinder: data.grinder,
        grindSetting: data.grind_setting,
        method: data.method,
        rating: data.rating,
        notes: data.notes,
        createdAt: new Date(data.created_at + 'Z'),
      }
    }

    const stored = localStorage.getItem('brew_records')
    if (!stored) return null
    const parsed = JSON.parse(stored).map((row: any) => ({
      ...row,
      brewType: row.brewType || 'pour-over',
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
        brew_type: record.brewType,
        water_temp: record.waterTemp,
        dripper: record.dripper,
        technique: record.technique,
        machine: record.machine,
        yield_weight: record.yieldWeight,
        brew_time: record.brewTime,
        pressure: record.pressure,
        temperature: record.temperature,
        grinder: record.grinder,
        grind_setting: record.grindSetting,
        method: record.method,
        rating: record.rating,
        notes: record.notes,
        created_at: newRecord.createdAt.toISOString(),
      })

      if (error) {
        console.error('Supabase error:', error)
      }
    }

    const records = this.getLocalRecords()
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
      if (record.brewType !== undefined) updateData.brew_type = record.brewType
      if (record.waterTemp !== undefined) updateData.water_temp = record.waterTemp
      if (record.dripper !== undefined) updateData.dripper = record.dripper
      if (record.technique !== undefined) updateData.technique = record.technique
      if (record.machine !== undefined) updateData.machine = record.machine
      if (record.yieldWeight !== undefined) updateData.yield_weight = record.yieldWeight
      if (record.brewTime !== undefined) updateData.brew_time = record.brewTime
      if (record.pressure !== undefined) updateData.pressure = record.pressure
      if (record.temperature !== undefined) updateData.temperature = record.temperature
      if (record.grinder !== undefined) updateData.grinder = record.grinder
      if (record.grindSetting !== undefined) updateData.grind_setting = record.grindSetting
      if (record.method !== undefined) updateData.method = record.method
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

    const records = this.getLocalRecords()
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

    const records = this.getLocalRecords()
    const filtered = records.filter((r) => r.id !== id)
    localStorage.setItem('brew_records', JSON.stringify(filtered))
  },
}