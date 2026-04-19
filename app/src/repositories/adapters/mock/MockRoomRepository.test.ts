import { afterEach, describe, expect, it, vi } from 'vitest';
import { setRepositories } from '@/repositories';
import { MockBillingRepository } from '@/repositories/adapters/mock/MockBillingRepository';
import { MockRoomRepository } from '@/repositories/adapters/mock/MockRoomRepository';
import { MockSettingsRepository } from '@/repositories/adapters/mock/MockSettingsRepository';
import { buildOwnerBillingState } from '@/services/ownerBillingState';

describe('MockRoomRepository', () => {
  afterEach(() => {
    setRepositories({
      roomRepository: new MockRoomRepository(),
      billingRepository: new MockBillingRepository(),
      settingsRepository: new MockSettingsRepository(),
    });
  });

  it('returns rooms list from repository contract', () => {
    const repository = new MockRoomRepository();

    const result = repository.listRooms();

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.length).toBeGreaterThan(0);
      expect(result.value[0]).toHaveProperty('id');
      expect(result.value[0]).toHaveProperty('number');
      expect(result.value[0]).toHaveProperty('baseRent');
    }
  });

  it('returns safe empty billing state when room repository fails', () => {
    setRepositories({
      roomRepository: {
        listRooms: () => ({
          ok: false as const,
          error: {
            code: 'UNKNOWN_ERROR' as const,
            message: 'Simulated failure',
          },
        }),
      },
      billingRepository: new MockBillingRepository(),
      settingsRepository: new MockSettingsRepository(),
    });

    const state = buildOwnerBillingState();

    expect(state.rooms).toEqual([]);
    expect(state.summary.totalRooms).toBe(0);
    expect(state.totalOutstanding).toBe(0);
  });

  it('returns repository error result when buildOwnerRooms throws', () => {
    const repository = new MockRoomRepository();
    const spy = vi
      .spyOn(repository, 'listRooms')
      .mockReturnValueOnce({
        ok: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message: 'Injected failure',
        },
      });

    const result = repository.listRooms();

    expect(result.ok).toBe(false);
    spy.mockRestore();
  });
});
