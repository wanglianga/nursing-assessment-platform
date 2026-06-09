import { useState, useEffect } from 'react'
import { CalendarDays, Plus, X, Loader2 } from 'lucide-react'
import { CARE_TYPE_LABELS } from '@/utils/constants'
import { useDataStore } from '@/store/dataStore'
import { useAuthStore } from '@/store/authStore'
import type { CareRecord } from '@/types'

export default function DailyCare() {
  const { careRecords, isLoading, fetchCareRecordsByCaregiver, createCareRecord, createRiskEvent } = useDataStore()
  const { user } = useAuthStore()
  const [showRecordModal, setShowRecordModal] = useState(false)
  const [showRiskModal, setShowRiskModal] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<CareRecord | null>(null)
  const [recordDesc, setRecordDesc] = useState('')
  const [recordNotes, setRecordNotes] = useState('')
  const [riskDesc, setRiskDesc] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (user?.id) {
      fetchCareRecordsByCaregiver(user.id)
    }
  }, [user?.id, fetchCareRecordsByCaregiver])

  const completedCount = careRecords.filter((r) => r.description).length

  const handleOpenRecord = (record: CareRecord) => {
    setSelectedRecord(record)
    setRecordDesc('')
    setRecordNotes('')
    setShowRecordModal(true)
  }

  const handleSubmitRecord = async () => {
    if (!selectedRecord || !user) return
    setSubmitting(true)
    try {
      await createCareRecord({
        elderId: selectedRecord.elderId,
        caregiverId: user.id,
        type: selectedRecord.type,
        description: recordDesc,
        notes: recordNotes,
      })
      setShowRecordModal(false)
      if (user.id) {
        fetchCareRecordsByCaregiver(user.id)
      }
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
        <button
          onClick={() => setShowRiskModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
        >
          <Plus size={16} />
          异常事件上报
        </button>
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

      <div className="bg-white rounded-lg border border-slate-200 p-5">
        <div className="space-y-2">
          {careRecords.map((record) => (
            <div
              key={record.id}
              onClick={() => !record.description && handleOpenRecord(record)}
              className={`flex items-center gap-4 p-3 rounded-lg ${
                record.description ? 'bg-green-50' : 'bg-slate-50 hover:bg-slate-100 cursor-pointer'
              }`}
            >
              <span className="text-sm font-mono text-slate-500 w-24">
                {new Date(record.recordTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                record.type === 'TURN_OVER' ? 'bg-purple-100 text-purple-700'
                : record.type === 'FEEDING' ? 'bg-green-100 text-green-700'
                : record.type === 'BATHING' ? 'bg-blue-100 text-blue-700'
                : record.type === 'REHABILITATION' ? 'bg-orange-100 text-orange-700'
                : 'bg-indigo-100 text-indigo-700'
              }`}>
                {CARE_TYPE_LABELS[record.type]}
              </span>
              <span className="text-sm text-slate-700">{record.caregiverName}</span>
              <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                record.description ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {record.description ? '已完成' : '待执行'}
              </span>
            </div>
          ))}
          {careRecords.length === 0 && (
            <div className="text-center py-8 text-slate-400">暂无今日护理任务</div>
          )}
        </div>
      </div>

      {showRecordModal && selectedRecord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-slate-800">填写护理记录</h3>
              <button onClick={() => setShowRecordModal(false)}><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span>{CARE_TYPE_LABELS[selectedRecord.type]}</span>
                <span>-</span>
                <span>{selectedRecord.caregiverName}</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">描述</label>
                <textarea
                  value={recordDesc}
                  onChange={(e) => setRecordDesc(e.target.value)}
                  rows={3}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="请描述护理执行情况..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">备注</label>
                <textarea
                  value={recordNotes}
                  onChange={(e) => setRecordNotes(e.target.value)}
                  rows={2}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="备注信息..."
                />
              </div>
              <button
                onClick={handleSubmitRecord}
                disabled={submitting}
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
