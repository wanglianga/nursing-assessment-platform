export type UserRole = 'DOCTOR' | 'CAREGIVER' | 'FAMILY' | 'ADMIN'
export type NursingLevel = 'SPECIAL' | 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3' | 'SELF_CARE'
export type ElderStatus = 'ACTIVE' | 'ON_LEAVE' | 'DISCHARGED'
export type AssessmentType = 'ADMISSION' | 'REASSESSMENT'
export type CarePlanStatus = 'ACTIVE' | 'SUSPENDED' | 'EXPIRED'
export type CareType = 'TURN_OVER' | 'FEEDING' | 'BATHING' | 'REHABILITATION' | 'NIGHT_PATROL' | 'OTHER'
export type RiskEventType = 'FALL' | 'PRESSURE_SORE' | 'WANDERING' | 'FAMILY_PICKUP' | 'OTHER'
export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type RiskEventStatus = 'REPORTED' | 'PROCESSING' | 'RESOLVED'
export type BillStatus = 'DRAFT' | 'CONFIRMED' | 'PAID'
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type ComplaintType = 'SERVICE_QUALITY' | 'FEE_DISPUTE' | 'CARE_ISSUE' | 'OTHER'
export type ComplaintStatus = 'SUBMITTED' | 'PROCESSING' | 'RESOLVED'
export type ChangeReasonType = 'ASSESSMENT' | 'RISK_EVENT' | 'REASSESSMENT' | 'FAMILY_LEAVE' | 'OTHER'
export type BillDetailCategory = 'NURSING_LEVEL' | 'VALUE_ADDED' | 'LEAVE_DEDUCTION' | 'RISK_ADJUSTMENT'
export type Gender = 'MALE' | 'FEMALE'

export interface User { id: number; username: string; role: UserRole; name: string; phone?: string }
export interface LoginRequest { username: string; password: string }
export interface LoginResponse { token: string; user: User }
export interface ApiResponse<T> { code: number; message: string; data: T }

export interface Elder {
  id: number; name: string; gender: Gender; age: number; idCard?: string
  admissionDate: string; nursingLevel: NursingLevel; contactName?: string
  contactPhone?: string; status: ElderStatus; allergies?: string
  chronicDiseases?: string; currentMedications?: string
}

export interface Assessment {
  id: number; elderId: number; assessorId: number; type: AssessmentType
  selfCareScore: number; cognitiveScore: number; chronicDiseaseScore: number
  fallRiskScore: number; medicationScore: number; totalScore: number
  nursingLevel: NursingLevel; assessorName: string; assessmentDate: string; notes?: string
}

export interface CarePlanItem {
  id: number; carePlanId: number; type: CareType; frequency: string
  description?: string; isActive: boolean
}

export interface CarePlanChange {
  id: number; carePlanId: number; changeDate: string; changeReason: string
  reasonType: ChangeReasonType; beforeSnapshot?: string; afterSnapshot?: string
}

export interface CarePlan {
  id: number; elderId: number; nursingLevel: NursingLevel
  effectiveDate: string; expiryDate?: string; status: CarePlanStatus
  items: CarePlanItem[]; changeHistory: CarePlanChange[]
}

export interface CareRecord {
  id: number; elderId: number; caregiverId: number; caregiverName: string
  type: CareType; recordTime: string; description?: string; notes?: string
}

export interface RiskEvent {
  id: number; elderId: number; elderName?: string; type: RiskEventType
  severity: Severity; eventTime: string; discoverer?: string
  description: string; status: RiskEventStatus; planAdjustment: boolean
  billingImpact: boolean; handlingRecords?: HandlingRecord[]
}

export interface HandlingRecord {
  id: number; riskEventId: number; handler: string; handlerRole?: string
  action: string; actionTime: string; result?: string
}

export interface Bill {
  id: number; elderId: number; elderName?: string; period: string
  nursingLevelFee: number; valueAddedFee: number; leaveDeduction: number
  riskAdjustment: number; totalAmount: number; status: BillStatus
  details?: BillDetail[]
}

export interface BillDetail {
  id: number; billId: number; category: BillDetailCategory
  description?: string; amount: number; quantity: number
  unitPrice: number; detailDate?: string
}

export interface LeaveRequest {
  id: number; elderId: number; elderName?: string; familyMemberId: number
  familyMemberName?: string; startDate: string; endDate: string
  reason?: string; status: LeaveStatus; approvedBy?: string
  leaveDays: number
}

export interface Complaint {
  id: number; elderId: number; elderName?: string; familyMemberId: number
  familyMemberName?: string; type: ComplaintType; description: string
  status: ComplaintStatus; response?: string; createTime: string; resolvedTime?: string
}
