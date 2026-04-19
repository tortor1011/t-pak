import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  lookupVehicleByPlateExact,
  registerVehicleRecord,
} from '@/services/vehicleRegistry';

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

describe('vehicleRegistry', () => {
  let localStorage: MemoryStorage;

  beforeEach(() => {
    localStorage = new MemoryStorage();
    attachMockWindow(localStorage);
  });

  afterEach(() => {
    detachMockWindow();
  });

  it('supports multiple vehicles for the same tenant', () => {
    const firstRegistry = registerVehicleRecord({
      tenantId: 't1',
      tenantName: 'สมชาย ศรีสุข',
      roomNumber: '101',
      plate: 'AA 1001',
      vehicleType: 'car',
      status: 'verified',
    });

    const secondRegistry = registerVehicleRecord({
      tenantId: 't1',
      tenantName: 'สมชาย ศรีสุข',
      roomNumber: '101',
      plate: 'AA 1002',
      vehicleType: 'motorcycle',
      status: 'verified',
    });

    expect(firstRegistry.length).toBeGreaterThan(0);
    expect(
      secondRegistry.filter((vehicle) => vehicle.tenantId === 't1').length
    ).toBeGreaterThanOrEqual(2);
  });

  it('rejects duplicate vehicle plate across the system', () => {
    expect(() =>
      registerVehicleRecord({
        tenantId: 't2',
        tenantName: 'สุรีย์ จันทร์ดี',
        roomNumber: '102',
        plate: '1กข 1234 กทม',
        vehicleType: 'car',
        status: 'verified',
      })
    ).toThrow(/unique/i);
  });

  it('allows exact plate lookup and active tenant filtering', () => {
    const activeVehicle = lookupVehicleByPlateExact('1กข 1234 กทม', {
      activeTenantOnly: true,
    });

    expect(activeVehicle).toBeTruthy();
    expect(activeVehicle?.roomNumber).toBe('101');

    const filteredOutVehicle = lookupVehicleByPlateExact('ศท 2211 กทม', {
      activeTenantOnly: true,
    });

    expect(filteredOutVehicle).toBeNull();
  });
});
