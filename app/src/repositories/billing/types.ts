import type { DebtItem, SlipVerification } from '@/types/billing';

export type SlipDecision = 'pending' | 'approved' | 'rejected';
export type SlipReviewDecision = Exclude<SlipDecision, 'pending'>;

export interface SlipVerificationQueueItem extends SlipVerification {
  decision: SlipDecision;
  reviewedAt: string | null;
}

export interface DebtCollectionQueueItem extends DebtItem {
  reminderCount: number;
}
