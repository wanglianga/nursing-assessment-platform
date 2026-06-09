import { useEffect, useMemo } from 'react'
import { ClipboardList, Users, AlertTriangle, Loader2 } from 'lucide-react'
import StatCard from '@/components/StatCard'
import { useDataStore } from '@/store/dataStore'
import { useAuthStore } from '@/store/authStore'
import { CARE_TYPE_LABELS, CARE_TYPE_COLORS, NURSING_LEVEL_LABELS } from '@/utils/constants'
import { formatDateTime } from '@/utils/helpers'
import type { CareType } from '@/types'

export default function CaregiverDashboard() {
  const { careRecords, riskEvents, isLoading, fetchCareRecordsByCaregiver, fetchRiskEvents } = useDataStore()
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    if (user?.id) {
      fetchCareRecordsByCaregiver(user.id)
    }
    fetchRiskEvents()
  }, [user?.id, fetchCareRecordsByCaregiver, fetchRiskEvents])

  const completed = useMemo(() => careRecords.filter((r) => {
    const recordDate = new Date(r.recordTime)
    const today = new Date()
    return recordDate.toDateString() === today.toDateString()
  }).length, [careRecords])

  const total = careRecords.length

  const myElderIds = useMemo(() => [...new Set(careRecords.map((r) => r.elderId))], [careRecords])

  const unresolvedRisks = useMemo(() => riskEvents.filter((e) => e.status !== 'RESOLVED').length, [riskEvents])

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
        <StatCard
          icon={<ClipboardList size={20} />}
          label="今日待办任务"
          value={`${completed}/${total}`}
          color="primary"
        />
        <StatCard icon={<Users size={20} />} label="负责老人数" value={myElderIds.length} color="blue" />
        <StatCard icon={<AlertTriangle size={20} />} label="待处理异常" value={unresolvedRisks} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-800">今日护理安排</h3>
            <span className="text-sm text-slate-500">{completed}/{total} 已完成</span>
          </div>
          <div className="space-y-3">
            {careRecords.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">暂无护理安排</p>
            ) : (
              careRecords.map((record) => (
                <div key={record.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm font-mono text-slate-500 w-20">{formatDateTime(record.recordTime)}</span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${CARE_TYPE_COLORS[record.type as CareType] || 'bg-slate-100 text-slate-700'}`}>
                    {CARE_TYPE_LABELS[record.type as CareType] || record.type}
                  </span>
                  <span className="text-sm text-slate-700">{record.description || `老人#${record.elderId}`}</span>
                  <span className="ml-auto text-xs text-slate-400">
                    {record.caregiverName}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-800">我的老人</h3>
          </div>
          <div className="space-y-3">
            {myElderIds.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">暂无负责老人</p>
            ) : (
              myElderIds.map((elderId) => {
                const record = careRecords.find((r) => r.elderId === elderId)
                return (
                  <div key={elderId} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="w-10 h-10 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-medium">
                      {elderId}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">老人#{elderId}</p>
                      {record && <p className="text-xs text-slate-500">护理员: {record.caregiverName}</p>}
                    </div>
                    <span className="ml-auto text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded-full">
                      {NURSING_LEVEL_LABELS[careRecords.find((r) => r.elderId === elderId)?.type as keyof typeof NURSING_LEVEL_LABELS] || '--'}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
