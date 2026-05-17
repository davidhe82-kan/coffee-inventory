import { supabase, isSupabaseConfigured } from '@/supabase'
import type { Transaction, TransactionType } from '../types'

const TX_STORAGE_KEY = 'coffee_transactions_local'

function loadLocalTransactions(beanId: string): Transaction[] {
  try {
    const data = localStorage.getItem(TX_STORAGE_KEY)
    if (!data) return []
    const all = JSON.parse(data) as Transaction[]
    return all.filter((tx) => tx.beanId === beanId)
  } catch {
    return []
  }
}

function saveLocalTransaction(tx: Transaction): void {
  try {
    const data = localStorage.getItem(TX_STORAGE_KEY)
    const all = data ? JSON.parse(data) as Transaction[] : []
    all.unshift(tx)
    localStorage.setItem(TX_STORAGE_KEY, JSON.stringify(all))
  } catch {
    // ignore
  }
}

export interface TransactionFormData {
  beanId: string
  type: TransactionType
  amount: number
  timestamp: Date
  notes: string
}

export const transactionService = {
  async getByBeanId(beanId: string): Promise<Transaction[]> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('bean_id', beanId)
        .order('timestamp', { ascending: false })

      if (error) {
        console.error('Supabase getTransactions error:', error)
        return loadLocalTransactions(beanId)
      }

      return data.map((row) => ({
        id: row.id,
        beanId: row.bean_id,
        type: row.type as TransactionType,
        amount: row.amount || 0,
        timestamp: new Date(row.timestamp),
        notes: row.notes || '',
      }))
    }

    return loadLocalTransactions(beanId)
  },

  async create(data: TransactionFormData): Promise<Transaction> {
    const newTx: Transaction = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      beanId: data.beanId,
      type: data.type,
      amount: data.amount,
      timestamp: data.timestamp,
      notes: data.notes,
    }

    if (isSupabaseConfigured()) {
      const { data: result, error } = await supabase
        .from('transactions')
        .insert({
          bean_id: data.beanId,
          type: data.type,
          amount: data.amount,
          timestamp: data.timestamp.toISOString(),
          notes: data.notes || '',
        })
        .select()
        .single()

      if (error) {
        console.error('Supabase createTransaction error:', error)
        saveLocalTransaction(newTx)
        return newTx
      }

      return {
        id: result.id,
        beanId: result.bean_id,
        type: result.type as TransactionType,
        amount: result.amount,
        timestamp: new Date(result.timestamp),
        notes: result.notes || '',
      }
    }

    saveLocalTransaction(newTx)
    return newTx
  },
}