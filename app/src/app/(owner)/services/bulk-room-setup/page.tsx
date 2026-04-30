'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/utils/currency';
import PageHeader from '@/components/layout/PageHeader';
import { useLanguage } from '@/hooks/useLanguage';
import { useRepositories } from '@/hooks/useRepositories';

const FLOORS = [1, 2, 3, 4];
const ROOMS_PER_FLOOR = 12;

function buildRoomsOnFloor(floor: number): number[] {
  const start = floor * 100 + 1;
  return Array.from({ length: ROOMS_PER_FLOOR }, (_, index) => start + index);
}

export default function BulkRoomSetupPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const { roomRepository, settingsRepository } = useRepositories();
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [selectedRooms, setSelectedRooms] = useState<number[]>(() =>
    buildRoomsOnFloor(1).slice(0, 10)
  );
  const activeAdditionalChargeRules = useMemo(
    () => {
      const result = settingsRepository.loadActiveAdditionalChargeRules();
      return result.ok ? result.value : [];
    },
    [settingsRepository]
  );
  const [selectedChargeRuleIds, setSelectedChargeRuleIds] = useState<string[]>(
    () => activeAdditionalChargeRules.map((rule) => rule.id)
  );
  const [baseRentInput, setBaseRentInput] = useState('5000');
  const [baseRentFeedback, setBaseRentFeedback] = useState<string | null>(null);
  const [chargeFeedback, setChargeFeedback] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const text =
    language === 'th'
      ? {
          roomsSelected: 'ห้องที่เลือก',
          baseRentLabel: 'ค่าเช่าพื้นฐาน (บาท)',
          baseRentPlaceholder: '5000',
          baseRentInvalid: 'กรุณากรอกค่าเช่าพื้นฐานที่มากกว่า 0',
          applyBaseRent: 'ปรับค่าเช่าพื้นฐาน',
          additionalChargeRules: 'กฎค่าบริการเพิ่มเติม',
          selected: 'เลือก',
          noActiveRules:
            'ยังไม่มีกฎค่าบริการเพิ่มเติมที่เปิดใช้งาน กรุณาเพิ่มจากหน้าตั้งค่าก่อน',
          perRoom: '/ห้อง',
          selectAll: 'เลือกทั้งหมด',
          clearSelection: 'ล้างรายการที่เลือก',
          selectedAdditionalCharges: 'ค่าบริการเพิ่มเติมที่เลือก',
          perOccupiedRoom: 'ต่อห้องที่มีผู้พัก',
          applyRulesToSelected: 'ใช้กฎค่าบริการกับห้องที่เลือก',
          resetToGlobal: 'รีเซ็ตห้องที่เลือกให้ใช้กฎส่วนกลาง',
          title: 'ตั้งค่าห้องแบบกลุ่ม',
          selectFloor: 'เลือกชั้น',
          floor: 'ชั้น',
          selectRooms: 'เลือกห้อง',
          deselectAll: 'ยกเลิกเลือกทั้งหมด',
          applyBaseRentFeedback: 'ตั้งค่า {{amount}} ให้ {{count}} ห้อง ที่ชั้น {{floor}} แล้ว',
          applyNoChargesFeedback: 'ลบค่าบริการเพิ่มเติมออกจาก {{count}} ห้อง ที่ชั้น {{floor}} แล้ว',
          applyChargeRulesFeedback:
            'ใช้กฎค่าบริการ {{ruleCount}} รายการกับ {{count}} ห้อง ที่ชั้น {{floor}} แล้ว',
          resetGlobalFeedback: 'รีเซ็ต {{count}} ห้องให้ใช้กฎค่าบริการส่วนกลางแล้ว',
        }
      : {
          roomsSelected: 'Rooms Selected',
          baseRentLabel: 'Base Rent (THB)',
          baseRentPlaceholder: '5000',
          baseRentInvalid: 'Please enter a valid base rent amount greater than 0.',
          applyBaseRent: 'Apply Base Rent',
          additionalChargeRules: 'Additional Charge Rules',
          selected: 'selected',
          noActiveRules:
            'No active additional charge rules found. Add rules in Property Settings first.',
          perRoom: '/room',
          selectAll: 'Select All',
          clearSelection: 'Clear Selection',
          selectedAdditionalCharges: 'Selected additional charges',
          perOccupiedRoom: 'per occupied room',
          applyRulesToSelected: 'Apply Charge Rules to Selected Rooms',
          resetToGlobal: 'Reset Selected Rooms to Global Rules',
          title: 'Bulk Room Setup',
          selectFloor: 'Select Floor',
          floor: 'Floor',
          selectRooms: 'Select Rooms',
          deselectAll: 'Deselect All',
          applyBaseRentFeedback: 'Applied {{amount}} to {{count}} room(s) on Floor {{floor}}.',
          applyNoChargesFeedback:
            'Applied no additional charges to {{count}} room(s) on Floor {{floor}}.',
          applyChargeRulesFeedback:
            'Applied {{ruleCount}} charge rule(s) to {{count}} room(s) on Floor {{floor}}.',
          resetGlobalFeedback:
            'Reset {{count}} room(s) to use global additional charge rules.',
        };

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
    setActionError(null);
  };

  const handleFloorSelect = (floor: number) => {
    setSelectedFloor(floor);
    setSelectedRooms(buildRoomsOnFloor(floor).slice(0, 10));
    setBaseRentFeedback(null);
    setChargeFeedback(null);
    setActionError(null);
  };

  const handleApplyBaseRent = async () => {
    if (!isBaseRentValid || selectedRooms.length === 0) return;

    const result = await roomRepository.applyBulkBaseRentOverrides(
      selectedRooms,
      parsedBaseRent
    );

    if (!result.ok) {
      setActionError(result.error.message);
      return;
    }

    setActionError(null);
    setBaseRentFeedback(
      text.applyBaseRentFeedback
        .replace('{{amount}}', formatCurrency(parsedBaseRent))
        .replace('{{count}}', selectedRooms.length.toString())
        .replace('{{floor}}', selectedFloor.toString())
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
    setActionError(null);
  };

  const handleSelectAllChargeRules = () => {
    setSelectedChargeRuleIds(activeAdditionalChargeRules.map((rule) => rule.id));
    setChargeFeedback(null);
    setActionError(null);
  };

  const handleClearChargeRules = () => {
    setSelectedChargeRuleIds([]);
    setChargeFeedback(null);
    setActionError(null);
  };

  const handleApplyChargeRules = async () => {
    if (selectedRooms.length === 0) {
      return;
    }

    if (!hasActiveAdditionalChargeRules && selectedChargeRuleIds.length === 0) {
      return;
    }

    const result = await roomRepository.applyBulkRoomAdditionalChargeRuleIds(
      selectedRooms,
      selectedChargeRuleIds
    );

    if (!result.ok) {
      setActionError(result.error.message);
      return;
    }

    setActionError(null);

    if (selectedChargeRuleIds.length === 0) {
      setChargeFeedback(
        text.applyNoChargesFeedback
          .replace('{{count}}', selectedRooms.length.toString())
          .replace('{{floor}}', selectedFloor.toString())
      );
    } else {
      setChargeFeedback(
        text.applyChargeRulesFeedback
          .replace('{{ruleCount}}', selectedChargeRuleIds.length.toString())
          .replace('{{count}}', selectedRooms.length.toString())
          .replace('{{floor}}', selectedFloor.toString())
      );
    }

    setBaseRentFeedback(null);
  };

  const handleResetChargeOverridesToGlobal = async () => {
    if (selectedRooms.length === 0) {
      return;
    }

    const result = await roomRepository.resetBulkRoomAdditionalChargeOverrides(
      selectedRooms
    );

    if (!result.ok) {
      setActionError(result.error.message);
      return;
    }

    setActionError(null);
    setChargeFeedback(
      text.resetGlobalFeedback.replace('{{count}}', selectedRooms.length.toString())
    );
    setBaseRentFeedback(null);
  };

  const actionFormContent = (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold font-headline text-on-surface">
          {selectedRooms.length} {text.roomsSelected}
        </h2>
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
          <label className="text-sm font-bold text-on-surface-variant mb-2 ml-1">{text.baseRentLabel}</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-on-surface-variant font-medium">฿</span>
            <input
              className="w-full h-14 pl-10 pr-4 rounded-xl bg-surface-container-low border-none text-on-surface text-lg font-semibold focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-colors"
              type="text"
              inputMode="numeric"
              value={baseRentInput}
              onChange={(e) => handleBaseRentChange(e.target.value)}
              placeholder={text.baseRentPlaceholder}
            />
          </div>
          {!isBaseRentValid && (
            <p className="mt-2 text-sm font-medium text-error">
              {text.baseRentInvalid}
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
          {text.applyBaseRent}
        </button>
      </div>

      <div className="border-t border-surface-container pt-6 space-y-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-bold text-on-surface">{text.additionalChargeRules}</h3>
          <span className="text-xs font-bold text-on-surface-variant bg-surface-container-low px-2 py-1 rounded-lg">
            {selectedChargeRuleIds.length}/{activeAdditionalChargeRules.length} {text.selected}
          </span>
        </div>

        {!hasActiveAdditionalChargeRules ? (
          <div className="rounded-xl bg-surface-container-low p-4 text-sm font-medium text-on-surface-variant text-center">
            {text.noActiveRules}
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
                      {formatCurrency(Math.round(rule.amount))}{text.perRoom}
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
                {text.selectAll}
              </button>
              <button
                onClick={handleClearChargeRules}
                className="h-10 px-3 rounded-lg text-xs font-bold border border-outline-variant text-on-surface-variant hover:bg-surface-container-low transition-all active:scale-95"
              >
                {text.clearSelection}
              </button>
            </div>

            <p className="text-xs font-medium text-on-surface-variant">
              {text.selectedAdditionalCharges}: {formatCurrency(Math.round(selectedChargeTotal))}{' '}
              {text.perOccupiedRoom}
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
          {text.applyRulesToSelected}
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
          {text.resetToGlobal}
        </button>

        {chargeFeedback && (
          <p className="text-sm font-medium text-secondary">{chargeFeedback}</p>
        )}

        {actionError && (
          <p className="text-sm font-medium text-error">{actionError}</p>
        )}
      </div>
    </>
  );

  return (
    <div className="flex flex-col min-h-screen bg-surface pb-32 lg:pb-8">
      <PageHeader
        title={text.title}
        onBack={() => router.back()}
        rightAction={
          <button className="p-2 rounded-full hover:bg-slate-100 transition-colors">
            <span className="material-symbols-outlined text-slate-500">help_outline</span>
          </button>
        }
      />

      {/* Main Content Area */}
      <main className="grow flex flex-col pt-4 pb-85 px-4 md:px-0 lg:px-8 xl:px-12 md:pb-8">
        {/* Floor Selector */}
        <div className="mb-8">
          <h2 className="text-lg font-bold font-headline mb-4 text-on-surface">{text.selectFloor}</h2>
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
                {text.floor} {floor}
              </button>
            ))}
          </div>
        </div>

        {/* Selection Grid */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold font-headline text-on-surface">{text.selectRooms}</h2>
            <button onClick={handleSelectAll} className="text-primary font-bold text-sm hover:underline">
              {selectedRooms.length === allRoomsOnFloor.length ? text.deselectAll : text.selectAll}
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
