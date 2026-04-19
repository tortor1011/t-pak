import { err, ok, type Result } from '@/repositories/common/Result';
import type { BillingRepository } from '@/repositories/billing/BillingRepository';
import type {
  DebtCollectionQueueItem,
  SlipReviewDecision,
  SlipVerificationQueueItem,
} from '@/repositories/billing/types';
import {
  loadSlipVerificationQueue,
  reviewSlipVerification,
} from '@/services/slipVerificationQueue';
import {
  loadDebtCollectionQueue,
  sendBulkDebtRemindersByIds,
  sendDebtReminder,
  settleDebtByRoomNumber,
} from '@/services/debtReminderQueue';
import { setRoomBillingStatusOverride } from '@/services/roomBillingStatusOverrides';

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function dispatchBillingStateUpdated(): void {
  if (!isBrowser()) {
    return;
  }

  window.dispatchEvent(new Event('estate_clarity.billing_state_updated'));
}

export class MockBillingRepository implements BillingRepository {
  loadSlipVerificationQueue(): Result<SlipVerificationQueueItem[]> {
    try {
      return ok(loadSlipVerificationQueue());
    } catch (error) {
      return err({
        code: 'UNKNOWN_ERROR',
        message: 'Failed to load slip verification queue.',
        details: error,
      });
    }
  }

  reviewSlipVerification(
    slipId: string,
    decision: SlipReviewDecision
  ): Result<SlipVerificationQueueItem[]> {
    try {
      const queue = reviewSlipVerification(slipId, decision);
      return ok(queue);
    } catch (error) {
      return err({
        code: 'UNKNOWN_ERROR',
        message: 'Failed to review slip verification item.',
        details: error,
      });
    }
  }

  loadDebtCollectionQueue(): Result<DebtCollectionQueueItem[]> {
    try {
      return ok(loadDebtCollectionQueue());
    } catch (error) {
      return err({
        code: 'UNKNOWN_ERROR',
        message: 'Failed to load debt collection queue.',
        details: error,
      });
    }
  }

  sendDebtReminder(debtId: string): Result<DebtCollectionQueueItem[]> {
    try {
      const queue = sendDebtReminder(debtId);
      dispatchBillingStateUpdated();
      return ok(queue);
    } catch (error) {
      return err({
        code: 'UNKNOWN_ERROR',
        message: 'Failed to send debt reminder.',
        details: error,
      });
    }
  }

  sendBulkDebtRemindersByIds(
    debtIds: string[]
  ): Result<DebtCollectionQueueItem[]> {
    try {
      const queue = sendBulkDebtRemindersByIds(debtIds);
      dispatchBillingStateUpdated();
      return ok(queue);
    } catch (error) {
      return err({
        code: 'UNKNOWN_ERROR',
        message: 'Failed to send bulk debt reminders.',
        details: error,
      });
    }
  }

  settleDebtAndMarkRoomPaid(
    roomNumber: string
  ): Result<DebtCollectionQueueItem[]> {
    try {
      const queue = settleDebtByRoomNumber(roomNumber);
      setRoomBillingStatusOverride(roomNumber, 'paid');
      dispatchBillingStateUpdated();
      return ok(queue);
    } catch (error) {
      return err({
        code: 'UNKNOWN_ERROR',
        message: 'Failed to settle debt and update room status.',
        details: error,
      });
    }
  }
}
