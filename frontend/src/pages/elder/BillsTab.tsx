import { formatDate, formatCurrency } from '@/utils/helpers'
import StatusBadge from '@/components/StatusBadge'
import { BILL_STATUS_LABELS, BILL_STATUS_COLORS, BILL_DETAIL_CATEGORY_LABELS } from '@/utils/constants'
import type { Bill } from '@/types'

interface Props {
  bills: Bill[]
}

export default function BillsTab({ bills }: Props) {
  return (
    <div className="space-y-4">
      {bills.map((bill) => (
        <div key={bill.id} className="bg-white rounded-lg border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-slate-800">{bill.period}</span>
              <StatusBadge label={BILL_STATUS_LABELS[bill.status]} colorClass={BILL_STATUS_COLORS[bill.status]} />
            </div>
            <span className="text-lg font-bold text-primary-600">{formatCurrency(bill.totalAmount)}</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
            <div className="text-center p-2 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500">护理等级费</p>
              <p className="text-sm font-semibold text-slate-800">{formatCurrency(bill.nursingLevelFee)}</p>
            </div>
            <div className="text-center p-2 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500">增值服务费</p>
              <p className="text-sm font-semibold text-slate-800">{formatCurrency(bill.valueAddedFee)}</p>
            </div>
            <div className="text-center p-2 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500">外出扣减</p>
              <p className="text-sm font-semibold text-red-600">-{formatCurrency(bill.leaveDeduction)}</p>
            </div>
            <div className="text-center p-2 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500">风险调整</p>
              <p className="text-sm font-semibold text-slate-800">{formatCurrency(bill.riskAdjustment)}</p>
            </div>
          </div>

          {bill.details && bill.details.length > 0 && (
            <div className="border-t border-slate-100 pt-3">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-500 text-xs">
                    <th className="text-left py-1">类别</th>
                    <th className="text-left py-1">描述</th>
                    <th className="text-right py-1">金额</th>
                  </tr>
                </thead>
                <tbody>
                  {bill.details.map((detail) => (
                    <tr key={detail.id} className="border-t border-slate-50">
                      <td className="py-1.5 text-slate-600">{BILL_DETAIL_CATEGORY_LABELS[detail.category]}</td>
                      <td className="py-1.5 text-slate-600">{detail.description}</td>
                      <td className="py-1.5 text-right text-slate-800">{formatCurrency(detail.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
