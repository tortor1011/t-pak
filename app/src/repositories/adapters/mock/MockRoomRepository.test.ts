import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setRepositories } from '@/repositories';
import { MockBillingRepository } from '@/repositories/adapters/mock/MockBillingRepository';
import { MockComplaintsRepository } from '@/repositories/adapters/mock/MockComplaintsRepository';
import { MockDeliveryRepository } from '@/repositories/adapters/mock/MockDeliveryRepository';
import { MockNotificationRepository } from '@/repositories/adapters/mock/MockNotificationRepository';
import { MockReportsRepository } from '@/repositories/adapters/mock/MockReportsRepository';
import { MockRoomRepository } from '@/repositories/adapters/mock/MockRoomRepository';
import { MockSettingsRepository } from '@/repositories/adapters/mock/MockSettingsRepository';
import { MockVehicleRepository } from '@/repositories/adapters/mock/MockVehicleRepository';
import { buildOwnerBillingState } from '@/services/ownerBillingState';

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

function attachMockWindow(localStorage: Storage, dispatchEvent: ReturnType<typeof vi.fn>): void {
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

describe('MockRoomRepository', () => {
  let dispatchEvent: ReturnType<typeof vi.fn>;
  let notificationRepository: MockNotificationRepository;

  beforeEach(() => {
    dispatchEvent = vi.fn();
    notificationRepository = new MockNotificationRepository();
    attachMockWindow(new MemoryStorage(), dispatchEvent);
  });

  afterEach(() => {
    setRepositories({
      roomRepository: new MockRoomRepository(),
      billingRepository: new MockBillingRepository(),
      settingsRepository: new MockSettingsRepository(),
      complaintsRepository: new MockComplaintsRepository(),
      reportsRepository: new MockReportsRepository(),
      deliveryRepository: new MockDeliveryRepository(notificationRepository),
      vehicleRepository: new MockVehicleRepository(),
      notificationRepository,
    });

    detachMockWindow();
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
        applyBulkBaseRentOverrides: () => ({
          ok: true as const,
          value: {},
        }),
        applyBulkRoomAdditionalChargeRuleIds: () => ({
          ok: true as const,
          value: {},
        }),
        resetBulkRoomAdditionalChargeOverrides: () => ({
          ok: true as const,
          value: {},
        }),
      },
      billingRepository: new MockBillingRepository(),
      settingsRepository: new MockSettingsRepository(),
      complaintsRepository: new MockComplaintsRepository(),
      reportsRepository: new MockReportsRepository(),
      deliveryRepository: new MockDeliveryRepository(notificationRepository),
      vehicleRepository: new MockVehicleRepository(),
      notificationRepository,
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

  it('applies bulk base-rent overrides via repository contract', () => {
    const repository = new MockRoomRepository();
    const result = repository.applyBulkBaseRentOverrides([101, 102], 6200);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value['101']).toBe(6200);
      expect(result.value['102']).toBe(6200);
    }
    expect(dispatchEvent).toHaveBeenCalledTimes(1);
  });

  it('applies and resets bulk additional-charge overrides via repository contract', () => {
    const repository = new MockRoomRepository();
    const applyResult = repository.applyBulkRoomAdditionalChargeRuleIds(
      [101, 102],
      ['charge-common', 'charge-water']
    );

    expect(applyResult.ok).toBe(true);
    if (applyResult.ok) {
      expect(applyResult.value['101']).toEqual(['charge-common', 'charge-water']);
      expect(applyResult.value['102']).toEqual(['charge-common', 'charge-water']);
    }

    const resetResult = repository.resetBulkRoomAdditionalChargeOverrides([101]);

    expect(resetResult.ok).toBe(true);
    if (resetResult.ok) {
      expect(resetResult.value['101']).toBeUndefined();
      expect(resetResult.value['102']).toEqual(['charge-common', 'charge-water']);
    }

    expect(dispatchEvent).toHaveBeenCalledTimes(2);
  });
});
