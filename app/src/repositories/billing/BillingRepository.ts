import type { Result } from '@/repositories/common/Result';
import type {
  BillingAggregationRoom,
  DebtCollectionQueueItem,
  MeterReadingSubmission,
  OwnerBillingAggregation,
  SlipReviewDecision,
  SlipVerificationQueueItem,
} from '@/repositories/billing/types';
import type { BillItem, MeterReading } from '@/types/billing';

export interface BillingRepository {
  loadRoomBills(roomId: string): Promise<Result<BillItem[]>>;
  loadMeterReadings(): Promise<Result<MeterReading[]>>;
  submitMeterReadings(
    readings: MeterReadingSubmission[]
  ): Promise<Result<MeterReading[]>>;
  loadOwnerBillingAggregation(
    rooms: BillingAggregationRoom[]
  ): Promise<Result<OwnerBillingAggregation>>;
  loadSlipVerificationQueue(): Promise<Result<SlipVerificationQueueItem[]>>;
  reviewSlipVerification(
    slipId: string,
    decision: SlipReviewDecision
  ): Promise<Result<SlipVerificationQueueItem[]>>;
  loadDebtCollectionQueue(): Promise<Result<DebtCollectionQueueItem[]>>;
  sendDebtReminder(debtId: string): Promise<Result<DebtCollectionQueueItem[]>>;
  sendBulkDebtRemindersByIds(
    debtIds: string[]
  ): Promise<Result<DebtCollectionQueueItem[]>>;
  settleDebtAndMarkRoomPaid(
    roomNumber: string
  ): Promise<Result<DebtCollectionQueueItem[]>>;
}
