import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, X, Loader2 } from 'lucide-react'
import StatusBadge from '@/components/StatusBadge'
import {
  RISK_EVENT_TYPE_LABELS, SEVERITY_LABELS, SEVERITY_COLORS,
  RISK_EVENT_STATUS_LABELS, RISK_EVENT_STATUS_COLORS
} from '@/utils/constants'
import { formatDateTime } from '@/utils/helpers'
import { useDataStore } from '@/store/dataStore'

export default function RiskEventDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentRiskEvent, isLoading, fetchRiskEventById, addHandlingRecord, updateRiskEventStatus } = useDataStore()
  const [showAddForm, setShowAddForm] = useState(false)
  const [actionText, setActionText] = useState('')
  const [resultText, setResultText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (id) {
      fetchRiskEventById(Number(id))
    }
  }, [id, fetchRiskEventById])

  const handleAddRecord = async () => {
    if (!id || !actionText) return
    setSubmitting(true)
    try {
      await addHandlingRecord(Number(id), {
        action: actionText,
        result: resultText,
      })
      setShowAddForm(false)
      setActionText('')
      setResultText('')
      fetchRiskEventById(Number(id))
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateStatus = async (status: 'PROCESSING' | 'RESOLVED') => {
    if (!id) return
    setSubmitting(true)
    try {
      await updateRiskEventStatus(Number(id), status)
      fetchRiskEventById(Number(id))
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading || !currentRiskEvent) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    )
  }

  const event = currentRiskEvent

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/risk-events')}
        className="flex items-center gap-1 text-sm text-slate-500 hover:text-primary-600 transition-colors"
      >
        <ArrowLeft size={16} /> 返回风险事件列表
      </button>

      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <StatusBadge label={RISK_EVENT_TYPE_LABELS[event.type]} colorClass="bg-slate-100 text-slate-700" />
          <StatusBadge label={SEVERITY_LABELS[event.severity]} colorClass={SEVERITY_COLORS[event.severity]} />
          <StatusBadge label={RISK_EVENT_STATUS_LABELS[event.status]} colorClass={RISK_EVENT_STATUS_COLORS[event.status]} />
        </div>
        <p className="text-base text-slate-800 mb-3">{event.description}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="bg-slate-50 p-3 rounded-lg">
            <p className="text-xs text-slate-500">老人</p>
            <p className="font-medium text-slate-800">{event.elderName}</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg">
            <p className="text-xs text-slate-500">事件时间</p>
            <p className="font-medium text-slate-800">{formatDateTime(event.eventTime)}</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg">
            <p className="text-xs text-slate-500">发现人</p>
            <p className="font-medium text-slate-800">{event.discoverer || '-'}</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg">
            <p className="text-xs text-slate-500">影响</p>
            <div className="flex gap-2 mt-1">
              {event.planAdjustment && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">计划调整</span>}
              {event.billingImpact && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">费用影响</span>}
              {!event.planAdjustment && !event.billingImpact && <span className="text-slate-500">-</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-slate-800">处理记录</h3>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
          >
            <Plus size={16} /> 添加记录
          </button>
        </div>

        <div className="relative">
          <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-slate-200" />
          <div className="space-y-4">
            {event.handlingRecords?.map((record) => (
              <div key={record.id} className="relative pl-10">
                <div className="absolute left-1.5 top-1.5 w-3 h-3 bg-primary-500 rounded-full border-2 border-white" />
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-slate-800">{record.handler}</span>
                    {record.handlerRole && (
                      <span className="text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full">
                        {record.handlerRole === 'DOCTOR' ? '医生' : record.handlerRole === 'CAREGIVER' ? '护工' : '管理员'}
                      </span>
                    )}
                    <span className="text-xs text-slate-400 ml-auto">{formatDateTime(record.actionTime)}</span>
                  </div>
                  <p className="text-sm text-slate-700">{record.action}</p>
                  {record.result && <p className="text-sm text-slate-500 mt-1">结果: {record.result}</p>}
                </div>
              </div>
            ))}
            {(!event.handlingRecords || event.handlingRecords.length === 0) && (
              <div className="text-center py-8 text-slate-400">暂无处理记录</div>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        {event.status === 'REPORTED' && (
          <button
            onClick={() => handleUpdateStatus('PROCESSING')}
            disabled={submitting}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-sm font-medium disabled:opacity-50 flex items-center gap-2"
          >
            {submitting && <Loader2 size={16} className="animate-spin" />}
            开始处理
          </button>
        )}
        {event.status === 'PROCESSING' && (
          <button
            onClick={() => handleUpdateStatus('RESOLVED')}
            disabled={submitting}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium disabled:opacity-50 flex items-center gap-2"
          >
            {submitting && <Loader2 size={16} className="animate-spin" />}
            标记已解决
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-slate-800">添加处理记录</h3>
              <button onClick={() => setShowAddForm(false)}><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">处理措施</label>
                <textarea value={actionText} onChange={(e) => setActionText(e.target.value)} rows={3}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="请描述处理措施..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">处理结果</label>
                <textarea value={resultText} onChange={(e) => setResultText(e.target.value)} rows={2}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="处理结果..." />
              </div>
              <button
                onClick={handleAddRecord}
                disabled={submitting || !actionText}
                className="w-full py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 size={16} className="animate-spin" />}
                提交
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
