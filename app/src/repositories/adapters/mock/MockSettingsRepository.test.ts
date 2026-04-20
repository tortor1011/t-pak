import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MockSettingsRepository } from '@/repositories/adapters/mock/MockSettingsRepository';

const PROPERTY_SETTINGS_STORAGE_KEY = 'estate_clarity.propertySettings.v1';

const VALID_SETTINGS = {
  electricityRate: 9,
  waterRate: 21,
  lateFee: 250,
  lateFeeDay: 6,
  additionalChargeRules: [],
};

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

describe('MockSettingsRepository', () => {
  let localStorage: MemoryStorage;
  let dispatchEvent: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    localStorage = new MemoryStorage();
    dispatchEvent = vi.fn();
    attachMockWindow(localStorage, dispatchEvent);
  });

  afterEach(() => {
    detachMockWindow();
  });

  it('loads property settings from repository contract', () => {
    const repository = new MockSettingsRepository();

    const result = repository.loadPropertySettings();

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toHaveProperty('electricityRate');
      expect(result.value).toHaveProperty('updatedAt');
    }
  });

  it('saves property settings via repository contract', () => {
    const repository = new MockSettingsRepository();

    const result = repository.savePropertySettings(VALID_SETTINGS);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.electricityRate).toBe(9);
      expect(result.value.waterRate).toBe(21);
    }
    expect(dispatchEvent).toHaveBeenCalledTimes(1);
  });

  it('loads active additional-charge rules only', () => {
    localStorage.setItem(
      PROPERTY_SETTINGS_STORAGE_KEY,
      JSON.stringify({
        ...VALID_SETTINGS,
        additionalChargeRules: [
          {
            id: 'charge-common',
            name: 'Common Area',
            amount: 200,
            isActive: true,
          },
          {
            id: 'charge-pool',
            name: 'Pool',
            amount: 300,
            isActive: false,
          },
        ],
        updatedAt: new Date().toISOString(),
      })
    );

    const repository = new MockSettingsRepository();
    const result = repository.loadActiveAdditionalChargeRules();

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual([
        {
          id: 'charge-common',
          name: 'Common Area',
          amount: 200,
          isActive: true,
        },
      ]);
    }
  });
});
