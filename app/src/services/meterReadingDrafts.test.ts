import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  loadMeterReadingDrafts,
  saveMeterReadingDrafts,
  type MeterReadingDraftMap,
} from '@/services/meterReadingDrafts';
import type { MeterReading } from '@/types/billing';

const STORAGE_KEY = 'estate_clarity.meterReadingDrafts.v1';

const BASE_METER_READINGS: MeterReading[] = [
  {
    roomId: 'r101',
    roomNumber: '101',
    building: 'A',
    floor: 1,
    electricity: { previous: 1234.5, current: null },
    water: { previous: 456.2, current: null },
  },
  {
    roomId: 'r102',
    roomNumber: '102',
    building: 'A',
    floor: 1,
    electricity: { previous: 2345, current: null },
    water: { previous: 567, current: null },
  },
];

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

describe('meterReadingDrafts', () => {
  let localStorage: MemoryStorage;

  beforeEach(() => {
    localStorage = new MemoryStorage();
    attachMockWindow(localStorage);
  });

  afterEach(() => {
    detachMockWindow();
  });

  it('loads default drafts from current meter reading values when no draft exists', () => {
    const drafts = loadMeterReadingDrafts(BASE_METER_READINGS);

    expect(drafts['r101']).toEqual({
      electric: '',
      water: '',
    });
    expect(drafts['r102']).toEqual({
      electric: '',
      water: '',
    });
  });

  it('persists and reloads saved drafts for known rooms', () => {
    const drafts: MeterReadingDraftMap = {
      r101: {
        electric: '1300.5',
        water: '500',
      },
      r102: {
        electric: '2400',
        water: '620.5',
      },
    };

    saveMeterReadingDrafts(drafts);

    const loaded = loadMeterReadingDrafts(BASE_METER_READINGS);

    expect(loaded['r101']).toEqual({
      electric: '1300.5',
      water: '500',
    });
    expect(loaded['r102']).toEqual({
      electric: '2400',
      water: '620.5',
    });
  });

  it('keeps valid persisted fields and falls back invalid fields to defaults', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        r101: {
          electric: 'invalid-value',
          water: '500',
        },
        r102: {
          electric: '2500',
          water: '-10',
        },
      })
    );

    const loaded = loadMeterReadingDrafts(BASE_METER_READINGS);

    expect(loaded['r101']).toEqual({
      electric: '',
      water: '500',
    });
    expect(loaded['r102']).toEqual({
      electric: '2500',
      water: '',
    });
  });
});
