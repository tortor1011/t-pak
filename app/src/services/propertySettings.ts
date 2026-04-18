const STORAGE_KEY = 'estate_clarity.propertySettings.v1';

export interface PropertySettingsValues {
  electricityRate: number;
  waterRate: number;
  lateFee: number;
  lateFeeDay: number;
}

export interface PropertySettingsSnapshot extends PropertySettingsValues {
  updatedAt: string;
}

export const DEFAULT_PROPERTY_SETTINGS: PropertySettingsValues = {
  electricityRate: 8,
  waterRate: 20,
  lateFee: 200,
  lateFeeDay: 5,
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

export function isPropertySettingsValid(values: PropertySettingsValues): boolean {
  return (
    isPositiveNumber(values.electricityRate) &&
    isPositiveNumber(values.waterRate) &&
    isPositiveNumber(values.lateFee) &&
    isValidLateFeeDay(values.lateFeeDay)
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
