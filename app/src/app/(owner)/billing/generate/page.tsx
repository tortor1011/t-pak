'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { MOCK_ROOMS } from '@/services/mockData';
import { applyRoomPricingOverrides } from '@/services/roomPricingOverrides';
import {
  buildRoomAdditionalChargeContext,
  calculateAdditionalChargeForRoomNumber,
} from '@/services/additionalChargeRules';
import { formatCurrency } from '@/utils/currency';
import PageHeader from '@/components/layout/PageHeader';

export default function GenerateBillsPage() {
  const router = useRouter();
  const rooms = useMemo(() => applyRoomPricingOverrides(MOCK_ROOMS), []);
  const additionalChargeContext = useMemo(
    () => buildRoomAdditionalChargeContext(),
    []
  );
  const activeAdditionalChargeRuleCount = additionalChargeContext.activeRuleIds.length;
  const unbilledRooms = useMemo(
    () => rooms.filter((r) => r.occupancy === 'occupied'),
    [rooms]
  );
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(unbilledRooms.map((r) => r.id))
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationFeedback, setGenerationFeedback] = useState<string | null>(null);

  const toggleRoom = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === unbilledRooms.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(unbilledRooms.map((r) => r.id)));
    }
  };

  const revenueBreakdown = useMemo(() => {
    return unbilledRooms
      .filter((room) => selectedIds.has(room.id))
      .reduce(
        (acc, room) => {
          const roomAdditionalCharge = calculateAdditionalChargeForRoomNumber(
            room.number,
            additionalChargeContext
          );

          acc.baseRevenue += room.baseRent;
          acc.additionalRevenue += roomAdditionalCharge;

          return acc;
        },
        {
          baseRevenue: 0,
          additionalRevenue: 0,
        }
      );
  }, [additionalChargeContext, selectedIds, unbilledRooms]);

  const estimatedRevenue = revenueBreakdown.baseRevenue + revenueBreakdown.additionalRevenue;

  const selectedRooms = useMemo(
    () => unbilledRooms.filter((room) => selectedIds.has(room.id)),
    [selectedIds, unbilledRooms]
  );

  const handleGenerateBills = async () => {
    if (isGenerating || selectedRooms.length === 0) return;

    setIsGenerating(true);
    setGenerationFeedback(null);

    try {
      await new Promise<void>((resolve) => {
        window.setTimeout(() => resolve(), 500);
      });

      setGenerationFeedback(
        `Generated ${selectedRooms.length} invoice(s) totaling ${formatCurrency(estimatedRevenue)}${
          revenueBreakdown.additionalRevenue > 0
            ? ` (including ${formatCurrency(revenueBreakdown.additionalRevenue)} additional charges).`
            : '.'
        }`
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface pb-32 lg:pb-8">
      <PageHeader
        title="Generate Bills"
        onBack={() => router.back()}
        rightAction={
          <span className="material-symbols-outlined text-slate-400">more_vert</span>
        }
      />

      <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-4xl mx-auto space-y-8 page-transition">
        {/* Summary Card */}
        <section className="bg-surface-container-lowest rounded-3xl p-8 shadow-[0_20px_50px_rgba(18,28,40,0.05)] space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-on-surface-variant font-semibold text-sm uppercase tracking-wider mb-1">
                Total Pending
              </p>
              <h2 className="text-4xl font-extrabold text-on-surface tracking-tight">
                {selectedIds.size}{' '}
                <span className="text-xl font-medium text-slate-400">Rooms</span>
              </h2>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-2xl">
                pending_actions
              </span>
            </div>
          </div>
          <div className="pt-4 space-y-1">
            <p className="text-on-surface-variant text-sm font-medium">Estimated Revenue</p>
            <p className="text-2xl font-bold text-on-surface">
              {formatCurrency(estimatedRevenue)}
            </p>
            {activeAdditionalChargeRuleCount > 0 && (
              <p className="text-xs font-medium text-on-surface-variant">
                Includes {formatCurrency(revenueBreakdown.additionalRevenue)} additional charges
                from {activeAdditionalChargeRuleCount} active rule
                {activeAdditionalChargeRuleCount === 1 ? '' : 's'}.
              </p>
            )}
          </div>
        </section>

        {/* Primary Action */}
        <section className="space-y-4">
          <button
            onClick={handleGenerateBills}
            disabled={isGenerating || selectedRooms.length === 0}
            className={`w-full h-16 btn-primary-gradient text-on-primary rounded-2xl font-bold text-lg shadow-lg transition-all duration-200 flex items-center justify-center gap-3 ${
              isGenerating || selectedRooms.length === 0
                ? 'opacity-50 cursor-not-allowed'
                : 'active:scale-95'
            }`}
          >
            <span>{isGenerating ? 'Generating Invoices...' : 'Generate & Send All Invoices'}</span>
          </button>
          <p className="text-center text-on-surface-variant text-sm px-4 leading-relaxed">
            Automatically calculates utilities and notifies tenants via SMS and Email.
          </p>
          {generationFeedback && (
            <p className="text-center text-sm font-medium text-secondary">
              {generationFeedback}
            </p>
          )}
        </section>

        {/* Room List */}
        <div className="flex justify-between items-center px-2">
          <h3 className="text-lg font-bold text-on-surface">Select Rooms</h3>
          <button
            onClick={toggleAll}
            disabled={isGenerating}
            className={`text-primary font-bold text-sm transition-opacity ${
              isGenerating ? 'opacity-40 cursor-not-allowed' : 'hover:opacity-80'
            }`}
          >
            {selectedIds.size === unbilledRooms.length ? 'Deselect All' : `Select All (${unbilledRooms.length})`}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {unbilledRooms.map((room) => {
            const selected = selectedIds.has(room.id);
            const roomAdditionalCharge = calculateAdditionalChargeForRoomNumber(
              room.number,
              additionalChargeContext
            );

            return (
              <div
                key={room.id}
                onClick={() => !isGenerating && toggleRoom(room.id)}
                className={`bg-surface-container-lowest rounded-3xl p-5 flex items-center gap-5 transition-all ${
                  isGenerating
                    ? 'opacity-60 cursor-not-allowed'
                    : 'hover:bg-surface-container-low cursor-pointer'
                }`}
              >
                <div className="shrink-0">
                  <div
                    className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-colors ${
                      selected
                        ? 'border-primary bg-primary'
                        : 'border-outline-variant bg-transparent'
                    }`}
                  >
                    {selected && (
                      <span className="material-symbols-outlined text-on-primary text-xl font-bold">
                        check
                      </span>
                    )}
                  </div>
                </div>
                <div className="grow">
                  <h4 className="text-lg font-bold text-on-surface">Room {room.number}</h4>
                  <p className="text-on-surface-variant text-sm font-medium">
                    {room.tenantName ?? 'Vacant'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-base font-bold text-on-surface">
                    {formatCurrency(room.baseRent + roomAdditionalCharge)}
                  </p>
                  {roomAdditionalCharge > 0 && (
                    <p className="text-[10px] font-medium text-on-surface-variant">
                      Base {formatCurrency(room.baseRent)} + Extra {formatCurrency(roomAdditionalCharge)}
                    </p>
                  )}
                  <span className="inline-block px-2 py-0.5 rounded-sm bg-surface-container text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter mt-1">
                    Meter: Apr 01
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
