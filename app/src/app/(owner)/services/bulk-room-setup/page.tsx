'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { formatCurrency } from '@/utils/currency';
import { applyBulkBaseRentOverrides } from '@/services/roomPricingOverrides';
import { loadActiveAdditionalChargeRules } from '@/services/additionalChargeRules';
import {
  applyBulkRoomAdditionalChargeRuleIds,
  resetBulkRoomAdditionalChargeOverrides,
} from '@/services/roomAdditionalChargeOverrides';

const FLOORS = [1, 2, 3, 4];
const ROOMS_PER_FLOOR = 12;

function buildRoomsOnFloor(floor: number): number[] {
  const start = floor * 100 + 1;
  return Array.from({ length: ROOMS_PER_FLOOR }, (_, index) => start + index);
}

export default function BulkRoomSetupPage() {
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [selectedRooms, setSelectedRooms] = useState<number[]>(() =>
    buildRoomsOnFloor(1).slice(0, 10)
  );
  const activeAdditionalChargeRules = useMemo(
    () => loadActiveAdditionalChargeRules(),
    []
  );
  const [selectedChargeRuleIds, setSelectedChargeRuleIds] = useState<string[]>(
    () => activeAdditionalChargeRules.map((rule) => rule.id)
  );
  const [baseRentInput, setBaseRentInput] = useState('5000');
  const [baseRentFeedback, setBaseRentFeedback] = useState<string | null>(null);
  const [chargeFeedback, setChargeFeedback] = useState<string | null>(null);

  const allRoomsOnFloor = useMemo(
    () => buildRoomsOnFloor(selectedFloor),
    [selectedFloor]
  );

  const selectedChargeRules = useMemo(() => {
    const selectedSet = new Set(selectedChargeRuleIds);

    return activeAdditionalChargeRules.filter((rule) => selectedSet.has(rule.id));
  }, [activeAdditionalChargeRules, selectedChargeRuleIds]);

  const selectedChargeTotal = useMemo(() => {
    return selectedChargeRules.reduce((sum, rule) => sum + rule.amount, 0);
  }, [selectedChargeRules]);

  const hasActiveAdditionalChargeRules = activeAdditionalChargeRules.length > 0;

  const parsedBaseRent = Number.parseInt(baseRentInput, 10);
  const isBaseRentValid = Number.isFinite(parsedBaseRent) && parsedBaseRent > 0;

  const handleRoomToggle = (room: number) => {
    setSelectedRooms((prev) =>
      prev.includes(room) ? prev.filter((r) => r !== room) : [...prev, room]
    );
  };

  const handleSelectAll = () => {
    if (selectedRooms.length === allRoomsOnFloor.length) {
      setSelectedRooms([]);
    } else {
      setSelectedRooms([...allRoomsOnFloor]);
    }
  };

  const handleBaseRentChange = (value: string) => {
    const digitsOnly = value.replace(/[^\d]/g, '');
    setBaseRentInput(digitsOnly);
  };

  const handleFloorSelect = (floor: number) => {
    setSelectedFloor(floor);
    setSelectedRooms(buildRoomsOnFloor(floor).slice(0, 10));
    setBaseRentFeedback(null);
    setChargeFeedback(null);
  };

  const handleApplyBaseRent = () => {
    if (!isBaseRentValid || selectedRooms.length === 0) return;

    applyBulkBaseRentOverrides(selectedRooms, parsedBaseRent);
    window.dispatchEvent(new Event('estate_clarity.billing_state_updated'));
    setBaseRentFeedback(
      `Applied ${formatCurrency(parsedBaseRent)} to ${selectedRooms.length} room(s) on Floor ${selectedFloor}.`
    );
    setChargeFeedback(null);
  };

  const handleToggleChargeRule = (ruleId: string) => {
    setSelectedChargeRuleIds((prev) => {
      if (prev.includes(ruleId)) {
        return prev.filter((id) => id !== ruleId);
      }

      return [...prev, ruleId];
    });

    setChargeFeedback(null);
  };

  const handleSelectAllChargeRules = () => {
    setSelectedChargeRuleIds(activeAdditionalChargeRules.map((rule) => rule.id));
    setChargeFeedback(null);
  };

  const handleClearChargeRules = () => {
    setSelectedChargeRuleIds([]);
    setChargeFeedback(null);
  };

  const handleApplyChargeRules = () => {
    if (selectedRooms.length === 0) {
      return;
    }

    if (!hasActiveAdditionalChargeRules && selectedChargeRuleIds.length === 0) {
      return;
    }

    applyBulkRoomAdditionalChargeRuleIds(selectedRooms, selectedChargeRuleIds);
    window.dispatchEvent(new Event('estate_clarity.billing_state_updated'));

    if (selectedChargeRuleIds.length === 0) {
      setChargeFeedback(
        `Applied no additional charges to ${selectedRooms.length} room(s) on Floor ${selectedFloor}.`
      );
    } else {
      setChargeFeedback(
        `Applied ${selectedChargeRuleIds.length} charge rule(s) to ${selectedRooms.length} room(s) on Floor ${selectedFloor}.`
      );
    }

    setBaseRentFeedback(null);
  };

  const handleResetChargeOverridesToGlobal = () => {
    if (selectedRooms.length === 0) {
      return;
    }

    resetBulkRoomAdditionalChargeOverrides(selectedRooms);
    window.dispatchEvent(new Event('estate_clarity.billing_state_updated'));
    setChargeFeedback(
      `Reset ${selectedRooms.length} room(s) to use global additional charge rules.`
    );
    setBaseRentFeedback(null);
  };

  const actionFormContent = (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold font-headline text-on-surface">{selectedRooms.length} Rooms Selected</h2>
        <button
          onClick={() => setSelectedRooms([])}
          className="text-on-surface-variant p-2 rounded-full hover:bg-surface-container-low"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      <div className="space-y-5 mb-8">
        {/* Base Rent Input */}
        <div className="flex flex-col">
          <label className="text-sm font-bold text-on-surface-variant mb-2 ml-1">Base Rent (THB)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-on-surface-variant font-medium">฿</span>
            <input
              className="w-full h-14 pl-10 pr-4 rounded-xl bg-surface-container-low border-none text-on-surface text-lg font-semibold focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-colors"
              type="text"
              inputMode="numeric"
              value={baseRentInput}
              onChange={(e) => handleBaseRentChange(e.target.value)}
              placeholder="5000"
            />
          </div>
          {!isBaseRentValid && (
            <p className="mt-2 text-sm font-medium text-error">
              Please enter a valid base rent amount greater than 0.
            </p>
          )}
          {baseRentFeedback && (
            <p className="mt-2 text-sm font-medium text-secondary">
              {baseRentFeedback}
            </p>
          )}
        </div>

        <button
          onClick={handleApplyBaseRent}
          disabled={!isBaseRentValid}
          className={`w-full h-14 rounded-xl bg-linear-to-b from-primary to-primary-container text-on-primary font-bold text-lg flex items-center justify-center shadow-lg shadow-primary/20 transition-all ${
            isBaseRentValid
              ? 'hover:opacity-90 active:scale-[0.98]'
              : 'opacity-50 cursor-not-allowed'
          }`}
        >
          Apply Base Rent
        </button>
      </div>

      <div className="border-t border-surface-container pt-6 space-y-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-bold text-on-surface">Additional Charge Rules</h3>
          <span className="text-xs font-bold text-on-surface-variant bg-surface-container-low px-2 py-1 rounded-lg">
            {selectedChargeRuleIds.length}/{activeAdditionalChargeRules.length} selected
          </span>
        </div>

        {!hasActiveAdditionalChargeRules ? (
          <div className="rounded-xl bg-surface-container-low p-4 text-sm font-medium text-on-surface-variant text-center">
            No active additional charge rules found. Add rules in Property Settings first.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeAdditionalChargeRules.map((rule) => {
                const isSelected = selectedChargeRuleIds.includes(rule.id);

                return (
                  <button
                    key={rule.id}
                    onClick={() => handleToggleChargeRule(rule.id)}
                    className={`rounded-xl border p-3 text-left transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-outline-variant bg-surface-container-lowest hover:bg-surface-container-low'
                    }`}
                  >
                    <p className="text-sm font-bold text-on-surface">{rule.name}</p>
                    <p className="text-xs font-medium text-on-surface-variant">
                      {formatCurrency(Math.round(rule.amount))}/room
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleSelectAllChargeRules}
                className="h-10 px-3 rounded-lg text-xs font-bold border border-outline-variant text-on-surface hover:bg-surface-container-low transition-all active:scale-95"
              >
                Select All
              </button>
              <button
                onClick={handleClearChargeRules}
                className="h-10 px-3 rounded-lg text-xs font-bold border border-outline-variant text-on-surface-variant hover:bg-surface-container-low transition-all active:scale-95"
              >
                Clear Selection
              </button>
            </div>

            <p className="text-xs font-medium text-on-surface-variant">
              Selected additional charges: {formatCurrency(Math.round(selectedChargeTotal))} per occupied room
            </p>
          </>
        )}

        <button
          onClick={handleApplyChargeRules}
          disabled={selectedRooms.length === 0 || (!hasActiveAdditionalChargeRules && selectedChargeRuleIds.length === 0)}
          className={`w-full h-12 rounded-xl bg-secondary text-on-secondary font-bold text-sm flex items-center justify-center transition-all ${
            selectedRooms.length === 0 || (!hasActiveAdditionalChargeRules && selectedChargeRuleIds.length === 0)
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:opacity-90 active:scale-[0.98]'
          }`}
        >
          Apply Charge Rules to Selected Rooms
        </button>

        <button
          onClick={handleResetChargeOverridesToGlobal}
          disabled={selectedRooms.length === 0}
          className={`w-full h-12 rounded-xl border border-outline-variant text-on-surface font-bold text-sm flex items-center justify-center transition-all ${
            selectedRooms.length === 0
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-surface-container-low active:scale-[0.98]'
          }`}
        >
          Reset Selected Rooms to Global Rules
        </button>

        {chargeFeedback && (
          <p className="text-sm font-medium text-secondary">{chargeFeedback}</p>
        )}
      </div>
    </>
  );

  return (
    <div className="flex flex-col min-h-screen bg-surface md:bg-transparent">
      {/* TopAppBar for mobile */}
      <header className="md:hidden bg-white dark:bg-slate-900 shadow-[0_20px_50px_rgba(18,28,40,0.05)] docked full-width top-0 z-10 flex justify-between items-center w-full px-6 py-4">
        <Link href="/services" className="text-blue-600 dark:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors p-2 rounded-full flex items-center justify-center">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>arrow_back</span>
        </Link>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50 font-headline">Bulk Room Setup</h1>
        <button className="text-blue-600 dark:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors p-2 rounded-full flex items-center justify-center">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>help_outline</span>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="grow flex flex-col pt-4 pb-85 px-4 md:px-0 lg:px-8 xl:px-12 md:pb-8">
        <div className="hidden md:flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold tracking-tight">Bulk Room Setup</h2>
        </div>

        {/* Floor Selector */}
        <div className="mb-8">
          <h2 className="text-lg font-bold font-headline mb-4 text-on-surface">Select Floor</h2>
          <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
            {FLOORS.map((floor) => (
              <button
                key={floor}
                onClick={() => handleFloorSelect(floor)}
                className={`shrink-0 px-6 py-3 rounded-xl font-bold text-base transition-colors ${
                  selectedFloor === floor
                    ? 'bg-primary text-on-primary shadow-[0_4px_14px_rgba(0,74,198,0.2)]'
                    : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-dim'
                }`}
              >
                Floor {floor}
              </button>
            ))}
          </div>
        </div>

        {/* Selection Grid */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold font-headline text-on-surface">Select Rooms</h2>
            <button onClick={handleSelectAll} className="text-primary font-bold text-sm hover:underline">
              {selectedRooms.length === allRoomsOnFloor.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {allRoomsOnFloor.map((room) => {
              const isSelected = selectedRooms.includes(room);
              return (
                <button
                  key={room}
                  onClick={() => handleRoomToggle(room)}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center relative transition-colors ${
                    isSelected
                      ? 'bg-primary-container text-on-primary-container shadow-sm border-2 border-primary'
                      : 'bg-surface-container-lowest text-on-surface border-2 border-outline-variant border-opacity-30 hover:bg-surface-container-low'
                  }`}
                >
                  <span className="font-bold text-lg">{room}</span>
                  {isSelected && (
                    <span className="material-symbols-outlined absolute top-2 right-2 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                      check_circle
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Desktop Action Form */}
        {selectedRooms.length > 0 && (
          <section className="hidden md:block mt-8">
            <div className="bg-surface-container-lowest rounded-2xl shadow-[0_20px_50px_rgba(18,28,40,0.05)] border border-surface-container-low p-6 lg:p-8 max-w-4xl">
              {actionFormContent}
            </div>
          </section>
        )}
      </main>

      {/* Mobile Bottom Sheet for Bulk Actions */}
      {selectedRooms.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-surface-container-lowest rounded-t-2xl shadow-[0_-20px_50px_rgba(18,28,40,0.1)] z-20 px-6 pt-6 pb-8 border-t border-surface-container-low md:hidden">
          {/* Drag Handle Indicator */}
          <div className="w-12 h-1.5 bg-outline-variant rounded-full mx-auto mb-6 opacity-50"></div>

          <div className="max-w-4xl mx-auto">{actionFormContent}</div>
        </div>
      )}
    </div>
  );
}
