'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  buildRoomAdditionalChargeContext,
  calculateAdditionalChargeForRoomNumber,
} from '@/services/additionalChargeRules';
import { getRoomAdditionalChargeRuleIds } from '@/services/roomAdditionalChargeOverrides';
import type { AdditionalChargeRule } from '@/services/propertySettings';
import type { BillItem } from '@/types/billing';
import { formatCurrency } from '@/utils/currency';
import StatusBadge from '@/components/ui/StatusBadge';
import PageHeader from '@/components/layout/PageHeader';
import { useLanguage } from '@/hooks/useLanguage';
import { useRepositories } from '@/hooks/useRepositories';

export default function RoomDetailPage() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const { roomRepository, billingRepository } = useRepositories();
  const params = useParams();
  const roomId = typeof params.id === 'string' ? params.id : '';
  const [rooms, setRooms] = useState<any[]>([]);
  const [roomBills, setRoomBills] = useState<BillItem[]>([]);

  useEffect(() => {
    const refreshRoomsState = async () => {
      const roomsResult = await roomRepository.listRooms();
      if (roomsResult.ok) {
        setRooms(roomsResult.value);
      }
    };

    const refreshRoomBills = async () => {
      if (!roomId) {
        setRoomBills([]);
        return;
      }

      const billsResult = await billingRepository.loadRoomBills(roomId);
      if (billsResult.ok) {
        setRoomBills(billsResult.value);
      }
    };

    refreshRoomsState();
    refreshRoomBills();

    window.addEventListener('storage', refreshRoomsState);
    window.addEventListener('estate_clarity.billing_state_updated', refreshRoomsState);
    window.addEventListener('storage', refreshRoomBills);
    window.addEventListener('estate_clarity.billing_state_updated', refreshRoomBills);

    return () => {
      window.removeEventListener('storage', refreshRoomsState);
      window.removeEventListener('estate_clarity.billing_state_updated', refreshRoomsState);
      window.removeEventListener('storage', refreshRoomBills);
      window.removeEventListener('estate_clarity.billing_state_updated', refreshRoomBills);
    };
  }, [billingRepository, roomId, roomRepository]);
  const room = rooms.find((r) => r.id === roomId);
  const [showModal, setShowModal] = useState(false);
  const lifecycleText =
    language === 'th'
      ? {
          startMoveIn: 'เริ่มย้ายเข้าห้องนี้',
          openMoveOut: 'ไปหน้าสรุปย้ายออก',
          reservedHint: 'ห้องนี้อยู่ในสถานะจอง ยังไม่สามารถเริ่มย้ายเข้า/ย้ายออกได้',
        }
      : {
          startMoveIn: 'Move Tenant into This Room',
          openMoveOut: 'Open Move-out Settlement',
          reservedHint: 'This room is reserved and not ready for move-in or move-out yet.',
        };

  const additionalChargeContext = buildRoomAdditionalChargeContext();

  const roomChargeOverrideIds = useMemo(() => {
    if (!room) {
      return undefined;
    }

    return getRoomAdditionalChargeRuleIds(room.number);
  }, [room]);

  const isUsingGlobalChargeRules = roomChargeOverrideIds === undefined;

  const effectiveChargeRules = useMemo(() => {
    if (!room) {
      return [];
    }

    const effectiveRuleIds =
      roomChargeOverrideIds ?? additionalChargeContext.activeRuleIds;

    return effectiveRuleIds
      .map((ruleId) => additionalChargeContext.activeRulesById.get(ruleId))
      .filter((rule): rule is AdditionalChargeRule => rule !== undefined);
  }, [additionalChargeContext, room, roomChargeOverrideIds]);

  const ignoredOverrideRuleIds = useMemo(() => {
    if (!roomChargeOverrideIds) {
      return [];
    }

    return roomChargeOverrideIds.filter(
      (ruleId) => !additionalChargeContext.activeRulesById.has(ruleId)
    );
  }, [additionalChargeContext, roomChargeOverrideIds]);

  const roomAdditionalCharge = useMemo(() => {
    if (!room || room.occupancy !== 'occupied') {
      return 0;
    }

    return calculateAdditionalChargeForRoomNumber(room.number, additionalChargeContext);
  }, [additionalChargeContext, room]);

  if (!room) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <p className="text-on-surface-variant">{t('roomDetail.notFound')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface pb-32 lg:pb-8">
      <PageHeader
        title={t('roomDetail.title', { room: room.number })}
        onBack={() => router.back()}
        rightAction={
          <button className="p-2 rounded-full hover:bg-slate-100 text-primary">
            <span className="material-symbols-outlined">edit</span>
          </button>
        }
      />

      <div className="pb-32 lg:pb-8 px-4 sm:px-6 lg:px-8 space-y-6 max-w-5xl mx-auto page-transition">
        {/* Tenant Info Card */}
        <section className="mt-4 bg-surface-container-lowest rounded-3xl p-6 shadow-[0_20px_50px_rgba(18,28,40,0.05)]">
          <div className="flex items-center gap-5 mb-8">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-surface-container flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl text-outline">person</span>
              </div>
              {room.occupancy === 'occupied' && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-secondary-container border-2 border-white rounded-full" />
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-extrabold tracking-tight text-on-surface">
                {room.tenantName ?? t('roomDetail.vacantRoom')}
              </h2>
              {room.tenantName && (
                <p className="text-on-surface-variant font-medium">+66 81 234 5678</p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          {room.tenantName && (
            <div className="grid grid-cols-2 gap-4 mb-8">
              <button className="h-14 flex items-center justify-center gap-2 rounded-2xl btn-primary-gradient text-white font-bold active:scale-95 duration-150 shadow-lg shadow-primary/20">
                <span className="material-symbols-outlined">call</span>
                <span>{t('roomDetail.call')}</span>
              </button>
              <button className="h-14 flex items-center justify-center gap-2 rounded-2xl bg-secondary-container text-on-secondary-container font-bold active:scale-95 duration-150">
                <span className="material-symbols-outlined">forum</span>
                <span>{t('roomDetail.chat')}</span>
              </button>
            </div>
          )}

          {/* Lease Dates */}
          <div className="space-y-4 pt-4 border-t border-surface-container">
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant font-medium">{t('roomDetail.moveInDate')}</span>
              <span className="text-on-surface font-semibold">{t('roomDetail.moveInDateValue')}</span>
            </div>
            <div className="flex justify-between items-center bg-error-container/20 p-3 rounded-xl">
              <span className="text-on-tertiary-fixed-variant font-bold">{t('roomDetail.contractExpires')}</span>
              <span className="text-error font-extrabold">{t('roomDetail.contractExpiresValue')}</span>
            </div>
          </div>
        </section>

        {/* Current Month Quick View */}
        <section className="bg-primary-container rounded-3xl p-6 text-white shadow-xl">
          <h3 className="text-sm font-bold uppercase tracking-widest opacity-80 mb-4">
            {t('roomDetail.lastRecordedMeter')}
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-sm">bolt</span>
                <span className="text-xs font-bold uppercase opacity-70">{t('roomDetail.electricity')}</span>
              </div>
              <p className="text-xl font-bold">
                120 <span className="text-sm font-medium opacity-80">kWh</span>
              </p>
            </div>
            <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-sm">water_drop</span>
                <span className="text-xs font-bold uppercase opacity-70">{t('roomDetail.water')}</span>
              </div>
              <p className="text-xl font-bold">
                8 <span className="text-sm font-medium opacity-80">m³</span>
              </p>
            </div>
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-white/20">
            <span className="font-bold opacity-90">{t('roomDetail.baseRoomRate')}</span>
            <span className="text-2xl font-black">{formatCurrency(room.baseRent)}</span>
          </div>
        </section>

        {/* Additional Charges Debug */}
        <section className="bg-surface-container-lowest rounded-3xl p-6 shadow-[0_20px_50px_rgba(18,28,40,0.05)] space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-extrabold tracking-tight text-on-surface">
              {t('roomDetail.additionalChargeAssignment')}
            </h3>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                isUsingGlobalChargeRules
                  ? 'bg-secondary-container/30 text-secondary'
                  : 'bg-primary/10 text-primary'
              }`}
            >
              {isUsingGlobalChargeRules
                ? t('roomDetail.globalRules')
                : t('roomDetail.roomOverride')}
            </span>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-surface-container-low p-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                {t('roomDetail.appliedThisMonth')}
              </p>
              <p className="text-sm font-medium text-on-surface-variant">
                {room.occupancy === 'occupied'
                  ? t('roomDetail.calculatedFromEffectiveRules')
                  : t('roomDetail.vacantNoAdditionalCharges')}
              </p>
            </div>
            <p className="text-2xl font-black text-on-surface">
              {formatCurrency(roomAdditionalCharge)}
            </p>
          </div>

          {effectiveChargeRules.length === 0 ? (
            <div className="rounded-xl bg-surface-container-low p-4 text-sm font-medium text-on-surface-variant text-center">
              {t('roomDetail.noActiveRulesApply')}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {effectiveChargeRules.map((rule) => (
                <div
                  key={rule.id}
                  className="rounded-xl bg-surface-container-low p-3 border border-surface-container-high"
                >
                  <p className="text-sm font-bold text-on-surface">{rule.name}</p>
                  <p className="text-xs font-medium text-on-surface-variant">
                    {t('roomDetail.perMonth', {
                      amount: formatCurrency(Math.round(rule.amount)),
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}

          {ignoredOverrideRuleIds.length > 0 && (
            <div className="rounded-xl bg-error-container/20 p-3 text-xs font-medium text-error">
              {t('roomDetail.ignoredOverrideRuleIds')}
              : {ignoredOverrideRuleIds.join(', ')}
            </div>
          )}

          <p className="text-xs text-on-surface-variant font-medium leading-relaxed">
            {isUsingGlobalChargeRules
              ? t('roomDetail.followsGlobalRules')
              : t('roomDetail.usesCustomSelection')}
          </p>
        </section>

        {/* Billing History */}
        <section>
          <div className="flex justify-between items-end px-2 mb-4">
            <h3 className="text-xl font-extrabold tracking-tight">{t('roomDetail.billingHistory')}</h3>
            <span className="text-primary font-bold text-sm">{t('roomDetail.viewAll')}</span>
          </div>
          <div className="space-y-3">
            {roomBills.map((bill) => (
              <div
                key={bill.id}
                className="flex items-center justify-between bg-surface-container-low p-5 rounded-2xl hover:bg-surface-container-high transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary-container">
                    <span className="material-symbols-outlined font-bold">receipt_long</span>
                  </div>
                  <div>
                    <p className="font-bold text-on-surface">{bill.month} {bill.year}</p>
                    <p className="text-sm font-medium text-on-surface-variant">
                      {formatCurrency(bill.totalAmount)}
                    </p>
                  </div>
                </div>
                <StatusBadge status={bill.status} />
              </div>
            ))}
            {roomBills.length === 0 && (
              <div className="bg-surface-container-low p-6 rounded-2xl text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-3xl mb-2 block">receipt_long</span>
                <p className="font-medium">{t('roomDetail.noBillingHistory')}</p>
              </div>
            )}
          </div>
        </section>

        {/* Action Buttons */}
        <section className="space-y-3 pt-6">
          {room.occupancy === 'occupied' && (
            <>
              <button className="w-full h-14 rounded-2xl border-2 border-primary-container text-primary-container font-extrabold active:scale-95 duration-150">
                {t('roomDetail.sendManualReminder')}
              </button>
              <button
                onClick={() => router.push(`/tenants/move-out/${room.id}`)}
                className="w-full h-14 rounded-2xl bg-surface-container-high text-on-surface font-bold active:scale-95 duration-150"
              >
                {lifecycleText.openMoveOut}
              </button>
              <button
                onClick={() => setShowModal(true)}
                className="w-full h-14 rounded-2xl bg-error-container/10 text-error font-bold active:scale-95 duration-150"
              >
                {t('roomDetail.terminateLease')}
              </button>
            </>
          )}

          {room.occupancy === 'vacant' && (
            <button
              onClick={() => router.push(`/tenants/move-in/${room.id}`)}
              className="w-full h-14 rounded-2xl btn-primary-gradient text-on-primary font-extrabold active:scale-95 duration-150 shadow-lg shadow-primary/20"
            >
              {lifecycleText.startMoveIn}
            </button>
          )}

          {room.occupancy === 'reserved' && (
            <div className="rounded-2xl bg-surface-container-low p-4 text-sm font-medium text-on-surface-variant text-center">
              {lifecycleText.reservedHint}
            </div>
          )}
        </section>
      </div>

      {/* Terminate Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-100 flex items-center justify-center p-6">
          <div className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-error-container/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-error text-4xl">warning</span>
              </div>
              <h3 className="text-2xl font-black text-on-surface mb-3 leading-tight">
                {t('roomDetail.confirmLeaseTermination')}
              </h3>
              <p className="text-on-surface-variant font-medium leading-relaxed">
                {t('roomDetail.finalRefundMessage', {
                  room: room.number,
                })}
              </p>
            </div>
            <div className="p-6 pt-0 space-y-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  router.push(`/tenants/move-out/${room.id}`);
                }}
                className="w-full h-14 rounded-2xl bg-error text-white font-extrabold active:scale-95 duration-150 shadow-lg shadow-error/20"
              >
                {t('roomDetail.confirmTermination')}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="w-full h-14 rounded-2xl bg-surface-container-high text-on-surface font-bold active:scale-95 duration-150"
              >
                {t('roomDetail.keepLease')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
