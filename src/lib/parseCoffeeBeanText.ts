import type { CoffeeBeanFormData, RoastLevel } from '@/features/inventory/types'

interface ParseResult {
  success: boolean
  data?: Partial<CoffeeBeanFormData>
  error?: string
}

function parseRoastLevel(text: string): RoastLevel {
  const lower = text.toLowerCase()
  if (lower.includes('浅') || lower.includes('light')) return 'light'
  if (lower.includes('深') || lower.includes('dark')) return 'dark'
  return 'medium'
}

function parseNumber(text: string): number {
  const match = text.match(/[\d.]+/)
  return match ? parseFloat(match[0]) : 0
}

function parseDate(text: string): Date | null {
  const match = text.match(/\d{4}[-/]\d{1,2}[-/]\d{1,2}/)
  if (match) {
    const [year, month, day] = match[0].split(/[-/]/).map(Number)
    return new Date(year, month - 1, day, 12, 0, 0)
  }
  return null
}

function parseBestPeriodValue(value: string): number {
  const rangeMatch = value.match(/(\d+)\s*天~\s*(\d+)\s*天/)
  if (rangeMatch) {
    return parseInt(rangeMatch[2], 10)
  }
  const singleMatch = value.match(/(\d+)\s*天/)
  if (singleMatch) {
    return parseInt(singleMatch[1], 10)
  }
  return 90
}

export function parseCoffeeBeanText(text: string): ParseResult {
  const lines = text.split(/\n/).map((l) => l.trim()).filter(Boolean)
  const data: Partial<CoffeeBeanFormData> = {
    name: '',
    origin: '',
    roaster: '',
    roastLevel: 'medium' as RoastLevel,
    roastDate: new Date(),
    quantity: 0,
    totalQuantity: 0,
    price: 0,
    notes: '',
  }

  const notesFields: string[] = []

  for (const line of lines) {
    const colonIndex = line.indexOf('：')
    const enColonIndex = line.indexOf(':')
    const sepIndex = colonIndex !== -1 ? colonIndex : enColonIndex
    if (sepIndex === -1) continue

    const key = line.slice(0, sepIndex).trim().toLowerCase()
    const value = line.slice(sepIndex + 1).trim()

    switch (key) {
      case '品名':
        data.name = value
        break
      case '净含量':
      case '净含量(g)':
      case '重量':
        const qty = parseNumber(value)
        data.quantity = qty
        data.totalQuantity = qty
        break
      case '产地':
      case 'origin':
        data.origin = value
        break
      case '烘焙商':
      case 'roaster':
        data.roaster = value
        break
      case '烘焙程度':
      case 'roast':
        data.roastLevel = parseRoastLevel(value)
        break
      case '烘焙日期':
      case 'roast date':
        const date = parseDate(value)
        if (date) data.roastDate = date
        break
      case '价格':
      case 'price':
        data.price = parseNumber(value)
        break
      case '豆种':
      case 'variety':
        notesFields.push(`豆种：${value}`)
        break
      case '处理法':
      case 'process':
        notesFields.push(`处理法：${value}`)
        break
      case '庄园':
      case '处理站':
      case 'estate':
        notesFields.push(`庄园/处理站：${value}`)
        break
      case '风味':
      case 'flavor':
        notesFields.push(`风味：${value}`)
        break
      case '最佳饮用期':
      case 'best period':
        const period = parseBestPeriodValue(value)
        notesFields.push(`最佳饮用期：${period}天`)
        break
      default:
        break
    }
  }

  if (!data.name) {
    return { success: false, error: '未找到品名' }
  }

  if (data.totalQuantity === 0) {
    data.quantity = 227
    data.totalQuantity = 227
  }

  if (!data.roastDate || isNaN(data.roastDate.getTime())) {
    data.roastDate = new Date()
  }

  data.notes = notesFields.join(' | ')

  return { success: true, data }
}