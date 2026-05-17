import { BillingSummary, calculateBillingSummary } from '@/services/billingSummary';
import { getRepositories } from '@/repositories';
import { err, type Result } from '@/repositories/common/Result';
import type { DebtCollectionQueueItem, SlipVerificationQueueItem } from '@/repositories/billing/types';
import { Room } from '@/types/room';

export interface OwnerBillingState {
  rooms: Room[];
  summary: BillingSummary;
  pendingSlipCount: number;
  slipQueue: SlipVerificationQueueItem[];
  debtQueue: DebtCollectionQueueItem[];
  activeDebtQueue: DebtCollectionQueueItem[];
  totalOutstanding: number;
}

export const EMPTY_OWNER_BILLING_STATE: OwnerBillingState = {
  rooms: [],
  summary: {
    totalRevenue: 0,
    pendingPayments: 0,
    collectedRevenue: 0,
    totalRooms: 0,
    occupiedRooms: 0,
    vacantRooms: 0,
  },
  pendingSlipCount: 0,
  slipQueue: [],
  debtQueue: [],
  activeDebtQueue: [],
  totalOutstanding: 0,
};

export async function buildOwnerBillingState(): Promise<OwnerBillingState> {
  const { roomRepository, billingRepository } = getRepositories();
  const roomsResult = await roomRepository.listRooms();

  if (!roomsResult.ok) {
    return EMPTY_OWNER_BILLING_STATE;
  }

  const rooms = roomsResult.value;
  const ownerBillingAggregationResult = await billingRepository.loadOwnerBillingAggregation(rooms);

  if (!ownerBillingAggregationResult.ok) {
    return EMPTY_OWNER_BILLING_STATE;
  }

  const {
    pendingSlipCount,
    debtQueue,
    activeDebtQueue,
    totalOutstanding,
  } = ownerBillingAggregationResult.value;
  const slipQueueResult = await billingRepository.loadSlipVerificationQueue();
  const summary = calculateBillingSummary(rooms);

  return {
    rooms,
    summary,
    pendingSlipCount,
    slipQueue: slipQueueResult.ok ? slipQueueResult.value : [],
    debtQueue,
    activeDebtQueue,
    totalOutstanding,
  };
}

export async function buildOwnerBillingStateResult(): Promise<Result<OwnerBillingState>> {
  try {
    return {
      ok: true,
      value: await buildOwnerBillingState(),
    };
  } catch (error) {
    return err({
      code: 'UNKNOWN_ERROR',
      message: 'Failed to build owner billing state.',
      details: error,
    });
  }
}
