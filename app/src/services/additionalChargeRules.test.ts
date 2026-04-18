import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  buildRoomAdditionalChargeContext,
  calculateAdditionalChargeForRoomNumber,
  calculateRoomAdditionalCharge,
  loadAdditionalChargeForRoomNumber,
} from '@/services/additionalChargeRules';
import type { AdditionalChargeRule } from '@/services/propertySettings';
import type { Room } from '@/types/room';

const PROPERTY_SETTINGS_STORAGE_KEY = 'estate_clarity.propertySettings.v1';
const ROOM_OVERRIDES_STORAGE_KEY = 'estate_clarity.roomAdditionalChargeOverrides.v1';

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

function attachMockWindow(localStorage: Storage): void {
  Object.defineProperty(globalThis, 'window', {
    value: { localStorage },
    configurable: true,
    writable: true,
  });
}

function detachMockWindow(): void {
  Reflect.deleteProperty(globalThis, 'window');
}

describe('additionalChargeRules', () => {
  let localStorage: MemoryStorage;

  beforeEach(() => {
    localStorage = new MemoryStorage();
    attachMockWindow(localStorage);
  });

  afterEach(() => {
    detachMockWindow();
  });

  it('calculates per-room additional charges with overrides and global fallback', () => {
    const rules: AdditionalChargeRule[] = [
      { id: 'charge-common', name: 'Common Area', amount: 200, isActive: true },
      { id: 'charge-elevator', name: 'Elevator', amount: 150, isActive: true },
      { id: 'charge-disabled', name: 'Disabled', amount: 999, isActive: false },
    ];

    const context = buildRoomAdditionalChargeContext(rules, {
      '101': ['charge-common'],
      '102': ['charge-elevator', 'charge-missing'],
      '103': [],
    });

    expect(calculateAdditionalChargeForRoomNumber('101', context)).toBe(200);
    expect(calculateAdditionalChargeForRoomNumber('102', context)).toBe(150);
    expect(calculateAdditionalChargeForRoomNumber('103', context)).toBe(0);
    expect(calculateAdditionalChargeForRoomNumber('104', context)).toBe(350);
  });

  it('returns 0 for vacant rooms in room-level additional charge calculation', () => {
    const rules: AdditionalChargeRule[] = [
      { id: 'charge-common', name: 'Common Area', amount: 180, isActive: true },
    ];

    const context = buildRoomAdditionalChargeContext(rules, {
      '101': ['charge-common'],
    });

    const occupiedRoom: Room = {
      id: 'r101',
      number: '101',
      floor: 1,
      building: 'A',
      occupancy: 'occupied',
      billingStatus: 'unpaid',
      baseRent: 4500,
      currentBill: 4500,
      tenantId: 't1',
      tenantName: 'Tenant One',
      tenantAvatar: null,
      amenities: ['AC'],
    };

    const vacantRoom: Room = {
      ...occupiedRoom,
      id: 'r105',
      number: '105',
      occupancy: 'vacant',
      tenantId: null,
      tenantName: null,
      currentBill: 0,
    };

    expect(calculateRoomAdditionalCharge(occupiedRoom, context)).toBe(180);
    expect(calculateRoomAdditionalCharge(vacantRoom, context)).toBe(0);
  });

  it('loads room additional charge from persisted settings and room overrides', () => {
    localStorage.setItem(
      PROPERTY_SETTINGS_STORAGE_KEY,
      JSON.stringify({
        electricityRate: 8,
        waterRate: 20,
        lateFee: 200,
        lateFeeDay: 5,
        additionalChargeRules: [
          { id: 'charge-common', name: 'Common Area', amount: 220, isActive: true },
          { id: 'charge-pool', name: 'Pool', amount: 300, isActive: true },
          { id: 'charge-disabled', name: 'Disabled', amount: 100, isActive: false },
        ],
        updatedAt: '2026-04-18T12:00:00.000Z',
      })
    );

    localStorage.setItem(
      ROOM_OVERRIDES_STORAGE_KEY,
      JSON.stringify({
        '101': ['charge-common'],
        '102': ['charge-pool', 'charge-common'],
        '103': [],
      })
    );

    expect(loadAdditionalChargeForRoomNumber('101')).toBe(220);
    expect(loadAdditionalChargeForRoomNumber('102')).toBe(520);
    expect(loadAdditionalChargeForRoomNumber('103')).toBe(0);
    expect(loadAdditionalChargeForRoomNumber('999')).toBe(520);
  });
});
