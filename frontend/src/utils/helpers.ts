import { format, parseISO } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { NURSING_LEVEL_COLORS, NURSING_LEVEL_LABELS } from './constants'
import type { NursingLevel } from '@/types'

export function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  try {
    return format(parseISO(dateStr), 'yyyy-MM-dd', { locale: zhCN })
  } catch {
    return dateStr
  }
}

export function formatDateTime(dateStr: string): string {
  if (!dateStr) return ''
  try {
    return format(parseISO(dateStr), 'yyyy-MM-dd HH:mm', { locale: zhCN })
  } catch {
    return dateStr
  }
}

export function formatCurrency(amount: number): string {
  return `¥${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function getNursingLevelColor(level: NursingLevel): string {
  return NURSING_LEVEL_COLORS[level] || 'bg-slate-100 text-slate-700'
}

export function getLevelBadgeClasses(level: NursingLevel): string {
  const color = NURSING_LEVEL_COLORS[level] || 'bg-slate-100 text-slate-700'
  return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`
}

export function getNursingLevelLabel(level: NursingLevel): string {
  return NURSING_LEVEL_LABELS[level] || level
}

export function getInitials(name: string): string {
  return name ? name.charAt(0) : '?'
}

export function getScoreColor(score: number, max: number): string {
  const ratio = score / max
  if (ratio >= 0.7) return 'text-red-600'
  if (ratio >= 0.4) return 'text-amber-600'
  return 'text-green-600'
}

export function getDaysUntil(dateStr: string): number {
  if (!dateStr) return 0
  try {
    const target = parseISO(dateStr)
    const now = new Date()
    const diff = target.getTime() - now.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  } catch {
    return 0
  }
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}
