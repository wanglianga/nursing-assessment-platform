import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import LevelBadge from '@/components/LevelBadge'
import { getNursingLevelLabel, formatDate, getDaysUntil } from '@/utils/helpers'
import { REASSESSMENT_REASON_LABELS, REASSESSMENT_REASON_COLORS } from '@/utils/constants'
import { useDataStore } from '@/store/dataStore'
import type { NursingLevel, ReassessmentReason } from '@/types'

interface ReassessmentItem {
  id: number
  name: string
  currentLevel: NursingLevel
  lastAssessment: string
  dueDate: string
  daysLeft: number
}

const REASSESSMENT_REASONS: { value: ReassessmentReason; label: string; description: string }[] = [
  { value: 'HOSPITALIZATION_RETURN', label: '住院返回', description: '老人住院后返回机构，需重新评估护理等级' },
  { value: 'COGNITIVE_DECLINE', label: '认知下降', description: '老人认知能力出现明显下降趋势' },
  { value: 'REHABILITATION_IMPROVEMENT', label: '康复改善', description: '老人康复情况良好，可能需要降低护理等级' },
  { value: 'PERIODIC_REVIEW', label: '定期复评', description: '按制度要求定期进行的复评' },
  { value: 'OTHER', label: '其他', description: '其他需要复评的情况' },
]

export default function Reassessment() {
  const navigate = useNavigate()
  const { elders, isLoading, fetchElders } = useDataStore()
  const [selectedReason, setSelectedReason] = useState<ReassessmentReason | null>(null)
  const [triggerDesc, setTriggerDesc] = useState('')
  const [showReasonPanel, setShowReasonPanel] = useState<number | null>(null)

  useEffect(() => {
    fetchElders()
  }, [fetchElders])

  const reassessmentList: ReassessmentItem[] = useMemo(() => {
    return elders.map((elder) => {
      const admissionDate = new Date(elder.admissionDate)
      const dueDate = new Date(admissionDate.getTime() + 60 * 24 * 60 * 60 * 1000)
      const dueDateStr = dueDate.toISOString().split('T')[0]
      const daysLeft = getDaysUntil(dueDateStr)
      return {
        id: elder.id,
        name: elder.name,
        currentLevel: elder.nursingLevel,
        lastAssessment: elder.admissionDate,
        dueDate: dueDateStr,
        daysLeft,
      }
    })
  }, [elders])

  const handleStartReassessment = (elderId: number) => {
    const params = new URLSearchParams()
    params.set('elderId', String(elderId))
    params.set('type', 'REASSESSMENT')
    if (selectedReason) {
      params.set('reason', selectedReason)
    }
    if (triggerDesc) {
      params.set('trigger', triggerDesc)
    }
    navigate(`/assessment?${params.toString()}`)
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
      <h2 className="text-xl font-bold text-slate-800">等级复评</h2>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-amber-800 mb-2">复评说明</h3>
        <p className="text-xs text-amber-700 leading-relaxed">
          当老人出现住院返回、认知下降或康复改善等情况时，评估医生可以发起护理等级复评。复评后护理项目、服务频次和费用标准将分段生效，不会覆盖历史账单。
        </p>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 text-left">
              <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase">姓名</th>
              <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase">当前等级</th>
              <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase">上次评估</th>
              <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase">到期日期</th>
              <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase">剩余天数</th>
              <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {reassessmentList.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-medium">
                      {item.name.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-slate-800">{item.name}</span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <LevelBadge level={item.currentLevel} />
                </td>
                <td className="px-5 py-4 text-sm text-slate-600">{formatDate(item.lastAssessment)}</td>
                <td className="px-5 py-4 text-sm text-slate-600">{formatDate(item.dueDate)}</td>
                <td className="px-5 py-4">
                  <span className={`text-sm font-medium ${
                    item.daysLeft < 0 ? 'text-red-600' : item.daysLeft <= 7 ? 'text-amber-600' : 'text-green-600'
                  }`}>
                    {item.daysLeft < 0 ? `过期${Math.abs(item.daysLeft)}天` : item.daysLeft === 0 ? '今日到期' : `${item.daysLeft}天`}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <button
                    onClick={() => setShowReasonPanel(showReasonPanel === item.id ? null : item.id)}
                    className="px-3 py-1.5 text-xs bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 font-medium"
                  >
                    进行复评
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showReasonPanel !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4">
            <h3 className="text-base font-semibold text-slate-800 mb-4">选择复评原因</h3>

            <div className="space-y-3 mb-4">
              {REASSESSMENT_REASONS.map((reason) => (
                <label
                  key={reason.value}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedReason === reason.value
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={reason.value}
                    checked={selectedReason === reason.value}
                    onChange={(e) => setSelectedReason(e.target.value as ReassessmentReason)}
                    className="mt-0.5 accent-primary-500"
                  />
                  <div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${REASSESSMENT_REASON_COLORS[reason.value]}`}>
                      {reason.label}
                    </span>
                    <p className="text-xs text-slate-500 mt-1">{reason.description}</p>
                  </div>
                </label>
              ))}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">触发说明（选填）</label>
              <textarea
                value={triggerDesc}
                onChange={(e) => setTriggerDesc(e.target.value)}
                rows={2}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                placeholder="请描述触发复评的具体情况..."
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowReasonPanel(null)
                  setSelectedReason(null)
                  setTriggerDesc('')
                }}
                className="flex-1 py-2 border border-slate-300 rounded-lg text-sm text-slate-600 hover:bg-slate-50"
              >
                取消
              </button>
              <button
                onClick={() => handleStartReassessment(showReasonPanel)}
                disabled={!selectedReason}
                className="flex-1 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                开始复评
              </button>
            </div>
          </div>
        </div>
      )}

      {reassessmentList.length === 0 && (
        <div className="text-center py-12 text-slate-400">暂无复评数据</div>
      )}
    </div>
  )
}
