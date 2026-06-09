import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2 } from 'lucide-react'
import LevelBadge from '@/components/LevelBadge'
import StatusBadge from '@/components/StatusBadge'
import { useDataStore } from '@/store/dataStore'
import { ELDER_STATUS_LABELS, ELDER_STATUS_COLORS, GENDER_LABELS } from '@/utils/constants'
import { formatDate } from '@/utils/helpers'
import BasicInfoTab from './elder/BasicInfoTab'
import AssessmentHistoryTab from './elder/AssessmentHistoryTab'
import CarePlanTab from './elder/CarePlanTab'
import CareRecordsTab from './elder/CareRecordsTab'
import RiskEventsTab from './elder/RiskEventsTab'
import BillsTab from './elder/BillsTab'

const TABS = ['基本信息', '评估历史', '护理计划', '护理记录', '风险事件', '费用明细']

export default function ElderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(0)
  const { currentElder, elderDetail, isLoading, fetchElderById } = useDataStore()

  useEffect(() => {
    if (id) {
      fetchElderById(Number(id))
    }
  }, [id, fetchElderById])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    )
  }

  if (!currentElder) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate('/elders')}
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-primary-600 transition-colors"
        >
          <ArrowLeft size={16} />
          返回老人列表
        </button>
        <div className="text-center py-20 text-slate-400">
          <p>未找到该老人信息</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/elders')}
        className="flex items-center gap-1 text-sm text-slate-500 hover:text-primary-600 transition-colors"
      >
        <ArrowLeft size={16} />
        返回老人列表
      </button>

      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-2xl font-bold">
            {currentElder.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-slate-800">{currentElder.name}</h2>
              <span className="text-sm text-slate-400">{GENDER_LABELS[currentElder.gender]} · {currentElder.age}岁</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <LevelBadge level={currentElder.nursingLevel} />
              <StatusBadge label={ELDER_STATUS_LABELS[currentElder.status]} colorClass={ELDER_STATUS_COLORS[currentElder.status]} />
              <span className="text-xs text-slate-400">入院: {formatDate(currentElder.admissionDate)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-slate-200">
        <nav className="flex gap-0">
          {TABS.map((tab, index) => (
            <button
              key={tab}
              onClick={() => setActiveTab(index)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === index
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      <div>
        {activeTab === 0 && <BasicInfoTab elder={currentElder} />}
        {activeTab === 1 && <AssessmentHistoryTab assessments={elderDetail?.assessments ?? []} />}
        {activeTab === 2 && <CarePlanTab carePlan={elderDetail?.carePlan ?? null} />}
        {activeTab === 3 && <CareRecordsTab records={elderDetail?.recentRecords ?? []} />}
        {activeTab === 4 && <RiskEventsTab riskEvents={elderDetail?.riskEvents ?? []} />}
        {activeTab === 5 && <BillsTab bills={elderDetail?.bills ?? []} />}
      </div>
    </div>
  )
}
