import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MockDeliveryRepository } from '@/repositories/adapters/mock/MockDeliveryRepository';
import { MockNotificationRepository } from '@/repositories/adapters/mock/MockNotificationRepository';

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

describe('MockDeliveryRepository', () => {
  let localStorage: MemoryStorage;

  beforeEach(() => {
    localStorage = new MemoryStorage();
    attachMockWindow(localStorage);
  });

  afterEach(() => {
    detachMockWindow();
  });

  it('completes delivery and queues LINE + app notifications', () => {
    const notificationRepository = new MockNotificationRepository();
    const deliveryRepository = new MockDeliveryRepository(notificationRepository);

    const createResult = deliveryRepository.createTaskFromTenantRequest({
      tenantName: 'Delivery Test',
      roomNumber: '601',
      trackingNumber: 'TRACK-601',
      phone: '099-111-2222',
    });

    expect(createResult.ok).toBe(true);
    if (!createResult.ok) {
      throw new Error('Expected create result to be ok.');
    }

    const createdTask = createResult.value.find(
      (task) => task.trackingNumber === 'TRACK-601'
    );
    expect(createdTask).toBeTruthy();
    if (!createdTask) {
      throw new Error('Expected created task to exist.');
    }

    const startResult = deliveryRepository.startDeliveryTask(createdTask.id);
    expect(startResult.ok).toBe(true);

    const completeResult = deliveryRepository.completeDeliveryTask(createdTask.id, {
      proofPhotoUrl: '/proof-601.jpg',
      confirmationChecked: true,
    });
    expect(completeResult.ok).toBe(true);

    const outboxResult = notificationRepository.listNotificationOutbox();
    expect(outboxResult.ok).toBe(true);
    if (!outboxResult.ok) {
      throw new Error('Expected outbox result to be ok.');
    }

    expect(outboxResult.value.length).toBe(2);
    const channels = outboxResult.value.map((item) => item.channel).sort();
    expect(channels).toEqual(['app', 'line']);
  });
});
