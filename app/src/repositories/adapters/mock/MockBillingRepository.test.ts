import { describe, expect, it } from 'vitest';
import { MockBillingRepository } from '@/repositories/adapters/mock/MockBillingRepository';
import type { BillingAggregationRoom } from '@/repositories/billing/types';

describe('MockBillingRepository', () => {
  it('loads room bills via repository contract', () => {
    const repository = new MockBillingRepository();

    const result = repository.loadRoomBills('r101');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.length).toBeGreaterThan(0);
      expect(result.value[0]).toHaveProperty('roomId', 'r101');
      expect(result.value[0]).toHaveProperty('totalAmount');
    }
  });

  it('loads meter readings via repository contract', () => {
    const repository = new MockBillingRepository();

    const result = repository.loadMeterReadings();

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.length).toBeGreaterThan(0);
      expect(result.value[0]).toHaveProperty('roomNumber');
      expect(result.value[0]).toHaveProperty('electricity');
    }
  });

  it('loads owner billing aggregation with paid-room debt filtering', () => {
    const repository = new MockBillingRepository();
    const rooms: BillingAggregationRoom[] = [
      { number: '103', billingStatus: 'unpaid' },
      { number: '202', billingStatus: 'unpaid' },
      { number: '205', billingStatus: 'paid' },
    ];

    const result = repository.loadOwnerBillingAggregation(rooms);

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

  it('returns zero active outstanding when all debt rooms are paid', () => {
    const repository = new MockBillingRepository();
    const rooms: BillingAggregationRoom[] = [
      { number: '103', billingStatus: 'paid' },
      { number: '202', billingStatus: 'paid' },
      { number: '205', billingStatus: 'paid' },
    ];

    const result = repository.loadOwnerBillingAggregation(rooms);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.activeDebtQueue).toEqual([]);
      expect(result.value.totalOutstanding).toBe(0);
    }
  });

  it('loads slip verification queue from repository contract', () => {
    const repository = new MockBillingRepository();

    const result = repository.loadSlipVerificationQueue();

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.length).toBeGreaterThan(0);
      expect(result.value[0]).toHaveProperty('decision');
      expect(result.value[0]).toHaveProperty('roomNumber');
    }
  });

  it('reviews slip verification via repository orchestration', () => {
    const repository = new MockBillingRepository();
    const queueResult = repository.loadSlipVerificationQueue();

    expect(queueResult.ok).toBe(true);
    if (!queueResult.ok || queueResult.value.length === 0) {
      return;
    }

    const target = queueResult.value[0];
    const reviewResult = repository.reviewSlipVerification(target.id, 'approved');

    expect(reviewResult.ok).toBe(true);
    if (reviewResult.ok) {
      const reviewed = reviewResult.value.find((item) => item.id === target.id);
      expect(reviewed?.decision).toBe('approved');
    }
  });

  it('settles debt and marks room status through a single method', () => {
    const repository = new MockBillingRepository();

    const result = repository.settleDebtAndMarkRoomPaid('205');

    expect(result.ok).toBe(true);
  });
});
