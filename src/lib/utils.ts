import { differenceInDays } from 'date-fns'
import type { FreshnessStatus, BestPeriod, CoffeeBean } from '@/features/inventory/types'

export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ')
}

export function parseBestPeriod(notes: string): BestPeriod {
  const rangeMatch = notes.match(/最佳饮用期[：:]\s*(\d+)\s*天~\s*(\d+)\s*天/)
  if (rangeMatch) {
    return { restDays: parseInt(rangeMatch[1], 10), bestDays: parseInt(rangeMatch[2], 10) }
  }

  const singleMatch = notes.match(/最佳饮用期[：:]\s*(\d+)\s*天/)
  if (singleMatch) {
    return { restDays: 7, bestDays: parseInt(singleMatch[1], 10) }
  }

  return { restDays: 7, bestDays: 90 }
}

export function formatBestPeriod(restDays: number, bestDays: number): string {
  return `最佳饮用期：${restDays}天~${bestDays}天`
}

export function getDaysSinceRoast(roastDate: Date): number {
  return differenceInDays(new Date(), roastDate)
}

export function getFreshnessStatus(roastDate: Date, bestPeriod?: BestPeriod): FreshnessStatus {
  const days = getDaysSinceRoast(roastDate)
  const period = bestPeriod || { restDays: 7, bestDays: 90 }

  if (days < period.restDays) return 'resting'
  if (days <= period.bestDays) return 'good'
  if (days <= period.bestDays + 14) return 'aging'
  return 'expired'
}

export function getFreshnessLabel(status: FreshnessStatus): string {
  const labels: Record<FreshnessStatus, string> = {
    resting: '养豆中',
    good: '最佳饮用期',
    aging: '已过最佳期',
    expired: '已过期',
  }
  return labels[status]
}

export function getFreshnessDescription(status: FreshnessStatus, bestPeriod?: BestPeriod): string {
  const period = bestPeriod || { restDays: 7, bestDays: 90 }
  const descriptions: Record<FreshnessStatus, string> = {
    resting: `建议养豆 ${period.restDays} 天后饮用`,
    good: `${period.restDays}~${period.bestDays} 天最佳饮用期`,
    aging: `已超过 ${period.bestDays} 天最佳期`,
    expired: '已过最佳饮用期，风味明显下降',
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
