import type { NursingLevel, CareType, RiskEventType, Severity, RiskEventStatus, BillStatus, LeaveStatus, ComplaintType, ComplaintStatus, ChangeReasonType, BillDetailCategory, ElderStatus, Gender, ReassessmentReason, CompanionStatus, HospitalResult, HealthReconfirmStatus } from '@/types'

export const NURSING_LEVEL_LABELS: Record<NursingLevel, string> = {
  SPECIAL: '特级护理',
  LEVEL_1: '一级护理',
  LEVEL_2: '二级护理',
  LEVEL_3: '三级护理',
  SELF_CARE: '自理',
}

export const NURSING_LEVEL_COLORS: Record<NursingLevel, string> = {
  SPECIAL: 'bg-red-100 text-red-700',
  LEVEL_1: 'bg-orange-100 text-orange-700',
  LEVEL_2: 'bg-amber-100 text-amber-700',
  LEVEL_3: 'bg-blue-100 text-blue-700',
  SELF_CARE: 'bg-green-100 text-green-700',
}

export const NURSING_LEVEL_FEES: Record<NursingLevel, number> = {
  SPECIAL: 8000,
  LEVEL_1: 6000,
  LEVEL_2: 4000,
  LEVEL_3: 2500,
  SELF_CARE: 1500,
}

export const CARE_TYPE_LABELS: Record<CareType, string> = {
  TURN_OVER: '翻身',
  FEEDING: '喂饭',
  BATHING: '洗浴',
  REHABILITATION: '康复训练',
  NIGHT_PATROL: '夜间巡视',
  OTHER: '异常事件',
}

export const CARE_TYPE_COLORS: Record<CareType, string> = {
  TURN_OVER: 'bg-purple-100 text-purple-700',
  FEEDING: 'bg-green-100 text-green-700',
  BATHING: 'bg-blue-100 text-blue-700',
  REHABILITATION: 'bg-orange-100 text-orange-700',
  NIGHT_PATROL: 'bg-indigo-100 text-indigo-700',
  OTHER: 'bg-red-100 text-red-700',
}

export const RISK_EVENT_TYPE_LABELS: Record<RiskEventType, string> = {
  FALL: '跌倒',
  PRESSURE_SORE: '压疮',
  WANDERING: '走失',
  FAMILY_PICKUP: '家属接出',
  OTHER: '其他',
}

export const SEVERITY_LABELS: Record<Severity, string> = {
  LOW: '低',
  MEDIUM: '中',
  HIGH: '高',
  CRITICAL: '严重',
}

export const SEVERITY_COLORS: Record<Severity, string> = {
  LOW: 'bg-green-100 text-green-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  HIGH: 'bg-orange-100 text-orange-700',
  CRITICAL: 'bg-red-100 text-red-700',
}

export const RISK_EVENT_STATUS_LABELS: Record<RiskEventStatus, string> = {
  REPORTED: '已上报',
  PROCESSING: '处理中',
  RESOLVED: '已解决',
}

export const RISK_EVENT_STATUS_COLORS: Record<RiskEventStatus, string> = {
  REPORTED: 'bg-red-100 text-red-700',
  PROCESSING: 'bg-yellow-100 text-yellow-700',
  RESOLVED: 'bg-green-100 text-green-700',
}

export const BILL_STATUS_LABELS: Record<BillStatus, string> = {
  DRAFT: '待确认',
  CONFIRMED: '已确认',
  PAID: '已支付',
}

export const BILL_STATUS_COLORS: Record<BillStatus, string> = {
  DRAFT: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PAID: 'bg-green-100 text-green-700',
}

export const LEAVE_STATUS_LABELS: Record<LeaveStatus, string> = {
  PENDING: '待审批',
  APPROVED: '已批准',
  REJECTED: '已拒绝',
  ON_LEAVE: '请假外出中',
  RETURNED: '已返院',
  COMPLETED: '已完成',
}

export const LEAVE_STATUS_COLORS: Record<LeaveStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  ON_LEAVE: 'bg-blue-100 text-blue-700',
  RETURNED: 'bg-purple-100 text-purple-700',
  COMPLETED: 'bg-slate-100 text-slate-700',
}

export const COMPANION_STATUS_LABELS: Record<CompanionStatus, string> = {
  ACCOMPANIED: '有人陪护',
  UNACCOMPANIED: '无人陪护',
  TEMPORARILY_UNATTENDED: '临时无人照看',
}

export const HOSPITAL_RESULT_LABELS: Record<HospitalResult, string> = {
  NOT_REQUIRED: '无需送医',
  OBSERVATION: '留院观察',
  TREATMENT: '门诊治疗',
  HOSPITALIZED: '住院治疗',
  RETURNED: '已返院',
}

export const HEALTH_RECONFIRM_STATUS_LABELS: Record<HealthReconfirmStatus, string> = {
  PENDING: '待确认',
  CONFIRMED_NORMAL: '健康正常',
  CONFIRMED_ABNORMAL: '健康异常',
  REQUIRES_ASSESSMENT: '需要重新评估',
}

export const HEALTH_RECONFIRM_STATUS_COLORS: Record<HealthReconfirmStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED_NORMAL: 'bg-green-100 text-green-700',
  CONFIRMED_ABNORMAL: 'bg-red-100 text-red-700',
  REQUIRES_ASSESSMENT: 'bg-orange-100 text-orange-700',
}

export const COMPLAINT_TYPE_LABELS: Record<ComplaintType, string> = {
  SERVICE_QUALITY: '服务质量',
  FEE_DISPUTE: '费用争议',
  CARE_ISSUE: '护理问题',
  OTHER: '其他',
}

export const COMPLAINT_STATUS_LABELS: Record<ComplaintStatus, string> = {
  SUBMITTED: '已提交',
  PROCESSING: '处理中',
  RESOLVED: '已解决',
}

export const COMPLAINT_STATUS_COLORS: Record<ComplaintStatus, string> = {
  SUBMITTED: 'bg-yellow-100 text-yellow-700',
  PROCESSING: 'bg-blue-100 text-blue-700',
  RESOLVED: 'bg-green-100 text-green-700',
}

export const CHANGE_REASON_LABELS: Record<ChangeReasonType, string> = {
  ASSESSMENT: '评估变更',
  RISK_EVENT: '风险事件',
  REASSESSMENT: '复评变更',
  FAMILY_LEAVE: '请假外出',
  OTHER: '其他',
}

export const BILL_DETAIL_CATEGORY_LABELS: Record<BillDetailCategory, string> = {
  NURSING_LEVEL: '护理等级费',
  BASIC_SERVICE: '基础服务费',
  VALUE_ADDED: '增值服务费',
  LEAVE_DEDUCTION: '请假扣减',
  RISK_CARE: '风险护理费',
  MEDICAL_SUPPLY: '医嘱用品费',
}

export const BILL_DETAIL_CATEGORY_ICONS: Record<BillDetailCategory, string> = {
  NURSING_LEVEL: '🏥',
  BASIC_SERVICE: '📋',
  VALUE_ADDED: '✨',
  LEAVE_DEDUCTION: '🚪',
  RISK_CARE: '⚠️',
  MEDICAL_SUPPLY: '💊',
}

export const REASSESSMENT_REASON_LABELS: Record<ReassessmentReason, string> = {
  HOSPITALIZATION_RETURN: '住院返回',
  COGNITIVE_DECLINE: '认知下降',
  REHABILITATION_IMPROVEMENT: '康复改善',
  PERIODIC_REVIEW: '定期复评',
  OTHER: '其他',
}

export const REASSESSMENT_REASON_COLORS: Record<ReassessmentReason, string> = {
  HOSPITALIZATION_RETURN: 'bg-red-100 text-red-700',
  COGNITIVE_DECLINE: 'bg-amber-100 text-amber-700',
  REHABILITATION_IMPROVEMENT: 'bg-green-100 text-green-700',
  PERIODIC_REVIEW: 'bg-blue-100 text-blue-700',
  OTHER: 'bg-slate-100 text-slate-700',
}

export const ELDER_STATUS_LABELS: Record<ElderStatus, string> = {
  ACTIVE: '在住',
  ON_LEAVE: '请假外出',
  DISCHARGED: '已出院',
}

export const ELDER_STATUS_COLORS: Record<ElderStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  ON_LEAVE: 'bg-yellow-100 text-yellow-700',
  DISCHARGED: 'bg-slate-100 text-slate-700',
}

export const GENDER_LABELS: Record<Gender, string> = {
  MALE: '男',
  FEMALE: '女',
}

export const SELF_CARE_ITEMS = ['进食', '穿衣', '如厕', '移动', '洗浴', '排泄']
export const COGNITIVE_ITEMS = ['定向力', '记忆力', '注意力', '语言能力', '视空间']
