'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageHeader from '@/components/layout/PageHeader';
import { useLanguage } from '@/hooks/useLanguage';
import { formatCurrency } from '@/utils/currency';
import type { Room } from '@/types/room';
import type { MeterReading } from '@/types/billing';
import { Loader2, AlertCircle } from 'lucide-react';

export default function MoveOutRoomDetailPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = typeof params.roomId === 'string' ? params.roomId : '';
  const { language } = useLanguage();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);

  // ── Fetch rooms from real API ──
  const { data: rooms = [], isLoading: isRoomsLoading } = useQuery<Room[]>({
    queryKey: ['rooms'],
    queryFn: async () => {
      const res = await fetch('/api/rooms');
      if (!res.ok) throw new Error('Failed to fetch rooms');
      return res.json();
    },
  });

  // ── Fetch meter readings from real API ──
  const { data: meterReadings = [] } = useQuery<MeterReading[]>({
    queryKey: ['meter-readings'],
    queryFn: async () => {
      const res = await fetch('/api/meter-readings');
      if (!res.ok) throw new Error('Failed to fetch meter readings');
      return res.json();
    },
  });

  const selectedRoom = rooms.find((room) => room.id === roomId);
  const isAllowedRoom = selectedRoom?.occupancy === 'occupied';
  const tenantId = selectedRoom?.tenantId ?? null;

  // Latest meter reading for this room
  const roomMeter = meterReadings.find((m) => m.roomId === roomId);

  // ── Fetch tenant detail for real securityDeposit ──
  const { data: tenantDetail } = useQuery<{ securityDeposit: number } | null>({
    queryKey: ['tenant-detail', tenantId],
    queryFn: async () => {
      if (!tenantId) return null;
      const res = await fetch(`/api/owner/tenants/${tenantId}`);
      if (!res.ok) throw new Error('Failed to fetch tenant');
      return res.json();
    },
    enabled: Boolean(tenantId),
  });

  // ── Move-out Mutation ──
  const moveOutMutation = useMutation({
    mutationFn: async (tenantId: string) => {
      const res = await fetch(`/api/owner/tenants/${tenantId}/move-out`, {
        method: 'POST',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Move-out failed');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['meter-readings'] });
      router.replace('/tenants/move-out');
    },
  });

  const text =
    language === 'th'
      ? {
          redirecting: 'กำลังพากลับหน้าเลือกห้อง...',
          loading: 'กำลังโหลดข้อมูล...',
          room: 'ห้อง',
          finalUtilityCalculation: 'มิเตอร์ล่าสุด (ข้อมูลอ้างอิง)',
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
          netRefund: 'คืนเงินสุทธิ (โดยประมาณ)',
          confirmMoveOutButton: 'ยืนยันย้ายออก',
          confirmMoveOutTitle: 'ยืนยันการย้ายออก?',
          confirmMoveOutDescription: 'ระบบจะคืนห้องนี้กลับเป็นว่าง ข้อมูลผู้เช่าและประวัติบิลจะถูกเก็บไว้ครับ',
          confirmAndProcess: 'ยืนยันและดำเนินการ',
          cancel: 'ยกเลิก',
          processing: 'กำลังดำเนินการ...',
          tenantUnavailable: 'ผู้เช่าเดิม',
          noMeterData: 'ยังไม่มีข้อมูลมิเตอร์',
          errorTitle: 'เกิดข้อผิดพลาด',
        }
      : {
          redirecting: 'Redirecting to room selector...',
          loading: 'Loading...',
          room: 'Room',
          finalUtilityCalculation: 'Latest Meter Reading (Reference)',
          electricity: 'Electricity',
          water: 'Water',
          previous: 'Previous',
          current: 'Current',
          units: 'Units used',
          damageDeductions: 'Damage Deductions',
          addDeduction: 'Add Deduction',
          settlementSummary: 'Settlement Summary',
          securityDeposit: 'Security Deposit',
          totalDeductions: 'Total Deductions',
          netRefund: 'Net Refund (Estimated)',
          confirmMoveOutButton: 'Confirm Move-out',
          confirmMoveOutTitle: 'Confirm Move-out?',
          confirmMoveOutDescription: 'The room will be set back to vacant. Tenant record and billing history will be preserved.',
          confirmAndProcess: 'Confirm & Process',
          cancel: 'Cancel',
          processing: 'Processing...',
          tenantUnavailable: 'Current tenant',
          noMeterData: 'No meter data available',
          errorTitle: 'Error',
        };

  if (isRoomsLoading) {
    return (
      <div className="min-h-screen bg-surface pb-32 lg:pb-8">
        <PageHeader title={language === 'th' ? 'สรุปย้ายออก' : 'Move-out'} onBack={() => router.push('/tenants/move-out')} />
        <div className="px-4 py-8 text-sm font-medium text-on-surface-variant">{text.loading}</div>
      </div>
    );
  }

  if (!selectedRoom || !isAllowedRoom) {
    return (
      <div className="min-h-screen bg-surface pb-32 lg:pb-8">
        <PageHeader title={language === 'th' ? 'สรุปย้ายออก' : 'Move-out'} onBack={() => router.push('/tenants/move-out')} />
        <div className="px-4 py-8 text-sm font-medium text-on-surface-variant">{text.redirecting}</div>
      </div>
    );
  }

  const pageTitle =
    language === 'th'
      ? `สรุปย้ายออก: ห้อง ${selectedRoom.number}`
      : `Move-out: Room ${selectedRoom.number}`;

  const securityDeposit = tenantDetail?.securityDeposit ?? 0;

  // Use real meter data if available
  const electricPrevious = roomMeter?.electricity.previous ?? 0;
  const electricCurrent = roomMeter?.electricity.current ?? electricPrevious;
  const electricUnits = Math.max(0, electricCurrent - electricPrevious);

  const waterPrevious = roomMeter?.water.previous ?? 0;
  const waterCurrent = roomMeter?.water.current ?? waterPrevious;
  const waterUnits = Math.max(0, waterCurrent - waterPrevious);

  // NOTE: rates are reference only — actual final bill should be generated separately
  const electricRate = 8;
  const waterRate = 20;
  const electricCost = electricUnits * electricRate;
  const waterCost = waterUnits * waterRate;

  const totalDeductions = electricCost + waterCost;
  const netRefund = securityDeposit - totalDeductions;

  const handleConfirmMoveOut = () => {
    if (!tenantId) return;
    moveOutMutation.mutate(tenantId);
  };

  return (
    <div className="min-h-screen bg-surface pb-32 lg:pb-8">
      <PageHeader title={pageTitle} onBack={() => router.push('/tenants/move-out')} />

      <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-4xl mx-auto page-transition">

        {/* Error Banner */}
        {moveOutMutation.isError && (
          <div className="bg-error-container text-on-error-container px-4 py-3 rounded-2xl flex items-center gap-3 text-sm font-medium">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {(moveOutMutation.error as Error).message}
          </div>
        )}

        {/* Tenant Info */}
        <section className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_10px_30px_rgba(18,28,40,0.03)]">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl text-outline">person</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-on-surface">
                {selectedRoom.tenantName ?? text.tenantUnavailable}
              </h2>
              <p className="text-on-surface-variant font-medium">
                {text.room} {selectedRoom.number}
              </p>
            </div>
          </div>
        </section>

        {/* Meter Reading (real data) */}
        <section className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_10px_30px_rgba(18,28,40,0.03)]">
          <h3 className="text-lg font-bold text-on-surface mb-4">{text.finalUtilityCalculation}</h3>
          {!roomMeter ? (
            <p className="text-sm text-on-surface-variant font-medium">{text.noMeterData}</p>
          ) : (
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
                    <p className="font-bold">{electricPrevious.toFixed(1)}</p>
                  </div>
                  <div>
                    <p className="text-on-surface-variant text-xs">{text.current}</p>
                    <p className="font-bold">{electricCurrent.toFixed(1)}</p>
                  </div>
                  <div>
                    <p className="text-on-surface-variant text-xs">{text.units}</p>
                    <p className="font-bold">{electricUnits.toFixed(1)} kWh</p>
                  </div>
                </div>
                <div className="flex justify-between pt-2 border-t border-surface-container">
                  <span className="text-sm text-on-surface-variant">
                    {electricUnits.toFixed(1)} × ฿{electricRate}
                  </span>
                  <span className="font-bold text-on-surface">{formatCurrency(electricCost)}</span>
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
                    <p className="font-bold">{waterPrevious.toFixed(1)}</p>
                  </div>
                  <div>
                    <p className="text-on-surface-variant text-xs">{text.current}</p>
                    <p className="font-bold">{waterCurrent.toFixed(1)}</p>
                  </div>
                  <div>
                    <p className="text-on-surface-variant text-xs">{text.units}</p>
                    <p className="font-bold">{waterUnits.toFixed(1)} m³</p>
                  </div>
                </div>
                <div className="flex justify-between pt-2 border-t border-surface-container">
                  <span className="text-sm text-on-surface-variant">
                    {waterUnits.toFixed(1)} × ฿{waterRate}
                  </span>
                  <span className="font-bold text-on-surface">{formatCurrency(waterCost)}</span>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Settlement Summary */}
        <section className="bg-primary-container rounded-3xl p-6 text-white shadow-xl">
          <h3 className="text-sm font-bold uppercase tracking-widest opacity-80 mb-4">
            {text.settlementSummary}
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="opacity-80">{text.securityDeposit}</span>
              <span className="font-bold">{formatCurrency(securityDeposit)}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-80">{text.totalDeductions}</span>
              <span className="font-bold text-tertiary-fixed-dim">-{formatCurrency(totalDeductions)}</span>
            </div>
            <div className="border-t border-white/20 pt-3 flex justify-between">
              <span className="font-bold text-lg">{text.netRefund}</span>
              <span className="text-2xl font-black">{formatCurrency(netRefund)}</span>
            </div>
          </div>
        </section>

        <button
          onClick={() => setShowModal(true)}
          disabled={!tenantId || moveOutMutation.isPending}
          className="w-full h-14 bg-error text-on-error rounded-2xl font-extrabold active:scale-95 transition-all shadow-lg shadow-error/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {text.confirmMoveOutButton}
        </button>
      </div>

      {/* Confirm Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-error-container/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-error text-4xl">warning</span>
              </div>
              <h3 className="text-2xl font-black text-on-surface mb-3 leading-tight">
                {text.confirmMoveOutTitle}
              </h3>
              <p className="text-on-surface-variant font-medium leading-relaxed">
                {text.confirmMoveOutDescription}
              </p>
            </div>
            <div className="p-6 pt-0 space-y-3">
              <button
                onClick={handleConfirmMoveOut}
                disabled={moveOutMutation.isPending}
                className="w-full h-14 rounded-2xl bg-error text-white font-extrabold active:scale-95 duration-150 shadow-lg shadow-error/20 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {moveOutMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {text.processing}
                  </>
                ) : (
                  text.confirmAndProcess
                )}
              </button>
              <button
                onClick={() => setShowModal(false)}
                disabled={moveOutMutation.isPending}
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
