const STORAGE_KEY = 'estate_clarity.roomAdditionalChargeOverrides.v1';

export type RoomAdditionalChargeOverrides = Record<string, string[]>;

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function isValidRoomNumber(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.trim().length > 0 &&
    value.trim().length <= 20
  );
}

function isValidRuleId(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.trim().length > 0 &&
    value.trim().length <= 64
  );
}

function normalizeRuleIds(input: unknown): string[] {
  if (!Array.isArray(input)) {
    return [];
  }

  const deduped = new Set<string>();

  for (const candidate of input) {
    if (!isValidRuleId(candidate)) {
      continue;
    }

    deduped.add(candidate.trim());
  }

  return Array.from(deduped);
}

function normalizeRoomNumber(value: string | number): string | null {
  const normalized = String(value).trim();
  return isValidRoomNumber(normalized) ? normalized : null;
}

function sanitizeOverrides(input: unknown): RoomAdditionalChargeOverrides {
  if (!input || typeof input !== 'object') {
    return {};
  }

  const next: RoomAdditionalChargeOverrides = {};

  for (const [roomNumber, value] of Object.entries(
    input as Record<string, unknown>
  )) {
    if (!isValidRoomNumber(roomNumber)) {
      continue;
    }

    if (!Array.isArray(value)) {
      continue;
    }

    next[roomNumber.trim()] = normalizeRuleIds(value);
  }

  return next;
}

export function loadRoomAdditionalChargeOverrides(): RoomAdditionalChargeOverrides {
  if (!isBrowser()) {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }

    const parsed: unknown = JSON.parse(raw);
    return sanitizeOverrides(parsed);
  } catch {
    return {};
  }
}

export function saveRoomAdditionalChargeOverrides(
  overrides: RoomAdditionalChargeOverrides
): void {
  if (!isBrowser()) {
    return;
  }

  const sanitized = sanitizeOverrides(overrides);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
}

export function setRoomAdditionalChargeRuleIds(
  roomNumber: string | number,
  ruleIds: string[]
): RoomAdditionalChargeOverrides {
  const normalizedRoomNumber = normalizeRoomNumber(roomNumber);
  if (!normalizedRoomNumber) {
    return loadRoomAdditionalChargeOverrides();
  }

  const existing = loadRoomAdditionalChargeOverrides();
  const next: RoomAdditionalChargeOverrides = {
    ...existing,
    [normalizedRoomNumber]: normalizeRuleIds(ruleIds),
  };

  saveRoomAdditionalChargeOverrides(next);
  return next;
}

export function applyBulkRoomAdditionalChargeRuleIds(
  roomNumbers: Array<string | number>,
  ruleIds: string[]
): RoomAdditionalChargeOverrides {
  const normalizedRuleIds = normalizeRuleIds(ruleIds);
  const existing = loadRoomAdditionalChargeOverrides();
  const next = { ...existing };

  for (const roomNumber of roomNumbers) {
    const normalizedRoomNumber = normalizeRoomNumber(roomNumber);
    if (!normalizedRoomNumber) {
      continue;
    }

    next[normalizedRoomNumber] = normalizedRuleIds;
  }

  saveRoomAdditionalChargeOverrides(next);
  return next;
}

export function resetBulkRoomAdditionalChargeOverrides(
  roomNumbers: Array<string | number>
): RoomAdditionalChargeOverrides {
  const existing = loadRoomAdditionalChargeOverrides();
  const next = { ...existing };

  for (const roomNumber of roomNumbers) {
    const normalizedRoomNumber = normalizeRoomNumber(roomNumber);
    if (!normalizedRoomNumber) {
      continue;
    }

    delete next[normalizedRoomNumber];
  }

  saveRoomAdditionalChargeOverrides(next);
  return next;
}

export function getRoomAdditionalChargeRuleIds(
  roomNumber: string | number
): string[] | undefined {
  const normalizedRoomNumber = normalizeRoomNumber(roomNumber);
  if (!normalizedRoomNumber) {
    return undefined;
  }

  const overrides = loadRoomAdditionalChargeOverrides();
  return overrides[normalizedRoomNumber];
}
