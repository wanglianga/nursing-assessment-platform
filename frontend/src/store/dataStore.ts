import { create } from 'zustand'
import { apiGet, apiPost, apiPut } from '@/utils/api'
import type {
  Elder, Assessment, CarePlan, CarePlanItem, CarePlanChange, CarePlanStatus,
  CareRecord, RiskEvent, HandlingRecord, RiskEventStatus,
  Bill, BillStatus, LeaveRequest, Complaint, FeeExplanation
} from '@/types'

interface DataState {
  elders: Elder[]
  currentElder: Elder | null
  elderDetail: {
    elder: Elder | null
    assessments: Assessment[]
    carePlan: CarePlan | null
    recentRecords: CareRecord[]
    riskEvents: RiskEvent[]
    bills: Bill[]
  } | null
  assessments: Assessment[]
  carePlan: CarePlan | null
  careRecords: CareRecord[]
  riskEvents: RiskEvent[]
  currentRiskEvent: RiskEvent | null
  bills: Bill[]
  currentBill: Bill | null
  feeExplanation: FeeExplanation | null
  leaveRequests: LeaveRequest[]
  complaints: Complaint[]
  isLoading: boolean
  error: string | null

  fetchElders: () => Promise<void>
  fetchElderById: (id: number) => Promise<void>
  createElder: (elder: Partial<Elder>) => Promise<void>
  updateElder: (id: number, elder: Partial<Elder>) => Promise<void>
  fetchElderStats: () => Promise<Record<string, unknown>>

  fetchAssessments: (elderId: number) => Promise<void>
  createAssessment: (assessment: Partial<Assessment>) => Promise<void>

  fetchCarePlan: (elderId: number) => Promise<void>
  addCarePlanItem: (elderId: number, item: Partial<CarePlanItem>) => Promise<void>
  updateCarePlanItem: (itemId: number, item: Partial<CarePlanItem>) => Promise<void>
  addCarePlanChange: (planId: number, change: Partial<CarePlanChange>) => Promise<void>
  suspendCarePlan: (planId: number) => Promise<void>
  activateCarePlan: (planId: number) => Promise<void>

  fetchCareRecords: (elderId: number) => Promise<void>
  fetchCareRecordsByCaregiver: (caregiverId: number) => Promise<void>
  createCareRecord: (record: Partial<CareRecord>) => Promise<void>
  fetchTodayCareStats: () => Promise<Record<string, number>>

  fetchRiskEvents: () => Promise<void>
  fetchRiskEventById: (id: number) => Promise<void>
  createRiskEvent: (event: Partial<RiskEvent>) => Promise<void>
  addHandlingRecord: (eventId: number, record: Partial<HandlingRecord>) => Promise<void>
  updateRiskEventStatus: (id: number, status: RiskEventStatus) => Promise<void>

  fetchBills: () => Promise<void>
  fetchBillsByElder: (elderId: number) => Promise<void>
  fetchBillById: (id: number) => Promise<void>
  fetchFeeExplanation: (billId: number) => Promise<void>
  generateBills: (period: string) => Promise<void>
  updateBillStatus: (id: number, status: BillStatus) => Promise<void>

  fetchFamilyElders: (familyId: number) => Promise<void>
  fetchFamilyRecords: (familyId: number, elderId: number) => Promise<void>

  fetchLeaveRequests: (familyId: number) => Promise<void>
  createLeaveRequest: (familyId: number, request: Partial<LeaveRequest>) => Promise<void>
  approveLeaveRequest: (id: number) => Promise<void>
  rejectLeaveRequest: (id: number) => Promise<void>

  fetchComplaints: (familyId: number) => Promise<void>
  createComplaint: (familyId: number, complaint: Partial<Complaint>) => Promise<void>
  resolveComplaint: (id: number, response: string) => Promise<void>

  clearError: () => void
}

export const useDataStore = create<DataState>()((set) => ({
  elders: [],
  currentElder: null,
  elderDetail: null,
  assessments: [],
  carePlan: null,
  careRecords: [],
  riskEvents: [],
  currentRiskEvent: null,
  bills: [],
  currentBill: null,
  feeExplanation: null,
  leaveRequests: [],
  complaints: [],
  isLoading: false,
  error: null,

  fetchElders: async () => {
    set({ isLoading: true })
    try {
      const data = await apiGet<Elder[]>('/elders')
      set({ elders: data, isLoading: false })
    } catch (err) {
      set({ isLoading: false, error: err instanceof Error ? err.message : '获取老人列表失败' })
    }
  },

  fetchElderById: async (id) => {
    set({ isLoading: true })
    try {
      const data = await apiGet<{
        elder: Elder
        assessments: Assessment[]
        carePlan: CarePlan | null
        recentRecords: CareRecord[]
        riskEvents: RiskEvent[]
        bills: Bill[]
      }>(`/elders/${id}`)
      let carePlan = data.carePlan
      const rawPlan = carePlan as unknown as Record<string, unknown>
      if (carePlan && rawPlan.changes && !carePlan.changeHistory) {
        carePlan = { ...carePlan, changeHistory: rawPlan.changes as CarePlanChange[] }
      }
      if (carePlan) {
        carePlan.changeHistory = carePlan.changeHistory ?? []
        carePlan.items = carePlan.items ?? []
      }
      set({
        currentElder: data.elder,
        elderDetail: { ...data, carePlan },
        isLoading: false
      })
    } catch (err) {
      set({ isLoading: false, error: err instanceof Error ? err.message : '获取老人详情失败' })
    }
  },

  createElder: async (elder) => {
    set({ isLoading: true })
    try {
      await apiPost<Elder>('/elders', elder)
      set({ isLoading: false })
    } catch (err) {
      set({ isLoading: false, error: err instanceof Error ? err.message : '创建老人失败' })
      throw err
    }
  },

  updateElder: async (id, elder) => {
    set({ isLoading: true })
    try {
      await apiPut<Elder>(`/elders/${id}`, elder)
      set({ isLoading: false })
    } catch (err) {
      set({ isLoading: false, error: err instanceof Error ? err.message : '更新老人失败' })
      throw err
    }
  },

  fetchElderStats: async () => {
    try {
      return await apiGet<Record<string, unknown>>('/elders/stats')
    } catch {
      return {}
    }
  },

  fetchAssessments: async (elderId) => {
    set({ isLoading: true })
    try {
      const data = await apiGet<Assessment[]>(`/assessments/elder/${elderId}`)
      set({ assessments: data, isLoading: false })
    } catch (err) {
      set({ isLoading: false, error: err instanceof Error ? err.message : '获取评估记录失败' })
    }
  },

  createAssessment: async (assessment) => {
    set({ isLoading: true })
    try {
      await apiPost<Assessment>('/assessments', assessment)
      set({ isLoading: false })
    } catch (err) {
      set({ isLoading: false, error: err instanceof Error ? err.message : '创建评估失败' })
      throw err
    }
  },

  fetchCarePlan: async (elderId) => {
    set({ isLoading: true })
    try {
      const data = await apiGet<CarePlan>(`/care-plans/elder/${elderId}`)
      let plan = data
      const rawPlan = plan as unknown as Record<string, unknown>
      if (plan && rawPlan.changes && !plan.changeHistory) {
        plan = { ...plan, changeHistory: rawPlan.changes as CarePlanChange[] }
      }
      if (plan) {
        plan.changeHistory = plan.changeHistory ?? []
        plan.items = plan.items ?? []
      }
      set({ carePlan: plan, isLoading: false })
    } catch (err) {
      set({ isLoading: false, error: err instanceof Error ? err.message : '获取护理计划失败' })
    }
  },

  addCarePlanItem: async (elderId, item) => {
    try {
      await apiPost<CarePlanItem>(`/care-plans/elder/${elderId}/items`, item)
    } catch (err) {
      set({ error: err instanceof Error ? err.message : '添加护理项目失败' })
      throw err
    }
  },

  updateCarePlanItem: async (itemId, item) => {
    try {
      await apiPut<CarePlanItem>(`/care-plans/items/${itemId}`, item)
    } catch (err) {
      set({ error: err instanceof Error ? err.message : '更新护理项目失败' })
      throw err
    }
  },

  addCarePlanChange: async (planId, change) => {
    try {
      await apiPost<CarePlanChange>(`/care-plans/${planId}/changes`, change)
    } catch (err) {
      set({ error: err instanceof Error ? err.message : '添加变更记录失败' })
      throw err
    }
  },

  suspendCarePlan: async (planId) => {
    try {
      await apiPut<CarePlan>(`/care-plans/${planId}/status`, { action: 'suspend' })
    } catch (err) {
      set({ error: err instanceof Error ? err.message : '暂停计划失败' })
      throw err
    }
  },

  activateCarePlan: async (planId) => {
    try {
      await apiPut<CarePlan>(`/care-plans/${planId}/status`, { action: 'activate' })
    } catch (err) {
      set({ error: err instanceof Error ? err.message : '激活计划失败' })
      throw err
    }
  },

  fetchCareRecords: async (elderId) => {
    set({ isLoading: true })
    try {
      const data = await apiGet<CareRecord[]>(`/care-records/elder/${elderId}`)
      set({ careRecords: data, isLoading: false })
    } catch (err) {
      set({ isLoading: false, error: err instanceof Error ? err.message : '获取护理记录失败' })
    }
  },

  fetchCareRecordsByCaregiver: async (caregiverId) => {
    set({ isLoading: true })
    try {
      const data = await apiGet<CareRecord[]>(`/care-records/caregiver/${caregiverId}`)
      set({ careRecords: data, isLoading: false })
    } catch (err) {
      set({ isLoading: false, error: err instanceof Error ? err.message : '获取护理记录失败' })
    }
  },

  createCareRecord: async (record) => {
    try {
      await apiPost<CareRecord>('/care-records', record)
    } catch (err) {
      set({ error: err instanceof Error ? err.message : '创建护理记录失败' })
      throw err
    }
  },

  fetchTodayCareStats: async () => {
    try {
      return await apiGet<Record<string, number>>('/care-records/stats/today')
    } catch {
      return {}
    }
  },

  fetchRiskEvents: async () => {
    set({ isLoading: true })
    try {
      const data = await apiGet<RiskEvent[]>('/risk-events')
      set({ riskEvents: data, isLoading: false })
    } catch (err) {
      set({ isLoading: false, error: err instanceof Error ? err.message : '获取风险事件失败' })
    }
  },

  fetchRiskEventById: async (id) => {
    set({ isLoading: true })
    try {
      const data = await apiGet<RiskEvent>(`/risk-events/${id}`)
      set({ currentRiskEvent: data, isLoading: false })
    } catch (err) {
      set({ isLoading: false, error: err instanceof Error ? err.message : '获取风险事件详情失败' })
    }
  },

  createRiskEvent: async (event) => {
    try {
      await apiPost<RiskEvent>('/risk-events', event)
    } catch (err) {
      set({ error: err instanceof Error ? err.message : '创建风险事件失败' })
      throw err
    }
  },

  addHandlingRecord: async (eventId, record) => {
    try {
      await apiPost<HandlingRecord>(`/risk-events/${eventId}/handling`, record)
    } catch (err) {
      set({ error: err instanceof Error ? err.message : '添加处理记录失败' })
      throw err
    }
  },

  updateRiskEventStatus: async (id, status) => {
    try {
      await apiPut<RiskEvent>(`/risk-events/${id}/status`, { status })
    } catch (err) {
      set({ error: err instanceof Error ? err.message : '更新风险事件状态失败' })
      throw err
    }
  },

  fetchBills: async () => {
    set({ isLoading: true })
    try {
      const data = await apiGet<Bill[]>('/bills')
      set({ bills: data, isLoading: false })
    } catch (err) {
      set({ isLoading: false, error: err instanceof Error ? err.message : '获取账单失败' })
    }
  },

  fetchBillsByElder: async (elderId) => {
    set({ isLoading: true })
    try {
      const data = await apiGet<Bill[]>(`/bills/elder/${elderId}`)
      set({ bills: data, isLoading: false })
    } catch (err) {
      set({ isLoading: false, error: err instanceof Error ? err.message : '获取账单失败' })
    }
  },

  fetchBillById: async (id) => {
    set({ isLoading: true })
    try {
      const data = await apiGet<Bill>(`/bills/${id}`)
      set({ currentBill: data, isLoading: false })
    } catch (err) {
      set({ isLoading: false, error: err instanceof Error ? err.message : '获取账单详情失败' })
    }
  },

  fetchFeeExplanation: async (billId) => {
    try {
      const data = await apiGet<FeeExplanation>(`/bills/${billId}/fee-explanation`)
      set({ feeExplanation: data })
    } catch (err) {
      set({ error: err instanceof Error ? err.message : '获取费用解释单失败' })
    }
  },

  generateBills: async (period) => {
    set({ isLoading: true })
    try {
      await apiPost<Bill[]>(`/bills/generate/${period}`)
      set({ isLoading: false })
    } catch (err) {
      set({ isLoading: false, error: err instanceof Error ? err.message : '生成账单失败' })
      throw err
    }
  },

  updateBillStatus: async (id, status) => {
    try {
      await apiPut<Bill>(`/bills/${id}/status`, { status })
    } catch (err) {
      set({ error: err instanceof Error ? err.message : '更新账单状态失败' })
      throw err
    }
  },

  fetchFamilyElders: async (familyId) => {
    set({ isLoading: true })
    try {
      const data = await apiGet<Elder[]>(`/family/${familyId}/elders`)
      set({ elders: data, isLoading: false })
    } catch (err) {
      set({ isLoading: false, error: err instanceof Error ? err.message : '获取家属关联老人失败' })
    }
  },

  fetchFamilyRecords: async (familyId, elderId) => {
    set({ isLoading: true })
    try {
      const data = await apiGet<CareRecord[]>(`/family/${familyId}/records/${elderId}`)
      set({ careRecords: data, isLoading: false })
    } catch (err) {
      set({ isLoading: false, error: err instanceof Error ? err.message : '获取服务记录失败' })
    }
  },

  fetchLeaveRequests: async (familyId) => {
    set({ isLoading: true })
    try {
      const data = await apiGet<LeaveRequest[]>(`/family/${familyId}/leave-requests`)
      set({ leaveRequests: data, isLoading: false })
    } catch (err) {
      set({ isLoading: false, error: err instanceof Error ? err.message : '获取请假记录失败' })
    }
  },

  createLeaveRequest: async (familyId, request) => {
    try {
      await apiPost<LeaveRequest>(`/family/${familyId}/leave-requests`, request)
    } catch (err) {
      set({ error: err instanceof Error ? err.message : '创建请假申请失败' })
      throw err
    }
  },

  approveLeaveRequest: async (id) => {
    try {
      await apiPut<LeaveRequest>(`/family/leave-requests/${id}/approve`, {})
    } catch (err) {
      set({ error: err instanceof Error ? err.message : '审批失败' })
      throw err
    }
  },

  rejectLeaveRequest: async (id) => {
    try {
      await apiPut<LeaveRequest>(`/family/leave-requests/${id}/reject`, {})
    } catch (err) {
      set({ error: err instanceof Error ? err.message : '拒绝失败' })
      throw err
    }
  },

  fetchComplaints: async (familyId) => {
    set({ isLoading: true })
    try {
      const data = await apiGet<Complaint[]>(`/family/${familyId}/complaints`)
      set({ complaints: data, isLoading: false })
    } catch (err) {
      set({ isLoading: false, error: err instanceof Error ? err.message : '获取投诉记录失败' })
    }
  },

  createComplaint: async (familyId, complaint) => {
    try {
      await apiPost<Complaint>(`/family/${familyId}/complaints`, complaint)
    } catch (err) {
      set({ error: err instanceof Error ? err.message : '创建投诉失败' })
      throw err
    }
  },

  resolveComplaint: async (id, response) => {
    try {
      await apiPut<Complaint>(`/family/complaints/${id}/resolve`, { response })
    } catch (err) {
      set({ error: err instanceof Error ? err.message : '处理投诉失败' })
      throw err
    }
  },

  clearError: () => set({ error: null }),
}))
