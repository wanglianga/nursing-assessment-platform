import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Check, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react'
import { SELF_CARE_ITEMS, COGNITIVE_ITEMS } from '@/utils/constants'
import { getNursingLevelLabel } from '@/utils/helpers'
import { useDataStore } from '@/store/dataStore'
import { useAuthStore } from '@/store/authStore'
import type { NursingLevel, AssessmentType } from '@/types'

const STEPS = ['自理能力', '认知状态', '慢病评估', '跌倒风险', '用药情况', '汇总']

function getNursingLevel(total: number): NursingLevel {
  if (total >= 120) return 'SPECIAL'
  if (total >= 90) return 'LEVEL_1'
  if (total >= 60) return 'LEVEL_2'
  if (total >= 30) return 'LEVEL_3'
  return 'SELF_CARE'
}

export default function Assessment() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const elderId = Number(searchParams.get('elderId'))
  const assessmentType = (searchParams.get('type') || 'ADMISSION') as AssessmentType
  const { createAssessment } = useDataStore()
  const { user } = useAuthStore()
  const [step, setStep] = useState(0)
  const [selfCareScores, setSelfCareScores] = useState<number[]>([5, 5, 5, 5, 5, 5])
  const [cognitiveScores, setCognitiveScores] = useState<number[]>([4, 4, 4, 4, 4])
  const [chronicScore, setChronicScore] = useState(0)
  const [chronicDesc, setChronicDesc] = useState('')
  const [fallScore, setFallScore] = useState(0)
  const [fallDesc, setFallDesc] = useState('')
  const [medScore, setMedScore] = useState(0)
  const [medDesc, setMedDesc] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const selfCareTotal = selfCareScores.reduce((a, b) => a + b, 0)
  const cognitiveTotal = cognitiveScores.reduce((a, b) => a + b, 0)
  const totalScore = selfCareTotal + cognitiveTotal + chronicScore + fallScore + medScore
  const suggestedLevel = getNursingLevel(totalScore)

  const dimensions = [
    { label: '自理能力', value: selfCareTotal, max: 60 },
    { label: '认知状态', value: cognitiveTotal, max: 50 },
    { label: '慢病评估', value: chronicScore, max: 20 },
    { label: '跌倒风险', value: fallScore, max: 25 },
    { label: '用药情况', value: medScore, max: 20 },
  ]

  const handleSubmit = async () => {
    if (!elderId || !user?.id) return
    setSubmitting(true)
    try {
      await createAssessment({
        elderId,
        assessorId: user.id,
        type: assessmentType,
        selfCareScore: selfCareTotal,
        cognitiveScore: cognitiveTotal,
        chronicDiseaseScore: chronicScore,
        fallRiskScore: fallScore,
        medicationScore: medScore,
        totalScore,
        nursingLevel: suggestedLevel,
        notes: [chronicDesc, fallDesc, medDesc].filter(Boolean).join('; '),
      })
      navigate(`/elders/${elderId}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-xl font-bold text-slate-800">护理评估</h2>

      <div className="flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
              i < step ? 'bg-green-100 text-green-700' : i === step ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-400'
            }`}>
              {i < step ? <Check size={12} /> : <span>{i + 1}</span>}
              <span className="hidden md:inline">{label}</span>
            </div>
            {i < STEPS.length - 1 && <ChevronRight size={14} className="text-slate-300 mx-1" />}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-6">
        {step === 0 && (
          <div className="space-y-5">
            <h3 className="text-base font-semibold text-slate-800">自理能力评估</h3>
            {SELF_CARE_ITEMS.map((item, i) => (
              <div key={item}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-700">{item}</span>
                  <span className="text-sm font-semibold text-primary-600">{selfCareScores[i]}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={10}
                  value={selfCareScores[i]}
                  onChange={(e) => {
                    const next = [...selfCareScores]
                    next[i] = Number(e.target.value)
                    setSelfCareScores(next)
                  }}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>0</span><span>5</span><span>10</span>
                </div>
              </div>
            ))}
            <div className="text-right text-sm text-slate-500">小计: <strong className="text-primary-600">{selfCareTotal}</strong> / 60</div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <h3 className="text-base font-semibold text-slate-800">认知状态评估</h3>
            {COGNITIVE_ITEMS.map((item, i) => (
              <div key={item}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-700">{item}</span>
                  <span className="text-sm font-semibold text-primary-600">{cognitiveScores[i]}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={10}
                  value={cognitiveScores[i]}
                  onChange={(e) => {
                    const next = [...cognitiveScores]
                    next[i] = Number(e.target.value)
                    setCognitiveScores(next)
                  }}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>0</span><span>5</span><span>10</span>
                </div>
              </div>
            ))}
            <div className="text-right text-sm text-slate-500">小计: <strong className="text-primary-600">{cognitiveTotal}</strong> / 50</div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <h3 className="text-base font-semibold text-slate-800">慢病评估</h3>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-700">慢病评分</span>
                <span className="text-sm font-semibold text-primary-600">{chronicScore}</span>
              </div>
              <input
                type="range"
                min={0}
                max={20}
                value={chronicScore}
                onChange={(e) => setChronicScore(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>0</span><span>10</span><span>20</span>
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-700 mb-1.5">描述</label>
              <textarea
                value={chronicDesc}
                onChange={(e) => setChronicDesc(e.target.value)}
                rows={3}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                placeholder="请描述慢病情况..."
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <h3 className="text-base font-semibold text-slate-800">跌倒风险评估 (Morse评分)</h3>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-700">跌倒风险评分</span>
                <span className="text-sm font-semibold text-primary-600">{fallScore}</span>
              </div>
              <input
                type="range"
                min={0}
                max={25}
                value={fallScore}
                onChange={(e) => setFallScore(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>0</span><span>12</span><span>25</span>
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-700 mb-1.5">描述</label>
              <textarea
                value={fallDesc}
                onChange={(e) => setFallDesc(e.target.value)}
                rows={3}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                placeholder="请描述跌倒风险情况..."
              />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5">
            <h3 className="text-base font-semibold text-slate-800">用药情况评估</h3>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-700">用药评分</span>
                <span className="text-sm font-semibold text-primary-600">{medScore}</span>
              </div>
              <input
                type="range"
                min={0}
                max={20}
                value={medScore}
                onChange={(e) => setMedScore(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>0</span><span>10</span><span>20</span>
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-700 mb-1.5">描述</label>
              <textarea
                value={medDesc}
                onChange={(e) => setMedDesc(e.target.value)}
                rows={3}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                placeholder="请描述用药情况..."
              />
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6">
            <h3 className="text-base font-semibold text-slate-800">评估汇总</h3>
            <div className="grid grid-cols-5 gap-3">
              {dimensions.map((dim) => (
                <div key={dim.label} className="text-center p-3 bg-slate-50 rounded-lg">
                  <div className="text-lg font-bold text-slate-800">{dim.value}</div>
                  <div className="text-xs text-slate-500">{dim.label}</div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                    <div className="bg-primary-500 h-1.5 rounded-full" style={{ width: `${(dim.value / dim.max) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-primary-50 rounded-lg p-4 text-center">
              <p className="text-sm text-slate-600">总分</p>
              <p className="text-3xl font-bold text-primary-700">{totalScore}</p>
              <p className="text-sm text-slate-600 mt-1">建议护理等级: <strong className="text-primary-700">{getNursingLevelLabel(suggestedLevel)}</strong></p>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          className="flex items-center gap-1 px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={16} /> 上一步
        </button>
        {step < 5 ? (
          <button
            onClick={() => setStep(step + 1)}
            className="flex items-center gap-1 px-4 py-2 text-sm text-white bg-primary-600 rounded-lg hover:bg-primary-700"
          >
            下一步 <ChevronRight size={16} />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 flex items-center gap-2"
          >
            {submitting && <Loader2 size={16} className="animate-spin" />}
            确认提交
          </button>
        )}
      </div>
    </div>
  )
}
