import { useState, useEffect } from 'react'
import { FileText, CalendarDays, Receipt, MessageSquare, Loader2, ChevronDown, ChevronUp, X, AlertCircle, Pill, Clock, ShieldCheck, UserCheck } from 'lucide-react'
import StatusBadge from '@/components/StatusBadge'
import { formatCurrency, formatDateTime, formatDate } from '@/utils/helpers'
import {
  CARE_TYPE_LABELS, LEAVE_STATUS_LABELS, LEAVE_STATUS_COLORS,
  COMPLAINT_TYPE_LABELS, COMPLAINT_STATUS_LABELS, COMPLAINT_STATUS_COLORS,
  BILL_STATUS_LABELS, BILL_STATUS_COLORS,
  BILL_DETAIL_CATEGORY_LABELS, BILL_DETAIL_CATEGORY_ICONS,
  HEALTH_RECONFIRM_STATUS_LABELS, HEALTH_RECONFIRM_STATUS_COLORS
} from '@/utils/constants'
import { useDataStore } from '@/store/dataStore'
import { useAuthStore } from '@/store/authStore'
import type { ComplaintType, BillDetailCategory, FeeExplanation, LeaveRequest, HealthReconfirmStatus } from '@/types'

const TABS = [
  { key: 'records', label: '服务记录', icon: <FileText size={18} /> },
  { key: 'leave', label: '请假外出', icon: <CalendarDays size={18} /> },
  { key: 'billing', label: '费用预估', icon: <Receipt size={18} /> },
  { key: 'complaints', label: '投诉建议', icon: <MessageSquare size={18} /> },
]

export default function FamilyPortal() {
  const { user } = useAuthStore()
  const {
    elders, careRecords, leaveRequests, complaints, isLoading,
    fetchFamilyElders, fetchFamilyRecords, fetchLeaveRequests, createLeaveRequest,
    fetchComplaints, createComplaint, fetchBillsByElder, bills,
    feeExplanation, fetchFeeExplanation, recordPickup, recordReturn, confirmHealthOnReturn
  } = useDataStore()
  const [activeTab, setActiveTab] = useState('records')
  const [showLeaveForm, setShowLeaveForm] = useState(false)
  const [showComplaintForm, setShowComplaintForm] = useState(false)
  const [showPickupForm, setShowPickupForm] = useState<LeaveRequest | null>(null)
  const [showReturnForm, setShowReturnForm] = useState<LeaveRequest | null>(null)
  const [showHealthConfirmForm, setShowHealthConfirmForm] = useState<LeaveRequest | null>(null)

  const [leaveStart, setLeaveStart] = useState('')
  const [leaveEnd, setLeaveEnd] = useState('')
  const [leaveReason, setLeaveReason] = useState('')
  const [leaveElderId, setLeaveElderId] = useState<number | null>(null)
  const [leaveRiskAcknowledged, setLeaveRiskAcknowledged] = useState(false)
  const [expectedReturn, setExpectedReturn] = useState('')

  const [complaintType, setComplaintType] = useState<ComplaintType>('SERVICE_QUALITY')
  const [complaintDesc, setComplaintDesc] = useState('')
  const [complaintElderId, setComplaintElderId] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [expandedBillId, setExpandedBillId] = useState<number | null>(null)

  const [pickupMedication, setPickupMedication] = useState('')
  const [pickupRisk, setPickupRisk] = useState(false)
  const [pickupExpectedReturn, setPickupExpectedReturn] = useState('')

  const [healthStatus, setHealthStatus] = useState<HealthReconfirmStatus>('PENDING')
  const [healthNotes, setHealthNotes] = useState('')

  useEffect(() => {
    if (user?.id) {
      fetchFamilyElders(user.id)
    }
  }, [user?.id, fetchFamilyElders])

  useEffect(() => {
    if (user?.id && elders.length > 0) {
      const elderId = elders[0].id
      fetchFamilyRecords(user.id, elderId)
      fetchLeaveRequests(user.id)
      fetchComplaints(user.id)
      fetchBillsByElder(elderId)
    }
  }, [user?.id, elders, fetchFamilyRecords, fetchLeaveRequests, fetchComplaints, fetchBillsByElder])

  const handleSubmitLeave = async () => {
    if (!user?.id || !leaveElderId || !leaveStart || !leaveEnd) return
    setSubmitting(true)
    try {
      await createLeaveRequest(user.id, {
        elderId: leaveElderId,
        startDate: leaveStart,
        endDate: leaveEnd,
        reason: leaveReason,
        riskAcknowledged: leaveRiskAcknowledged,
        expectedReturnTime: expectedReturn || undefined,
      })
      setShowLeaveForm(false)
      setLeaveStart('')
      setLeaveEnd('')
      setLeaveReason('')
      setLeaveRiskAcknowledged(false)
      setExpectedReturn('')
      fetchLeaveRequests(user.id)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitComplaint = async () => {
    if (!user?.id || !complaintElderId || !complaintDesc) return
    setSubmitting(true)
    try {
      await createComplaint(user.id, {
        elderId: complaintElderId,
        type: complaintType,
        description: complaintDesc,
      })
      setShowComplaintForm(false)
      setComplaintDesc('')
      fetchComplaints(user.id)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitPickup = async () => {
    if (!showPickupForm || !pickupRisk) return
    setSubmitting(true)
    try {
      await recordPickup(showPickupForm.id, {
        medicationHandover: pickupMedication,
        riskAcknowledged: pickupRisk,
        expectedReturnTime: pickupExpectedReturn || undefined,
      })
      setShowPickupForm(null)
      setPickupMedication('')
      setPickupRisk(false)
      setPickupExpectedReturn('')
      if (user?.id) fetchLeaveRequests(user.id)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitReturn = async () => {
    if (!showReturnForm) return
    setSubmitting(true)
    try {
      await recordReturn(showReturnForm.id)
      setShowReturnForm(null)
      if (user?.id) fetchLeaveRequests(user.id)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitHealthConfirm = async () => {
    if (!showHealthConfirmForm || healthStatus === 'PENDING') return
    setSubmitting(true)
    try {
      await confirmHealthOnReturn(showHealthConfirmForm.id, healthStatus, healthNotes)
      setShowHealthConfirmForm(null)
      setHealthStatus('PENDING')
      setHealthNotes('')
      if (user?.id) fetchLeaveRequests(user.id)
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
      <h2 className="text-xl font-bold text-slate-800">家属服务</h2>

      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.key ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'records' && (
        <div className="space-y-3">
          {careRecords.map((record) => (
            <div key={record.id} className="bg-white rounded-lg border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full font-medium">
                  {CARE_TYPE_LABELS[record.type]}
                </span>
                <span className="text-xs text-slate-400">{record.caregiverName}</span>
                <span className="text-xs text-slate-400 ml-auto">{formatDateTime(record.recordTime)}</span>
              </div>
              <p className="text-sm text-slate-600">{record.description}</p>
            </div>
          ))}
          {careRecords.length === 0 && (
            <div className="text-center py-12 text-slate-400">暂无服务记录</div>
          )}
        </div>
      )}

      {activeTab === 'leave' && (
        <div className="space-y-4">
          <button
            onClick={() => {
              setLeaveElderId(elders.length > 0 ? elders[0].id : null)
              setShowLeaveForm(true)
            }}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium"
          >
            申请请假外出
          </button>
          <div className="space-y-3">
            {leaveRequests.map((leave) => (
              <div key={leave.id} className="bg-white rounded-lg border border-slate-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-800">{leave.elderName}</span>
                    <StatusBadge label={LEAVE_STATUS_LABELS[leave.status]} colorClass={LEAVE_STATUS_COLORS[leave.status]} />
                  </div>
                  {leave.billingSuspended && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">费用暂停</span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm text-slate-600 mb-2">
                  <div className="flex items-center gap-1">
                    <CalendarDays size={14} className="text-slate-400" />
                    <span>{formatDate(leave.startDate)} ~ {formatDate(leave.endDate)} ({leave.leaveDays}天)</span>
                  </div>
                  {leave.pickupTime && (
                    <div className="flex items-center gap-1">
                      <Clock size={14} className="text-slate-400" />
                      <span>接回: {formatDateTime(leave.pickupTime)}</span>
                    </div>
                  )}
                  {leave.expectedReturnTime && (
                    <div className="flex items-center gap-1">
                      <Clock size={14} className="text-slate-400" />
                      <span>预计返院: {formatDateTime(leave.expectedReturnTime)}</span>
                    </div>
                  )}
                  {leave.actualReturnTime && (
                    <div className="flex items-center gap-1">
                      <Clock size={14} className="text-slate-400" />
                      <span>实际返院: {formatDateTime(leave.actualReturnTime)}</span>
                    </div>
                  )}
                </div>

                {leave.reason && <p className="text-xs text-slate-400 mb-2">原因: {leave.reason}</p>}

                {leave.medicationHandover && (
                  <div className="mb-2 p-2 bg-blue-50 rounded text-xs">
                    <div className="flex items-center gap-1 text-blue-700 font-medium mb-1">
                      <Pill size={12} /> 药品交接
                    </div>
                    <p className="text-blue-600">{leave.medicationHandover}</p>
                  </div>
                )}

                {leave.riskAcknowledged && (
                  <div className="mb-2 p-2 bg-orange-50 rounded text-xs">
                    <div className="flex items-center gap-1 text-orange-700 font-medium mb-1">
                      <ShieldCheck size={12} /> 风险告知已确认
                    </div>
                    {leave.riskAcknowledgedTime && (
                      <p className="text-orange-600">确认时间: {formatDateTime(leave.riskAcknowledgedTime)}</p>
                    )}
                  </div>
                )}

                {leave.healthReconfirmStatus && (
                  <div className="mb-2 flex items-center gap-2">
                    <UserCheck size={14} className="text-slate-400" />
                    <StatusBadge label={`健康确认: ${HEALTH_RECONFIRM_STATUS_LABELS[leave.healthReconfirmStatus]}`} colorClass={HEALTH_RECONFIRM_STATUS_COLORS[leave.healthReconfirmStatus]} />
                  </div>
                )}
                {leave.healthReconfirmNotes && (
                  <p className="text-xs text-slate-500 mb-2">健康备注: {leave.healthReconfirmNotes}</p>
                )}

                <div className="flex gap-2 mt-3 flex-wrap">
                  {leave.status === 'APPROVED' && (
                    <button
                      onClick={() => {
                        setShowPickupForm(leave)
                        setPickupMedication('')
                        setPickupRisk(false)
                        setPickupExpectedReturn(leave.expectedReturnTime ? leave.expectedReturnTime.slice(0, 16) : '')
                      }}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs font-medium"
                    >
                      登记接回
                    </button>
                  )}
                  {leave.status === 'ON_LEAVE' && (
                    <button
                      onClick={() => setShowReturnForm(leave)}
                      className="px-3 py-1.5 bg-purple-600 text-white rounded hover:bg-purple-700 text-xs font-medium"
                    >
                      登记返院
                    </button>
                  )}
                  {leave.status === 'RETURNED' && leave.healthReconfirmStatus === 'PENDING' && (
                    <button
                      onClick={() => {
                        setShowHealthConfirmForm(leave)
                        setHealthStatus('PENDING')
                        setHealthNotes('')
                      }}
                      className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 text-xs font-medium"
                    >
                      确认健康状态
                    </button>
                  )}
                </div>
              </div>
            ))}
            {leaveRequests.length === 0 && (
              <div className="text-center py-12 text-slate-400">暂无请假记录</div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'billing' && (
        <div className="space-y-4">
          {bills.map((bill) => (
            <div key={bill.id} className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <div
                className="p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={async () => {
                  if (expandedBillId === bill.id) {
                    setExpandedBillId(null)
                  } else {
                    setExpandedBillId(bill.id)
                    await fetchFeeExplanation(bill.id)
                  }
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-800">{bill.period}</span>
                    <StatusBadge label={BILL_STATUS_LABELS[bill.status]} colorClass={BILL_STATUS_COLORS[bill.status]} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-primary-600">{formatCurrency(bill.totalAmount)}</span>
                    {expandedBillId === bill.id ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-1.5 bg-slate-50 rounded">
                    <p className="text-xs text-slate-500">护理等级</p>
                    <p className="text-xs font-semibold text-slate-800">{formatCurrency(bill.nursingLevelFee)}</p>
                  </div>
                  <div className="text-center p-1.5 bg-slate-50 rounded">
                    <p className="text-xs text-slate-500">基础服务</p>
                    <p className="text-xs font-semibold text-slate-800">{formatCurrency(bill.basicServiceFee)}</p>
                  </div>
                  <div className="text-center p-1.5 bg-slate-50 rounded">
                    <p className="text-xs text-slate-500">增值服务</p>
                    <p className="text-xs font-semibold text-slate-800">{formatCurrency(bill.valueAddedFee)}</p>
                  </div>
                  <div className="text-center p-1.5 bg-slate-50 rounded">
                    <p className="text-xs text-slate-500">请假扣减</p>
                    <p className="text-xs font-semibold text-red-600">-{formatCurrency(bill.leaveDeduction)}</p>
                  </div>
                  <div className="text-center p-1.5 bg-slate-50 rounded">
                    <p className="text-xs text-slate-500">风险护理</p>
                    <p className="text-xs font-semibold text-slate-800">{formatCurrency(bill.riskCareFee)}</p>
                  </div>
                  <div className="text-center p-1.5 bg-slate-50 rounded">
                    <p className="text-xs text-slate-500">医嘱用品</p>
                    <p className="text-xs font-semibold text-slate-800">{formatCurrency(bill.medicalSupplyFee)}</p>
                  </div>
                </div>
              </div>

              {expandedBillId === bill.id && feeExplanation && feeExplanation.bill.id === bill.id && (
                <div className="border-t border-slate-200 p-4 bg-slate-50">
                  <h4 className="text-sm font-semibold text-slate-800 mb-3">费用解释单</h4>
                  {(['NURSING_LEVEL', 'BASIC_SERVICE', 'VALUE_ADDED', 'LEAVE_DEDUCTION', 'RISK_CARE', 'MEDICAL_SUPPLY'] as BillDetailCategory[]).map((category) => {
                    const items = feeExplanation.breakdown[category]
                    if (!items || items.length === 0) return null
                    return (
                      <div key={category} className="mb-3 last:mb-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span>{BILL_DETAIL_CATEGORY_ICONS[category]}</span>
                          <span className="text-xs font-semibold text-slate-700">{BILL_DETAIL_CATEGORY_LABELS[category]}</span>
                          <span className="text-xs text-slate-400">
                            {formatCurrency(items.reduce((s, i) => s + i.amount, 0))}
                          </span>
                        </div>
                        <div className="space-y-1.5 ml-5">
                          {items.map((item, idx) => (
                            <div key={item.id || idx} className="bg-white rounded border border-slate-200 p-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-700">{item.description}</span>
                                <span className={`text-xs font-semibold ${category === 'LEAVE_DEDUCTION' ? 'text-red-600' : 'text-slate-800'}`}>
                                  {category === 'LEAVE_DEDUCTION' ? '-' : ''}{formatCurrency(item.amount)}
                                </span>
                              </div>
                              {(item.effectiveStartDate || item.effectiveEndDate) && (
                                <div className="text-xs text-slate-400 mt-0.5">
                                  生效: {item.effectiveStartDate || ''} ~ {item.effectiveEndDate || ''}
                                </div>
                              )}
                              {item.serviceRecord && (
                                <div className="mt-1 p-1.5 bg-primary-50 rounded text-xs">
                                  <span className="text-primary-700 font-medium">关联记录: </span>
                                  <span className="text-primary-600">
                                    {CARE_TYPE_LABELS[item.serviceRecord.type as keyof typeof CARE_TYPE_LABELS] || item.serviceRecord.type}
                                    {' '}| {item.serviceRecord.caregiverName}
                                    {' '}| {new Date(item.serviceRecord.recordTime).toLocaleDateString('zh-CN')}
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
          {bills.length === 0 && (
            <div className="text-center py-8 text-slate-400">暂无费用数据</div>
          )}
        </div>
      )}

      {activeTab === 'complaints' && (
        <div className="space-y-4">
          <button
            onClick={() => {
              setComplaintElderId(elders.length > 0 ? elders[0].id : null)
              setShowComplaintForm(true)
            }}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium"
          >
            提交投诉/建议
          </button>
          <div className="space-y-3">
            {complaints.map((c) => (
              <div key={c.id} className="bg-white rounded-lg border border-slate-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                      {COMPLAINT_TYPE_LABELS[c.type]}
                    </span>
                    <StatusBadge label={COMPLAINT_STATUS_LABELS[c.status]} colorClass={COMPLAINT_STATUS_COLORS[c.status]} />
                  </div>
                  <span className="text-xs text-slate-400">{formatDateTime(c.createTime)}</span>
                </div>
                <p className="text-sm text-slate-700">{c.description}</p>
                {c.response && (
                  <div className="mt-2 p-2 bg-green-50 rounded-lg">
                    <p className="text-xs text-green-700">回复: {c.response}</p>
                  </div>
                )}
              </div>
            ))}
            {complaints.length === 0 && (
              <div className="text-center py-12 text-slate-400">暂无投诉记录</div>
            )}
          </div>
        </div>
      )}

      {showLeaveForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-slate-800">申请请假外出</h3>
              <button onClick={() => setShowLeaveForm(false)}><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-4">
              {elders.length > 1 && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">老人</label>
                  <select
                    value={leaveElderId || ''}
                    onChange={(e) => setLeaveElderId(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    {elders.map((elder) => (
                      <option key={elder.id} value={elder.id}>{elder.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">开始日期 *</label>
                <input type="date" value={leaveStart} onChange={(e) => setLeaveStart(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">结束日期 *</label>
                <input type="date" value={leaveEnd} onChange={(e) => setLeaveEnd(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">预计返院时间</label>
                <input type="datetime-local" value={expectedReturn} onChange={(e) => setExpectedReturn(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">原因</label>
                <textarea value={leaveReason} onChange={(e) => setLeaveReason(e.target.value)} rows={2}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="请说明请假原因..." />
              </div>
              <label className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <input type="checkbox" checked={leaveRiskAcknowledged} onChange={(e) => setLeaveRiskAcknowledged(e.target.checked)}
                  className="w-4 h-4 mt-0.5 text-primary-600 rounded" />
                <div className="text-xs">
                  <p className="font-medium text-amber-800 flex items-center gap-1 mb-1">
                    <AlertCircle size={12} /> 风险告知确认
                  </p>
                  <p className="text-amber-700">本人确认已知晓老人外出期间的安全风险，愿意承担相关责任，并承诺按时返院。</p>
                </div>
              </label>
              <div className="flex gap-2">
                <button onClick={() => setShowLeaveForm(false)}
                  className="flex-1 py-2 border border-slate-300 rounded-lg text-sm text-slate-600 hover:bg-slate-50">取消</button>
                <button
                  onClick={handleSubmitLeave}
                  disabled={submitting || !leaveStart || !leaveEnd}
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

      {showComplaintForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-slate-800">提交投诉/建议</h3>
              <button onClick={() => setShowComplaintForm(false)}><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-4">
              {elders.length > 1 && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">老人</label>
                  <select
                    value={complaintElderId || ''}
                    onChange={(e) => setComplaintElderId(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    {elders.map((elder) => (
                      <option key={elder.id} value={elder.id}>{elder.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">类型</label>
                <select value={complaintType} onChange={(e) => setComplaintType(e.target.value as ComplaintType)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none">
                  {(Object.entries(COMPLAINT_TYPE_LABELS) as [ComplaintType, string][]).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">描述</label>
                <textarea value={complaintDesc} onChange={(e) => setComplaintDesc(e.target.value)} rows={4}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="请详细描述您的投诉或建议..." />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowComplaintForm(false)}
                  className="flex-1 py-2 border border-slate-300 rounded-lg text-sm text-slate-600 hover:bg-slate-50">取消</button>
                <button
                  onClick={handleSubmitComplaint}
                  disabled={submitting || !complaintDesc}
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

      {showPickupForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-slate-800">登记家属接回</h3>
              <button onClick={() => setShowPickupForm(null)}><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-4">
              <div className="p-3 bg-primary-50 rounded-lg text-sm">
                <p className="font-medium text-primary-800">{showPickupForm.elderName}</p>
                <p className="text-primary-600 text-xs">请假: {formatDate(showPickupForm.startDate)} ~ {formatDate(showPickupForm.endDate)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                  <Pill size={14} /> 药品交接
                </label>
                <textarea value={pickupMedication} onChange={(e) => setPickupMedication(e.target.value)} rows={3}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="请详细说明带走的药品名称、剂量、服用方法..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">预计返院时间</label>
                <input type="datetime-local" value={pickupExpectedReturn} onChange={(e) => setPickupExpectedReturn(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <label className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <input type="checkbox" checked={pickupRisk} onChange={(e) => setPickupRisk(e.target.checked)}
                  className="w-4 h-4 mt-0.5 text-primary-600 rounded" />
                <div className="text-xs">
                  <p className="font-medium text-amber-800 flex items-center gap-1 mb-1">
                    <ShieldCheck size={12} /> 风险告知确认
                  </p>
                  <p className="text-amber-700">本人确认已完成药品交接，已知晓老人外出期间的安全风险，并承诺按时返院。</p>
                </div>
              </label>
              <div className="flex gap-2">
                <button onClick={() => setShowPickupForm(null)}
                  className="flex-1 py-2 border border-slate-300 rounded-lg text-sm text-slate-600 hover:bg-slate-50">取消</button>
                <button
                  onClick={handleSubmitPickup}
                  disabled={submitting || !pickupRisk}
                  className="flex-1 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 size={16} className="animate-spin" />}
                  确认接回
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showReturnForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-slate-800">登记返院</h3>
              <button onClick={() => setShowReturnForm(null)}><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-4">
              <div className="p-3 bg-purple-50 rounded-lg text-sm">
                <p className="font-medium text-purple-800">{showReturnForm.elderName}</p>
                <p className="text-purple-600 text-xs">确认老人已安全返院，系统将自动恢复护理状态并待健康确认。</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowReturnForm(null)}
                  className="flex-1 py-2 border border-slate-300 rounded-lg text-sm text-slate-600 hover:bg-slate-50">取消</button>
                <button
                  onClick={handleSubmitReturn}
                  disabled={submitting}
                  className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 size={16} className="animate-spin" />}
                  确认返院
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showHealthConfirmForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-slate-800">返院健康确认</h3>
              <button onClick={() => setShowHealthConfirmForm(null)}><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-4">
              <div className="p-3 bg-green-50 rounded-lg text-sm">
                <p className="font-medium text-green-800">{showHealthConfirmForm.elderName}</p>
                <p className="text-green-600 text-xs">请确认老人返院后的健康状态，以决定是否恢复正常护理或启动重新评估。</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">健康状态 *</label>
                <select value={healthStatus} onChange={(e) => setHealthStatus(e.target.value as HealthReconfirmStatus)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none">
                  <option value="PENDING">请选择</option>
                  {(Object.entries(HEALTH_RECONFIRM_STATUS_LABELS) as [HealthReconfirmStatus, string][]).map(([key, label]) => (
                    key !== 'PENDING' && <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">健康备注</label>
                <textarea value={healthNotes} onChange={(e) => setHealthNotes(e.target.value)} rows={3}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="体温、血压、精神状态、外出期间健康情况..." />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowHealthConfirmForm(null)}
                  className="flex-1 py-2 border border-slate-300 rounded-lg text-sm text-slate-600 hover:bg-slate-50">取消</button>
                <button
                  onClick={handleSubmitHealthConfirm}
                  disabled={submitting || healthStatus === 'PENDING'}
                  className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 size={16} className="animate-spin" />}
                  确认
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
