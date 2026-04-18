import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  applyBulkRoomAdditionalChargeRuleIds,
  getRoomAdditionalChargeRuleIds,
  loadRoomAdditionalChargeOverrides,
  resetBulkRoomAdditionalChargeOverrides,
  setRoomAdditionalChargeRuleIds,
} from '@/services/roomAdditionalChargeOverrides';

const STORAGE_KEY = 'estate_clarity.roomAdditionalChargeOverrides.v1';

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

describe('roomAdditionalChargeOverrides', () => {
  let localStorage: MemoryStorage;

  beforeEach(() => {
    localStorage = new MemoryStorage();
    attachMockWindow(localStorage);
  });

  afterEach(() => {
    detachMockWindow();
  });

  it('applies bulk room charge rule ids and deduplicates valid ids', () => {
    const next = applyBulkRoomAdditionalChargeRuleIds(
      [101, '102', '   '],
      ['charge-common', 'charge-elevator', 'charge-common', '']
    );

    expect(next['101']).toEqual(['charge-common', 'charge-elevator']);
    expect(next['102']).toEqual(['charge-common', 'charge-elevator']);
    expect(next['']).toBeUndefined();

    const loaded = loadRoomAdditionalChargeOverrides();
    expect(loaded).toEqual(next);
  });

  it('sets, gets, and resets room overrides without touching other rooms', () => {
    setRoomAdditionalChargeRuleIds('101', ['charge-common']);
    setRoomAdditionalChargeRuleIds('102', ['charge-pool', 'charge-common']);

    expect(getRoomAdditionalChargeRuleIds('101')).toEqual(['charge-common']);
    expect(getRoomAdditionalChargeRuleIds('102')).toEqual([
      'charge-pool',
      'charge-common',
    ]);

    const afterReset = resetBulkRoomAdditionalChargeOverrides(['101']);

    expect(afterReset['101']).toBeUndefined();
    expect(afterReset['102']).toEqual(['charge-pool', 'charge-common']);
  });

  it('returns empty object when stored JSON is invalid', () => {
    localStorage.setItem(STORAGE_KEY, '{invalid-json');

    expect(loadRoomAdditionalChargeOverrides()).toEqual({});
  });
});
