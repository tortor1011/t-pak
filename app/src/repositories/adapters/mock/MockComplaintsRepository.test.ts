import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MockComplaintsRepository } from '@/repositories/adapters/mock/MockComplaintsRepository';

class MemoryStorage implements Storage {
  private readonly store = new Map<string, string>();

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

describe('MockComplaintsRepository', () => {
  let localStorage: MemoryStorage;

  beforeEach(() => {
    localStorage = new MemoryStorage();
    attachMockWindow(localStorage);
  });

  afterEach(() => {
    detachMockWindow();
  });

  it('loads complaints from repository contract', async () => {
    const repository = new MockComplaintsRepository();

    const result = await repository.listComplaints();

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.length).toBeGreaterThan(0);
      expect(result.value[0]).toHaveProperty('status');
      expect(result.value[0]).toHaveProperty('roomNumber');
    }
  });

  it('updates complaint status and persists the update in queue storage', async () => {
    const repository = new MockComplaintsRepository();
    const complaintsResult = await repository.listComplaints();

    expect(complaintsResult.ok).toBe(true);
    if (!complaintsResult.ok) {
      throw new Error('Expected complaintsResult to be ok.');
    }

    const targetComplaint = complaintsResult.value.find(
      (complaint) => complaint.status === 'new'
    );
    expect(targetComplaint).toBeTruthy();
    if (!targetComplaint) {
      throw new Error('Expected a complaint with new status.');
    }

    const updateToInProgressResult = await repository.updateComplaintStatus(
      targetComplaint.id,
      'in-progress'
    );

    expect(updateToInProgressResult.ok).toBe(true);
    if (!updateToInProgressResult.ok) {
      throw new Error('Expected updateToInProgressResult to be ok.');
    }

    const inProgressComplaint = updateToInProgressResult.value.find(
      (complaint) => complaint.id === targetComplaint.id
    );
    expect(inProgressComplaint?.status).toBe('in-progress');

    const updateToResolvedResult = await repository.updateComplaintStatus(
      targetComplaint.id,
      'resolved'
    );

    expect(updateToResolvedResult.ok).toBe(true);
    if (!updateToResolvedResult.ok) {
      throw new Error('Expected updateToResolvedResult to be ok.');
    }

    const resolvedComplaint = updateToResolvedResult.value.find(
      (complaint) => complaint.id === targetComplaint.id
    );
    expect(resolvedComplaint?.status).toBe('resolved');
    expect(resolvedComplaint?.resolvedAt).not.toBeNull();
  });
});
