export type BrewType = 'pour-over' | 'espresso'

export interface BrewRecord {
  id: string
  beanId: string
  beanName: string
  beanWeight: number
  brewType: BrewType
  // 手冲相关
  waterTemp?: number
  dripper?: string
  technique?: string
  // 意式相关
  machine?: string
  yieldWeight?: number
  brewTime?: number
  pressure?: number
  temperature?: number
  // 通用
  grinder: string
  grindSetting: string
  method: string
  rating: number
  notes: string
  createdAt: Date
}

export interface NewBrewRecord {
  beanId: string
  beanName: string
  beanWeight: number
  brewType: BrewType
  waterTemp?: number
  dripper?: string
  technique?: string
  machine?: string
  yieldWeight?: number
  brewTime?: number
  pressure?: number
  temperature?: number
  grinder: string
  grindSetting: string
  method: string
  rating: number
  notes: string
}