import { useState, useEffect, useCallback } from 'react'
import { transactionService } from '../services/transactionService'
import type { TransactionFormData } from '../services/transactionService'
import type { Transaction } from '../types'

export function useTransactions(beanId: string | undefined) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTransactions = useCallback(async () => {
    if (!beanId) return
    try {
      setLoading(true)
      setError(null)
      const data = await transactionService.getByBeanId(beanId)
      setTransactions(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions')
    } finally {
      setLoading(false)
    }
  }, [beanId])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const addTransaction = useCallback(async (data: Omit<TransactionFormData, 'beanId'>) => {
    if (!beanId) return null
    const newTransaction = await transactionService.create({
      ...data,
      beanId,
    })
    setTransactions((prev) => [newTransaction, ...prev])
    return newTransaction
  }, [beanId])

  return {
    transactions,
    loading,
    error,
    addTransaction,
    refresh: fetchTransactions,
  }
}