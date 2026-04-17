'use client';

import { useRouter } from 'next/navigation';
import { MOCK_DEBTS } from '@/services/mockData';
import { formatCurrency } from '@/utils/currency';
import PageHeader from '@/components/layout/PageHeader';

export default function DebtCollectionPage() {
  const router = useRouter();
  const totalOutstanding = MOCK_DEBTS.reduce((sum, d) => sum + d.totalOutstanding, 0);

  return (
    <div className="min-h-screen bg-surface pb-32 lg:pb-8">
      <PageHeader
        title="Debt Collection"
        onBack={() => router.back()}
        rightAction={
          <button className="p-2 rounded-full hover:bg-slate-100 transition-colors">
            <span className="material-symbols-outlined text-slate-500">history</span>
          </button>
        }
      />

      <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-5xl mx-auto space-y-8 page-transition">
        {/* Outstanding Summary */}
        <section className="bg-tertiary-fixed rounded-3xl p-6 shadow-[0_20px_50px_rgba(18,28,40,0.05)]">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-on-tertiary-fixed-variant text-sm font-bold uppercase tracking-wider">
                Total Outstanding
              </p>
              <h2 className="text-4xl font-black text-on-tertiary-fixed tracking-tight mt-1">
                {formatCurrency(totalOutstanding)}
              </h2>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-on-tertiary-fixed-variant text-2xl">
                warning
              </span>
            </div>
          </div>
          <button className="w-full h-12 bg-tertiary text-on-tertiary rounded-xl font-bold active:scale-95 transition-all flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-lg">send</span>
            Send Bulk Reminder
          </button>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-bold text-on-surface">Overdue Rooms</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {MOCK_DEBTS.map((debt) => (
            <div
              key={debt.id}
              className="bg-surface-container-lowest rounded-3xl p-6 shadow-[0_10px_40px_rgba(18,28,40,0.03)] space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl font-black text-on-surface">
                      Room {debt.roomNumber}
                    </span>
                    <span className="bg-error text-on-error text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                      {debt.monthsOverdue} {debt.monthsOverdue > 1 ? 'MONTHS' : 'MONTH'} OVERDUE
                    </span>
                  </div>
                  <p className="text-on-surface-variant font-medium text-sm">{debt.tenantName}</p>
                </div>
                <p className="text-xl font-bold text-tertiary">
                  {formatCurrency(debt.totalOutstanding)}
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                <span className="material-symbols-outlined text-sm">schedule</span>
                <span>
                  {debt.lastReminder
                    ? `Last reminder: ${debt.lastReminder}`
                    : 'No reminder sent yet'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button className="h-12 btn-primary-gradient text-on-primary font-bold rounded-xl active:scale-95 transition-all flex items-center justify-center gap-2 text-sm">
                  <span className="material-symbols-outlined text-lg">send</span>
                  Send Reminder
                </button>
                <button className="h-12 border-2 border-primary text-primary font-bold rounded-xl active:scale-95 transition-all flex items-center justify-center gap-2 text-sm">
                  <span className="material-symbols-outlined text-lg">call</span>
                  Call Tenant
                </button>
              </div>
            </div>
          ))}
          </div>
        </section>
      </div>
    </div>
  );
}
