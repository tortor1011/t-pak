import { describe, expect, it } from 'vitest';
import { MockComplaintsRepository } from '@/repositories/adapters/mock/MockComplaintsRepository';

describe('MockComplaintsRepository', () => {
  it('loads complaints from repository contract', () => {
    const repository = new MockComplaintsRepository();

    const result = repository.listComplaints();

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.length).toBeGreaterThan(0);
      expect(result.value[0]).toHaveProperty('status');
      expect(result.value[0]).toHaveProperty('roomNumber');
    }
  });
});
