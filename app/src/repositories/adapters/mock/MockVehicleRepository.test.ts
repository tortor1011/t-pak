import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MockVehicleRepository } from '@/repositories/adapters/mock/MockVehicleRepository';

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
    value: {
      localStorage,
      dispatchEvent: () => true,
    },
    configurable: true,
    writable: true,
  });
}

function detachMockWindow(): void {
  Reflect.deleteProperty(globalThis, 'window');
}

describe('MockVehicleRepository', () => {
  let localStorage: MemoryStorage;

  beforeEach(() => {
    localStorage = new MemoryStorage();
    attachMockWindow(localStorage);
  });

  afterEach(() => {
    detachMockWindow();
  });

  it('returns conflict when registering duplicate plate', () => {
    const repository = new MockVehicleRepository();

    const result = repository.registerVehicle({
      tenantId: 't2',
      tenantName: 'สุรีย์ จันทร์ดี',
      roomNumber: '102',
      plate: '1กข 1234 กทม',
      vehicleType: 'car',
      status: 'verified',
    });

    expect(result.ok).toBe(false);
    if (result.ok) {
      throw new Error('Expected duplicate plate registration to fail.');
    }

    expect(result.error.code).toBe('CONFLICT');
  });

  it('can lookup exact plate with active tenant filter', () => {
    const repository = new MockVehicleRepository();

    const activeResult = repository.lookupByPlateExact('1กข 1234 กทม', {
      activeTenantOnly: true,
    });
    expect(activeResult.ok).toBe(true);
    if (!activeResult.ok) {
      throw new Error('Expected active lookup to succeed.');
    }

    expect(activeResult.value?.roomNumber).toBe('101');

    const filteredResult = repository.lookupByPlateExact('ศท 2211 กทม', {
      activeTenantOnly: true,
    });
    expect(filteredResult.ok).toBe(true);
    if (!filteredResult.ok) {
      throw new Error('Expected filtered lookup to succeed.');
    }

    expect(filteredResult.value).toBeNull();
  });

  it('returns only selected room records when room filter is set', () => {
    const repository = new MockVehicleRepository();

    const result = repository.searchVehicles('', {
      roomNumber: '101',
      activeTenantOnly: false,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error('Expected room-filtered search to succeed.');
    }

    expect(result.value.length).toBeGreaterThan(0);
    expect(result.value.every((vehicle) => vehicle.roomNumber === '101')).toBe(true);
  });

  it('does not return deactivated vehicle when active tenant filter is enabled', () => {
    const repository = new MockVehicleRepository();

    const registerResult = repository.registerVehicle({
      tenantId: 't1',
      tenantName: 'สมชาย ศรีสุข',
      roomNumber: '101',
      plate: 'CC 8877',
      vehicleType: 'car',
      status: 'verified',
    });

    expect(registerResult.ok).toBe(true);
    if (!registerResult.ok) {
      throw new Error('Expected vehicle registration to succeed.');
    }

    const createdVehicle = registerResult.value.find((item) => item.plate === 'CC 8877');
    expect(createdVehicle).toBeTruthy();
    if (!createdVehicle) {
      throw new Error('Expected created vehicle to exist.');
    }

    const deactivateResult = repository.deactivateVehicle(createdVehicle.id);
    expect(deactivateResult.ok).toBe(true);

    const activeOnlyResult = repository.searchVehicles('', {
      activeTenantOnly: true,
    });

    expect(activeOnlyResult.ok).toBe(true);
    if (!activeOnlyResult.ok) {
      throw new Error('Expected active-only search to succeed.');
    }

    expect(activeOnlyResult.value.some((item) => item.id === createdVehicle.id)).toBe(false);
  });
});
