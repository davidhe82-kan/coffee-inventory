export interface BrewRecord {
  id: string
  beanId: string
  beanName: string
  beanWeight: number
  waterTemp: number
  grinder: string
  grindSetting: string
  method: string
  technique: string
  dripper: string
  rating: number
  notes: string
  createdAt: Date
}

export interface NewBrewRecord {
  beanId: string
  beanName: string
  beanWeight: number
  waterTemp: number
  grinder: string
  grindSetting: string
  method: string
  technique: string
  dripper: string
  rating: number
  notes: string
}