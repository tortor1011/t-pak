const STORAGE_KEY = 'estate_clarity.propertySettings.v1';

export const ADDITIONAL_CHARGE_NAME_MAX_LENGTH = 60;
export const ADDITIONAL_CHARGE_RULE_LIMIT = 20;

export interface AdditionalChargeRule {
  id: string;
  name: string;
  amount: number;
  isActive: boolean;
}

export interface PropertySettingsValues {
  electricityRate: number;
  waterRate: number;
  lateFee: number;
  lateFeeDay: number;
  additionalChargeRules: AdditionalChargeRule[];
}

export interface PropertySettingsSnapshot extends PropertySettingsValues {
  updatedAt: string;
}

export const DEFAULT_PROPERTY_SETTINGS: PropertySettingsValues = {
  electricityRate: 8,
  waterRate: 20,
  lateFee: 200,
  lateFeeDay: 5,
  additionalChargeRules: [],
};

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function isPositiveNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function isValidLateFeeDay(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    Number.isInteger(value) &&
    value >= 0
  );
}

function isValidRuleId(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.trim().length > 0 &&
    value.trim().length <= 64
  );
}

function isValidRuleName(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.trim().length > 0 &&
    value.trim().length <= ADDITIONAL_CHARGE_NAME_MAX_LENGTH
  );
}

function isAdditionalChargeRule(value: unknown): value is AdditionalChargeRule {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const parsed = value as Record<string, unknown>;

  return (
    isValidRuleId(parsed.id) &&
    isValidRuleName(parsed.name) &&
    isPositiveNumber(parsed.amount) &&
    typeof parsed.isActive === 'boolean'
  );
}

function hasUniqueRuleIds(rules: AdditionalChargeRule[]): boolean {
  const uniqueIds = new Set(rules.map((rule) => rule.id));
  return uniqueIds.size === rules.length;
}

function sanitizeAdditionalChargeRules(input: unknown): AdditionalChargeRule[] {
  if (!Array.isArray(input)) {
    return [];
  }

  const seenIds = new Set<string>();
  const sanitized: AdditionalChargeRule[] = [];

  for (const [index, candidate] of input.entries()) {
    if (!candidate || typeof candidate !== 'object') {
      continue;
    }

    const value = candidate as Record<string, unknown>;
    const name = typeof value.name === 'string' ? value.name.trim() : '';
    const amount = Number(value.amount);

    if (!isValidRuleName(name) || !isPositiveNumber(amount)) {
      continue;
    }

    const rawId = typeof value.id === 'string' ? value.id.trim() : '';
    const normalizedId = isValidRuleId(rawId)
      ? rawId
      : `charge-${index + 1}`;
    const id = seenIds.has(normalizedId)
      ? `${normalizedId}-${index + 1}`
      : normalizedId;

    if (!isValidRuleId(id)) {
      continue;
    }

    seenIds.add(id);

    sanitized.push({
      id,
      name,
      amount,
      isActive: typeof value.isActive === 'boolean' ? value.isActive : true,
    });

    if (sanitized.length >= ADDITIONAL_CHARGE_RULE_LIMIT) {
      break;
    }
  }

  return sanitized;
}

export function isPropertySettingsValid(values: PropertySettingsValues): boolean {
  return (
    isPositiveNumber(values.electricityRate) &&
    isPositiveNumber(values.waterRate) &&
    isPositiveNumber(values.lateFee) &&
    isValidLateFeeDay(values.lateFeeDay) &&
    Array.isArray(values.additionalChargeRules) &&
    values.additionalChargeRules.length <= ADDITIONAL_CHARGE_RULE_LIMIT &&
    values.additionalChargeRules.every((rule) => isAdditionalChargeRule(rule)) &&
    hasUniqueRuleIds(values.additionalChargeRules)
  );
}

function sanitizeSnapshot(snapshot: unknown): PropertySettingsSnapshot | null {
  if (!snapshot || typeof snapshot !== 'object') {
    return null;
  }

  const value = snapshot as Record<string, unknown>;
  const parsedValues: PropertySettingsValues = {
    electricityRate: Number(value.electricityRate),
    waterRate: Number(value.waterRate),
    lateFee: Number(value.lateFee),
    lateFeeDay: Number(value.lateFeeDay),
    additionalChargeRules: sanitizeAdditionalChargeRules(value.additionalChargeRules),
  };

  if (!isPropertySettingsValid(parsedValues) || typeof value.updatedAt !== 'string') {
    return null;
  }

  return {
    ...parsedValues,
    updatedAt: value.updatedAt,
  };
}

function buildDefaultSnapshot(): PropertySettingsSnapshot {
  return {
    ...DEFAULT_PROPERTY_SETTINGS,
    updatedAt: new Date().toISOString(),
  };
}

export function loadPropertySettings(): PropertySettingsSnapshot {
  if (!isBrowser()) {
    return buildDefaultSnapshot();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return buildDefaultSnapshot();
    }

    const parsed: unknown = JSON.parse(raw);
    const sanitized = sanitizeSnapshot(parsed);

    return sanitized ?? buildDefaultSnapshot();
  } catch {
    return buildDefaultSnapshot();
  }
}

export function savePropertySettings(
  values: PropertySettingsValues
): PropertySettingsSnapshot {
  if (!isPropertySettingsValid(values)) {
    throw new Error('Invalid property settings values.');
  }

  const snapshot: PropertySettingsSnapshot = {
    ...values,
    updatedAt: new Date().toISOString(),
  };

  if (isBrowser()) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  }

  return snapshot;
}
