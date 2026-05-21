const STORAGE_KEY = 'coffee_beans_local'
const TRANSACTIONS_KEY = 'coffee_transactions_local'

export interface LocalCoffeeBean {
  id: string
  name: string
  origin: string
  roaster: string
  farm: string
  beanVariety: string
  processingMethod: string
  roastLevel: 'light' | 'medium' | 'dark'
  roastDate: Date
  quantity: number
  totalQuantity: number
  price: number
  notes: string
  isArchived: boolean
  createdAt: Date
  updatedAt: Date
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

function loadFromStorage<T>(key: string): T[] {
  try {
    const data = localStorage.getItem(key)
    if (!data) return []
    const parsed = JSON.parse(data)
    return parsed.map((item: Record<string, unknown>) => ({
      ...item,
      roastDate: new Date(item.roastDate as string),
      createdAt: new Date(item.createdAt as string),
      updatedAt: new Date(item.updatedAt as string),
    }))
  } catch {
    return []
  }
}

function saveToStorage<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data))
}

export const localStorageService = {
  getAllBeans(): LocalCoffeeBean[] {
    return loadFromStorage<LocalCoffeeBean>(STORAGE_KEY)
  },

  addBean(bean: Omit<LocalCoffeeBean, 'id' | 'createdAt' | 'updatedAt' | 'isArchived'>): LocalCoffeeBean {
    const now = new Date()
    const newBean: LocalCoffeeBean = {
      ...bean,
      isArchived: false,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    }
    const beans = this.getAllBeans()
    beans.unshift(newBean)
    saveToStorage(STORAGE_KEY, beans)
    return newBean
  },

  updateBeanQuantity(id: string, quantity: number): void {
    const beans = this.getAllBeans()
    const index = beans.findIndex((b) => b.id === id)
    if (index !== -1) {
      beans[index].quantity = quantity
      beans[index].updatedAt = new Date()
      saveToStorage(STORAGE_KEY, beans)
    }
  },

  clearAll(): void {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(TRANSACTIONS_KEY)
  },
}

export const sampleBeanData = {
  name: 'Laners 翼神传说',
  origin: '巴拿马',
  roaster: '',
  farm: '索菲亚',
  beanVariety: '瑰夏',
  processingMethod: '日晒',
  roastLevel: 'light' as const,
  roastDate: new Date('2026-04-20'),
  quantity: 15,
  totalQuantity: 15,
  price: 87,
  notes: '风味：荔枝花、血橙、荔枝 | 最佳饮用期：7天~90天',
  isArchived: false,
}

export function addSampleBean(): LocalCoffeeBean {
  return localStorageService.addBean(sampleBeanData)
}
