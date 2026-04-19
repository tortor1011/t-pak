import { describe, expect, it } from 'vitest';
import { MockReportsRepository } from '@/repositories/adapters/mock/MockReportsRepository';

describe('MockReportsRepository', () => {
  it('loads financial summary from repository contract', () => {
    const repository = new MockReportsRepository();

    const result = repository.loadFinancialSummary();

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.totalRevenue).toBeGreaterThan(0);
      expect(result.value.monthlyData.length).toBeGreaterThan(0);
      expect(result.value.monthlyData[0]).toHaveProperty('month');
    }
  });
});
