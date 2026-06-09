import { formatDate } from '@/utils/helpers'
import { CARE_TYPE_LABELS } from '@/utils/constants'
import type { CareRecord } from '@/types'

function groupByDate(records: CareRecord[]) {
  const groups: Record<string, CareRecord[]> = {}
  for (const record of records) {
    const date = formatDate(record.recordTime)
    if (!groups[date]) groups[date] = []
    groups[date].push(record)
  }
  return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a))
}

interface Props {
  records: CareRecord[]
}

export default function CareRecordsTab({ records }: Props) {
  const grouped = groupByDate(records)

  return (
    <div className="space-y-6">
      {grouped.map(([date, recs]) => (
        <div key={date}>
          <h4 className="text-sm font-semibold text-slate-600 mb-3">{date}</h4>
          <div className="space-y-2">
            {recs.map((record) => (
              <div key={record.id} className="bg-white rounded-lg border border-slate-200 p-4 flex items-start gap-4">
                <span className="text-sm font-mono text-slate-400 w-14 pt-0.5">
                  {record.recordTime.split('T')[1]?.substring(0, 5)}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full font-medium">
                      {CARE_TYPE_LABELS[record.type]}
                    </span>
                    <span className="text-xs text-slate-400">{record.caregiverName}</span>
                  </div>
                  {record.description && (
                    <p className="text-sm text-slate-600">{record.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      {records.length === 0 && (
        <div className="text-center py-8 text-slate-400">暂无护理记录</div>
      )}
    </div>
  )
}
