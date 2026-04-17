'use client';

import { MOCK_FINANCIAL } from '@/services/mockData';
import { formatCurrency } from '@/utils/currency';

export default function ReportsPage() {
  const maxRevenue = Math.max(...MOCK_FINANCIAL.monthlyData.map((d) => d.revenue));

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6 lg:space-y-8 page-transition">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Financial Reports</h2>
        <button className="flex items-center gap-2 bg-surface-container-low px-4 py-2 rounded-xl text-on-surface font-semibold hover:bg-surface-container transition-colors text-sm">
          <span>2026</span>
          <span className="material-symbols-outlined text-sm">arrow_drop_down</span>
        </button>
      </div>

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
              Total Revenue
            </p>
            <p className="text-2xl font-black text-on-surface">
              {formatCurrency(MOCK_FINANCIAL.totalRevenue)}
            </p>
          </div>
          <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-[0_10px_40px_rgba(18,28,40,0.03)]">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-tertiary-fixed/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-tertiary text-lg">trending_down</span>
              </div>
            </div>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              Total Expenses
            </p>
            <p className="text-2xl font-black text-on-surface">
              {formatCurrency(47000)}
            </p>
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-primary-container rounded-3xl p-6 text-white shadow-xl flex flex-col justify-center">
          <p className="text-sm font-bold uppercase tracking-widest opacity-80 mb-1">Net Profit</p>
          <h2 className="text-4xl font-black">
            {formatCurrency(MOCK_FINANCIAL.totalRevenue - 47000)}
          </h2>
          <p className="text-sm font-medium opacity-70 mt-1">April 2026</p>
        </div>
      </div>

      {/* Middle Row: Chart + Occupancy */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Chart — takes 2 cols */}
        <section className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold tracking-tight">Monthly Trend</h3>
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-[0_10px_40px_rgba(18,28,40,0.03)]">
            <div className="flex items-end gap-3 h-48">
              {MOCK_FINANCIAL.monthlyData.map((item) => {
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
                    <span className="text-[10px] font-bold text-on-surface-variant">{item.month}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-surface-container">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-primary/80" />
                <span className="text-xs font-medium text-on-surface-variant">Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-tertiary-fixed" />
                <span className="text-xs font-medium text-on-surface-variant">Expenses</span>
              </div>
            </div>
          </div>
        </section>

        {/* Occupancy */}
        <section className="space-y-4">
          <h3 className="text-lg font-bold tracking-tight">Occupancy Rate</h3>
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-[0_10px_40px_rgba(18,28,40,0.03)]">
            <div className="flex justify-between items-center mb-4">
              <span className="text-3xl font-black text-primary">
                {Math.round((MOCK_FINANCIAL.occupiedRooms / MOCK_FINANCIAL.totalRooms) * 100)}%
              </span>
              <span className="text-on-surface-variant font-medium text-sm">
                {MOCK_FINANCIAL.occupiedRooms}/{MOCK_FINANCIAL.totalRooms} rooms
              </span>
            </div>
            <div className="w-full h-3 bg-surface-container rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-1000"
                style={{
                  width: `${(MOCK_FINANCIAL.occupiedRooms / MOCK_FINANCIAL.totalRooms) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Export */}
          <h3 className="text-lg font-bold tracking-tight pt-4">Export Data</h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="h-14 bg-surface-container-high text-on-surface rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all">
              <span className="material-symbols-outlined text-primary">table_chart</span>
              Excel
            </button>
            <button className="h-14 bg-surface-container-high text-on-surface rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all">
              <span className="material-symbols-outlined text-tertiary">picture_as_pdf</span>
              PDF
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
