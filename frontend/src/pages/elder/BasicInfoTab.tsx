import { User, Phone, CreditCard, AlertTriangle, Pill } from 'lucide-react'
import { formatDate } from '@/utils/helpers'
import { GENDER_LABELS } from '@/utils/constants'
import type { Elder } from '@/types'

interface Props {
  elder: Elder
}

export default function BasicInfoTab({ elder }: Props) {
  const allergies = elder.allergies ? elder.allergies.split(',').filter(Boolean) : []
  const diseases = elder.chronicDiseases ? elder.chronicDiseases.split(',').filter(Boolean) : []
  const medications = elder.currentMedications ? elder.currentMedications.split(',').filter(Boolean) : []

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <h4 className="text-sm font-semibold text-slate-800 mb-3">基本信息</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <User size={16} className="text-slate-400" />
              <span className="text-sm text-slate-500 w-20">姓名</span>
              <span className="text-sm text-slate-800">{elder.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <User size={16} className="text-slate-400" />
              <span className="text-sm text-slate-500 w-20">性别</span>
              <span className="text-sm text-slate-800">{GENDER_LABELS[elder.gender]}</span>
            </div>
            <div className="flex items-center gap-3">
              <User size={16} className="text-slate-400" />
              <span className="text-sm text-slate-500 w-20">年龄</span>
              <span className="text-sm text-slate-800">{elder.age}岁</span>
            </div>
            <div className="flex items-center gap-3">
              <CreditCard size={16} className="text-slate-400" />
              <span className="text-sm text-slate-500 w-20">身份证号</span>
              <span className="text-sm text-slate-800">{elder.idCard || '-'}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone size={16} className="text-slate-400" />
              <span className="text-sm text-slate-500 w-20">联系人</span>
              <span className="text-sm text-slate-800">{elder.contactName || '-'}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone size={16} className="text-slate-400" />
              <span className="text-sm text-slate-500 w-20">联系电话</span>
              <span className="text-sm text-slate-800">{elder.contactPhone || '-'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {allergies.length > 0 && (
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={16} className="text-red-500" />
              <h4 className="text-sm font-semibold text-slate-800">过敏信息</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {allergies.map((a) => (
                <span key={a} className="text-xs bg-red-50 text-red-600 px-2.5 py-1 rounded-full border border-red-200">
                  {a.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        {diseases.length > 0 && (
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <h4 className="text-sm font-semibold text-slate-800 mb-3">慢性疾病</h4>
            <div className="flex flex-wrap gap-2">
              {diseases.map((d) => (
                <span key={d} className="text-xs bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full border border-amber-200">
                  {d.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        {medications.length > 0 && (
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Pill size={16} className="text-blue-500" />
              <h4 className="text-sm font-semibold text-slate-800">当前用药</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {medications.map((m) => (
                <span key={m} className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-200">
                  {m.trim()}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
