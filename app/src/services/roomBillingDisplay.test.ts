import { describe, expect, it } from 'vitest';
import { getRoomBillingStatusForDisplay } from '@/services/roomBillingDisplay';
import type { BillingStatus, RoomOccupancy } from '@/types/room';

function makeRoom(
  occupancy: RoomOccupancy,
  billingStatus: BillingStatus
): { occupancy: RoomOccupancy; billingStatus: BillingStatus } {
  return {
    occupancy,
    billingStatus,
  };
}

describe('getRoomBillingStatusForDisplay', () => {
  it('returns billing status for occupied rooms', () => {
    expect(getRoomBillingStatusForDisplay(makeRoom('occupied', 'paid'))).toBe('paid');
    expect(getRoomBillingStatusForDisplay(makeRoom('occupied', 'pending'))).toBe('pending');
    expect(getRoomBillingStatusForDisplay(makeRoom('occupied', 'unpaid'))).toBe('unpaid');
  });

  it('hides billing status for vacant rooms', () => {
    expect(getRoomBillingStatusForDisplay(makeRoom('vacant', 'paid'))).toBeNull();
    expect(getRoomBillingStatusForDisplay(makeRoom('vacant', 'pending'))).toBeNull();
    expect(getRoomBillingStatusForDisplay(makeRoom('vacant', 'unpaid'))).toBeNull();
  });

  it('hides billing status for reserved rooms', () => {
    expect(getRoomBillingStatusForDisplay(makeRoom('reserved', 'paid'))).toBeNull();
  });
});
