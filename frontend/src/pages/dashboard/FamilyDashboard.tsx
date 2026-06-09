import { useEffect, useMemo } from 'react'
import { Heart, FileText, Receipt, Loader2 } from 'lucide-react'
import StatCard from '@/components/StatCard'
import { useDataStore } from '@/store/dataStore'
import { useAuthStore } from '@/store/authStore'
import { formatCurrency, formatDateTime } from '@/utils/helpers'
import { CARE_TYPE_LABELS, CARE_TYPE_COLORS, NURSING_LEVEL_LABELS, ELDER_STATUS_LABELS, ELDER_STATUS_COLORS, NURSING_LEVEL_FEES } from '@/utils/constants'
import type { CareType } from '@/types'

export default function FamilyDashboard() {
  const {
    elders, careRecords, bills, isLoading,
    fetchFamilyElders, fetchFamilyRecords, fetchBillsByElder
  } = useDataStore()
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    if (user?.id) {
      fetchFamilyElders(user.id)
    }
  }, [user?.id, fetchFamilyElders])

  const firstElder = elders[0]

  useEffect(() => {
    if (user?.id && firstElder) {
      fetchFamilyRecords(user.id, firstElder.id)
      fetchBillsByElder(firstElder.id)
    }
  }, [user?.id, firstElder, fetchFamilyRecords, fetchBillsByElder])

  const todayRecords = useMemo(() => {
    const today = new Date().toDateString()
    return careRecords.filter((r) => new Date(r.recordTime).toDateString() === today)
  }, [careRecords])

  const latestBill = useMemo(() => {
    if (bills.length === 0) return null
    return bills[bills.length - 1]
  }, [bills])

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
          icon={<Heart size={20} />}
          label="老人状态"
          value={firstElder ? ELDER_STATUS_LABELS[firstElder.status] : '--'}
          color="green"
        />
        <StatCard
          icon={<FileText size={20} />}
          label="今日服务次数"
          value={todayRecords.length}
          color="primary"
        />
        <StatCard
          icon={<Receipt size={20} />}
          label="本月预估费用"
          value={latestBill ? formatCurrency(latestBill.totalAmount) : firstElder ? formatCurrency(NURSING_LEVEL_FEES[firstElder.nursingLevel]) : '--'}
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-base font-semibold text-slate-800 mb-4">老人护理概况</h3>
          {firstElder ? (
            <div className="flex items-center gap-4 p-4 bg-primary-50 rounded-lg">
              <div className="w-16 h-16 bg-primary-200 text-primary-700 rounded-full flex items-center justify-center text-2xl font-bold">
                {firstElder.name.charAt(0)}
              </div>
              <div>
                <p className="text-lg font-semibold text-slate-800">{firstElder.name}</p>
                <p className="text-sm text-slate-600">房间: {firstElder.contactName || '--'}</p>
                <div className="flex gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${NURSING_LEVEL_LABELS[firstElder.nursingLevel] ? 'bg-amber-100 text-amber-700' : ''}`}>
                    {NURSING_LEVEL_LABELS[firstElder.nursingLevel]}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${ELDER_STATUS_COLORS[firstElder.status]}`}>
                    {ELDER_STATUS_LABELS[firstElder.status]}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-4">暂无关联老人信息</p>
          )}
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-base font-semibold text-slate-800 mb-4">费用预估</h3>
          {latestBill ? (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">护理等级费</span>
                <span className="text-slate-800">{formatCurrency(latestBill.nursingLevelFee)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">增值服务费</span>
                <span className="text-slate-800">{formatCurrency(latestBill.valueAddedFee)}</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-semibold">
                <span className="text-slate-700">合计</span>
                <span className="text-primary-600">{formatCurrency(latestBill.totalAmount)}</span>
              </div>
            </div>
          ) : firstElder ? (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">护理等级费</span>
                <span className="text-slate-800">{formatCurrency(NURSING_LEVEL_FEES[firstElder.nursingLevel])}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">增值服务费</span>
                <span className="text-slate-800">{formatCurrency(0)}</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-semibold">
                <span className="text-slate-700">合计</span>
                <span className="text-primary-600">{formatCurrency(NURSING_LEVEL_FEES[firstElder.nursingLevel])}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-4">暂无费用信息</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-base font-semibold text-slate-800 mb-4">最近服务记录</h3>
        <div className="space-y-3">
          {careRecords.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">暂无服务记录</p>
          ) : (
            careRecords.slice(0, 10).map((record) => (
              <div key={record.id} className="flex items-start gap-4 p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-mono text-slate-500 w-28 pt-0.5">{formatDateTime(record.recordTime)}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${CARE_TYPE_COLORS[record.type as CareType] || 'bg-slate-100 text-slate-700'}`}>
                      {CARE_TYPE_LABELS[record.type as CareType] || record.type}
                    </span>
                    <span className="text-xs text-slate-400">{record.caregiverName}</span>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">{record.description || ''}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
