import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, X, Loader2, Phone, UserCheck, FileText, AlertTriangle } from 'lucide-react'
import StatusBadge from '@/components/StatusBadge'
import {
  RISK_EVENT_TYPE_LABELS, SEVERITY_LABELS, SEVERITY_COLORS,
  RISK_EVENT_STATUS_LABELS, RISK_EVENT_STATUS_COLORS,
  COMPANION_STATUS_LABELS, HOSPITAL_RESULT_LABELS
} from '@/utils/constants'
import { formatDateTime } from '@/utils/helpers'
import { useDataStore } from '@/store/dataStore'
import type { CompanionStatus, HospitalResult } from '@/types'

export default function RiskEventDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentRiskEvent, isLoading, fetchRiskEventById, addHandlingRecord, updateRiskEventStatus,
    notifyFamily, notifyDoctor, updateFallDetails, submitReview } = useDataStore()
  const [showAddForm, setShowAddForm] = useState(false)
  const [showFallForm, setShowFallForm] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [actionText, setActionText] = useState('')
  const [resultText, setResultText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [location, setLocation] = useState('')
  const [companionStatus, setCompanionStatus] = useState<CompanionStatus>('UNACCOMPANIED')
  const [injuryPhotos, setInjuryPhotos] = useState('')
  const [hospitalResult, setHospitalResult] = useState<HospitalResult>('NOT_REQUIRED')
  const [hospitalNotes, setHospitalNotes] = useState('')

  const [reviewConclusion, setReviewConclusion] = useState('')
  const [patrolFrequencyAdjustment, setPatrolFrequencyAdjustment] = useState('')
  const [reviewPlanAdjustment, setReviewPlanAdjustment] = useState(false)
  const [reviewBillingImpact, setReviewBillingImpact] = useState(false)

  useEffect(() => {
    if (id) {
      fetchRiskEventById(Number(id))
    }
  }, [id, fetchRiskEventById])

  useEffect(() => {
    if (currentRiskEvent) {
      setLocation(currentRiskEvent.location || '')
      setCompanionStatus(currentRiskEvent.companionStatus || 'UNACCOMPANIED')
      setInjuryPhotos(currentRiskEvent.injuryPhotos || '')
      setHospitalResult(currentRiskEvent.hospitalResult || 'NOT_REQUIRED')
      setHospitalNotes(currentRiskEvent.hospitalNotes || '')
      setReviewConclusion(currentRiskEvent.reviewConclusion || '')
      setPatrolFrequencyAdjustment(currentRiskEvent.patrolFrequencyAdjustment || '')
    }
  }, [currentRiskEvent])

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

  const handleNotifyFamily = async () => {
    if (!id) return
    setSubmitting(true)
    try {
      await notifyFamily(Number(id))
      fetchRiskEventById(Number(id))
    } finally {
      setSubmitting(false)
    }
  }

  const handleNotifyDoctor = async () => {
    if (!id) return
    setSubmitting(true)
    try {
      await notifyDoctor(Number(id))
      fetchRiskEventById(Number(id))
    } finally {
      setSubmitting(false)
    }
  }

  const handleSaveFallDetails = async () => {
    if (!id) return
    setSubmitting(true)
    try {
      await updateFallDetails(Number(id), {
        location,
        companionStatus,
        injuryPhotos,
        hospitalResult,
        hospitalNotes,
      })
      setShowFallForm(false)
      fetchRiskEventById(Number(id))
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitReview = async () => {
    if (!id || !reviewConclusion) return
    setSubmitting(true)
    try {
      await submitReview(Number(id), {
        reviewConclusion,
        patrolFrequencyAdjustment,
        planAdjustment: reviewPlanAdjustment,
        billingImpact: reviewBillingImpact,
      })
      setShowReviewForm(false)
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
  const isFall = event.type === 'FALL'

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
            <div className="flex gap-2 mt-1 flex-wrap">
              {event.planAdjustment && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">计划调整</span>}
              {event.billingImpact && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">费用影响</span>}
              {!event.planAdjustment && !event.billingImpact && <span className="text-slate-500">-</span>}
            </div>
          </div>
        </div>

        {isFall && (
          <div className="mt-4 p-4 bg-orange-50 rounded-lg border border-orange-100">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={18} className="text-orange-600" />
              <h4 className="text-sm font-semibold text-orange-800">跌倒事件详情</h4>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
              <div>
                <p className="text-xs text-orange-600">地点</p>
                <p className="font-medium text-slate-800">{event.location || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-orange-600">陪护状态</p>
                <p className="font-medium text-slate-800">{event.companionStatus ? COMPANION_STATUS_LABELS[event.companionStatus] : '-'}</p>
              </div>
              <div>
                <p className="text-xs text-orange-600">送医结果</p>
                <p className="font-medium text-slate-800">{event.hospitalResult ? HOSPITAL_RESULT_LABELS[event.hospitalResult] : '-'}</p>
              </div>
              <div>
                <p className="text-xs text-orange-600">送医备注</p>
                <p className="font-medium text-slate-800">{event.hospitalNotes || '-'}</p>
              </div>
            </div>
            <div className="flex gap-2 text-xs flex-wrap">
              {event.familyNotified && (
                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                  家属已通知 {event.familyNotifiedTime ? formatDateTime(event.familyNotifiedTime) : ''}
                </span>
              )}
              {event.doctorNotified && (
                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  医生已通知 {event.doctorNotifiedTime ? formatDateTime(event.doctorNotifiedTime) : ''}
                </span>
              )}
            </div>
            {event.reviewConclusion && (
              <div className="mt-3 p-2 bg-white rounded border border-orange-200">
                <p className="text-xs text-orange-600 mb-1">复盘结论</p>
                <p className="text-sm text-slate-700">{event.reviewConclusion}</p>
                {event.patrolFrequencyAdjustment && (
                  <p className="text-xs text-slate-500 mt-1">巡视频次调整: {event.patrolFrequencyAdjustment}</p>
                )}
              </div>
            )}
          </div>
        )}
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
                        {record.handlerRole === 'DOCTOR' ? '医生' : record.handlerRole === 'CAREGIVER' ? '护工' : record.handlerRole === 'SYSTEM' ? '系统' : '管理员'}
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

      <div className="flex gap-3 flex-wrap">
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
        {isFall && !event.familyNotified && (
          <button
            onClick={handleNotifyFamily}
            disabled={submitting}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium disabled:opacity-50 flex items-center gap-2"
          >
            <Phone size={16} />
            {submitting && <Loader2 size={16} className="animate-spin" />}
            通知家属
          </button>
        )}
        {isFall && !event.doctorNotified && (
          <button
            onClick={handleNotifyDoctor}
            disabled={submitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50 flex items-center gap-2"
          >
            <UserCheck size={16} />
            {submitting && <Loader2 size={16} className="animate-spin" />}
            通知评估医生
          </button>
        )}
        {isFall && (
          <button
            onClick={() => setShowFallForm(true)}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm font-medium flex items-center gap-2"
          >
            <FileText size={16} />
            记录跌倒详情
          </button>
        )}
        {isFall && !event.reviewConclusion && (
          <button
            onClick={() => setShowReviewForm(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium flex items-center gap-2"
          >
            <FileText size={16} />
            提交复盘结论
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

      {showFallForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-slate-800">记录跌倒详情</h3>
              <button onClick={() => setShowFallForm(false)}><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">跌倒地点 *</label>
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="例如: 卧室、走廊、洗手间..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">陪护状态</label>
                <select value={companionStatus} onChange={(e) => setCompanionStatus(e.target.value as CompanionStatus)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none">
                  {(Object.entries(COMPANION_STATUS_LABELS) as [CompanionStatus, string][]).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">伤情照片 (描述或链接)</label>
                <textarea value={injuryPhotos} onChange={(e) => setInjuryPhotos(e.target.value)} rows={2}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="描述伤情或输入照片链接..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">送医结果</label>
                <select value={hospitalResult} onChange={(e) => setHospitalResult(e.target.value as HospitalResult)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none">
                  {(Object.entries(HOSPITAL_RESULT_LABELS) as [HospitalResult, string][]).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">送医备注</label>
                <textarea value={hospitalNotes} onChange={(e) => setHospitalNotes(e.target.value)} rows={2}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="诊断结果、治疗方案等..." />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowFallForm(false)}
                  className="flex-1 py-2 border border-slate-300 rounded-lg text-sm text-slate-600 hover:bg-slate-50">取消</button>
                <button
                  onClick={handleSaveFallDetails}
                  disabled={submitting || !location}
                  className="flex-1 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 size={16} className="animate-spin" />}
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showReviewForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-slate-800">提交复盘结论</h3>
              <button onClick={() => setShowReviewForm(false)}><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">复盘结论 *</label>
                <textarea value={reviewConclusion} onChange={(e) => setReviewConclusion(e.target.value)} rows={4}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="事件原因分析、改进措施..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">巡视频次调整</label>
                <input type="text" value={patrolFrequencyAdjustment} onChange={(e) => setPatrolFrequencyAdjustment(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="例如: 夜间巡视从2小时/次调整为1小时/次" />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={reviewPlanAdjustment} onChange={(e) => setReviewPlanAdjustment(e.target.checked)}
                    className="w-4 h-4 text-primary-600 rounded" />
                  <span className="text-sm text-slate-700">触发护理计划调整</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={reviewBillingImpact} onChange={(e) => setReviewBillingImpact(e.target.checked)}
                    className="w-4 h-4 text-primary-600 rounded" />
                  <span className="text-sm text-slate-700">产生费用影响 (风险护理费)</span>
                </label>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowReviewForm(false)}
                  className="flex-1 py-2 border border-slate-300 rounded-lg text-sm text-slate-600 hover:bg-slate-50">取消</button>
                <button
                  onClick={handleSubmitReview}
                  disabled={submitting || !reviewConclusion}
                  className="flex-1 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 size={16} className="animate-spin" />}
                  提交
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
