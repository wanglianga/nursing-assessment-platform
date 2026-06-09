import { useState, useEffect } from 'react'
import { FileText, CalendarDays, Receipt, MessageSquare, Loader2 } from 'lucide-react'
import StatusBadge from '@/components/StatusBadge'
import { formatCurrency, formatDateTime, formatDate } from '@/utils/helpers'
import {
  CARE_TYPE_LABELS, LEAVE_STATUS_LABELS, LEAVE_STATUS_COLORS,
  COMPLAINT_TYPE_LABELS, COMPLAINT_STATUS_LABELS, COMPLAINT_STATUS_COLORS
} from '@/utils/constants'
import { useDataStore } from '@/store/dataStore'
import { useAuthStore } from '@/store/authStore'
import type { ComplaintType } from '@/types'

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
    fetchComplaints, createComplaint, fetchBillsByElder, bills
  } = useDataStore()
  const [activeTab, setActiveTab] = useState('records')
  const [showLeaveForm, setShowLeaveForm] = useState(false)
  const [showComplaintForm, setShowComplaintForm] = useState(false)
  const [leaveStart, setLeaveStart] = useState('')
  const [leaveEnd, setLeaveEnd] = useState('')
  const [leaveReason, setLeaveReason] = useState('')
  const [leaveElderId, setLeaveElderId] = useState<number | null>(null)
  const [complaintType, setComplaintType] = useState<ComplaintType>('SERVICE_QUALITY')
  const [complaintDesc, setComplaintDesc] = useState('')
  const [complaintElderId, setComplaintElderId] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)

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
      })
      setShowLeaveForm(false)
      setLeaveStart('')
      setLeaveEnd('')
      setLeaveReason('')
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

      <div className="flex gap-2 border-b border-slate-200">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
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
            申请请假
          </button>
          <div className="space-y-3">
            {leaveRequests.map((leave) => (
              <div key={leave.id} className="bg-white rounded-lg border border-slate-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-800">{leave.elderName}</span>
                  <StatusBadge label={LEAVE_STATUS_LABELS[leave.status]} colorClass={LEAVE_STATUS_COLORS[leave.status]} />
                </div>
                <div className="text-sm text-slate-600">
                  {formatDate(leave.startDate)} ~ {formatDate(leave.endDate)} ({leave.leaveDays}天)
                </div>
                {leave.reason && <p className="text-xs text-slate-400 mt-1">原因: {leave.reason}</p>}
              </div>
            ))}
            {leaveRequests.length === 0 && (
              <div className="text-center py-12 text-slate-400">暂无请假记录</div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'billing' && (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-base font-semibold text-slate-800 mb-4">本月费用预估</h3>
          <div className="space-y-3">
            {bills.length > 0 ? (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">护理等级费</span>
                  <span className="text-slate-800">{formatCurrency(bills[0].nursingLevelFee)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">增值服务费</span>
                  <span className="text-slate-800">{formatCurrency(bills[0].valueAddedFee)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">外出扣减</span>
                  <span className="text-red-600">-{formatCurrency(bills[0].leaveDeduction)}</span>
                </div>
                <div className="border-t border-slate-200 pt-3 flex justify-between">
                  <span className="font-medium text-slate-700">合计</span>
                  <span className="text-lg font-bold text-primary-600">{formatCurrency(bills[0].totalAmount)}</span>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-slate-400">暂无费用数据</div>
            )}
          </div>
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
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-base font-semibold text-slate-800 mb-4">申请请假外出</h3>
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
                <label className="block text-sm font-medium text-slate-700 mb-1">开始日期</label>
                <input type="date" value={leaveStart} onChange={(e) => setLeaveStart(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">结束日期</label>
                <input type="date" value={leaveEnd} onChange={(e) => setLeaveEnd(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">原因</label>
                <textarea value={leaveReason} onChange={(e) => setLeaveReason(e.target.value)} rows={2}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="请说明请假原因..." />
              </div>
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
            <h3 className="text-base font-semibold text-slate-800 mb-4">提交投诉/建议</h3>
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
    </div>
  )
}
