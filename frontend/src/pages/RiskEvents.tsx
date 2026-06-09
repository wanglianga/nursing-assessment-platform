import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Filter, Loader2 } from 'lucide-react'
import StatusBadge from '@/components/StatusBadge'
import { RISK_EVENT_TYPE_LABELS, RISK_EVENT_TYPE_LABELS as TYPE_MAP, SEVERITY_LABELS, SEVERITY_COLORS, RISK_EVENT_STATUS_LABELS, RISK_EVENT_STATUS_COLORS } from '@/utils/constants'
import { formatDateTime } from '@/utils/helpers'
import { useDataStore } from '@/store/dataStore'
import type { RiskEventType, Severity, RiskEventStatus } from '@/types'

export default function RiskEvents() {
  const navigate = useNavigate()
  const { riskEvents, isLoading, fetchRiskEvents } = useDataStore()
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [severityFilter, setSeverityFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')

  useEffect(() => {
    fetchRiskEvents()
  }, [fetchRiskEvents])

  const filtered = riskEvents.filter((event) => {
    const matchType = !typeFilter || event.type === typeFilter
    const matchSeverity = !severityFilter || event.severity === severityFilter
    const matchStatus = !statusFilter || event.status === statusFilter
    return matchType && matchSeverity && matchStatus
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-slate-800">风险事件</h2>

      <div className="flex flex-wrap items-center gap-3">
        <Filter size={16} className="text-slate-400" />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
        >
          <option value="">全部类型</option>
          {(Object.entries(RISK_EVENT_TYPE_LABELS) as [RiskEventType, string][]).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
        >
          <option value="">全部严重程度</option>
          {(Object.entries(SEVERITY_LABELS) as [Severity, string][]).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
        >
          <option value="">全部状态</option>
          {(Object.entries(RISK_EVENT_STATUS_LABELS) as [RiskEventStatus, string][]).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        {filtered.map((event) => (
          <div
            key={event.id}
            onClick={() => navigate(`/risk-events/${event.id}`)}
            className="bg-white rounded-lg border border-slate-200 p-5 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-start gap-4">
              <div className={`w-1.5 h-full min-h-[60px] rounded-full ${
                event.severity === 'CRITICAL' ? 'bg-red-500' : event.severity === 'HIGH' ? 'bg-orange-500' : event.severity === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500'
              }`} />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <StatusBadge label={TYPE_MAP[event.type]} colorClass="bg-slate-100 text-slate-700" />
                  <StatusBadge label={SEVERITY_LABELS[event.severity]} colorClass={SEVERITY_COLORS[event.severity]} />
                  <StatusBadge label={RISK_EVENT_STATUS_LABELS[event.status]} colorClass={RISK_EVENT_STATUS_COLORS[event.status]} />
                </div>
                <p className="text-sm text-slate-700 mb-2">{event.description}</p>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span>老人: {event.elderName}</span>
                  <span>时间: {formatDateTime(event.eventTime)}</span>
                  {event.discoverer && <span>发现人: {event.discoverer}</span>}
                  {event.planAdjustment && <span className="text-amber-600">计划调整</span>}
                  {event.billingImpact && <span className="text-red-600">费用影响</span>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-slate-400">暂无匹配的风险事件</div>
      )}
    </div>
  )
}
