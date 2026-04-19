import type { Result } from '@/repositories/common/Result';
import type {
  DebtCollectionQueueItem,
  SlipReviewDecision,
  SlipVerificationQueueItem,
} from '@/repositories/billing/types';

export interface BillingRepository {
  loadSlipVerificationQueue(): Result<SlipVerificationQueueItem[]>;
  reviewSlipVerification(
    slipId: string,
    decision: SlipReviewDecision
  ): Result<SlipVerificationQueueItem[]>;
  loadDebtCollectionQueue(): Result<DebtCollectionQueueItem[]>;
  sendDebtReminder(debtId: string): Result<DebtCollectionQueueItem[]>;
  sendBulkDebtRemindersByIds(
    debtIds: string[]
  ): Result<DebtCollectionQueueItem[]>;
  settleDebtAndMarkRoomPaid(
    roomNumber: string
  ): Result<DebtCollectionQueueItem[]>;
}
