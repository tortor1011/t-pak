'use client';

import { useMemo, useState } from 'react';
import {
  ADDITIONAL_CHARGE_NAME_MAX_LENGTH,
  ADDITIONAL_CHARGE_RULE_LIMIT,
  type AdditionalChargeRule,
  loadPropertySettings,
  savePropertySettings,
  type PropertySettingsValues,
} from '@/services/propertySettings';
import { formatCurrency } from '@/utils/currency';

interface AdditionalChargeRuleFormItem {
  id: string;
  name: string;
  amount: string;
  isActive: boolean;
}

interface SettingsFormState {
  electricityRate: string;
  waterRate: string;
  lateFee: string;
  lateFeeDay: string;
  additionalChargeRules: AdditionalChargeRuleFormItem[];
}

interface AdditionalChargePreset {
  name: string;
  amount: number;
}

const ADDITIONAL_CHARGE_PRESETS: AdditionalChargePreset[] = [
  { name: 'Common Area Fee', amount: 200 },
  { name: 'Elevator Fee', amount: 150 },
  { name: 'Pool Fee', amount: 250 },
  { name: 'Maintenance Fee', amount: 120 },
];

function buildAdditionalChargeRuleId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `charge-${crypto.randomUUID()}`;
  }

  return `charge-${Date.now()}-${Math.round(Math.random() * 100000)}`;
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
    additionalChargeRules: values.additionalChargeRules.map((rule) => ({
      id: rule.id,
      name: rule.name,
      amount: rule.amount.toString(),
      isActive: rule.isActive,
    })),
  };
}

function toComparableRules(rules: AdditionalChargeRule[]): AdditionalChargeRule[] {
  return rules.map((rule) => ({
    id: rule.id,
    name: rule.name.trim(),
    amount: Number(rule.amount.toFixed(2)),
    isActive: rule.isActive,
  }));
}

function areAdditionalChargeRulesEqual(
  left: AdditionalChargeRule[],
  right: AdditionalChargeRule[]
): boolean {
  if (left.length !== right.length) {
    return false;
  }

  const leftComparable = toComparableRules(left);
  const rightComparable = toComparableRules(right);

  return leftComparable.every((rule, index) => {
    const otherRule = rightComparable[index];

    return (
      rule.id === otherRule.id &&
      rule.name === otherRule.name &&
      rule.amount === otherRule.amount &&
      rule.isActive === otherRule.isActive
    );
  });
}

export default function SettingsPage() {
  const initialSettings = useMemo<PropertySettingsValues>(() => {
    const loaded = loadPropertySettings();

    return {
      electricityRate: loaded.electricityRate,
      waterRate: loaded.waterRate,
      lateFee: loaded.lateFee,
      lateFeeDay: loaded.lateFeeDay,
      additionalChargeRules: loaded.additionalChargeRules,
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
      additionalChargeRules: form.additionalChargeRules.map((rule) => ({
        id: rule.id,
        name: rule.name.trim(),
        amount: Number.parseFloat(rule.amount),
        isActive: rule.isActive,
      })),
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

    if (parsedValues.additionalChargeRules.length > ADDITIONAL_CHARGE_RULE_LIMIT) {
      return `You can add up to ${ADDITIONAL_CHARGE_RULE_LIMIT} additional charge rules.`;
    }

    const seenRuleIds = new Set<string>();

    for (const [index, rule] of parsedValues.additionalChargeRules.entries()) {
      if (rule.id.trim() === '') {
        return `Additional charge #${index + 1}: invalid rule identifier.`;
      }

      if (seenRuleIds.has(rule.id)) {
        return `Additional charge #${index + 1}: duplicate rule found.`;
      }

      seenRuleIds.add(rule.id);

      if (rule.name.trim() === '') {
        return `Additional charge #${index + 1}: name is required.`;
      }

      if (rule.name.length > ADDITIONAL_CHARGE_NAME_MAX_LENGTH) {
        return `Additional charge #${index + 1}: name must be ${ADDITIONAL_CHARGE_NAME_MAX_LENGTH} characters or less.`;
      }

      if (!Number.isFinite(rule.amount) || rule.amount <= 0) {
        return `Additional charge #${index + 1}: amount must be greater than 0.`;
      }
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
      parsedValues.lateFeeDay !== savedSettings.lateFeeDay ||
      !areAdditionalChargeRulesEqual(
        parsedValues.additionalChargeRules,
        savedSettings.additionalChargeRules
      )
    );
  }, [parsedValues, savedSettings]);

  const canSave = !isSaving && !validationError && hasUnsavedChanges;

  const additionalChargePreview = useMemo(() => {
    const activeRules = form.additionalChargeRules.filter((rule) => {
      const amount = Number.parseFloat(rule.amount);

      return (
        rule.isActive &&
        rule.name.trim() !== '' &&
        Number.isFinite(amount) &&
        amount > 0
      );
    });

    const totalPerRoom = Math.round(
      activeRules.reduce((sum, rule) => sum + Number.parseFloat(rule.amount), 0)
    );

    return {
      activeRuleCount: activeRules.length,
      totalPerRoom,
    };
  }, [form.additionalChargeRules]);

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

  const handleAddChargeRule = (preset?: AdditionalChargePreset) => {
    if (form.additionalChargeRules.length >= ADDITIONAL_CHARGE_RULE_LIMIT) {
      setSaveError(
        `You can add up to ${ADDITIONAL_CHARGE_RULE_LIMIT} additional charge rules.`
      );
      return;
    }

    setForm((prev) => ({
      ...prev,
      additionalChargeRules: [
        ...prev.additionalChargeRules,
        {
          id: buildAdditionalChargeRuleId(),
          name: preset?.name ?? '',
          amount: preset ? preset.amount.toString() : '',
          isActive: true,
        },
      ],
    }));

    setSaveError(null);
    setSaveFeedback(null);
  };

  const handleRemoveChargeRule = (ruleId: string) => {
    setForm((prev) => ({
      ...prev,
      additionalChargeRules: prev.additionalChargeRules.filter(
        (rule) => rule.id !== ruleId
      ),
    }));

    setSaveError(null);
    setSaveFeedback(null);
  };

  const handleAdditionalChargeNameChange = (ruleId: string, value: string) => {
    const normalizedName = value.slice(0, ADDITIONAL_CHARGE_NAME_MAX_LENGTH);

    setForm((prev) => ({
      ...prev,
      additionalChargeRules: prev.additionalChargeRules.map((rule) =>
        rule.id === ruleId
          ? {
              ...rule,
              name: normalizedName,
            }
          : rule
      ),
    }));

    setSaveError(null);
    setSaveFeedback(null);
  };

  const handleAdditionalChargeAmountChange = (ruleId: string, value: string) => {
    const normalizedAmount = normalizeNumericInput(value, true);

    setForm((prev) => ({
      ...prev,
      additionalChargeRules: prev.additionalChargeRules.map((rule) =>
        rule.id === ruleId
          ? {
              ...rule,
              amount: normalizedAmount,
            }
          : rule
      ),
    }));

    setSaveError(null);
    setSaveFeedback(null);
  };

  const handleToggleAdditionalChargeRule = (ruleId: string) => {
    setForm((prev) => ({
      ...prev,
      additionalChargeRules: prev.additionalChargeRules.map((rule) =>
        rule.id === ruleId
          ? {
              ...rule,
              isActive: !rule.isActive,
            }
          : rule
      ),
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
      setForm(toFormState(parsedValues));
      window.dispatchEvent(new Event('estate_clarity.billing_state_updated'));
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

      {/* Additional Charges */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-bold tracking-tight">Additional Charges</h3>
          <button
            type="button"
            onClick={() => handleAddChargeRule()}
            disabled={form.additionalChargeRules.length >= ADDITIONAL_CHARGE_RULE_LIMIT}
            className={`h-10 px-4 rounded-xl text-sm font-bold border border-primary/30 text-primary transition-all flex items-center gap-1 ${
              form.additionalChargeRules.length >= ADDITIONAL_CHARGE_RULE_LIMIT
                ? 'opacity-50 cursor-not-allowed'
                : 'active:scale-95 hover:bg-primary/5'
            }`}
          >
            <span className="material-symbols-outlined text-base">add</span>
            Add Charge
          </button>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-[0_10px_40px_rgba(18,28,40,0.03)] space-y-5">
          <p className="text-sm text-on-surface-variant font-medium leading-relaxed">
            Add recurring monthly charges (for example: common area, elevator,
            pool, or maintenance) that apply to occupied rooms.
          </p>

          <div className="flex flex-wrap gap-2">
            {ADDITIONAL_CHARGE_PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => handleAddChargeRule(preset)}
                disabled={form.additionalChargeRules.length >= ADDITIONAL_CHARGE_RULE_LIMIT}
                className={`h-9 px-3 rounded-lg text-xs font-bold border border-outline-variant text-on-surface transition-all ${
                  form.additionalChargeRules.length >= ADDITIONAL_CHARGE_RULE_LIMIT
                    ? 'opacity-50 cursor-not-allowed'
                    : 'active:scale-95 hover:bg-surface-container-low'
                }`}
              >
                + {preset.name}
              </button>
            ))}
          </div>

          {form.additionalChargeRules.length === 0 ? (
            <div className="rounded-xl bg-surface-container-low p-5 text-on-surface-variant text-sm font-medium text-center">
              No additional charges yet. Use Add Charge to create one.
            </div>
          ) : (
            <div className="space-y-4">
              {form.additionalChargeRules.map((rule, index) => (
                <div
                  key={rule.id}
                  className="rounded-2xl bg-surface-container-low p-4 space-y-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-bold text-on-surface">
                      Charge #{index + 1}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleRemoveChargeRule(rule.id)}
                      className="h-8 px-3 rounded-lg text-xs font-bold border border-error/40 text-error hover:bg-error/10 active:scale-95 transition-all"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2 block">
                        Charge Name
                      </label>
                      <input
                        className="w-full h-12 px-4 rounded-xl bg-surface-container-lowest border-none focus:ring-2 focus:ring-primary font-semibold"
                        type="text"
                        value={rule.name}
                        onChange={(e) =>
                          handleAdditionalChargeNameChange(rule.id, e.target.value)
                        }
                        placeholder="Common Area Fee"
                        maxLength={ADDITIONAL_CHARGE_NAME_MAX_LENGTH}
                      />
                      <p className="text-[11px] text-on-surface-variant mt-1 font-medium">
                        {rule.name.length}/{ADDITIONAL_CHARGE_NAME_MAX_LENGTH}
                      </p>
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2 block">
                        Amount (THB/month)
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">
                          ฿
                        </span>
                        <input
                          className="w-full h-12 pl-10 pr-4 rounded-xl bg-surface-container-lowest border-none focus:ring-2 focus:ring-primary font-semibold"
                          type="text"
                          inputMode="decimal"
                          value={rule.amount}
                          onChange={(e) =>
                            handleAdditionalChargeAmountChange(rule.id, e.target.value)
                          }
                          placeholder="200"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-1">
                    <p className="text-xs text-on-surface-variant font-medium">
                      {rule.isActive
                        ? 'Included in billing totals'
                        : 'Excluded from billing totals'}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleToggleAdditionalChargeRule(rule.id)}
                      className={`h-8 px-3 rounded-lg text-xs font-bold transition-all active:scale-95 ${
                        rule.isActive
                          ? 'bg-secondary-container/40 text-secondary border border-secondary/30'
                          : 'bg-surface-container-high text-on-surface-variant border border-outline-variant'
                      }`}
                    >
                      {rule.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-start space-x-2 p-3 bg-secondary-container/20 rounded-xl">
            <span className="material-symbols-outlined text-secondary text-lg mt-0.5">
              info
            </span>
            <p className="text-xs text-secondary font-medium leading-relaxed">
              Active rules: {additionalChargePreview.activeRuleCount} | Additional
              charges per occupied room: {formatCurrency(additionalChargePreview.totalPerRoom)}
            </p>
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
