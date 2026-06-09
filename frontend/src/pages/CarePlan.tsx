import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, X, Loader2 } from 'lucide-react'
import { formatDate } from '@/utils/helpers'
import { CARE_TYPE_LABELS, CHANGE_REASON_LABELS } from '@/utils/constants'
import { useDataStore } from '@/store/dataStore'
import type { CareType } from '@/types'

export default function CarePlanPage() {
  const [searchParams] = useSearchParams()
  const elderId = Number(searchParams.get('elderId'))
  const { carePlan, isLoading, fetchCarePlan, suspendCarePlan, activateCarePlan, addCarePlanItem } = useDataStore()
  const [showAddItem, setShowAddItem] = useState(false)
  const [itemType, setItemType] = useState<CareType>('TURN_OVER')
  const [itemFrequency, setItemFrequency] = useState('')
  const [itemDescription, setItemDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (elderId) {
      fetchCarePlan(elderId)
    }
  }, [elderId, fetchCarePlan])

  const handleSuspend = async () => {
    if (!carePlan) return
    setSubmitting(true)
    try {
      await suspendCarePlan(carePlan.id)
      fetchCarePlan(elderId)
    } finally {
      setSubmitting(false)
    }
  }

  const handleActivate = async () => {
    if (!carePlan) return
    setSubmitting(true)
    try {
      await activateCarePlan(carePlan.id)
      fetchCarePlan(elderId)
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddItem = async () => {
    if (!elderId || !itemFrequency) return
    setSubmitting(true)
    try {
      await addCarePlanItem(elderId, {
        type: itemType,
        frequency: itemFrequency,
        description: itemDescription,
      })
      setShowAddItem(false)
      setItemFrequency('')
      setItemDescription('')
      fetchCarePlan(elderId)
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading || !carePlan) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">护理计划</h2>
        <div className="flex gap-2">
          {carePlan.status === 'ACTIVE' ? (
            <button
              onClick={handleSuspend}
              disabled={submitting}
              className="px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-600 disabled:opacity-50 flex items-center gap-2"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              暂停计划
            </button>
          ) : (
            <button
              onClick={handleActivate}
              disabled={submitting}
              className="px-4 py-2 text-sm border border-green-300 rounded-lg hover:bg-green-50 text-green-600 disabled:opacity-50 flex items-center gap-2"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              激活计划
            </button>
          )}
          <button
            onClick={() => setShowAddItem(true)}
            className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            添加项目
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-5">
        <div className="flex items-center gap-4 mb-4">
          <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
            carePlan.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
          }`}>
            {carePlan.status === 'ACTIVE' ? '生效中' : '已暂停'}
          </span>
          <span className="text-sm text-slate-500">生效日期: {formatDate(carePlan.effectiveDate)}</span>
          {carePlan.expiryDate && <span className="text-sm text-slate-500">到期: {formatDate(carePlan.expiryDate)}</span>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {carePlan.items.map((item) => (
            <div key={item.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full font-medium">
                  {CARE_TYPE_LABELS[item.type]}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={item.isActive} className="sr-only peer" readOnly />
                  <div className="w-9 h-5 bg-slate-200 peer-checked:bg-primary-500 rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
                </label>
              </div>
              <p className="text-sm font-medium text-slate-700">{item.frequency}</p>
              {item.description && <p className="text-xs text-slate-500 mt-1">{item.description}</p>}
            </div>
          ))}
          {carePlan.items.length === 0 && (
            <div className="col-span-full text-center py-8 text-slate-400">暂无护理项目</div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-5">
        <h3 className="text-base font-semibold text-slate-800 mb-4">变更历史</h3>
        <div className="relative">
          <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-slate-200" />
          <div className="space-y-4">
            {carePlan.changeHistory.map((change) => (
              <div key={change.id} className="relative pl-10">
                <div className="absolute left-1.5 top-1.5 w-3 h-3 bg-primary-500 rounded-full border-2 border-white" />
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                    {CHANGE_REASON_LABELS[change.reasonType]}
                  </span>
                  <span className="text-xs text-slate-400">{formatDate(change.changeDate)}</span>
                </div>
                <p className="text-sm text-slate-600">{change.changeReason}</p>
              </div>
            ))}
            {carePlan.changeHistory.length === 0 && (
              <div className="text-center py-8 text-slate-400">暂无变更记录</div>
            )}
          </div>
        </div>
      </div>

      {showAddItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-slate-800">添加护理项目</h3>
              <button onClick={() => setShowAddItem(false)}><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">护理类型</label>
                <select
                  value={itemType}
                  onChange={(e) => setItemType(e.target.value as CareType)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  {(Object.entries(CARE_TYPE_LABELS) as [CareType, string][]).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">频率</label>
                <input
                  type="text"
                  value={itemFrequency}
                  onChange={(e) => setItemFrequency(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="如: 每日3次"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">描述</label>
                <textarea
                  value={itemDescription}
                  onChange={(e) => setItemDescription(e.target.value)}
                  rows={2}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="护理项目描述..."
                />
              </div>
              <button
                onClick={handleAddItem}
                disabled={submitting || !itemFrequency}
                className="w-full py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 size={16} className="animate-spin" />}
                添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
