'use client';

import { useMemo, useState } from 'react';
import {
  ADDITIONAL_CHARGE_NAME_MAX_LENGTH,
  ADDITIONAL_CHARGE_RULE_LIMIT,
  DEFAULT_PROPERTY_SETTINGS,
  type AdditionalChargeRule,
  type PropertySettingsValues,
} from '@/services/propertySettings';
import { formatCurrency } from '@/utils/currency';
import { useLanguage } from '@/hooks/useLanguage';
import { useRepositories } from '@/hooks/useRepositories';

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
  nameTh: string;
  nameEn: string;
  amount: number;
}

const ADDITIONAL_CHARGE_PRESETS: AdditionalChargePreset[] = [
  { nameTh: 'ค่าส่วนกลาง', nameEn: 'Common Area Fee', amount: 200 },
  { nameTh: 'ค่าลิฟต์', nameEn: 'Elevator Fee', amount: 150 },
  { nameTh: 'ค่าสระว่ายน้ำ', nameEn: 'Pool Fee', amount: 250 },
  { nameTh: 'ค่าบำรุงรักษา', nameEn: 'Maintenance Fee', amount: 120 },
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
  const { language } = useLanguage();
  const { settingsRepository } = useRepositories();
  const text = useMemo(
    () =>
      language === 'th'
      ? {
          title: 'ตั้งค่าอาคาร',
          propertyName: 'หอพัก A',
          propertyGroup: 'กลุ่มทรัพย์สิน A',
          totalRooms: 'จำนวนห้องทั้งหมด',
          floors: 'จำนวนชั้น',
          utilityTitle: 'กติกาคิดค่าสาธารณูปโภค',
          electricityRate: 'ค่าไฟฟ้า (ต่อหน่วย kWh)',
          waterRate: 'ค่าน้ำ (ต่อหน่วย m³)',
          additionalTitle: 'ค่าบริการเพิ่มเติม',
          addCharge: 'เพิ่มรายการ',
          additionalDescription:
            'เพิ่มค่าบริการรายเดือน (เช่น ค่าส่วนกลาง ค่าลิฟต์ ค่าสระว่ายน้ำ หรือค่าบำรุงรักษา) สำหรับห้องที่มีผู้เช่า',
          noAdditionalCharges: 'ยังไม่มีค่าบริการเพิ่มเติม กดเพิ่มรายการเพื่อเริ่มต้น',
          chargeNumber: 'รายการที่',
          remove: 'ลบ',
          chargeName: 'ชื่อรายการ',
          chargeNamePlaceholder: 'ค่าส่วนกลาง',
          amountPerMonth: 'จำนวนเงิน (บาท/เดือน)',
          includedInBilling: 'รวมในยอดเรียกเก็บแล้ว',
          excludedInBilling: 'ไม่รวมในยอดเรียกเก็บ',
          active: 'ใช้งาน',
          inactive: 'ปิดใช้งาน',
          activeRulesSummary: 'กฎที่ใช้งาน',
          additionalPerRoomSummary: 'ค่าบริการต่อห้องที่มีผู้พัก',
          lateFeeTitle: 'ค่าปรับชำระล่าช้า',
          fineAmount: 'ค่าปรับ (บาท/วัน)',
          gracePeriod: 'ระยะผ่อนผัน (วันหลังวันครบกำหนด)',
          lateFeePreview: 'จะคิดค่าปรับ ฿{{fee}}/วัน หลังเลยกำหนด {{days}} วัน',
          saving: 'กำลังบันทึก...',
          saveSettings: 'บันทึกการตั้งค่า',
          settingsSaved: 'บันทึกแล้ว',
          appPreview: 'ตัวอย่างระบบฝั่งเจ้าของ',
          numericFields: 'กรุณากรอกทุกช่องด้วยตัวเลขที่ถูกต้อง',
          electricityRateInvalid: 'ค่าไฟฟ้าต้องมากกว่า 0',
          waterRateInvalid: 'ค่าน้ำต้องมากกว่า 0',
          lateFeeInvalid: 'ค่าปรับต้องมากกว่า 0',
          gracePeriodInvalid: 'ระยะผ่อนผันต้องเป็นจำนวนเต็มตั้งแต่ 0 ขึ้นไป',
          ruleLimit: `เพิ่มได้สูงสุด ${ADDITIONAL_CHARGE_RULE_LIMIT} รายการ`,
          invalidRuleId: 'รหัสรายการไม่ถูกต้อง',
          duplicateRule: 'พบรายการซ้ำ',
          ruleNameRequired: 'กรุณากรอกชื่อรายการ',
          ruleNameLength: `ชื่อรายการต้องไม่เกิน ${ADDITIONAL_CHARGE_NAME_MAX_LENGTH} ตัวอักษร`,
          ruleAmountInvalid: 'จำนวนเงินต้องมากกว่า 0',
          checkFormValues: 'กรุณาตรวจสอบค่าที่กรอกในแบบฟอร์ม',
          noChanges: 'ไม่มีการเปลี่ยนแปลงให้บันทึก',
          savedAt: 'บันทึกการตั้งค่าเมื่อ {{time}}',
        }
      : {
          title: 'Property Settings',
          propertyName: 'Dormitory A',
          propertyGroup: 'Property Group A',
          totalRooms: 'Total Rooms',
          floors: 'Floors',
          utilityTitle: 'Utility Pricing Rules',
          electricityRate: 'Electricity Rate (per kWh)',
          waterRate: 'Water Rate (per m³)',
          additionalTitle: 'Additional Charges',
          addCharge: 'Add Charge',
          additionalDescription:
            'Add recurring monthly charges (for example: common area, elevator, pool, or maintenance) that apply to occupied rooms.',
          noAdditionalCharges: 'No additional charges yet. Use Add Charge to create one.',
          chargeNumber: 'Charge #',
          remove: 'Remove',
          chargeName: 'Charge Name',
          chargeNamePlaceholder: 'Common Area Fee',
          amountPerMonth: 'Amount (THB/month)',
          includedInBilling: 'Included in billing totals',
          excludedInBilling: 'Excluded from billing totals',
          active: 'Active',
          inactive: 'Inactive',
          activeRulesSummary: 'Active rules',
          additionalPerRoomSummary: 'Additional charges per occupied room',
          lateFeeTitle: 'Late Payment Fine',
          fineAmount: 'Fine Amount (THB/day)',
          gracePeriod: 'Grace Period (days after due date)',
          lateFeePreview:
            'Late fee of ฿{{fee}}/day will be applied after {{days}} days past due date',
          saving: 'Saving Settings...',
          saveSettings: 'Save Settings',
          settingsSaved: 'Settings Saved',
          appPreview: 'Frontend Preview - Owner App',
          numericFields: 'Please fill all fields with numeric values.',
          electricityRateInvalid: 'Electricity rate must be greater than 0.',
          waterRateInvalid: 'Water rate must be greater than 0.',
          lateFeeInvalid: 'Late fee must be greater than 0.',
          gracePeriodInvalid: 'Grace period must be a whole number that is 0 or greater.',
          ruleLimit: `You can add up to ${ADDITIONAL_CHARGE_RULE_LIMIT} additional charge rules.`,
          invalidRuleId: 'invalid rule identifier.',
          duplicateRule: 'duplicate rule found.',
          ruleNameRequired: 'name is required.',
          ruleNameLength: `name must be ${ADDITIONAL_CHARGE_NAME_MAX_LENGTH} characters or less.`,
          ruleAmountInvalid: 'amount must be greater than 0.',
          checkFormValues: 'Please check the form values.',
          noChanges: 'No changes to save.',
          savedAt: 'Settings saved at {{time}}.',
        },
    [language]
  );

  const initialSettings = useMemo<PropertySettingsValues>(() => {
    const result = settingsRepository.loadPropertySettings();
    const loaded = result.ok
      ? result.value
      : {
          ...DEFAULT_PROPERTY_SETTINGS,
          updatedAt: new Date().toISOString(),
        };

    return {
      electricityRate: loaded.electricityRate,
      waterRate: loaded.waterRate,
      lateFee: loaded.lateFee,
      lateFeeDay: loaded.lateFeeDay,
      additionalChargeRules: loaded.additionalChargeRules,
    };
  }, [settingsRepository]);

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
      return text.numericFields;
    }

    if (parsedValues.electricityRate <= 0) {
      return text.electricityRateInvalid;
    }

    if (parsedValues.waterRate <= 0) {
      return text.waterRateInvalid;
    }

    if (parsedValues.lateFee <= 0) {
      return text.lateFeeInvalid;
    }

    if (!Number.isInteger(parsedValues.lateFeeDay) || parsedValues.lateFeeDay < 0) {
      return text.gracePeriodInvalid;
    }

    if (parsedValues.additionalChargeRules.length > ADDITIONAL_CHARGE_RULE_LIMIT) {
      return text.ruleLimit;
    }

    const seenRuleIds = new Set<string>();

    for (const [index, rule] of parsedValues.additionalChargeRules.entries()) {
      if (rule.id.trim() === '') {
        return language === 'th'
          ? `ค่าบริการเพิ่มเติมรายการที่ ${index + 1}: ${text.invalidRuleId}`
          : `Additional charge #${index + 1}: ${text.invalidRuleId}`;
      }

      if (seenRuleIds.has(rule.id)) {
        return language === 'th'
          ? `ค่าบริการเพิ่มเติมรายการที่ ${index + 1}: ${text.duplicateRule}`
          : `Additional charge #${index + 1}: ${text.duplicateRule}`;
      }

      seenRuleIds.add(rule.id);

      if (rule.name.trim() === '') {
        return language === 'th'
          ? `ค่าบริการเพิ่มเติมรายการที่ ${index + 1}: ${text.ruleNameRequired}`
          : `Additional charge #${index + 1}: ${text.ruleNameRequired}`;
      }

      if (rule.name.length > ADDITIONAL_CHARGE_NAME_MAX_LENGTH) {
        return language === 'th'
          ? `ค่าบริการเพิ่มเติมรายการที่ ${index + 1}: ${text.ruleNameLength}`
          : `Additional charge #${index + 1}: ${text.ruleNameLength}`;
      }

      if (!Number.isFinite(rule.amount) || rule.amount <= 0) {
        return language === 'th'
          ? `ค่าบริการเพิ่มเติมรายการที่ ${index + 1}: ${text.ruleAmountInvalid}`
          : `Additional charge #${index + 1}: ${text.ruleAmountInvalid}`;
      }
    }

    return null;
  }, [language, parsedValues, text]);

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
      setSaveError(text.ruleLimit);
      return;
    }

    setForm((prev) => ({
      ...prev,
      additionalChargeRules: [
        ...prev.additionalChargeRules,
        {
          id: buildAdditionalChargeRuleId(),
          name: preset ? (language === 'th' ? preset.nameTh : preset.nameEn) : '',
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
      setSaveError(validationError ?? text.checkFormValues);
      return;
    }

    if (!hasUnsavedChanges) {
      setSaveFeedback(text.noChanges);
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setSaveFeedback(null);

    try {
      await new Promise<void>((resolve) => {
        window.setTimeout(() => resolve(), 500);
      });

      const savedSnapshotResult = settingsRepository.savePropertySettings(parsedValues);
      if (!savedSnapshotResult.ok) {
        setSaveError(savedSnapshotResult.error.message);
        return;
      }

      const savedSnapshot = savedSnapshotResult.value;

      setSavedSettings(parsedValues);
      setForm(toFormState(parsedValues));
      setSaveFeedback(
        text.savedAt.replace(
          '{{time}}',
          new Date(savedSnapshot.updatedAt).toLocaleTimeString()
        )
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="px-6 py-8 space-y-8 page-transition">
      <h2 className="text-2xl font-bold tracking-tight">{text.title}</h2>

      {/* Property Info */}
      <section className="bg-surface-container-lowest rounded-2xl p-6 shadow-[0_10px_40px_rgba(18,28,40,0.03)] space-y-4">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-14 h-14 rounded-2xl btn-primary-gradient flex items-center justify-center shadow-lg">
            <span className="material-symbols-outlined text-white text-2xl">apartment</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-on-surface">{text.propertyName}</h3>
            <p className="text-on-surface-variant font-medium text-sm">{text.propertyGroup}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-surface-container">
          <div>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{text.totalRooms}</p>
            <p className="text-lg font-bold text-on-surface">12</p>
          </div>
          <div>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{text.floors}</p>
            <p className="text-lg font-bold text-on-surface">3</p>
          </div>
        </div>
      </section>

      {/* Utility Rates */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold tracking-tight">{text.utilityTitle}</h3>
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-[0_10px_40px_rgba(18,28,40,0.03)] space-y-6">
          {/* Electricity */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-on-surface mb-3">
              <span className="material-symbols-outlined text-primary text-lg">bolt</span>
              {text.electricityRate}
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
              {text.waterRate}
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
          <h3 className="text-lg font-bold tracking-tight">{text.additionalTitle}</h3>
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
            {text.addCharge}
          </button>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-[0_10px_40px_rgba(18,28,40,0.03)] space-y-5">
          <p className="text-sm text-on-surface-variant font-medium leading-relaxed">
            {text.additionalDescription}
          </p>

          <div className="flex flex-wrap gap-2">
            {ADDITIONAL_CHARGE_PRESETS.map((preset) => (
              <button
                key={preset.nameEn}
                type="button"
                onClick={() => handleAddChargeRule(preset)}
                disabled={form.additionalChargeRules.length >= ADDITIONAL_CHARGE_RULE_LIMIT}
                className={`h-9 px-3 rounded-lg text-xs font-bold border border-outline-variant text-on-surface transition-all ${
                  form.additionalChargeRules.length >= ADDITIONAL_CHARGE_RULE_LIMIT
                    ? 'opacity-50 cursor-not-allowed'
                    : 'active:scale-95 hover:bg-surface-container-low'
                }`}
              >
                + {language === 'th' ? preset.nameTh : preset.nameEn}
              </button>
            ))}
          </div>

          {form.additionalChargeRules.length === 0 ? (
            <div className="rounded-xl bg-surface-container-low p-5 text-on-surface-variant text-sm font-medium text-center">
              {text.noAdditionalCharges}
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
                      {text.chargeNumber} {index + 1}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleRemoveChargeRule(rule.id)}
                      className="h-8 px-3 rounded-lg text-xs font-bold border border-error/40 text-error hover:bg-error/10 active:scale-95 transition-all"
                    >
                      {text.remove}
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2 block">
                        {text.chargeName}
                      </label>
                      <input
                        className="w-full h-12 px-4 rounded-xl bg-surface-container-lowest border-none focus:ring-2 focus:ring-primary font-semibold"
                        type="text"
                        value={rule.name}
                        onChange={(e) =>
                          handleAdditionalChargeNameChange(rule.id, e.target.value)
                        }
                        placeholder={text.chargeNamePlaceholder}
                        maxLength={ADDITIONAL_CHARGE_NAME_MAX_LENGTH}
                      />
                      <p className="text-[11px] text-on-surface-variant mt-1 font-medium">
                        {rule.name.length}/{ADDITIONAL_CHARGE_NAME_MAX_LENGTH}
                      </p>
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2 block">
                        {text.amountPerMonth}
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
                        ? text.includedInBilling
                        : text.excludedInBilling}
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
                      {rule.isActive ? text.active : text.inactive}
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
              {text.activeRulesSummary}: {additionalChargePreview.activeRuleCount} |{' '}
              {text.additionalPerRoomSummary}: {formatCurrency(additionalChargePreview.totalPerRoom)}
            </p>
          </div>
        </div>
      </section>

      {/* Late Fee Settings */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold tracking-tight">{text.lateFeeTitle}</h3>
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-[0_10px_40px_rgba(18,28,40,0.03)] space-y-6">
          <div>
            <label className="text-sm font-bold text-on-surface mb-3 block">
              {text.fineAmount}
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
              {text.gracePeriod}
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
              {text.lateFeePreview
                .replace('{{fee}}', form.lateFee || '0')
                .replace('{{days}}', form.lateFeeDay || '0')}
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
        {isSaving ? text.saving : hasUnsavedChanges ? text.saveSettings : text.settingsSaved}
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
        <p className="text-outline text-xs mt-1">{text.appPreview}</p>
      </div>
    </div>
  );
}
