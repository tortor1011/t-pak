import { err, ok, type Result } from '@/repositories/common/Result';
import type { BillingRepository } from '@/repositories/billing/BillingRepository';
import type {
  BillingAggregationRoom,
  DebtCollectionQueueItem,
  OwnerBillingAggregation,
  SlipReviewDecision,
  SlipVerificationQueueItem,
} from '@/repositories/billing/types';
import {
  countPendingSlipVerifications,
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
import { MOCK_BILLS, MOCK_METER_READINGS } from '@/services/mockData';
import type { BillItem, MeterReading } from '@/types/billing';

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function dispatchBillingStateUpdated(): void {
  if (!isBrowser()) {
    return;
  }

  window.dispatchEvent(new Event('estate_clarity.billing_state_updated'));
}

function getActiveDebtQueue(
  debtQueue: DebtCollectionQueueItem[],
  rooms: BillingAggregationRoom[]
): DebtCollectionQueueItem[] {
  const paidRoomNumbers = new Set(
    rooms
      .filter((room) => room.billingStatus === 'paid')
      .map((room) => room.number)
  );

  return debtQueue.filter((debt) => !paidRoomNumbers.has(debt.roomNumber));
}

export class MockBillingRepository implements BillingRepository {
  loadRoomBills(roomId: string): Result<BillItem[]> {
    try {
      const bills = MOCK_BILLS
        .filter((bill) => bill.roomId === roomId)
        .sort(
          (a, b) =>
            new Date(b.meterReadDate).getTime() - new Date(a.meterReadDate).getTime()
        );
      return ok(bills);
    } catch (error) {
      return err({
        code: 'UNKNOWN_ERROR',
        message: 'Failed to load room bills.',
        details: error,
      });
    }
  }

  loadMeterReadings(): Result<MeterReading[]> {
    try {
      return ok(MOCK_METER_READINGS);
    } catch (error) {
      return err({
        code: 'UNKNOWN_ERROR',
        message: 'Failed to load meter readings.',
        details: error,
      });
    }
  }

  loadOwnerBillingAggregation(
    rooms: BillingAggregationRoom[]
  ): Result<OwnerBillingAggregation> {
    try {
      const slipQueue = loadSlipVerificationQueue();
      const debtQueue = loadDebtCollectionQueue();
      const activeDebtQueue = getActiveDebtQueue(debtQueue, rooms);
      const totalOutstanding = activeDebtQueue.reduce(
        (sum, debt) => sum + debt.totalOutstanding,
        0
      );

      return ok({
        pendingSlipCount: countPendingSlipVerifications(slipQueue),
        debtQueue,
        activeDebtQueue,
        totalOutstanding,
      });
    } catch (error) {
      return err({
        code: 'UNKNOWN_ERROR',
        message: 'Failed to load owner billing aggregation.',
        details: error,
      });
    }
  }

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
