import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MockBillingRepository } from '@/repositories/adapters/mock/MockBillingRepository';
import type {
  BillingAggregationRoom,
  MeterReadingSubmission,
} from '@/repositories/billing/types';

class MemoryStorage implements Storage {
  private store = new Map<string, string>();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key) ?? null : null;
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
}

function attachMockWindow(
  localStorage: Storage,
  dispatchEvent: ReturnType<typeof vi.fn>
): void {
  Object.defineProperty(globalThis, 'window', {
    value: {
      localStorage,
      dispatchEvent,
    },
    configurable: true,
    writable: true,
  });
}

function detachMockWindow(): void {
  Reflect.deleteProperty(globalThis, 'window');
}

describe('MockBillingRepository', () => {
  let dispatchEvent: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    dispatchEvent = vi.fn();
    attachMockWindow(new MemoryStorage(), dispatchEvent);
  });

  afterEach(() => {
    detachMockWindow();
  });

  it('loads room bills via repository contract', async () => {
    const repository = new MockBillingRepository();

    const result = await repository.loadRoomBills('r101');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.length).toBeGreaterThan(0);
      expect(result.value[0]).toHaveProperty('roomId', 'r101');
      expect(result.value[0]).toHaveProperty('totalAmount');
    }
  });

  it('loads meter readings via repository contract', async () => {
    const repository = new MockBillingRepository();

    const result = await repository.loadMeterReadings();

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.length).toBeGreaterThan(0);
      expect(result.value[0]).toHaveProperty('roomNumber');
      expect(result.value[0]).toHaveProperty('electricity');
    }
  });

  it('submits meter readings via repository contract and persists current values', async () => {
    const repository = new MockBillingRepository();
    const submissions: MeterReadingSubmission[] = [
      {
        roomId: 'r101',
        electricityCurrent: 1300.5,
        waterCurrent: 500,
      },
      {
        roomId: 'r102',
        electricityCurrent: 2400,
        waterCurrent: 600.25,
      },
    ];

    const submitResult = await repository.submitMeterReadings(submissions);

    expect(submitResult.ok).toBe(true);
    if (submitResult.ok) {
      const room101 = submitResult.value.find((reading) => reading.roomId === 'r101');
      const room102 = submitResult.value.find((reading) => reading.roomId === 'r102');

      expect(room101?.electricity.current).toBe(1300.5);
      expect(room101?.water.current).toBe(500);
      expect(room102?.electricity.current).toBe(2400);
      expect(room102?.water.current).toBe(600.25);
    }

    const loadedResult = await repository.loadMeterReadings();

    expect(loadedResult.ok).toBe(true);
    if (loadedResult.ok) {
      const room101 = loadedResult.value.find((reading) => reading.roomId === 'r101');
      const room102 = loadedResult.value.find((reading) => reading.roomId === 'r102');

      expect(room101?.electricity.current).toBe(1300.5);
      expect(room101?.water.current).toBe(500);
      expect(room102?.electricity.current).toBe(2400);
      expect(room102?.water.current).toBe(600.25);
    }

    expect(dispatchEvent).toHaveBeenCalledTimes(1);
  });

  it('returns validation error when submitted reading is below previous value', async () => {
    const repository = new MockBillingRepository();
    const invalidSubmission: MeterReadingSubmission[] = [
      {
        roomId: 'r101',
        electricityCurrent: 1000,
        waterCurrent: 500,
      },
    ];

    const result = await repository.submitMeterReadings(invalidSubmission);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('VALIDATION_ERROR');
    }
    expect(dispatchEvent).not.toHaveBeenCalled();
  });

  it('loads owner billing aggregation with paid-room debt filtering', async () => {
    const repository = new MockBillingRepository();
    const rooms: BillingAggregationRoom[] = [
      { number: '103', billingStatus: 'unpaid' },
      { number: '202', billingStatus: 'unpaid' },
      { number: '205', billingStatus: 'paid' },
    ];

    const result = await repository.loadOwnerBillingAggregation(rooms);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.pendingSlipCount).toBe(3);
      expect(result.value.debtQueue.length).toBeGreaterThanOrEqual(
        result.value.activeDebtQueue.length
      );
      expect(
        result.value.activeDebtQueue.some((debt) => debt.roomNumber === '205')
      ).toBe(false);
      expect(result.value.totalOutstanding).toBe(
        result.value.activeDebtQueue.reduce(
          (sum, debt) => sum + debt.totalOutstanding,
          0
        )
      );
    }
  });

  it('returns zero active outstanding when all debt rooms are paid', async () => {
    const repository = new MockBillingRepository();
    const rooms: BillingAggregationRoom[] = [
      { number: '103', billingStatus: 'paid' },
      { number: '202', billingStatus: 'paid' },
      { number: '205', billingStatus: 'paid' },
    ];

    const result = await repository.loadOwnerBillingAggregation(rooms);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.activeDebtQueue).toEqual([]);
      expect(result.value.totalOutstanding).toBe(0);
    }
  });

  it('loads slip verification queue from repository contract', async () => {
    const repository = new MockBillingRepository();

    const result = await repository.loadSlipVerificationQueue();

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.length).toBeGreaterThan(0);
      expect(result.value[0]).toHaveProperty('decision');
      expect(result.value[0]).toHaveProperty('roomNumber');
    }
  });

  it('reviews slip verification via repository orchestration', async () => {
    const repository = new MockBillingRepository();
    const queueResult = await repository.loadSlipVerificationQueue();

    expect(queueResult.ok).toBe(true);
    if (!queueResult.ok || queueResult.value.length === 0) {
      return;
    }

    const target = queueResult.value[0];
    const reviewResult = await repository.reviewSlipVerification(target.id, 'approved');

    expect(reviewResult.ok).toBe(true);
    if (reviewResult.ok) {
      const reviewed = reviewResult.value.find((item) => item.id === target.id);
      expect(reviewed?.decision).toBe('approved');
    }
  });

  it('settles debt and marks room status through a single method', async () => {
    const repository = new MockBillingRepository();

    const result = await repository.settleDebtAndMarkRoomPaid('205');

    expect(result.ok).toBe(true);
  });
});
