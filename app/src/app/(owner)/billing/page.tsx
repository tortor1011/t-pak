'use client';

import Link from 'next/link';
import { MOCK_FINANCIAL, MOCK_SLIPS, MOCK_DEBTS } from '@/services/mockData';
import { formatCurrency } from '@/utils/currency';

const BILLING_ACTIONS = [
  {
    title: 'Read Meters',
    description: 'Record electricity & water usage',
    icon: 'speed',
    href: '/billing/meter-reading',
    gradient: true,
  },
  {
    title: 'Generate Bills',
    description: 'Create invoices for unbilled rooms',
    icon: 'receipt_long',
    href: '/billing/generate',
    gradient: false,
  },
  {
    title: 'Verify Slips',
    description: `${MOCK_SLIPS.length} slips waiting for review`,
    icon: 'fact_check',
    href: '/billing/verify',
    gradient: false,
    badge: MOCK_SLIPS.length,
  },
  {
    title: 'Debt Collection',
    description: `${MOCK_DEBTS.length} rooms with outstanding balance`,
    icon: 'account_balance_wallet',
    href: '/billing/debt',
    gradient: false,
    badge: MOCK_DEBTS.length,
  },
];

export default function BillingPage() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6 lg:space-y-8 page-transition">
      {/* Summary */}
      <section className="bg-surface-container-lowest p-6 lg:p-8 rounded-3xl shadow-[0_10px_40px_rgba(18,28,40,0.03)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div>
            <p className="text-on-surface-variant text-sm uppercase tracking-widest mb-1 font-medium">
              Monthly Revenue
            </p>
            <h2 className="text-4xl font-black text-on-surface">
              {formatCurrency(MOCK_FINANCIAL.totalRevenue)}
            </h2>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-2xl">payments</span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 bg-secondary-container/20 px-4 py-3 rounded-xl">
            <p className="text-xs font-bold text-on-secondary-container uppercase tracking-wider">Collected</p>
            <p className="text-lg font-bold text-on-secondary-container">
              {formatCurrency(MOCK_FINANCIAL.totalRevenue - MOCK_FINANCIAL.pendingPayments)}
            </p>
          </div>
          <div className="flex-1 bg-tertiary-fixed/40 px-4 py-3 rounded-xl">
            <p className="text-xs font-bold text-tertiary uppercase tracking-wider">Pending</p>
            <p className="text-lg font-bold text-tertiary">
              {formatCurrency(MOCK_FINANCIAL.pendingPayments)}
            </p>
          </div>
        </div>
      </section>

      {/* Billing Lifecycle Actions */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold tracking-tight">Billing Lifecycle</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {BILLING_ACTIONS.map((action) => (
            <Link key={action.href} href={action.href}>
              <div
                className={`p-5 rounded-2xl flex items-center gap-4 active:scale-[0.98] transition-all cursor-pointer h-full ${
                  action.gradient
                    ? 'btn-primary-gradient text-on-primary shadow-[0_8px_20px_rgba(0,74,198,0.2)]'
                    : 'bg-surface-container-lowest shadow-[0_10px_40px_rgba(18,28,40,0.03)] hover:bg-surface-container-low'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    action.gradient ? 'bg-white/20' : 'bg-surface-container'
                  }`}
                >
                  <span className={`material-symbols-outlined ${action.gradient ? 'text-white' : 'text-primary'}`}>
                    {action.icon}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`font-bold ${action.gradient ? '' : 'text-on-surface'}`}>
                    {action.title}
                  </h4>
                  <p className={`text-sm font-medium ${action.gradient ? 'opacity-80' : 'text-on-surface-variant'}`}>
                    {action.description}
                  </p>
                </div>
                {action.badge && !action.gradient && (
                  <span className="bg-tertiary text-on-tertiary w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0">
                    {action.badge}
                  </span>
                )}
                <span className={`material-symbols-outlined shrink-0 ${action.gradient ? 'text-white/60' : 'text-outline'}`}>
                  chevron_right
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
