'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { MOCK_ROOMS, MOCK_BILLS } from '@/services/mockData';
import { formatCurrency } from '@/utils/currency';
import StatusBadge from '@/components/ui/StatusBadge';
import PageHeader from '@/components/layout/PageHeader';

export default function RoomDetailPage() {
  const router = useRouter();
  const params = useParams();
  const room = MOCK_ROOMS.find((r) => r.id === params.id);
  const [showModal, setShowModal] = useState(false);

  if (!room) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <p className="text-on-surface-variant">Room not found</p>
      </div>
    );
  }

  const roomBills = MOCK_BILLS.filter((b) => b.roomId === room.id);

  return (
    <div className="min-h-screen bg-surface pb-32 lg:pb-8">
      <PageHeader
        title={`Room ${room.number} Details`}
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
                {room.tenantName ?? 'Vacant Room'}
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
                <span>Call</span>
              </button>
              <button className="h-14 flex items-center justify-center gap-2 rounded-2xl bg-secondary-container text-on-secondary-container font-bold active:scale-95 duration-150">
                <span className="material-symbols-outlined">forum</span>
                <span>Chat</span>
              </button>
            </div>
          )}

          {/* Lease Dates */}
          <div className="space-y-4 pt-4 border-t border-surface-container">
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant font-medium">Move-in Date</span>
              <span className="text-on-surface font-semibold">Oct 01, 2025</span>
            </div>
            <div className="flex justify-between items-center bg-error-container/20 p-3 rounded-xl">
              <span className="text-on-tertiary-fixed-variant font-bold">Contract Expires</span>
              <span className="text-error font-extrabold">Sep 30, 2026</span>
            </div>
          </div>
        </section>

        {/* Current Month Quick View */}
        <section className="bg-primary-container rounded-3xl p-6 text-white shadow-xl">
          <h3 className="text-sm font-bold uppercase tracking-widest opacity-80 mb-4">
            LAST RECORDED METER (March 2026)
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-sm">bolt</span>
                <span className="text-xs font-bold uppercase opacity-70">Electricity</span>
              </div>
              <p className="text-xl font-bold">
                120 <span className="text-sm font-medium opacity-80">kWh</span>
              </p>
            </div>
            <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-sm">water_drop</span>
                <span className="text-xs font-bold uppercase opacity-70">Water</span>
              </div>
              <p className="text-xl font-bold">
                8 <span className="text-sm font-medium opacity-80">m³</span>
              </p>
            </div>
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-white/20">
            <span className="font-bold opacity-90">Base Room Rate</span>
            <span className="text-2xl font-black">{formatCurrency(room.baseRent)}</span>
          </div>
        </section>

        {/* Billing History */}
        <section>
          <div className="flex justify-between items-end px-2 mb-4">
            <h3 className="text-xl font-extrabold tracking-tight">Billing History</h3>
            <span className="text-primary font-bold text-sm">View All</span>
          </div>
          <div className="space-y-3">
            {['March 2026', 'February 2026', 'January 2026'].map((month) => (
              <div
                key={month}
                className="flex items-center justify-between bg-surface-container-low p-5 rounded-2xl hover:bg-surface-container-high transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary-container">
                    <span className="material-symbols-outlined font-bold">receipt_long</span>
                  </div>
                  <div>
                    <p className="font-bold text-on-surface">{month}</p>
                    <p className="text-sm font-medium text-on-surface-variant">
                      {formatCurrency(room.baseRent)}
                    </p>
                  </div>
                </div>
                <StatusBadge status="paid" />
              </div>
            ))}
          </div>
        </section>

        {/* Action Buttons */}
        {room.tenantName && (
          <section className="space-y-3 pt-6">
            <button className="w-full h-14 rounded-2xl border-2 border-primary-container text-primary-container font-extrabold active:scale-95 duration-150">
              Send Manual Reminder
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="w-full h-14 rounded-2xl bg-error-container/10 text-error font-bold active:scale-95 duration-150"
            >
              Terminate Lease
            </button>
          </section>
        )}
      </div>

      {/* Terminate Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-error-container/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-error text-4xl">warning</span>
              </div>
              <h3 className="text-2xl font-black text-on-surface mb-3 leading-tight">
                Confirm Lease Termination?
              </h3>
              <p className="text-on-surface-variant font-medium leading-relaxed">
                This will calculate the final refund amount for{' '}
                <span className="font-bold text-on-surface">Room {room.number}</span>.
              </p>
            </div>
            <div className="p-6 pt-0 space-y-3">
              <button
                onClick={() => setShowModal(false)}
                className="w-full h-14 rounded-2xl bg-error text-white font-extrabold active:scale-95 duration-150 shadow-lg shadow-error/20"
              >
                Confirm Termination
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="w-full h-14 rounded-2xl bg-surface-container-high text-on-surface font-bold active:scale-95 duration-150"
              >
                Keep Lease
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
