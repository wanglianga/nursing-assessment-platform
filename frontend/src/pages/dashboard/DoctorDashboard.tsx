import { useEffect, useMemo } from 'react'
import { ClipboardCheck, AlertTriangle, Clock, Loader2 } from 'lucide-react'
import StatCard from '@/components/StatCard'
import LevelBadge from '@/components/LevelBadge'
import { useDataStore } from '@/store/dataStore'
import { formatDate, formatDateTime } from '@/utils/helpers'
import type { NursingLevel } from '@/types'

const NURSING_LEVEL_ORDER: Record<NursingLevel, number> = {
  SPECIAL: 0,
  LEVEL_1: 1,
  LEVEL_2: 2,
  LEVEL_3: 3,
  SELF_CARE: 4,
}

export default function DoctorDashboard() {
  const { elders, riskEvents, isLoading, fetchElders, fetchRiskEvents } = useDataStore()

  useEffect(() => {
    fetchElders()
    fetchRiskEvents()
  }, [fetchElders, fetchRiskEvents])

  const pendingElders = useMemo(() =>
    elders
      .filter((e) => e.status === 'ACTIVE')
      .sort((a, b) => NURSING_LEVEL_ORDER[a.nursingLevel] - NURSING_LEVEL_ORDER[b.nursingLevel])
      .slice(0, 10),
    [elders]
  )

  const upcomingReassessments = useMemo(() =>
    elders
      .filter((e) => e.status === 'ACTIVE')
      .slice(0, 5),
    [elders]
  )

  const recentRisks = useMemo(() =>
    riskEvents.filter((e) => e.status !== 'RESOLVED').slice(0, 10),
    [riskEvents]
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary-500" size={32} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon={<ClipboardCheck size={20} />} label="待评估老人" value={pendingElders.length} color="primary" />
        <StatCard icon={<Clock size={20} />} label="即将到期复评" value={upcomingReassessments.length} color="amber" />
        <StatCard icon={<AlertTriangle size={20} />} label="待处理风险事件" value={recentRisks.length} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-base font-semibold text-slate-800 mb-4">待评估老人</h3>
          <div className="space-y-3">
            {pendingElders.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">暂无待评估老人</p>
            ) : (
              pendingElders.map((elder) => (
                <div key={elder.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-medium">
                      {elder.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{elder.name}</p>
                      <p className="text-xs text-slate-500">入院: {formatDate(elder.admissionDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <LevelBadge level={elder.nursingLevel} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-base font-semibold text-slate-800 mb-4">即将到期复评</h3>
          <div className="space-y-3">
            {upcomingReassessments.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">暂无即将到期复评</p>
            ) : (
              upcomingReassessments.map((elder) => (
                <div key={elder.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center font-medium">
                      {elder.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{elder.name}</p>
                      <LevelBadge level={elder.nursingLevel} />
                    </div>
                  </div>
                  <span className="text-xs text-slate-500">
                    入院: {formatDate(elder.admissionDate)}
                  </span>
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
                <span className={`w-2 h-2 rounded-full ${event.severity === 'HIGH' || event.severity === 'CRITICAL' ? 'bg-orange-500' : 'bg-yellow-500'}`} />
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
