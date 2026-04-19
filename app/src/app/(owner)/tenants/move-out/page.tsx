'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/hooks/useLanguage';
import { formatCurrency } from '@/utils/currency';
import PageHeader from '@/components/layout/PageHeader';

export default function MoveOutPage() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const [showModal, setShowModal] = useState(false);
  const text =
    language === 'th'
      ? {
          room: 'ห้อง',
          finalUtilityCalculation: 'คำนวณค่าสาธารณูปโภคงวดสุดท้าย',
          electricity: 'ไฟฟ้า',
          water: 'น้ำ',
          previous: 'ครั้งก่อน',
          current: 'ครั้งล่าสุด',
          units: 'หน่วยที่ใช้',
          damageDeductions: 'หักค่าเสียหาย',
          addDeduction: 'เพิ่มรายการหัก',
          settlementSummary: 'สรุปยอดปิดสัญญา',
          securityDeposit: 'เงินประกัน',
          totalDeductions: 'ยอดหักทั้งหมด',
          netRefund: 'คืนเงินสุทธิ',
          confirmMoveOutButton: 'ยืนยันย้ายออกและคืนเงินประกัน',
          confirmMoveOutTitle: 'ยืนยันการย้ายออก?',
          confirmMoveOutDescriptionStart: 'ระบบจะคืนเงินสุทธิ',
          confirmMoveOutDescriptionMiddle: 'ให้กับ',
          confirmAndProcess: 'ยืนยันและดำเนินการ',
          cancel: 'ยกเลิก',
          wallDamageRepair: 'ซ่อมแซมผนังเสียหาย',
          missingKeyReplacement: 'ค่าทำกุญแจทดแทน',
        }
      : {
          room: 'Room',
          finalUtilityCalculation: 'Final Utility Calculation',
          electricity: 'Electricity',
          water: 'Water',
          previous: 'Previous',
          current: 'Current',
          units: 'Units',
          damageDeductions: 'Damage Deductions',
          addDeduction: 'Add Deduction',
          settlementSummary: 'Settlement Summary',
          securityDeposit: 'Security Deposit',
          totalDeductions: 'Total Deductions',
          netRefund: 'Net Refund',
          confirmMoveOutButton: 'Confirm Move-out & Process Refund',
          confirmMoveOutTitle: 'Confirm Move-out?',
          confirmMoveOutDescriptionStart: 'Net refund of',
          confirmMoveOutDescriptionMiddle: 'will be processed for',
          confirmAndProcess: 'Confirm & Process',
          cancel: 'Cancel',
          wallDamageRepair: 'Wall damage repair',
          missingKeyReplacement: 'Missing key replacement',
        };

  // Mock move-out data
  const moveOutData = {
    roomNumber: '101',
    tenantName: 'สมชาย ศรีสุข',
    securityDeposit: 9000,
    finalElectricity: { previous: 1234.5, current: 1354.5, rate: 8, units: 120, cost: 960 },
    finalWater: { previous: 456.2, current: 464.2, rate: 20, units: 8, cost: 160 },
    damages: [
      { description: text.wallDamageRepair, amount: 500 },
      { description: text.missingKeyReplacement, amount: 200 },
    ],
  };

  const totalDeductions =
    moveOutData.finalElectricity.cost +
    moveOutData.finalWater.cost +
    moveOutData.damages.reduce((sum, d) => sum + d.amount, 0);
  const netRefund = moveOutData.securityDeposit - totalDeductions;

  return (
    <div className="min-h-screen bg-surface pb-32 lg:pb-8">
      <PageHeader title={t('page.moveOutTitle')} onBack={() => router.back()} />

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
                {text.room} {moveOutData.roomNumber}
              </p>
            </div>
          </div>
        </section>

        {/* Final Utility Calculation */}
        <section className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_10px_30px_rgba(18,28,40,0.03)]">
          <h3 className="text-lg font-bold text-on-surface mb-4">{text.finalUtilityCalculation}</h3>
          <div className="space-y-4">
            {/* Electricity */}
            <div className="bg-surface-container-low p-4 rounded-xl space-y-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-lg">bolt</span>
                <span className="font-bold text-on-surface">{text.electricity}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <p className="text-on-surface-variant text-xs">{text.previous}</p>
                  <p className="font-bold">{moveOutData.finalElectricity.previous}</p>
                </div>
                <div>
                  <p className="text-on-surface-variant text-xs">{text.current}</p>
                  <p className="font-bold">{moveOutData.finalElectricity.current}</p>
                </div>
                <div>
                  <p className="text-on-surface-variant text-xs">{text.units}</p>
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
                <span className="font-bold text-on-surface">{text.water}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <p className="text-on-surface-variant text-xs">{text.previous}</p>
                  <p className="font-bold">{moveOutData.finalWater.previous}</p>
                </div>
                <div>
                  <p className="text-on-surface-variant text-xs">{text.current}</p>
                  <p className="font-bold">{moveOutData.finalWater.current}</p>
                </div>
                <div>
                  <p className="text-on-surface-variant text-xs">{text.units}</p>
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
          <h3 className="text-lg font-bold text-on-surface mb-4">{text.damageDeductions}</h3>
          <div className="space-y-3">
            {moveOutData.damages.map((damage, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <span className="text-on-surface-variant font-medium">{damage.description}</span>
                <span className="font-bold text-tertiary">-{formatCurrency(damage.amount)}</span>
              </div>
            ))}
            <button className="w-full py-3 border-2 border-dashed border-outline-variant rounded-xl text-on-surface-variant font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
              <span className="material-symbols-outlined text-lg">add</span>
              {text.addDeduction}
            </button>
          </div>
        </section>

        {/* Net Refund Summary */}
        <section className="bg-primary-container rounded-3xl p-6 text-white shadow-xl">
          <h3 className="text-sm font-bold uppercase tracking-widest opacity-80 mb-4">
            {text.settlementSummary}
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="opacity-80">{text.securityDeposit}</span>
              <span className="font-bold">{formatCurrency(moveOutData.securityDeposit)}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-80">{text.totalDeductions}</span>
              <span className="font-bold text-tertiary-fixed-dim">
                -{formatCurrency(totalDeductions)}
              </span>
            </div>
            <div className="border-t border-white/20 pt-3 flex justify-between">
              <span className="font-bold text-lg">{text.netRefund}</span>
              <span className="text-2xl font-black">{formatCurrency(netRefund)}</span>
            </div>
          </div>
        </section>

        {/* Action */}
        <button
          onClick={() => setShowModal(true)}
          className="w-full h-14 bg-error text-on-error rounded-2xl font-extrabold active:scale-95 transition-all shadow-lg shadow-error/20"
        >
          {text.confirmMoveOutButton}
        </button>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-100 flex items-center justify-center p-6">
          <div className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-error-container/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-error text-4xl">warning</span>
              </div>
              <h3 className="text-2xl font-black text-on-surface mb-3 leading-tight">
                {text.confirmMoveOutTitle}
              </h3>
              <p className="text-on-surface-variant font-medium leading-relaxed">
                {text.confirmMoveOutDescriptionStart}{' '}
                <span className="font-bold text-secondary">{formatCurrency(netRefund)}</span>{' '}
                {text.confirmMoveOutDescriptionMiddle}{' '}
                <span className="font-bold text-on-surface">{moveOutData.tenantName}</span>.
              </p>
            </div>
            <div className="p-6 pt-0 space-y-3">
              <button
                onClick={() => setShowModal(false)}
                className="w-full h-14 rounded-2xl bg-error text-white font-extrabold active:scale-95 duration-150 shadow-lg shadow-error/20"
              >
                {text.confirmAndProcess}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="w-full h-14 rounded-2xl bg-surface-container-high text-on-surface font-bold active:scale-95 duration-150"
              >
                {text.cancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
