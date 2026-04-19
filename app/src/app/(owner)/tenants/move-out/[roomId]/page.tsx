'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PageHeader from '@/components/layout/PageHeader';
import { useLanguage } from '@/hooks/useLanguage';
import { useRepositories } from '@/hooks/useRepositories';
import { formatCurrency } from '@/utils/currency';
import type { Room } from '@/types/room';

function sortRoomsByNumber(rooms: Room[]): Room[] {
  return [...rooms].sort((a, b) => a.number.localeCompare(b.number, 'en', { numeric: true }));
}

export default function MoveOutRoomDetailPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = typeof params.roomId === 'string' ? params.roomId : '';
  const { language } = useLanguage();
  const { roomRepository } = useRepositories();
  const [showModal, setShowModal] = useState(false);

  const [rooms, setRooms] = useState<Room[]>(() => {
    const roomsResult = roomRepository.listRooms();
    return roomsResult.ok ? sortRoomsByNumber(roomsResult.value) : [];
  });

  const text =
    language === 'th'
      ? {
          redirecting: 'กำลังพากลับหน้าเลือกห้อง...',
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
          tenantUnavailable: 'ผู้เช่าเดิม',
        }
      : {
          redirecting: 'Redirecting to room selector...',
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
          tenantUnavailable: 'Current tenant',
        };

  useEffect(() => {
    const refreshRooms = () => {
      const roomsResult = roomRepository.listRooms();
      if (roomsResult.ok) {
        setRooms(sortRoomsByNumber(roomsResult.value));
      }
    };

    window.addEventListener('storage', refreshRooms);
    window.addEventListener('estate_clarity.billing_state_updated', refreshRooms);

    return () => {
      window.removeEventListener('storage', refreshRooms);
      window.removeEventListener('estate_clarity.billing_state_updated', refreshRooms);
    };
  }, [roomRepository]);

  const selectedRoom = rooms.find((room) => room.id === roomId);
  const isAllowedRoom = selectedRoom?.occupancy === 'occupied';

  useEffect(() => {
    if (!selectedRoom || !isAllowedRoom) {
      router.replace('/tenants/move-out');
    }
  }, [isAllowedRoom, router, selectedRoom]);

  if (!selectedRoom || !isAllowedRoom) {
    return (
      <div className="min-h-screen bg-surface pb-32 lg:pb-8">
        <PageHeader
          title={language === 'th' ? 'สรุปย้ายออก' : 'Move-out Settlement'}
          onBack={() => router.push('/tenants/move-out')}
        />
        <div className="px-4 py-8 text-sm font-medium text-on-surface-variant">{text.redirecting}</div>
      </div>
    );
  }

  const pageTitle =
    language === 'th'
      ? `สรุปย้ายออก: ห้อง ${selectedRoom.number}`
      : `Move-out: Room ${selectedRoom.number}`;

  const securityDeposit = selectedRoom.baseRent * 2;
  const electricPrevious = 1234.5 + selectedRoom.floor * 10;
  const electricUnits = 120;
  const electricRate = 8;
  const electricCurrent = Number((electricPrevious + electricUnits).toFixed(1));

  const waterPrevious = 456.2 + selectedRoom.floor * 4;
  const waterUnits = 8;
  const waterRate = 20;
  const waterCurrent = Number((waterPrevious + waterUnits).toFixed(1));

  const moveOutData = {
    roomNumber: selectedRoom.number,
    tenantName: selectedRoom.tenantName ?? text.tenantUnavailable,
    securityDeposit,
    finalElectricity: {
      previous: electricPrevious,
      current: electricCurrent,
      rate: electricRate,
      units: electricUnits,
      cost: electricUnits * electricRate,
    },
    finalWater: {
      previous: waterPrevious,
      current: waterCurrent,
      rate: waterRate,
      units: waterUnits,
      cost: waterUnits * waterRate,
    },
    damages: [
      { description: text.wallDamageRepair, amount: 500 },
      { description: text.missingKeyReplacement, amount: 200 },
    ],
  };

  const totalDeductions =
    moveOutData.finalElectricity.cost +
    moveOutData.finalWater.cost +
    moveOutData.damages.reduce((sum, damage) => sum + damage.amount, 0);
  const netRefund = moveOutData.securityDeposit - totalDeductions;

  return (
    <div className="min-h-screen bg-surface pb-32 lg:pb-8">
      <PageHeader title={pageTitle} onBack={() => router.push('/tenants/move-out')} />

      <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-4xl mx-auto page-transition">
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

        <section className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_10px_30px_rgba(18,28,40,0.03)]">
          <h3 className="text-lg font-bold text-on-surface mb-4">{text.finalUtilityCalculation}</h3>
          <div className="space-y-4">
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

        <section className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_10px_30px_rgba(18,28,40,0.03)]">
          <h3 className="text-lg font-bold text-on-surface mb-4">{text.damageDeductions}</h3>
          <div className="space-y-3">
            {moveOutData.damages.map((damage, index) => (
              <div key={`${damage.description}-${index}`} className="flex justify-between items-center">
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

        <button
          onClick={() => setShowModal(true)}
          className="w-full h-14 bg-error text-on-error rounded-2xl font-extrabold active:scale-95 transition-all shadow-lg shadow-error/20"
        >
          {text.confirmMoveOutButton}
        </button>
      </div>

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
                onClick={() => {
                  setShowModal(false);
                  router.push(`/rooms/${selectedRoom.id}`);
                }}
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
