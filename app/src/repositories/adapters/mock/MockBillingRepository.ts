import { err, ok, type Result } from '@/repositories/common/Result';
import type { BillingRepository } from '@/repositories/billing/BillingRepository';
import type {
  BillingAggregationRoom,
  DebtCollectionQueueItem,
  MeterReadingSubmission,
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

const METER_READING_STORAGE_KEY = 'estate_clarity.submittedMeterReadings.v1';

interface SubmittedMeterReadingState {
  electricityCurrent: number;
  waterCurrent: number;
}

type SubmittedMeterReadingStateMap = Record<string, SubmittedMeterReadingState>;

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function dispatchBillingStateUpdated(): void {
  if (!isBrowser()) {
    return;
  }

  window.dispatchEvent(new Event('estate_clarity.billing_state_updated'));
}

function isNonNegativeFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function sanitizeSubmittedMeterReadingState(
  input: unknown
): SubmittedMeterReadingStateMap {
  if (!input || typeof input !== 'object') {
    return {};
  }

  const nextState: SubmittedMeterReadingStateMap = {};

  for (const [roomId, value] of Object.entries(input as Record<string, unknown>)) {
    if (roomId.trim() === '' || !value || typeof value !== 'object') {
      continue;
    }

    const candidate = value as Record<string, unknown>;
    const electricityCurrent = candidate.electricityCurrent;
    const waterCurrent = candidate.waterCurrent;

    if (
      !isNonNegativeFiniteNumber(electricityCurrent) ||
      !isNonNegativeFiniteNumber(waterCurrent)
    ) {
      continue;
    }

    nextState[roomId.trim()] = {
      electricityCurrent,
      waterCurrent,
    };
  }

  return nextState;
}

function loadSubmittedMeterReadingState(): SubmittedMeterReadingStateMap {
  if (!isBrowser()) {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(METER_READING_STORAGE_KEY);
    if (!raw) {
      return {};
    }

    const parsed: unknown = JSON.parse(raw);
    return sanitizeSubmittedMeterReadingState(parsed);
  } catch {
    return {};
  }
}

function saveSubmittedMeterReadingState(
  state: SubmittedMeterReadingStateMap
): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(
    METER_READING_STORAGE_KEY,
    JSON.stringify(sanitizeSubmittedMeterReadingState(state))
  );
}

function mergeMeterReadingsWithSubmittedState(
  baseReadings: MeterReading[],
  submittedState: SubmittedMeterReadingStateMap
): MeterReading[] {
  return baseReadings.map((reading) => {
    const submitted = submittedState[reading.roomId];
    if (!submitted) {
      return {
        ...reading,
        electricity: { ...reading.electricity },
        water: { ...reading.water },
      };
    }

    const canUseSubmittedElectricity =
      submitted.electricityCurrent >= reading.electricity.previous;
    const canUseSubmittedWater = submitted.waterCurrent >= reading.water.previous;

    return {
      ...reading,
      electricity: {
        ...reading.electricity,
        current: canUseSubmittedElectricity
          ? submitted.electricityCurrent
          : reading.electricity.current,
      },
      water: {
        ...reading.water,
        current: canUseSubmittedWater
          ? submitted.waterCurrent
          : reading.water.current,
      },
    };
  });
}

function validateMeterReadingSubmission(
  reading: MeterReadingSubmission,
  meterReadingsByRoomId: Map<string, MeterReading>
): string | null {
  if (!isNonNegativeFiniteNumber(reading.electricityCurrent)) {
    return `Room ID ${reading.roomId} has invalid electricity meter reading.`;
  }

  if (!isNonNegativeFiniteNumber(reading.waterCurrent)) {
    return `Room ID ${reading.roomId} has invalid water meter reading.`;
  }

  const targetRoom = meterReadingsByRoomId.get(reading.roomId);
  if (!targetRoom) {
    return `Meter reading room ID ${reading.roomId} was not found.`;
  }

  if (reading.electricityCurrent < targetRoom.electricity.previous) {
    return `Room ${targetRoom.roomNumber} electricity reading must be greater than or equal to previous value.`;
  }

  if (reading.waterCurrent < targetRoom.water.previous) {
    return `Room ${targetRoom.roomNumber} water reading must be greater than or equal to previous value.`;
  }

  return null;
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
      const submittedState = loadSubmittedMeterReadingState();
      const meterReadings = mergeMeterReadingsWithSubmittedState(
        MOCK_METER_READINGS,
        submittedState
      );

      return ok(meterReadings);
    } catch (error) {
      return err({
        code: 'UNKNOWN_ERROR',
        message: 'Failed to load meter readings.',
        details: error,
      });
    }
  }

  submitMeterReadings(
    readings: MeterReadingSubmission[]
  ): Result<MeterReading[]> {
    if (readings.length === 0) {
      return err({
        code: 'VALIDATION_ERROR',
        message: 'At least one meter reading is required.',
      });
    }

    try {
      const meterReadingsResult = this.loadMeterReadings();
      if (!meterReadingsResult.ok) {
        return meterReadingsResult;
      }

      const meterReadingsByRoomId = new Map(
        meterReadingsResult.value.map((reading) => [reading.roomId, reading] as const)
      );

      const normalizedReadings: MeterReadingSubmission[] = [];
      const submittedRoomIds = new Set<string>();

      for (const reading of readings) {
        const normalizedRoomId = reading.roomId.trim();
        if (normalizedRoomId === '') {
          return err({
            code: 'VALIDATION_ERROR',
            message: 'Meter reading room ID is required.',
          });
        }

        if (submittedRoomIds.has(normalizedRoomId)) {
          return err({
            code: 'VALIDATION_ERROR',
            message: `Duplicate meter reading for room ID ${normalizedRoomId}.`,
          });
        }

        const normalizedReading: MeterReadingSubmission = {
          roomId: normalizedRoomId,
          electricityCurrent: reading.electricityCurrent,
          waterCurrent: reading.waterCurrent,
        };

        const validationError = validateMeterReadingSubmission(
          normalizedReading,
          meterReadingsByRoomId
        );

        if (validationError) {
          return err({
            code: 'VALIDATION_ERROR',
            message: validationError,
          });
        }

        submittedRoomIds.add(normalizedRoomId);
        normalizedReadings.push(normalizedReading);
      }

      const submittedState = loadSubmittedMeterReadingState();

      for (const reading of normalizedReadings) {
        submittedState[reading.roomId] = {
          electricityCurrent: reading.electricityCurrent,
          waterCurrent: reading.waterCurrent,
        };
      }

      saveSubmittedMeterReadingState(submittedState);

      const updatedMeterReadings = mergeMeterReadingsWithSubmittedState(
        MOCK_METER_READINGS,
        submittedState
      );

      dispatchBillingStateUpdated();
      return ok(updatedMeterReadings);
    } catch (error) {
      return err({
        code: 'UNKNOWN_ERROR',
        message: 'Failed to submit meter readings.',
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
