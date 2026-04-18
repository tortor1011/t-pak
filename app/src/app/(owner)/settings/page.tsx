'use client';

import { useMemo, useState } from 'react';
import {
  loadPropertySettings,
  savePropertySettings,
  type PropertySettingsValues,
} from '@/services/propertySettings';

interface SettingsFormState {
  electricityRate: string;
  waterRate: string;
  lateFee: string;
  lateFeeDay: string;
}

function normalizeNumericInput(value: string, allowDecimal: boolean): string {
  const sanitized = allowDecimal
    ? value.replace(/[^\d.]/g, '')
    : value.replace(/[^\d]/g, '');

  if (!allowDecimal) {
    return sanitized;
  }

  const [whole, ...decimals] = sanitized.split('.');
  return decimals.length > 0 ? `${whole}.${decimals.join('')}` : whole;
}

function toFormState(values: PropertySettingsValues): SettingsFormState {
  return {
    electricityRate: values.electricityRate.toString(),
    waterRate: values.waterRate.toString(),
    lateFee: values.lateFee.toString(),
    lateFeeDay: values.lateFeeDay.toString(),
  };
}

export default function SettingsPage() {
  const initialSettings = useMemo<PropertySettingsValues>(() => {
    const loaded = loadPropertySettings();

    return {
      electricityRate: loaded.electricityRate,
      waterRate: loaded.waterRate,
      lateFee: loaded.lateFee,
      lateFeeDay: loaded.lateFeeDay,
    };
  }, []);

  const [savedSettings, setSavedSettings] =
    useState<PropertySettingsValues>(initialSettings);
  const [form, setForm] = useState<SettingsFormState>(() =>
    toFormState(initialSettings)
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const parsedValues = useMemo<PropertySettingsValues | null>(() => {
    const electricityRate = Number.parseFloat(form.electricityRate);
    const waterRate = Number.parseFloat(form.waterRate);
    const lateFee = Number.parseFloat(form.lateFee);
    const lateFeeDay = Number.parseInt(form.lateFeeDay, 10);

    if (
      !Number.isFinite(electricityRate) ||
      !Number.isFinite(waterRate) ||
      !Number.isFinite(lateFee) ||
      !Number.isFinite(lateFeeDay)
    ) {
      return null;
    }

    return {
      electricityRate,
      waterRate,
      lateFee,
      lateFeeDay,
    };
  }, [form]);

  const validationError = useMemo(() => {
    if (!parsedValues) {
      return 'Please fill all fields with numeric values.';
    }

    if (parsedValues.electricityRate <= 0) {
      return 'Electricity rate must be greater than 0.';
    }

    if (parsedValues.waterRate <= 0) {
      return 'Water rate must be greater than 0.';
    }

    if (parsedValues.lateFee <= 0) {
      return 'Late fee must be greater than 0.';
    }

    if (!Number.isInteger(parsedValues.lateFeeDay) || parsedValues.lateFeeDay < 0) {
      return 'Grace period must be a whole number that is 0 or greater.';
    }

    return null;
  }, [parsedValues]);

  const hasUnsavedChanges = useMemo(() => {
    if (!parsedValues) {
      return true;
    }

    return (
      parsedValues.electricityRate !== savedSettings.electricityRate ||
      parsedValues.waterRate !== savedSettings.waterRate ||
      parsedValues.lateFee !== savedSettings.lateFee ||
      parsedValues.lateFeeDay !== savedSettings.lateFeeDay
    );
  }, [parsedValues, savedSettings]);

  const canSave = !isSaving && !validationError && hasUnsavedChanges;

  const handleValueChange = (
    field: keyof SettingsFormState,
    value: string,
    allowDecimal: boolean
  ) => {
    const normalized = normalizeNumericInput(value, allowDecimal);

    setForm((prev) => ({
      ...prev,
      [field]: normalized,
    }));

    setSaveError(null);
    setSaveFeedback(null);
  };

  const handleSave = async () => {
    if (isSaving) return;

    if (validationError || !parsedValues) {
      setSaveError(validationError ?? 'Please check the form values.');
      return;
    }

    if (!hasUnsavedChanges) {
      setSaveFeedback('No changes to save.');
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setSaveFeedback(null);

    try {
      await new Promise<void>((resolve) => {
        window.setTimeout(() => resolve(), 500);
      });

      const savedSnapshot = savePropertySettings(parsedValues);

      setSavedSettings(parsedValues);
      setSaveFeedback(
        `Settings saved at ${new Date(savedSnapshot.updatedAt).toLocaleTimeString()}.`
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="px-6 py-8 space-y-8 page-transition">
      <h2 className="text-2xl font-bold tracking-tight">Property Settings</h2>

      {/* Property Info */}
      <section className="bg-surface-container-lowest rounded-2xl p-6 shadow-[0_10px_40px_rgba(18,28,40,0.03)] space-y-4">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-14 h-14 rounded-2xl btn-primary-gradient flex items-center justify-center shadow-lg">
            <span className="material-symbols-outlined text-white text-2xl">apartment</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-on-surface">Dormitory A</h3>
            <p className="text-on-surface-variant font-medium text-sm">Property Group A</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-surface-container">
          <div>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Total Rooms</p>
            <p className="text-lg font-bold text-on-surface">12</p>
          </div>
          <div>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Floors</p>
            <p className="text-lg font-bold text-on-surface">3</p>
          </div>
        </div>
      </section>

      {/* Utility Rates */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold tracking-tight">Utility Pricing Rules</h3>
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-[0_10px_40px_rgba(18,28,40,0.03)] space-y-6">
          {/* Electricity */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-on-surface mb-3">
              <span className="material-symbols-outlined text-primary text-lg">bolt</span>
              Electricity Rate (per kWh)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">
                ฿
              </span>
              <input
                className="w-full h-14 pl-10 pr-4 rounded-xl bg-surface-container-low border-none focus:ring-2 focus:ring-primary font-bold text-lg"
                type="number"
                value={form.electricityRate}
                onChange={(e) =>
                  handleValueChange('electricityRate', e.target.value, true)
                }
              />
            </div>
          </div>

          {/* Water */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-on-surface mb-3">
              <span className="material-symbols-outlined text-cyan-500 text-lg">water_drop</span>
              Water Rate (per m³)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">
                ฿
              </span>
              <input
                className="w-full h-14 pl-10 pr-4 rounded-xl bg-surface-container-low border-none focus:ring-2 focus:ring-primary font-bold text-lg"
                type="number"
                value={form.waterRate}
                onChange={(e) => handleValueChange('waterRate', e.target.value, true)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Late Fee Settings */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold tracking-tight">Late Payment Fine</h3>
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-[0_10px_40px_rgba(18,28,40,0.03)] space-y-6">
          <div>
            <label className="text-sm font-bold text-on-surface mb-3 block">
              Fine Amount (THB/day)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">
                ฿
              </span>
              <input
                className="w-full h-14 pl-10 pr-4 rounded-xl bg-surface-container-low border-none focus:ring-2 focus:ring-primary font-bold text-lg"
                type="number"
                value={form.lateFee}
                onChange={(e) => handleValueChange('lateFee', e.target.value, true)}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-bold text-on-surface mb-3 block">
              Grace Period (days after due date)
            </label>
            <input
              className="w-full h-14 px-4 rounded-xl bg-surface-container-low border-none focus:ring-2 focus:ring-primary font-bold text-lg"
              type="number"
              value={form.lateFeeDay}
              onChange={(e) => handleValueChange('lateFeeDay', e.target.value, false)}
            />
          </div>
          <div className="flex items-start space-x-2 p-3 bg-tertiary-fixed/20 rounded-xl">
            <span className="material-symbols-outlined text-tertiary text-lg mt-0.5">info</span>
            <p className="text-xs text-tertiary font-medium leading-relaxed">
              Late fee of ฿{form.lateFee || '0'}/day will be applied after {form.lateFeeDay || '0'} days past due date
            </p>
          </div>
        </div>
      </section>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={!canSave}
        className={`w-full h-14 btn-primary-gradient text-on-primary rounded-2xl font-bold text-lg shadow-[0_8px_20px_rgba(0,74,198,0.2)] transition-all flex items-center justify-center gap-3 ${
          canSave ? 'active:scale-95' : 'opacity-60 cursor-not-allowed'
        }`}
      >
        <span className="material-symbols-outlined">save</span>
        {isSaving ? 'Saving Settings...' : hasUnsavedChanges ? 'Save Settings' : 'Settings Saved'}
      </button>

      {saveError && (
        <p className="px-4 py-3 rounded-xl bg-error-container/20 text-error text-sm font-medium">
          {saveError}
        </p>
      )}

      {saveFeedback && (
        <p className="px-4 py-3 rounded-xl bg-secondary-container/30 text-secondary text-sm font-medium">
          {saveFeedback}
        </p>
      )}

      {/* App Info */}
      <div className="text-center pt-4">
        <p className="text-outline text-sm font-medium">Estate Clarity v1.0.0</p>
        <p className="text-outline text-xs mt-1">Frontend Preview — Owner App</p>
      </div>
    </div>
  );
}
