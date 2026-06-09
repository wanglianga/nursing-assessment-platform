import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, Filter, Loader2 } from 'lucide-react'
import LevelBadge from '@/components/LevelBadge'
import StatusBadge from '@/components/StatusBadge'
import { useAuthStore } from '@/store/authStore'
import { useDataStore } from '@/store/dataStore'
import { NURSING_LEVEL_LABELS, ELDER_STATUS_LABELS, ELDER_STATUS_COLORS, GENDER_LABELS } from '@/utils/constants'
import { formatDate } from '@/utils/helpers'
import type { NursingLevel, ElderStatus } from '@/types'

export default function Elders() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { elders, isLoading, fetchElders } = useDataStore()
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')

  useEffect(() => {
    fetchElders()
  }, [fetchElders])

  const filtered = elders.filter((elder) => {
    const matchSearch = elder.name.includes(search) || (elder.contactName && elder.contactName.includes(search))
    const matchLevel = !levelFilter || elder.nursingLevel === levelFilter
    const matchStatus = !statusFilter || elder.status === statusFilter
    return matchSearch && matchLevel && matchStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">老人档案</h2>
        {(user?.role === 'ADMIN' || user?.role === 'DOCTOR') && (
          <button
            onClick={() => navigate('/elders/new')}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
          >
            <Plus size={16} />
            新增老人
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="搜索姓名或联系人..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-slate-400" />
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
          >
            <option value="">全部等级</option>
            {(Object.entries(NURSING_LEVEL_LABELS) as [NursingLevel, string][]).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
          >
            <option value="">全部状态</option>
            {(Object.entries(ELDER_STATUS_LABELS) as [ElderStatus, string][]).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((elder) => (
              <div
                key={elder.id}
                onClick={() => navigate(`/elders/${elder.id}`)}
                className="bg-white rounded-lg border border-slate-200 p-5 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0">
                    {elder.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-slate-800">{elder.name}</h3>
                      <span className="text-xs text-slate-400">{GENDER_LABELS[elder.gender]}</span>
                      <span className="text-xs text-slate-400">{elder.age}岁</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <LevelBadge level={elder.nursingLevel} />
                      <StatusBadge label={ELDER_STATUS_LABELS[elder.status]} colorClass={ELDER_STATUS_COLORS[elder.status]} />
                    </div>
                    <p className="text-xs text-slate-500 mt-2">入院: {formatDate(elder.admissionDate)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <p>未找到匹配的老人</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
