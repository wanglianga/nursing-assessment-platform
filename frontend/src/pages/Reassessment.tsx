import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import LevelBadge from '@/components/LevelBadge'
import { getNursingLevelLabel, formatDate, getDaysUntil } from '@/utils/helpers'
import { useDataStore } from '@/store/dataStore'
import type { NursingLevel } from '@/types'

interface ReassessmentItem {
  id: number
  name: string
  currentLevel: NursingLevel
  lastAssessment: string
  dueDate: string
  daysLeft: number
}

export default function Reassessment() {
  const navigate = useNavigate()
  const { elders, isLoading, fetchElders } = useDataStore()

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
                    onClick={() => navigate(`/assessment?elderId=${item.id}&type=REASSESSMENT`)}
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

      {reassessmentList.length === 0 && (
        <div className="text-center py-12 text-slate-400">暂无复评数据</div>
      )}
    </div>
  )
}
