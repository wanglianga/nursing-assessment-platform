import { useState, useEffect, useMemo } from 'react'
import { CalendarDays, Plus, X, Loader2, ChevronDown, ChevronRight } from 'lucide-react'
import { CARE_TYPE_LABELS, CARE_TYPE_COLORS } from '@/utils/constants'
import { useDataStore } from '@/store/dataStore'
import { useAuthStore } from '@/store/authStore'
import type { CareType, CareRecord, Elder } from '@/types'

const ALL_CARE_TYPES: CareType[] = ['TURN_OVER', 'FEEDING', 'BATHING', 'REHABILITATION', 'NIGHT_PATROL', 'OTHER']

function groupByElder(records: CareRecord[], elders: Elder[]) {
  const elderMap = new Map<number, string>()
  for (const e of elders) elderMap.set(e.id, e.name)

  const groups: Record<number, { name: string; records: CareRecord[] }> = {}
  for (const r of records) {
    if (!groups[r.elderId]) {
      groups[r.elderId] = { name: elderMap.get(r.elderId) || `老人${r.elderId}`, records: [] }
    }
    groups[r.elderId].records.push(r)
  }

  for (const g of Object.values(groups)) {
    g.records.sort((a, b) => new Date(b.recordTime).getTime() - new Date(a.recordTime).getTime())
  }

  return Object.entries(groups).sort(([, a], [, b]) => a.name.localeCompare(b.name))
}

export default function DailyCare() {
  const { careRecords, elders, isLoading, fetchCareRecordsByCaregiver, fetchElders, createCareRecord, createRiskEvent } = useDataStore()
  const { user } = useAuthStore()

  const [showNewModal, setShowNewModal] = useState(false)
  const [showRiskModal, setShowRiskModal] = useState(false)
  const [newElderId, setNewElderId] = useState<number | ''>('')
  const [newType, setNewType] = useState<CareType>('TURN_OVER')
  const [newDesc, setNewDesc] = useState('')
  const [newNotes, setNewNotes] = useState('')
  const [riskDesc, setRiskDesc] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [expandedElders, setExpandedElders] = useState<Set<number>>(new Set())

  useEffect(() => {
    if (user?.id) {
      fetchCareRecordsByCaregiver(user.id)
      fetchElders()
    }
  }, [user?.id, fetchCareRecordsByCaregiver, fetchElders])

  const grouped = useMemo(() => groupByElder(careRecords, elders), [careRecords, elders])

  const completedCount = careRecords.filter((r) => r.description).length

  useEffect(() => {
    const allIds = grouped.map(([, g]) => g.records[0]?.elderId).filter(Boolean) as number[]
    setExpandedElders(new Set(allIds.slice(0, 5)))
  }, [careRecords.length])

  const toggleElder = (elderId: number) => {
    setExpandedElders((prev) => {
      const next = new Set(prev)
      if (next.has(elderId)) next.delete(elderId)
      else next.add(elderId)
      return next
    })
  }

  const handleNewRecord = () => {
    setNewElderId('')
    setNewType('TURN_OVER')
    setNewDesc('')
    setNewNotes('')
    setShowNewModal(true)
  }

  const handleSubmitNew = async () => {
    if (!newElderId || !newDesc || !user) return
    setSubmitting(true)
    try {
      await createCareRecord({
        elderId: Number(newElderId),
        caregiverId: user.id,
        type: newType,
        description: newDesc,
        notes: newNotes,
      })
      setShowNewModal(false)
      if (user.id) fetchCareRecordsByCaregiver(user.id)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitRisk = async () => {
    if (!riskDesc || !user) return
    setSubmitting(true)
    try {
      await createRiskEvent({
        description: riskDesc,
        discoverer: user.name,
      })
      setShowRiskModal(false)
      setRiskDesc('')
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">日常护理</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={handleNewRecord}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium"
          >
            <Plus size={16} />
            新建记录
          </button>
          <button
            onClick={() => setShowRiskModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
          >
            <Plus size={16} />
            异常事件上报
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-4 flex items-center gap-4">
        <CalendarDays size={20} className="text-primary-500" />
        <input
          type="date"
          defaultValue={new Date().toISOString().split('T')[0]}
          className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
        />
        <span className="text-sm text-slate-500">
          完成进度: {completedCount}/{careRecords.length}
        </span>
        <div className="flex-1 bg-slate-100 rounded-full h-2">
          <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${careRecords.length ? (completedCount / careRecords.length) * 100 : 0}%` }} />
        </div>
      </div>

      <div className="space-y-3">
        {grouped.map(([elderId, group]) => {
          const isExpanded = expandedElders.has(Number(elderId))
          const elderCompleted = group.records.filter((r) => r.description).length
          return (
            <div key={elderId} className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <button
                onClick={() => toggleElder(Number(elderId))}
                className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors"
              >
                {isExpanded ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
                <span className="text-sm font-semibold text-slate-800">{group.name}</span>
                <span className="text-xs text-slate-400 ml-2">{elderCompleted}/{group.records.length} 已完成</span>
                <div className="flex-1" />
                <div className="flex gap-1 flex-wrap justify-end">
                  {ALL_CARE_TYPES.map((ct) => {
                    const hasType = group.records.some((r) => r.type === ct)
                    const colorClass = CARE_TYPE_COLORS[ct] || 'bg-slate-100 text-slate-700'
                    return (
                      <span key={ct} className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${hasType ? colorClass : 'bg-slate-50 text-slate-300'}`}>
                        {CARE_TYPE_LABELS[ct]}
                      </span>
                    )
                  })}
                </div>
              </button>
              {isExpanded && (
                <div className="border-t border-slate-100 px-4 pb-3">
                  <div className="space-y-1.5 pt-2">
                    {group.records.map((record) => {
                      const label = CARE_TYPE_LABELS[record.type] || record.type
                      const colorClass = CARE_TYPE_COLORS[record.type] || 'bg-slate-100 text-slate-700'
                      return (
                        <div
                          key={record.id}
                          className={`flex items-center gap-3 p-2.5 rounded-lg ${
                            record.description ? 'bg-green-50' : 'bg-slate-50'
                          }`}
                        >
                          <span className="text-xs font-mono text-slate-400 w-12">
                            {new Date(record.recordTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colorClass}`}>
                            {label}
                          </span>
                          {record.description && <span className="text-xs text-slate-600 flex-1 truncate">{record.description}</span>}
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                            record.description ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {record.description ? '已完成' : '待执行'}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        })}
        {careRecords.length === 0 && (
          <div className="bg-white rounded-lg border border-slate-200 p-8 text-center text-slate-400">暂无今日护理任务</div>
        )}
      </div>

      {showNewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-slate-800">新建护理记录</h3>
              <button onClick={() => setShowNewModal(false)}><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">选择老人</label>
                <select
                  value={newElderId}
                  onChange={(e) => setNewElderId(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  <option value="">请选择老人</option>
                  {elders.filter((e) => e.status === 'ACTIVE').map((e) => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">护理类型</label>
                <div className="grid grid-cols-3 gap-2">
                  {ALL_CARE_TYPES.map((ct) => {
                    const colorClass = CARE_TYPE_COLORS[ct] || 'bg-slate-100 text-slate-700'
                    return (
                      <button
                        key={ct}
                        onClick={() => setNewType(ct)}
                        className={`px-2 py-2 rounded-lg text-xs font-medium border transition-colors ${
                          newType === ct ? `${colorClass} border-current` : 'border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        {CARE_TYPE_LABELS[ct]}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">执行描述</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={3}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="请描述护理执行情况..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">备注</label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  rows={2}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="备注信息..."
                />
              </div>
              <button
                onClick={handleSubmitNew}
                disabled={submitting || !newElderId || !newDesc}
                className="w-full py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 size={16} className="animate-spin" />}
                提交记录
              </button>
            </div>
          </div>
        </div>
      )}

      {showRiskModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-slate-800">异常事件上报</h3>
              <button onClick={() => setShowRiskModal(false)}><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">事件描述</label>
                <textarea
                  value={riskDesc}
                  onChange={(e) => setRiskDesc(e.target.value)}
                  rows={4}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="请详细描述异常事件..."
                />
              </div>
              <button
                onClick={handleSubmitRisk}
                disabled={submitting || !riskDesc}
                className="w-full py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 size={16} className="animate-spin" />}
                上报事件
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
