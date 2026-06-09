import { formatDate } from '@/utils/helpers'
import { getNursingLevelLabel } from '@/utils/helpers'
import { REASSESSMENT_REASON_LABELS, REASSESSMENT_REASON_COLORS } from '@/utils/constants'
import type { Assessment } from '@/types'

const DIMENSIONS: { key: keyof Assessment; label: string; max: number }[] = [
  { key: 'selfCareScore', label: '自理能力', max: 60 },
  { key: 'cognitiveScore', label: '认知状态', max: 50 },
  { key: 'chronicDiseaseScore', label: '慢病评估', max: 20 },
  { key: 'fallRiskScore', label: '跌倒风险', max: 25 },
  { key: 'medicationScore', label: '用药情况', max: 20 },
]

interface Props {
  assessments: Assessment[]
}

export default function AssessmentHistoryTab({ assessments }: Props) {
  return (
    <div className="space-y-4">
      {assessments.map((assessment) => (
        <div key={assessment.id} className="bg-white rounded-lg border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                assessment.type === 'ADMISSION'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-amber-100 text-amber-700'
              }`}>
                {assessment.type === 'ADMISSION' ? '入院评估' : '复评'}
              </span>
              <span className="text-sm text-slate-500">{formatDate(assessment.assessmentDate)}</span>
              <span className="text-sm text-slate-500">评估人: {assessment.assessorName}</span>
              {assessment.reassessmentReason && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${REASSESSMENT_REASON_COLORS[assessment.reassessmentReason]}`}>
                  {REASSESSMENT_REASON_LABELS[assessment.reassessmentReason]}
                </span>
              )}
            </div>
            <span className="text-sm font-semibold text-primary-600">
              建议等级: {getNursingLevelLabel(assessment.nursingLevel)}
            </span>
          </div>

          {assessment.reassessmentTrigger && (
            <div className="mb-3 p-2 bg-amber-50 rounded-lg text-xs text-amber-700">
              触发说明: {assessment.reassessmentTrigger}
            </div>
          )}

          <div className="grid grid-cols-5 gap-4 mb-3">
            {DIMENSIONS.map((dim) => (
              <div key={dim.key} className="text-center">
                <div className="text-lg font-bold text-slate-800">
                  {assessment[dim.key] as number}
                </div>
                <div className="text-xs text-slate-500">{dim.label}</div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1">
                  <div
                    className="bg-primary-500 h-1.5 rounded-full"
                    style={{ width: `${((assessment[dim.key] as number) / dim.max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <span className="text-sm text-slate-600">总分: <strong>{assessment.totalScore}</strong></span>
            {assessment.notes && <span className="text-xs text-slate-400">{assessment.notes}</span>}
          </div>
        </div>
      ))}
      {assessments.length === 0 && (
        <div className="text-center py-8 text-slate-400">暂无评估记录</div>
      )}
    </div>
  )
}
