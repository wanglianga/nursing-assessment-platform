import { useEffect, useMemo } from 'react'
import { Users, ClipboardCheck, TrendingUp, AlertTriangle, Loader2 } from 'lucide-react'
import StatCard from '@/components/StatCard'
import { useDataStore } from '@/store/dataStore'
import { NURSING_LEVEL_LABELS } from '@/utils/constants'
import { formatDateTime } from '@/utils/helpers'
import type { NursingLevel } from '@/types'

const NURSING_LEVEL_DISTRIBUTION_COLORS: Record<NursingLevel, string> = {
  SPECIAL: '#ef4444',
  LEVEL_1: '#f97316',
  LEVEL_2: '#f59e0b',
  LEVEL_3: '#3b82f6',
  SELF_CARE: '#22c55e',
}

const priorityColors: Record<string, string> = {
  critical: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-blue-100 text-blue-700',
}

export default function AdminDashboard() {
  const { elders, riskEvents, isLoading, fetchElders, fetchRiskEvents } = useDataStore()

  useEffect(() => {
    fetchElders()
    fetchRiskEvents()
  }, [fetchElders, fetchRiskEvents])

  const activeElders = useMemo(() => elders.filter((e) => e.status === 'ACTIVE'), [elders])

  const distribution = useMemo(() => {
    const counts: Partial<Record<NursingLevel, number>> = {}
    for (const elder of activeElders) {
      counts[elder.nursingLevel] = (counts[elder.nursingLevel] || 0) + 1
    }
    return (Object.keys(NURSING_LEVEL_LABELS) as NursingLevel[]).map((level) => ({
      name: NURSING_LEVEL_LABELS[level],
      value: counts[level] || 0,
      color: NURSING_LEVEL_DISTRIBUTION_COLORS[level],
    }))
  }, [activeElders])

  const recentRisks = useMemo(() => riskEvents.slice(0, 10), [riskEvents])

  const stats = useMemo(() => [
    { icon: <Users size={20} />, label: '在住老人数', value: activeElders.length, color: 'primary' },
    { icon: <ClipboardCheck size={20} />, label: '待评估数', value: 0, color: 'amber' },
    { icon: <TrendingUp size={20} />, label: '今日护理完成率', value: '--', color: 'green' },
    { icon: <AlertTriangle size={20} />, label: '本月风险事件数', value: riskEvents.length, color: 'red' },
  ], [activeElders.length, riskEvents.length])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary-500" size={32} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-base font-semibold text-slate-800 mb-4">护理等级分布</h3>
          <div className="space-y-3">
            {distribution.map((item) => (
              <div key={item.name} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-slate-600 w-20">{item.name}</span>
                <div className="flex-1 bg-slate-100 rounded-full h-2.5">
                  <div
                    className="h-2.5 rounded-full transition-all"
                    style={{
                      width: activeElders.length ? `${(item.value / activeElders.length) * 100}%` : '0%',
                      backgroundColor: item.color,
                    }}
                  />
                </div>
                <span className="text-sm font-medium text-slate-700 w-8 text-right">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-base font-semibold text-slate-800 mb-4">待办事项</h3>
          <div className="space-y-3">
            {recentRisks.filter((e) => e.status !== 'RESOLVED').length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">暂无待办事项</p>
            ) : (
              recentRisks.filter((e) => e.status !== 'RESOLVED').map((event) => (
                <div key={event.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    event.severity === 'CRITICAL' ? priorityColors.critical
                    : event.severity === 'HIGH' ? priorityColors.high
                    : event.severity === 'MEDIUM' ? priorityColors.medium
                    : priorityColors.low
                  }`}>
                    {event.severity === 'CRITICAL' ? '紧急' : event.severity === 'HIGH' ? '高' : event.severity === 'MEDIUM' ? '中' : '低'}
                  </span>
                  <span className="text-sm text-slate-700">{event.elderName || `老人#${event.elderId}`} - {event.description}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-base font-semibold text-slate-800 mb-4">近期风险事件</h3>
        <div className="space-y-3">
          {recentRisks.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">暂无风险事件</p>
          ) : (
            recentRisks.map((event) => (
              <div key={event.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                <span className={`w-2 h-2 rounded-full ${
                  event.severity === 'CRITICAL' ? 'bg-red-500' : event.severity === 'HIGH' ? 'bg-orange-500' : 'bg-yellow-500'
                }`} />
                <span className="text-sm font-medium text-slate-800">{event.elderName || `老人#${event.elderId}`}</span>
                <span className="text-sm text-slate-600">{event.description}</span>
                <span className="text-xs text-slate-400 ml-auto">{formatDateTime(event.eventTime)}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
