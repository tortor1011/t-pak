'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useRepositories } from '@/hooks/useRepositories';
import { formatCurrency } from '@/utils/currency';
import { useLanguage } from '@/hooks/useLanguage';
import PageHeader from '@/components/layout/PageHeader';

export default function ReportsPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const { reportsRepository } = useRepositories();
  const financialSummary = useMemo(() => {
    const summaryResult = reportsRepository.loadFinancialSummary();
    if (!summaryResult.ok) {
      return {
        totalRevenue: 0,
        pendingPayments: 0,
        totalRooms: 0,
        occupiedRooms: 0,
        vacantRooms: 0,
        monthlyData: [],
      };
    }

    return summaryResult.value;
  }, [reportsRepository]);
  const maxRevenue = Math.max(1, ...financialSummary.monthlyData.map((d) => d.revenue));
  const occupancyRate =
    financialSummary.totalRooms > 0
      ? (financialSummary.occupiedRooms / financialSummary.totalRooms) * 100
      : 0;
  const text =
    language === 'th'
      ? {
          title: 'รายงานการเงิน',
          totalRevenue: 'รายรับรวม',
          totalExpenses: 'รายจ่ายรวม',
          netProfit: 'กำไรสุทธิ',
          monthlyTrend: 'แนวโน้มรายเดือน',
          revenue: 'รายรับ',
          expenses: 'รายจ่าย',
          occupancyRate: 'อัตราการเข้าพัก',
          roomsSuffix: 'ห้อง',
          exportData: 'ส่งออกข้อมูล',
          excel: 'เอ็กเซล',
          period: 'เมษายน 2026',
        }
      : {
          title: 'Financial Reports',
          totalRevenue: 'Total Revenue',
          totalExpenses: 'Total Expenses',
          netProfit: 'Net Profit',
          monthlyTrend: 'Monthly Trend',
          revenue: 'Revenue',
          expenses: 'Expenses',
          occupancyRate: 'Occupancy Rate',
          roomsSuffix: 'rooms',
          exportData: 'Export Data',
          excel: 'Excel',
          period: 'April 2026',
        };

  const monthLabels: Record<string, string> =
    language === 'th'
      ? {
          Nov: 'พ.ย.',
          Dec: 'ธ.ค.',
          Jan: 'ม.ค.',
          Feb: 'ก.พ.',
          Mar: 'มี.ค.',
          Apr: 'เม.ย.',
        }
      : {};

  return (
    <div className="min-h-screen bg-surface pb-32 lg:pb-8">
      <PageHeader
        title={text.title}
        onBack={() => router.back()}
        rightAction={
          <button className="flex items-center gap-2 bg-surface-container-low px-4 py-2 rounded-xl text-on-surface font-semibold hover:bg-surface-container transition-colors text-sm">
            <span>2026</span>
            <span className="material-symbols-outlined text-sm">arrow_drop_down</span>
          </button>
        }
      />

      <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6 lg:space-y-8 page-transition">
        {/* Top Row: Summary + Net Profit */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4 lg:col-span-2">
            <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-[0_10px_40px_rgba(18,28,40,0.03)]">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-secondary-container/30 flex items-center justify-center">
                  <span className="material-symbols-outlined text-secondary text-lg">trending_up</span>
                </div>
              </div>
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                {text.totalRevenue}
              </p>
              <p className="text-2xl font-black text-on-surface">
                {formatCurrency(financialSummary.totalRevenue)}
              </p>
            </div>
            <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-[0_10px_40px_rgba(18,28,40,0.03)]">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-tertiary-fixed/30 flex items-center justify-center">
                  <span className="material-symbols-outlined text-tertiary text-lg">trending_down</span>
                </div>
              </div>
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                {text.totalExpenses}
              </p>
              <p className="text-2xl font-black text-on-surface">
                {formatCurrency(47000)}
              </p>
            </div>
          </div>

          {/* Net Profit */}
          <div className="bg-primary-container rounded-3xl p-6 text-white shadow-xl flex flex-col justify-center">
            <p className="text-sm font-bold uppercase tracking-widest opacity-80 mb-1">{text.netProfit}</p>
            <h2 className="text-4xl font-black">
              {formatCurrency(financialSummary.totalRevenue - 47000)}
            </h2>
            <p className="text-sm font-medium opacity-70 mt-1">{text.period}</p>
          </div>
        </div>

        {/* Middle Row: Chart + Occupancy */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Monthly Chart — takes 2 cols */}
          <section className="lg:col-span-2 space-y-4">
            <h3 className="text-lg font-bold tracking-tight">{text.monthlyTrend}</h3>
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-[0_10px_40px_rgba(18,28,40,0.03)]">
              <div className="flex items-end gap-3 h-48">
                {financialSummary.monthlyData.map((item) => {
                  const height = (item.revenue / maxRevenue) * 100;
                  const expenseHeight = (item.expenses / maxRevenue) * 100;
                  return (
                    <div key={item.month} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full flex items-end gap-1 h-40">
                        <div
                          className="flex-1 bg-primary/80 rounded-t-lg transition-all duration-500"
                          style={{ height: `${height}%` }}
                        />
                        <div
                          className="flex-1 bg-tertiary-fixed rounded-t-lg transition-all duration-500"
                          style={{ height: `${expenseHeight}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-on-surface-variant">
                        {monthLabels[item.month] ?? item.month}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-6 mt-4 pt-4 border-t border-surface-container">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-primary/80" />
                  <span className="text-xs font-medium text-on-surface-variant">{text.revenue}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-tertiary-fixed" />
                  <span className="text-xs font-medium text-on-surface-variant">{text.expenses}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Occupancy */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold tracking-tight">{text.occupancyRate}</h3>
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-[0_10px_40px_rgba(18,28,40,0.03)]">
              <div className="flex justify-between items-center mb-4">
                <span className="text-3xl font-black text-primary">
                  {Math.round(occupancyRate)}%
                </span>
                <span className="text-on-surface-variant font-medium text-sm">
                  {financialSummary.occupiedRooms}/{financialSummary.totalRooms} {text.roomsSuffix}
                </span>
              </div>
              <div className="w-full h-3 bg-surface-container rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-1000"
                  style={{
                    width: `${occupancyRate}%`,
                  }}
                />
              </div>
            </div>

            {/* Export */}
            <h3 className="text-lg font-bold tracking-tight pt-4">{text.exportData}</h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="h-14 bg-surface-container-high text-on-surface rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all">
                <span className="material-symbols-outlined text-primary">table_chart</span>
                {text.excel}
              </button>
              <button className="h-14 bg-surface-container-high text-on-surface rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all">
                <span className="material-symbols-outlined text-tertiary">picture_as_pdf</span>
                PDF
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
