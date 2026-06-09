import { formatDateTime } from '@/utils/helpers'
import StatusBadge from '@/components/StatusBadge'
import { RISK_EVENT_TYPE_LABELS, SEVERITY_LABELS, SEVERITY_COLORS, RISK_EVENT_STATUS_LABELS, RISK_EVENT_STATUS_COLORS } from '@/utils/constants'
import type { RiskEvent } from '@/types'

interface Props {
  riskEvents: RiskEvent[]
}

export default function RiskEventsTab({ riskEvents }: Props) {
  return (
    <div className="space-y-4">
      {riskEvents.map((event) => (
        <div key={event.id} className="bg-white rounded-lg border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <StatusBadge label={RISK_EVENT_TYPE_LABELS[event.type]} colorClass="bg-slate-100 text-slate-700" />
              <StatusBadge label={SEVERITY_LABELS[event.severity]} colorClass={SEVERITY_COLORS[event.severity]} />
            </div>
            <StatusBadge label={RISK_EVENT_STATUS_LABELS[event.status]} colorClass={RISK_EVENT_STATUS_COLORS[event.status]} />
          </div>
          <p className="text-sm text-slate-700 mb-2">{event.description}</p>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span>时间: {formatDateTime(event.eventTime)}</span>
            <span>发现人: {event.discoverer}</span>
            {event.planAdjustment && <span className="text-amber-600">已触发计划调整</span>}
          </div>
        </div>
      ))}
      {riskEvents.length === 0 && (
        <div className="text-center py-8 text-slate-400">暂无风险事件</div>
      )}
    </div>
  )
}
