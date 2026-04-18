import { DebtItem } from '@/types/billing';
import { MOCK_DEBTS, MOCK_ROOMS, MOCK_TENANTS } from '@/services/mockData';

const REMINDER_STATE_STORAGE_KEY = 'estate_clarity.debtReminderQueue.v1';
const RUNTIME_DEBT_QUEUE_STORAGE_KEY = 'estate_clarity.runtimeDebtQueue.v1';

interface DebtReminderStateItem {
  reminderCount: number;
  lastReminder: string | null;
}

type DebtReminderStateMap = Record<string, DebtReminderStateItem>;

export interface SlipDebtPayload {
  roomNumber: string;
  tenantName: string;
  amount: number;
  observedAt?: string | null;
}

export interface DebtCollectionQueueItem extends DebtItem {
  reminderCount: number;
}

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function isDebtReminderStateItem(value: unknown): value is DebtReminderStateItem {
  if (!value || typeof value !== 'object') return false;

  const parsed = value as Record<string, unknown>;
  const isLastReminderValid =
    parsed.lastReminder === null || typeof parsed.lastReminder === 'string';

  return (
    typeof parsed.reminderCount === 'number' &&
    Number.isFinite(parsed.reminderCount) &&
    parsed.reminderCount >= 0 &&
    isLastReminderValid
  );
}

function isValidStringOrNull(value: unknown): value is string | null {
  return value === null || typeof value === 'string';
}

function isDebtItem(value: unknown): value is DebtItem {
  if (!value || typeof value !== 'object') return false;

  const parsed = value as Record<string, unknown>;

  return (
    typeof parsed.id === 'string' &&
    typeof parsed.roomNumber === 'string' &&
    typeof parsed.tenantName === 'string' &&
    typeof parsed.totalOutstanding === 'number' &&
    Number.isFinite(parsed.totalOutstanding) &&
    typeof parsed.monthsOverdue === 'number' &&
    Number.isFinite(parsed.monthsOverdue) &&
    isValidStringOrNull(parsed.lastReminder) &&
    typeof parsed.phone === 'string'
  );
}

function loadDebtReminderStateMap(): DebtReminderStateMap {
  if (!isBrowser()) return {};

  try {
    const raw = window.localStorage.getItem(REMINDER_STATE_STORAGE_KEY);
    if (!raw) return {};

    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};

    return Object.entries(parsed as Record<string, unknown>).reduce<DebtReminderStateMap>(
      (acc, [debtId, value]) => {
        if (isDebtReminderStateItem(value)) {
          acc[debtId] = value;
        }

        return acc;
      },
      {}
    );
  } catch {
    return {};
  }
}

function saveDebtReminderStateMap(state: DebtReminderStateMap): void {
  if (!isBrowser()) return;

  window.localStorage.setItem(REMINDER_STATE_STORAGE_KEY, JSON.stringify(state));
}

function loadRuntimeDebtQueue(): DebtItem[] {
  if (!isBrowser()) return [];

  try {
    const raw = window.localStorage.getItem(RUNTIME_DEBT_QUEUE_STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item): item is DebtItem => isDebtItem(item));
  } catch {
    return [];
  }
}

function saveRuntimeDebtQueue(queue: DebtItem[]): void {
  if (!isBrowser()) return;

  window.localStorage.setItem(RUNTIME_DEBT_QUEUE_STORAGE_KEY, JSON.stringify(queue));
}

function mergeBaseAndRuntimeDebts(baseDebts: DebtItem[]): DebtItem[] {
  const mergedByRoom = new Map<string, DebtItem>();

  for (const debt of baseDebts) {
    mergedByRoom.set(debt.roomNumber, debt);
  }

  for (const debt of loadRuntimeDebtQueue()) {
    mergedByRoom.set(debt.roomNumber, debt);
  }

  return Array.from(mergedByRoom.values());
}

export function loadDebtCollectionQueue(
  debts: DebtItem[] = MOCK_DEBTS
): DebtCollectionQueueItem[] {
  const mergedQueue = mergeBaseAndRuntimeDebts(debts);
  const state = loadDebtReminderStateMap();

  return mergedQueue.map((debt) => {
    const saved = state[debt.id];

    if (!saved) {
      return {
        ...debt,
        reminderCount: debt.lastReminder ? 1 : 0,
      };
    }

    return {
      ...debt,
      lastReminder: saved.lastReminder,
      reminderCount: saved.reminderCount,
    };
  });
}

function toStateMap(queue: DebtCollectionQueueItem[]): DebtReminderStateMap {
  return queue.reduce<DebtReminderStateMap>((acc, item) => {
    acc[item.id] = {
      reminderCount: item.reminderCount,
      lastReminder: item.lastReminder,
    };

    return acc;
  }, {});
}

export function saveDebtCollectionQueue(queue: DebtCollectionQueueItem[]): void {
  saveDebtReminderStateMap(toStateMap(queue));
}

export function sendDebtReminder(debtId: string): DebtCollectionQueueItem[] {
  const currentQueue = loadDebtCollectionQueue();

  const nextQueue = currentQueue.map((debt) => {
    if (debt.id !== debtId) return debt;

    return {
      ...debt,
      reminderCount: debt.reminderCount + 1,
      lastReminder: new Date().toISOString(),
    };
  });

  saveDebtCollectionQueue(nextQueue);
  return nextQueue;
}

export function sendBulkDebtReminders(): DebtCollectionQueueItem[] {
  const currentQueue = loadDebtCollectionQueue();
  const sentAt = new Date().toISOString();

  const nextQueue = currentQueue.map((debt) => ({
    ...debt,
    reminderCount: debt.reminderCount + 1,
    lastReminder: sentAt,
  }));

  saveDebtCollectionQueue(nextQueue);
  return nextQueue;
}

export function sendBulkDebtRemindersByIds(
  debtIds: string[]
): DebtCollectionQueueItem[] {
  if (debtIds.length === 0) {
    return loadDebtCollectionQueue();
  }

  const currentQueue = loadDebtCollectionQueue();
  const sentAt = new Date().toISOString();
  const targetSet = new Set<string>(debtIds);

  const nextQueue = currentQueue.map((debt) => {
    if (!targetSet.has(debt.id)) {
      return debt;
    }

    return {
      ...debt,
      reminderCount: debt.reminderCount + 1,
      lastReminder: sentAt,
    };
  });

  saveDebtCollectionQueue(nextQueue);
  return nextQueue;
}

function createRuntimeDebtId(roomNumber: string): string {
  return `runtime-${roomNumber}`;
}

function getReferenceDebtByRoomNumber(roomNumber: string): DebtItem | undefined {
  return MOCK_DEBTS.find((debt) => debt.roomNumber === roomNumber);
}

function isUsablePhone(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.trim() !== '' && value !== '-';
}

function getTenantPhoneByRoomNumber(roomNumber: string): string | null {
  const tenantByRoomNumber = MOCK_TENANTS.find(
    (tenant) => tenant.roomNumber === roomNumber
  );
  if (tenantByRoomNumber?.phone) {
    return tenantByRoomNumber.phone;
  }

  const room = MOCK_ROOMS.find((item) => item.number === roomNumber);
  if (!room?.tenantId) {
    return null;
  }

  const tenantById = MOCK_TENANTS.find((tenant) => tenant.id === room.tenantId);
  return tenantById?.phone ?? null;
}

function resolveDebtPhone(
  roomNumber: string,
  existing: DebtItem | undefined,
  referenceDebt: DebtItem | undefined
): string {
  if (isUsablePhone(existing?.phone)) {
    return existing.phone;
  }

  if (isUsablePhone(referenceDebt?.phone)) {
    return referenceDebt.phone;
  }

  const tenantPhone = getTenantPhoneByRoomNumber(roomNumber);
  if (isUsablePhone(tenantPhone)) {
    return tenantPhone;
  }

  return '-';
}

function calculateMonthsOverdue(observedAt?: string | null): number {
  if (!observedAt) {
    return 1;
  }

  const observedDate = new Date(observedAt);
  if (Number.isNaN(observedDate.getTime())) {
    return 1;
  }

  const now = new Date();
  const monthDiff =
    (now.getFullYear() - observedDate.getFullYear()) * 12 +
    (now.getMonth() - observedDate.getMonth());

  return Math.max(1, monthDiff);
}

function resolveMonthsOverdue(
  existing: DebtItem | undefined,
  referenceDebt: DebtItem | undefined,
  observedAt?: string | null
): number {
  if (existing && existing.monthsOverdue > 0) {
    return existing.monthsOverdue;
  }

  if (referenceDebt && referenceDebt.monthsOverdue > 0) {
    return referenceDebt.monthsOverdue;
  }

  return calculateMonthsOverdue(observedAt);
}

function resolveOutstandingAmount(
  amount: number,
  existing: DebtItem | undefined,
  referenceDebt: DebtItem | undefined
): number {
  const normalizedAmount = Math.max(0, Math.round(amount));

  return Math.max(
    normalizedAmount,
    existing?.totalOutstanding ?? 0,
    referenceDebt?.totalOutstanding ?? 0
  );
}

function resolveTenantName(
  tenantName: string,
  existing: DebtItem | undefined,
  referenceDebt: DebtItem | undefined,
  roomNumber: string
): string {
  const normalized = tenantName.trim();

  if (normalized) {
    return normalized;
  }

  if (existing?.tenantName?.trim()) {
    return existing.tenantName;
  }

  if (referenceDebt?.tenantName?.trim()) {
    return referenceDebt.tenantName;
  }

  return `Room ${roomNumber}`;
}

export function upsertDebtFromSlip(payload: SlipDebtPayload): DebtItem[] {
  const runtimeQueue = loadRuntimeDebtQueue();
  const existing = runtimeQueue.find((debt) => debt.roomNumber === payload.roomNumber);
  const referenceDebt = getReferenceDebtByRoomNumber(payload.roomNumber);

  const nextDebt: DebtItem = {
    id: existing?.id ?? createRuntimeDebtId(payload.roomNumber),
    roomNumber: payload.roomNumber,
    tenantName: resolveTenantName(
      payload.tenantName,
      existing,
      referenceDebt,
      payload.roomNumber
    ),
    totalOutstanding: resolveOutstandingAmount(
      payload.amount,
      existing,
      referenceDebt
    ),
    monthsOverdue: resolveMonthsOverdue(
      existing,
      referenceDebt,
      payload.observedAt
    ),
    lastReminder: existing?.lastReminder ?? null,
    phone: resolveDebtPhone(payload.roomNumber, existing, referenceDebt),
  };

  const nextRuntimeQueue = existing
    ? runtimeQueue.map((debt) =>
        debt.roomNumber === payload.roomNumber ? nextDebt : debt
      )
    : [...runtimeQueue, nextDebt];

  saveRuntimeDebtQueue(nextRuntimeQueue);
  return nextRuntimeQueue;
}

export function resolveDebtByRoomNumber(roomNumber: string): DebtItem[] {
  const runtimeQueue = loadRuntimeDebtQueue();
  const nextRuntimeQueue = runtimeQueue.filter(
    (debt) => debt.roomNumber !== roomNumber
  );

  saveRuntimeDebtQueue(nextRuntimeQueue);
  return nextRuntimeQueue;
}

export function settleDebtByRoomNumber(
  roomNumber: string
): DebtCollectionQueueItem[] {
  const queue = loadDebtCollectionQueue();
  const targetDebtIds = queue
    .filter((debt) => debt.roomNumber === roomNumber)
    .map((debt) => debt.id);

  if (targetDebtIds.length > 0) {
    const reminderState = loadDebtReminderStateMap();
    let hasStateChanged = false;

    for (const debtId of targetDebtIds) {
      if (debtId in reminderState) {
        delete reminderState[debtId];
        hasStateChanged = true;
      }
    }

    if (hasStateChanged) {
      saveDebtReminderStateMap(reminderState);
    }
  }

  resolveDebtByRoomNumber(roomNumber);

  return loadDebtCollectionQueue().filter(
    (debt) => debt.roomNumber !== roomNumber
  );
}
