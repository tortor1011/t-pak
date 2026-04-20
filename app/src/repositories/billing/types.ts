import type { DebtItem, SlipVerification } from '@/types/billing';
import type { Room } from '@/types/room';

export type SlipDecision = 'pending' | 'approved' | 'rejected';
export type SlipReviewDecision = Exclude<SlipDecision, 'pending'>;

export interface SlipVerificationQueueItem extends SlipVerification {
  decision: SlipDecision;
  reviewedAt: string | null;
}

export interface DebtCollectionQueueItem extends DebtItem {
  reminderCount: number;
}

export type BillingAggregationRoom = Pick<Room, 'number' | 'billingStatus'>;

export interface OwnerBillingAggregation {
  pendingSlipCount: number;
  debtQueue: DebtCollectionQueueItem[];
  activeDebtQueue: DebtCollectionQueueItem[];
  totalOutstanding: number;
}
