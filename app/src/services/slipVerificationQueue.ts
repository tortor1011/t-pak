import { SlipVerification } from '@/types/billing';
import { MOCK_SLIPS } from '@/services/mockData';
import { setRoomBillingStatusOverride } from '@/services/roomBillingStatusOverrides';
import {
  resolveDebtByRoomNumber,
  upsertDebtFromSlip,
} from '@/services/debtReminderQueue';

const STORAGE_KEY = 'estate_clarity.slipVerificationQueue.v1';

export type SlipDecision = 'pending' | 'approved' | 'rejected';

export interface SlipVerificationQueueItem extends SlipVerification {
  decision: SlipDecision;
  reviewedAt: string | null;
}

export function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function isValidNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isValidStringOrNull(value: unknown): value is string | null {
  return value === null || typeof value === 'string';
}

function isSlipDecision(value: unknown): value is SlipDecision {
  return value === 'pending' || value === 'approved' || value === 'rejected';
}

function createDefaultQueue(): SlipVerificationQueueItem[] {
  return MOCK_SLIPS.map((slip) => ({
    ...slip,
    decision: 'pending',
    reviewedAt: null,
  }));
}

function sanitizeQueueItem(item: unknown): SlipVerificationQueueItem | null {
  if (!item || typeof item !== 'object') return null;

  const value = item as Record<string, unknown>;

  if (
    typeof value.id !== 'string' ||
    typeof value.roomNumber !== 'string' ||
    typeof value.tenantName !== 'string' ||
    !isValidNumber(value.amount) ||
    typeof value.slipUrl !== 'string' ||
    typeof value.uploadedAt !== 'string' ||
    !isValidStringOrNull(value.detectedDate) ||
    !isValidNumber(value.detectedAmount) && value.detectedAmount !== null ||
    typeof value.isAmountMatch !== 'boolean' ||
    !isSlipDecision(value.decision) ||
    !isValidStringOrNull(value.reviewedAt)
  ) {
    return null;
  }

  return {
    id: value.id,
    roomNumber: value.roomNumber,
    tenantName: value.tenantName,
    amount: value.amount,
    slipUrl: value.slipUrl,
    uploadedAt: value.uploadedAt,
    detectedAmount: value.detectedAmount,
    detectedDate: value.detectedDate,
    isAmountMatch: value.isAmountMatch,
    decision: value.decision,
    reviewedAt: value.reviewedAt,
  };
}

function mergeWithDefaults(queue: SlipVerificationQueueItem[]): SlipVerificationQueueItem[] {
  const persistedById = new Map(queue.map((item) => [item.id, item]));

  return createDefaultQueue().map((defaultItem) => {
    const persisted = persistedById.get(defaultItem.id);
    return persisted ?? defaultItem;
  });
}

export function loadSlipVerificationQueue(): SlipVerificationQueueItem[] {
  if (!isBrowser()) {
    return createDefaultQueue();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return createDefaultQueue();
    }

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return createDefaultQueue();
    }

    const sanitizedQueue = parsed
      .map((item) => sanitizeQueueItem(item))
      .filter((item): item is SlipVerificationQueueItem => item !== null);

    return mergeWithDefaults(sanitizedQueue);
  } catch {
    return createDefaultQueue();
  }
}

export function saveSlipVerificationQueue(queue: SlipVerificationQueueItem[]): void {
  if (!isBrowser()) return;

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
}

export function getPendingSlipVerificationQueue(
  queue: SlipVerificationQueueItem[] = loadSlipVerificationQueue()
): SlipVerificationQueueItem[] {
  return queue.filter((item) => item.decision === 'pending');
}

export function countPendingSlipVerifications(
  queue: SlipVerificationQueueItem[] = loadSlipVerificationQueue()
): number {
  return getPendingSlipVerificationQueue(queue).length;
}

export function reviewSlipVerification(
  slipId: string,
  decision: Exclude<SlipDecision, 'pending'>
): SlipVerificationQueueItem[] {
  const currentQueue = loadSlipVerificationQueue();
  const reviewedSlip = currentQueue.find((item) => item.id === slipId);

  const nextQueue = currentQueue.map((item) => {
    if (item.id !== slipId || item.decision !== 'pending') {
      return item;
    }

    return {
      ...item,
      decision,
      reviewedAt: new Date().toISOString(),
    };
  });

  saveSlipVerificationQueue(nextQueue);

  if (reviewedSlip) {
    setRoomBillingStatusOverride(
      reviewedSlip.roomNumber,
      decision === 'approved' ? 'paid' : 'unpaid'
    );

    if (decision === 'approved') {
      resolveDebtByRoomNumber(reviewedSlip.roomNumber);
    } else {
      upsertDebtFromSlip({
        roomNumber: reviewedSlip.roomNumber,
        tenantName: reviewedSlip.tenantName,
        amount: reviewedSlip.amount,
      });
    }
  }

  if (isBrowser()) {
    window.dispatchEvent(new Event('estate_clarity.billing_state_updated'));
  }

  return nextQueue;
}
