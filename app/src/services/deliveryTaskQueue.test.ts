import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  completeDeliveryTask,
  createDeliveryTaskFromTenantRequest,
  markDeliveryTaskInProgress,
} from '@/services/deliveryTaskQueue';

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

describe('deliveryTaskQueue', () => {
  let localStorage: MemoryStorage;

  beforeEach(() => {
    localStorage = new MemoryStorage();
    attachMockWindow(localStorage);
  });

  afterEach(() => {
    detachMockWindow();
  });

  it('creates a pending task from tenant request payload', () => {
    const queue = createDeliveryTaskFromTenantRequest({
      tenantName: 'Tester Resident',
      roomNumber: '509',
      trackingNumber: 'TRACK-509',
      phone: '080-000-0000',
    });

    const createdTask = queue.find((task) => task.trackingNumber === 'TRACK-509');

    expect(createdTask).toBeTruthy();
    expect(createdTask?.status).toBe('pending');
    expect(createdTask?.roomNumber).toBe('509');
  });

  it('runs pending -> in-progress -> delivered transition with proof', () => {
    const createdQueue = createDeliveryTaskFromTenantRequest({
      tenantName: 'Tester Resident',
      roomNumber: '510',
      trackingNumber: 'TRACK-510',
      phone: '081-111-1111',
    });
    const createdTask = createdQueue.find((task) => task.trackingNumber === 'TRACK-510');

    expect(createdTask).toBeTruthy();
    if (!createdTask) {
      throw new Error('Expected created task to exist.');
    }

    const startedQueue = markDeliveryTaskInProgress(createdTask.id);
    const startedTask = startedQueue.find((task) => task.id === createdTask.id);

    expect(startedTask?.status).toBe('in-progress');
    expect(startedTask?.startedAt).not.toBeNull();

    const completedQueue = completeDeliveryTask(createdTask.id, {
      proofPhotoUrl: '/proof-510.jpg',
      confirmationChecked: true,
      deliveryNote: 'Placed near the door.',
    });
    const completedTask = completedQueue.find((task) => task.id === createdTask.id);

    expect(completedTask?.status).toBe('delivered');
    expect(completedTask?.proofPhotoUrl).toBe('/proof-510.jpg');
    expect(completedTask?.confirmationChecked).toBe(true);
    expect(completedTask?.deliveredAt).not.toBeNull();
  });

  it('throws when delivery confirmation checkbox is not checked', () => {
    const createdQueue = createDeliveryTaskFromTenantRequest({
      tenantName: 'Tester Resident',
      roomNumber: '511',
      trackingNumber: 'TRACK-511',
      phone: '082-222-2222',
    });
    const createdTask = createdQueue.find((task) => task.trackingNumber === 'TRACK-511');

    expect(createdTask).toBeTruthy();
    if (!createdTask) {
      throw new Error('Expected created task to exist.');
    }

    expect(() =>
      completeDeliveryTask(createdTask.id, {
        proofPhotoUrl: '/proof-511.jpg',
        confirmationChecked: false,
      })
    ).toThrow(/confirmation/i);
  });
});
