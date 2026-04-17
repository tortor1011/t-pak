'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/utils/currency';
import PageHeader from '@/components/layout/PageHeader';

export default function MoveOutPage() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  // Mock move-out data
  const moveOutData = {
    roomNumber: '101',
    tenantName: 'สมชาย ศรีสุข',
    securityDeposit: 9000,
    finalElectricity: { previous: 1234.5, current: 1354.5, rate: 8, units: 120, cost: 960 },
    finalWater: { previous: 456.2, current: 464.2, rate: 20, units: 8, cost: 160 },
    damages: [
      { description: 'Wall damage repair', amount: 500 },
      { description: 'Missing key replacement', amount: 200 },
    ],
  };

  const totalDeductions =
    moveOutData.finalElectricity.cost +
    moveOutData.finalWater.cost +
    moveOutData.damages.reduce((sum, d) => sum + d.amount, 0);
  const netRefund = moveOutData.securityDeposit - totalDeductions;

  return (
    <div className="min-h-screen bg-surface pb-32 lg:pb-8">
      <PageHeader title="Move-out Settlement" onBack={() => router.back()} />

      <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-4xl mx-auto page-transition">
        {/* Tenant Info */}
        <section className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_10px_30px_rgba(18,28,40,0.03)]">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl text-outline">person</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-on-surface">{moveOutData.tenantName}</h2>
              <p className="text-on-surface-variant font-medium">
                Room {moveOutData.roomNumber}
              </p>
            </div>
          </div>
        </section>

        {/* Final Utility Calculation */}
        <section className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_10px_30px_rgba(18,28,40,0.03)]">
          <h3 className="text-lg font-bold text-on-surface mb-4">Final Utility Calculation</h3>
          <div className="space-y-4">
            {/* Electricity */}
            <div className="bg-surface-container-low p-4 rounded-xl space-y-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-lg">bolt</span>
                <span className="font-bold text-on-surface">Electricity</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <p className="text-on-surface-variant text-xs">Previous</p>
                  <p className="font-bold">{moveOutData.finalElectricity.previous}</p>
                </div>
                <div>
                  <p className="text-on-surface-variant text-xs">Current</p>
                  <p className="font-bold">{moveOutData.finalElectricity.current}</p>
                </div>
                <div>
                  <p className="text-on-surface-variant text-xs">Units</p>
                  <p className="font-bold">{moveOutData.finalElectricity.units} kWh</p>
                </div>
              </div>
              <div className="flex justify-between pt-2 border-t border-surface-container">
                <span className="text-sm text-on-surface-variant">
                  {moveOutData.finalElectricity.units} × ฿{moveOutData.finalElectricity.rate}
                </span>
                <span className="font-bold text-on-surface">
                  {formatCurrency(moveOutData.finalElectricity.cost)}
                </span>
              </div>
            </div>

            {/* Water */}
            <div className="bg-surface-container-low p-4 rounded-xl space-y-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-cyan-500 text-lg">water_drop</span>
                <span className="font-bold text-on-surface">Water</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <p className="text-on-surface-variant text-xs">Previous</p>
                  <p className="font-bold">{moveOutData.finalWater.previous}</p>
                </div>
                <div>
                  <p className="text-on-surface-variant text-xs">Current</p>
                  <p className="font-bold">{moveOutData.finalWater.current}</p>
                </div>
                <div>
                  <p className="text-on-surface-variant text-xs">Units</p>
                  <p className="font-bold">{moveOutData.finalWater.units} m³</p>
                </div>
              </div>
              <div className="flex justify-between pt-2 border-t border-surface-container">
                <span className="text-sm text-on-surface-variant">
                  {moveOutData.finalWater.units} × ฿{moveOutData.finalWater.rate}
                </span>
                <span className="font-bold text-on-surface">
                  {formatCurrency(moveOutData.finalWater.cost)}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Damage Deductions */}
        <section className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_10px_30px_rgba(18,28,40,0.03)]">
          <h3 className="text-lg font-bold text-on-surface mb-4">Damage Deductions</h3>
          <div className="space-y-3">
            {moveOutData.damages.map((damage, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <span className="text-on-surface-variant font-medium">{damage.description}</span>
                <span className="font-bold text-tertiary">-{formatCurrency(damage.amount)}</span>
              </div>
            ))}
            <button className="w-full py-3 border-2 border-dashed border-outline-variant rounded-xl text-on-surface-variant font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
              <span className="material-symbols-outlined text-lg">add</span>
              Add Deduction
            </button>
          </div>
        </section>

        {/* Net Refund Summary */}
        <section className="bg-primary-container rounded-3xl p-6 text-white shadow-xl">
          <h3 className="text-sm font-bold uppercase tracking-widest opacity-80 mb-4">
            Settlement Summary
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="opacity-80">Security Deposit</span>
              <span className="font-bold">{formatCurrency(moveOutData.securityDeposit)}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-80">Total Deductions</span>
              <span className="font-bold text-tertiary-fixed-dim">
                -{formatCurrency(totalDeductions)}
              </span>
            </div>
            <div className="border-t border-white/20 pt-3 flex justify-between">
              <span className="font-bold text-lg">Net Refund</span>
              <span className="text-2xl font-black">{formatCurrency(netRefund)}</span>
            </div>
          </div>
        </section>

        {/* Action */}
        <button
          onClick={() => setShowModal(true)}
          className="w-full h-14 bg-error text-on-error rounded-2xl font-extrabold active:scale-95 transition-all shadow-lg shadow-error/20"
        >
          Confirm Move-out & Process Refund
        </button>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-error-container/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-error text-4xl">warning</span>
              </div>
              <h3 className="text-2xl font-black text-on-surface mb-3 leading-tight">
                Confirm Move-out?
              </h3>
              <p className="text-on-surface-variant font-medium leading-relaxed">
                Net refund of <span className="font-bold text-secondary">{formatCurrency(netRefund)}</span> will be processed for{' '}
                <span className="font-bold text-on-surface">{moveOutData.tenantName}</span>.
              </p>
            </div>
            <div className="p-6 pt-0 space-y-3">
              <button
                onClick={() => setShowModal(false)}
                className="w-full h-14 rounded-2xl bg-error text-white font-extrabold active:scale-95 duration-150 shadow-lg shadow-error/20"
              >
                Confirm & Process
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="w-full h-14 rounded-2xl bg-surface-container-high text-on-surface font-bold active:scale-95 duration-150"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
