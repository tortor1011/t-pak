import { MOCK_ROOMS } from '@/services/mockData';
import { BillingSummary, calculateBillingSummary } from '@/services/billingSummary';
import { buildOwnerRooms } from '@/services/ownerRooms';
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
  const rooms = buildOwnerRooms(MOCK_ROOMS);
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
