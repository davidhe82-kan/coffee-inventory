export type RoastLevel = 'light' | 'medium' | 'dark'

export type TransactionType = 'add' | 'consume'

export interface CoffeeBean {
  id: string
  name: string
  origin: string
  roaster: string
  farm?: string
  beanVariety: string
  processingMethod: string
  roastLevel: RoastLevel
  roastDate: Date
  quantity: number
  totalQuantity: number
  price: number
  notes: string
  isArchived: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Transaction {
  id: string
  beanId: string
  type: TransactionType
  amount: number
  timestamp: Date
  notes: string
}

export type FreshnessStatus = 'resting' | 'good' | 'aging' | 'expired'

export interface BestPeriod {
  restDays: number
  bestDays: number
}

export interface CoffeeBeanFormData {
  name: string
  origin: string
  roaster: string
  farm: string
  beanVariety: string
  processingMethod: string
  roastLevel: RoastLevel
  roastDate: Date
  quantity: number
  totalQuantity: number
  price: number
  notes: string
  restDays?: number
  bestDays?: number
}
