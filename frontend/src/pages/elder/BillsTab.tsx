import { useState } from 'react'
import { formatDate, formatCurrency } from '@/utils/helpers'
import StatusBadge from '@/components/StatusBadge'
import { BILL_STATUS_LABELS, BILL_STATUS_COLORS, BILL_DETAIL_CATEGORY_LABELS, BILL_DETAIL_CATEGORY_ICONS, CARE_TYPE_LABELS } from '@/utils/constants'
import type { Bill, FeeExplanation, BillDetailCategory } from '@/types'

interface Props {
  bills: Bill[]
  feeExplanation: FeeExplanation | null
  onFetchExplanation: (billId: number) => Promise<void>
}

const CATEGORY_ORDER: BillDetailCategory[] = [
  'NURSING_LEVEL', 'BASIC_SERVICE', 'VALUE_ADDED', 'LEAVE_DEDUCTION', 'RISK_CARE', 'MEDICAL_SUPPLY'
]

export default function BillsTab({ bills, feeExplanation, onFetchExplanation }: Props) {
  const [expandedBillId, setExpandedBillId] = useState<number | null>(null)

  const handleExpand = async (billId: number) => {
    if (expandedBillId === billId) {
      setExpandedBillId(null)
      return
    }
    setExpandedBillId(billId)
    await onFetchExplanation(billId)
  }

  return (
    <div className="space-y-4">
      {bills.map((bill) => (
        <div key={bill.id} className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div
            className="p-5 cursor-pointer hover:bg-slate-50 transition-colors"
            onClick={() => handleExpand(bill.id)}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-slate-800">{bill.period}</span>
                <StatusBadge label={BILL_STATUS_LABELS[bill.status]} colorClass={BILL_STATUS_COLORS[bill.status]} />
              </div>
              <span className="text-lg font-bold text-primary-600">{formatCurrency(bill.totalAmount)}</span>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              <div className="text-center p-2 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500">护理等级</p>
                <p className="text-sm font-semibold text-slate-800">{formatCurrency(bill.nursingLevelFee)}</p>
              </div>
              <div className="text-center p-2 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500">基础服务</p>
                <p className="text-sm font-semibold text-slate-800">{formatCurrency(bill.basicServiceFee)}</p>
              </div>
              <div className="text-center p-2 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500">增值服务</p>
                <p className="text-sm font-semibold text-slate-800">{formatCurrency(bill.valueAddedFee)}</p>
              </div>
              <div className="text-center p-2 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500">请假扣减</p>
                <p className="text-sm font-semibold text-red-600">-{formatCurrency(bill.leaveDeduction)}</p>
              </div>
              <div className="text-center p-2 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500">风险护理</p>
                <p className="text-sm font-semibold text-slate-800">{formatCurrency(bill.riskCareFee)}</p>
              </div>
              <div className="text-center p-2 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500">医嘱用品</p>
                <p className="text-sm font-semibold text-slate-800">{formatCurrency(bill.medicalSupplyFee)}</p>
              </div>
            </div>

            <p className="text-xs text-slate-400 mt-2 text-center">点击查看费用解释单</p>
          </div>

          {expandedBillId === bill.id && feeExplanation && feeExplanation.bill.id === bill.id && (
            <div className="border-t border-slate-200 p-5 bg-slate-50">
              <h4 className="text-sm font-semibold text-slate-800 mb-4">费用解释单</h4>

              {CATEGORY_ORDER.map((category) => {
                const items = feeExplanation.breakdown[category]
                if (!items || items.length === 0) return null

                return (
                  <div key={category} className="mb-4 last:mb-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-base">{BILL_DETAIL_CATEGORY_ICONS[category]}</span>
                      <span className="text-sm font-semibold text-slate-700">
                        {BILL_DETAIL_CATEGORY_LABELS[category]}
                      </span>
                      <span className="text-xs text-slate-400">
                        合计: {formatCurrency(items.reduce((sum, item) => sum + item.amount, 0))}
                      </span>
                    </div>

                    <div className="space-y-2 ml-6">
                      {items.map((item, idx) => (
                        <div key={item.id || idx} className="bg-white rounded-lg border border-slate-200 p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-slate-700">{item.description}</span>
                            <span className={`text-sm font-semibold ${
                              category === 'LEAVE_DEDUCTION' ? 'text-red-600' : 'text-slate-800'
                            }`}>
                              {category === 'LEAVE_DEDUCTION' ? '-' : ''}{formatCurrency(item.amount)}
                            </span>
                          </div>

                          {(item.effectiveStartDate || item.effectiveEndDate) && (
                            <div className="text-xs text-slate-400 mb-1">
                              生效期: {item.effectiveStartDate ? formatDate(item.effectiveStartDate) : ''} ~ {item.effectiveEndDate ? formatDate(item.effectiveEndDate) : ''}
                            </div>
                          )}

                          {item.quantity && item.unitPrice && (
                            <div className="text-xs text-slate-400">
                              单价: {formatCurrency(item.unitPrice)} x {item.quantity}
                            </div>
                          )}

                          {item.serviceRecord && (
                            <div className="mt-2 p-2 bg-primary-50 rounded-lg">
                              <div className="flex items-center gap-1 mb-1">
                                <span className="text-xs font-medium text-primary-700">关联服务记录</span>
                              </div>
                              <div className="text-xs text-primary-600">
                                <span className="mr-2">{CARE_TYPE_LABELS[item.serviceRecord.type as keyof typeof CARE_TYPE_LABELS] || item.serviceRecord.type}</span>
                                <span className="mr-2">{item.serviceRecord.caregiverName}</span>
                                <span>{new Date(item.serviceRecord.recordTime).toLocaleString('zh-CN')}</span>
                              </div>
                              {item.serviceRecord.description && (
                                <p className="text-xs text-primary-500 mt-0.5">{item.serviceRecord.description}</p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}

              <div className="mt-4 pt-3 border-t border-slate-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-600">费用合计</span>
                  <span className="text-lg font-bold text-primary-600">{formatCurrency(bill.totalAmount)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
      {bills.length === 0 && (
        <div className="text-center py-8 text-slate-400">暂无费用记录</div>
      )}
    </div>
  )
}
