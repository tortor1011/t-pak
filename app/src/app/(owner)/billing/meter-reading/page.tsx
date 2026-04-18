'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MOCK_METER_READINGS } from '@/services/mockData';
import {
  loadMeterReadingDrafts,
  parseReadingInput,
  saveMeterReadingDrafts,
  type MeterReadingDraftMap,
} from '@/services/meterReadingDrafts';
import PageHeader from '@/components/layout/PageHeader';

interface ValidationResult {
  incompleteCount: number;
  error: string | null;
}

function validateMeterReadings(readings: MeterReadingDraftMap): ValidationResult {
  let incompleteCount = 0;

  for (const room of MOCK_METER_READINGS) {
    const roomReading = readings[room.roomId];
    const electricText = roomReading?.electric ?? '';
    const waterText = roomReading?.water ?? '';

    if (electricText.trim() === '' || waterText.trim() === '') {
      incompleteCount += 1;
      continue;
    }

    const electric = parseReadingInput(electricText);
    const water = parseReadingInput(waterText);

    if (electric === null || water === null) {
      return {
        incompleteCount,
        error: `Room ${room.roomNumber} has an invalid meter value.`,
      };
    }

    if (electric < room.electricity.previous) {
      return {
        incompleteCount,
        error: `Room ${room.roomNumber} electricity reading must be greater than or equal to the previous value.`,
      };
    }

    if (water < room.water.previous) {
      return {
        incompleteCount,
        error: `Room ${room.roomNumber} water reading must be greater than or equal to the previous value.`,
      };
    }
  }

  return {
    incompleteCount,
    error: null,
  };
}

export default function MeterReadingPage() {
  const router = useRouter();

  const [readings, setReadings] = useState<MeterReadingDraftMap>(() =>
    loadMeterReadingDrafts(MOCK_METER_READINGS)
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleReadingChange = (roomId: string, field: 'electric' | 'water', value: string) => {
    const sanitized = value.replace(/[^\d.]/g, '');
    const [whole, ...decimals] = sanitized.split('.');
    const normalized = decimals.length > 0 ? `${whole}.${decimals.join('')}` : whole;

    setReadings((prev) => ({
      ...prev,
      [roomId]: {
        ...prev[roomId],
        [field]: normalized,
      },
    }));

    setSaveError(null);
    setSaveFeedback(null);
  };

  const validation = validateMeterReadings(readings);

  const canSave = !isSaving && validation.incompleteCount === 0 && !validation.error;

  const handleSave = async () => {
    if (isSaving) return;

    if (validation.error) {
      setSaveError(validation.error);
      return;
    }

    if (validation.incompleteCount > 0) {
      setSaveError(
        `Please complete all readings before saving. ${validation.incompleteCount} room(s) still missing values.`
      );
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setSaveFeedback(null);

    try {
      await new Promise<void>((resolve) => {
        window.setTimeout(() => resolve(), 500);
      });

      saveMeterReadingDrafts(readings);
      setSaveFeedback(`Saved meter readings for ${MOCK_METER_READINGS.length} room(s).`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <PageHeader
        title="จดค่าน้ำ-ค่าไฟ"
        onBack={() => router.back()}
        rightAction={
          <button className="p-2 rounded-full hover:bg-slate-100 transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-500">history</span>
          </button>
        }
      />

      <div className="flex-grow flex flex-col pb-32 lg:pb-8 page-transition">
        <section className="px-4 sm:px-6 lg:px-8 mt-4 max-w-6xl mx-auto w-full">
          {saveError && (
            <p className="mb-4 px-4 py-3 rounded-xl bg-error-container/20 text-error text-sm font-medium">
              {saveError}
            </p>
          )}

          {saveFeedback && (
            <p className="mb-4 px-4 py-3 rounded-xl bg-secondary-container/30 text-secondary text-sm font-medium">
              {saveFeedback}
            </p>
          )}

          <div className="bg-white rounded-2xl shadow-sm border border-outline-variant overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 border-b border-outline-variant text-sm text-on-surface-variant whitespace-nowrap">
                  <th className="py-4 px-4 font-semibold w-24">ห้อง</th>
                  <th className="py-4 px-4 font-semibold text-right">ค่าไฟเดือนก่อน</th>
                  <th className="py-4 px-4 font-semibold">ค่าไฟเดือนนี้</th>
                  <th className="py-4 px-4 font-semibold text-right">ค่าน้ำเดือนก่อน</th>
                  <th className="py-4 px-4 font-semibold">ค่าน้ำเดือนนี้</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_METER_READINGS.map((room) => (
                  <tr key={room.roomId} className="border-b border-outline-variant/30 hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-lg text-on-surface">
                        {room.roomNumber}
                      </div>
                    </td>
                    
                    {/* Electricity */}
                    <td className="py-3 px-4 text-right text-on-surface-variant font-medium">
                      {room.electricity.previous.toLocaleString(undefined, { minimumFractionDigits: 1 })}
                    </td>
                    <td className="py-3 px-4">
                      <input
                        className="w-32 bg-blue-50/50 border border-primary/30 rounded-lg px-3 py-2 text-lg font-bold focus:ring-2 focus:ring-primary/20 transition-all text-on-surface placeholder:text-outline-variant focus:outline-none"
                        placeholder="0.0"
                        step="0.1"
                        type="number"
                        value={readings[room.roomId]?.electric || ''}
                        onChange={(e) => handleReadingChange(room.roomId, 'electric', e.target.value)}
                      />
                    </td>

                    {/* Water */}
                    <td className="py-3 px-4 text-right text-on-surface-variant font-medium">
                      {room.water.previous.toLocaleString(undefined, { minimumFractionDigits: 1 })}
                    </td>
                    <td className="py-3 px-4">
                      <input
                        className="w-32 bg-blue-50/50 border border-primary/30 rounded-lg px-3 py-2 text-lg font-bold focus:ring-2 focus:ring-primary/20 transition-all text-on-surface placeholder:text-outline-variant focus:outline-none"
                        placeholder="0.0"
                        step="0.1"
                        type="number"
                        value={readings[room.roomId]?.water || ''}
                        onChange={(e) => handleReadingChange(room.roomId, 'water', e.target.value)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Footer Action */}
      <div className="fixed bottom-0 left-0 lg:left-72 w-full lg:w-[calc(100%-18rem)] p-6 pb-10 lg:pb-6 bg-gradient-to-t from-surface via-surface to-transparent z-40 pointer-events-none">
        <button
          onClick={handleSave}
          disabled={!canSave}
          className={`w-full max-w-2xl mx-auto h-16 btn-primary-gradient text-on-primary rounded-2xl font-bold text-lg shadow-[0_20px_50px_rgba(18,28,40,0.15)] transition-all flex items-center justify-center gap-3 pointer-events-auto ${
            canSave ? 'active:scale-95' : 'opacity-60 cursor-not-allowed'
          }`}
        >
          <span className="material-symbols-outlined">save</span>
          {isSaving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
        </button>
      </div>
    </div>
  );
}
