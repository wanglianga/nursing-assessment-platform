import { formatDate } from '@/utils/helpers'
import { CARE_TYPE_LABELS, CHANGE_REASON_LABELS } from '@/utils/constants'
import type { CarePlan } from '@/types'

interface Props {
  carePlan: CarePlan | null
}

export default function CarePlanTab({ carePlan }: Props) {
  if (!carePlan) {
    return (
      <div className="text-center py-8 text-slate-400">暂无护理计划</div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
              carePlan.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : carePlan.status === 'SUSPENDED' ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-700'
            }`}>
              {carePlan.status === 'ACTIVE' ? '生效中' : carePlan.status === 'SUSPENDED' ? '已暂停' : '已过期'}
            </span>
            <span className="text-sm text-slate-500">生效: {formatDate(carePlan.effectiveDate)}</span>
            {carePlan.expiryDate && <span className="text-sm text-slate-500">至: {formatDate(carePlan.expiryDate)}</span>}
          </div>
        </div>

        <h4 className="text-sm font-semibold text-slate-800 mb-3">护理项目</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {carePlan.items.map((item) => (
            <div key={item.id} className={`p-4 rounded-lg border ${item.isActive ? 'border-slate-200 bg-white' : 'border-slate-100 bg-slate-50 opacity-60'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full font-medium">
                  {CARE_TYPE_LABELS[item.type]}
                </span>
                <span className={`text-xs ${item.isActive ? 'text-green-600' : 'text-slate-400'}`}>
                  {item.isActive ? '启用' : '停用'}
                </span>
              </div>
              <p className="text-sm font-medium text-slate-700">{item.frequency}</p>
              {item.description && <p className="text-xs text-slate-500 mt-1">{item.description}</p>}
            </div>
          ))}
        </div>
      </div>

      {carePlan.changeHistory.length > 0 && (
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <h4 className="text-sm font-semibold text-slate-800 mb-4">变更历史</h4>
          <div className="space-y-3">
            {carePlan.changeHistory.map((change) => (
              <div key={change.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="w-2 h-2 bg-primary-500 rounded-full mt-1.5 flex-shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                      {CHANGE_REASON_LABELS[change.reasonType]}
                    </span>
                    <span className="text-xs text-slate-400">{formatDate(change.changeDate)}</span>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">{change.changeReason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
