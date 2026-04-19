import { describe, expect, it } from 'vitest';
import { MockBillingRepository } from '@/repositories/adapters/mock/MockBillingRepository';

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
