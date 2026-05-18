import { differenceInDays } from 'date-fns'
import type { FreshnessStatus, CoffeeBean } from '@/features/inventory/types'

export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ')
}

export function parseBestPeriod(notes: string): number {
  const rangeMatch = notes.match(/最佳饮用期[：:]\s*\d+\s*天~\s*(\d+)\s*天/)
  if (rangeMatch) {
    const days = parseInt(rangeMatch[1], 10)
    if (days > 0) return days
  }

  const singleMatch = notes.match(/最佳饮用期[：:]\s*(\d+)\s*天/)
  if (singleMatch) {
    const days = parseInt(singleMatch[1], 10)
    if (days > 0) return days
  }

  return 90
}

export function getDaysSinceRoast(roastDate: Date): number {
  return differenceInDays(new Date(), roastDate)
}

export function getFreshnessStatus(roastDate: Date, bestPeriod: number = 90): FreshnessStatus {
  const days = getDaysSinceRoast(roastDate)

  if (days < 7) return 'fresh'
  if (days <= bestPeriod) return 'good'
  if (days <= bestPeriod * 1.3) return 'aging'
  return 'expired'
}

export function getFreshnessLabel(status: FreshnessStatus): string {
  const labels: Record<FreshnessStatus, string> = {
    fresh: '新鲜',
    good: '最佳饮用期',
    aging: '接近过期',
    expired: '已过期',
  }
  return labels[status]
}

export function getFreshnessDescription(status: FreshnessStatus, bestPeriod: number): string {
  const descriptions: Record<FreshnessStatus, string> = {
    fresh: '刚烘焙不久，排气中',
    good: `在最佳饮用期内`,
    aging: `即将超过${bestPeriod}天最佳期`,
    expired: '已超过最佳饮用期',
  }
  return descriptions[status]
}

export function formatQuantity(grams: number): string {
  if (grams >= 1000) {
    return `${(grams / 1000).toFixed(1)}kg`
  }
  return `${grams}g`
}

export function calculateRemainingPercent(bean: CoffeeBean): number {
  if (bean.totalQuantity === 0) return 0
  return Math.round((bean.quantity / bean.totalQuantity) * 100)
}

export function getRoastLevelLabel(level: 'light' | 'medium' | 'dark'): string {
  const labels: Record<string, string> = {
    light: '浅烘',
    medium: '中烘',
    dark: '深烘',
  }
  return labels[level] || level
}

export function calculatePricePerGram(price: number, grams: number): string {
  if (grams <= 0) return '-'
  const perGram = price / grams
  return `¥${perGram.toFixed(2)}/g`
}