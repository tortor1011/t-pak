import { BillingSummary, calculateBillingSummary } from '@/services/billingSummary';
import { getRepositories } from '@/repositories';
import { err, type Result } from '@/repositories/common/Result';
import {
  countPendingSlipVerifications,
  loadSlipVerificationQueue,
} from '@/services/slipVerificationQueue';
import {
  DebtCollectionQueueItem,
  loadDebtCollectionQueue,
} from '@/services/debtReminderQueue';
import { Room } from '@/types/room';

export interface OwnerBillingState {
  rooms: Room[];
  summary: BillingSummary;
  pendingSlipCount: number;
  debtQueue: DebtCollectionQueueItem[];
  activeDebtQueue: DebtCollectionQueueItem[];
  totalOutstanding: number;
}

const EMPTY_OWNER_BILLING_STATE: OwnerBillingState = {
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
  debtQueue: [],
  activeDebtQueue: [],
  totalOutstanding: 0,
};

function getActiveDebtQueue(
  debtQueue: DebtCollectionQueueItem[],
  rooms: Room[]
): DebtCollectionQueueItem[] {
  const paidRoomNumbers = new Set(
    rooms
      .filter((room) => room.billingStatus === 'paid')
      .map((room) => room.number)
  );

  return debtQueue.filter((debt) => !paidRoomNumbers.has(debt.roomNumber));
}

export function buildOwnerBillingState(): OwnerBillingState {
  const { roomRepository } = getRepositories();
  const roomsResult = roomRepository.listRooms();

  if (!roomsResult.ok) {
    return EMPTY_OWNER_BILLING_STATE;
  }

  const rooms = roomsResult.value;
  const summary = calculateBillingSummary(rooms);
  const pendingSlipCount = countPendingSlipVerifications(loadSlipVerificationQueue());
  const debtQueue = loadDebtCollectionQueue();
  const activeDebtQueue = getActiveDebtQueue(debtQueue, rooms);
  const totalOutstanding = activeDebtQueue.reduce(
    (sum, debt) => sum + debt.totalOutstanding,
    0
  );

  return {
    rooms,
    summary,
    pendingSlipCount,
    debtQueue,
    activeDebtQueue,
    totalOutstanding,
  };
}

export function buildOwnerBillingStateResult(): Result<OwnerBillingState> {
  try {
    return {
      ok: true,
      value: buildOwnerBillingState(),
    };
  } catch (error) {
    return err({
      code: 'UNKNOWN_ERROR',
      message: 'Failed to build owner billing state.',
      details: error,
    });
  }
}
