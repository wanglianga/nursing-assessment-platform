import { useState, useEffect } from 'react'
import { Receipt, TrendingUp, Loader2 } from 'lucide-react'
import StatCard from '@/components/StatCard'
import StatusBadge from '@/components/StatusBadge'
import { formatCurrency } from '@/utils/helpers'
import { BILL_STATUS_LABELS, BILL_STATUS_COLORS } from '@/utils/constants'
import { useDataStore } from '@/store/dataStore'
import type { Bill, BillStatus } from '@/types'

export default function Billing() {
  const { bills, isLoading, fetchBills, generateBills, updateBillStatus } = useDataStore()
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null)
  const [period, setPeriod] = useState('2024-03')
  const [generating, setGenerating] = useState(false)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchBills()
  }, [fetchBills])

  const totalRevenue = bills.reduce((sum, b) => sum + b.totalAmount, 0)
  const draftCount = bills.filter((b) => b.status === 'DRAFT').length
  const paidCount = bills.filter((b) => b.status === 'PAID').length

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      await generateBills(period)
      fetchBills()
    } finally {
      setGenerating(false)
    }
  }

  const handleUpdateStatus = async (id: number, status: BillStatus) => {
    setUpdating(true)
    try {
      await updateBillStatus(id, status)
      fetchBills()
      setSelectedBill(null)
    } finally {
      setUpdating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">费用结算</h2>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium disabled:opacity-50 flex items-center gap-2"
        >
          {generating && <Loader2 size={16} className="animate-spin" />}
          生成账单
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon={<TrendingUp size={20} />} label="本期总金额" value={formatCurrency(totalRevenue)} color="primary" />
        <StatCard icon={<Receipt size={20} />} label="待确认账单" value={draftCount} color="amber" />
        <StatCard icon={<Receipt size={20} />} label="已支付账单" value={paidCount} color="green" />
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="flex items-center gap-3 mb-4">
          <label className="text-sm text-slate-600">账期:</label>
          <input
            type="month"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
          />
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-200">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">老人</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">账期</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500">护理费</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500">增值费</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500">扣减</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500">合计</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-500">状态</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-500">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bills.map((bill) => (
                <tr key={bill.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm font-medium text-slate-800">{bill.elderName}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{bill.period}</td>
                  <td className="px-4 py-3 text-sm text-slate-600 text-right">{formatCurrency(bill.nursingLevelFee)}</td>
                  <td className="px-4 py-3 text-sm text-slate-600 text-right">{formatCurrency(bill.valueAddedFee)}</td>
                  <td className="px-4 py-3 text-sm text-red-600 text-right">-{formatCurrency(bill.leaveDeduction)}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-primary-600 text-right">{formatCurrency(bill.totalAmount)}</td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge label={BILL_STATUS_LABELS[bill.status]} colorClass={BILL_STATUS_COLORS[bill.status]} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => setSelectedBill(bill)}
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                    >
                      详情
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {bills.length === 0 && (
          <div className="text-center py-12 text-slate-400">暂无账单数据</div>
        )}
      </div>

      {selectedBill && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-slate-800">
                账单详情 - {selectedBill.elderName} ({selectedBill.period})
              </h3>
              <button onClick={() => setSelectedBill(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-xs text-slate-500">护理等级费</p>
                  <p className="text-sm font-semibold">{formatCurrency(selectedBill.nursingLevelFee)}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-xs text-slate-500">基础服务费</p>
                  <p className="text-sm font-semibold">{formatCurrency(selectedBill.basicServiceFee)}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-xs text-slate-500">增值服务费</p>
                  <p className="text-sm font-semibold">{formatCurrency(selectedBill.valueAddedFee)}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-xs text-slate-500">请假扣减</p>
                  <p className="text-sm font-semibold text-red-600">-{formatCurrency(selectedBill.leaveDeduction)}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-xs text-slate-500">风险护理费</p>
                  <p className="text-sm font-semibold">{formatCurrency(selectedBill.riskCareFee)}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-xs text-slate-500">医嘱用品费</p>
                  <p className="text-sm font-semibold">{formatCurrency(selectedBill.medicalSupplyFee)}</p>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
                <span className="text-sm text-slate-600">合计</span>
                <span className="text-xl font-bold text-primary-600">{formatCurrency(selectedBill.totalAmount)}</span>
              </div>

              <div className="flex gap-2 pt-2">
                {selectedBill.status === 'DRAFT' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedBill.id, 'CONFIRMED')}
                    disabled={updating}
                    className="flex-1 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {updating && <Loader2 size={16} className="animate-spin" />}
                    确认账单
                  </button>
                )}
                {selectedBill.status === 'CONFIRMED' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedBill.id, 'PAID')}
                    disabled={updating}
                    className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {updating && <Loader2 size={16} className="animate-spin" />}
                    标记已支付
                  </button>
                )}
                <button
                  onClick={() => setSelectedBill(null)}
                  className="flex-1 py-2 border border-slate-300 rounded-lg text-sm text-slate-600 hover:bg-slate-50"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
