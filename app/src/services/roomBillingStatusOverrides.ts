import { BillingStatus, Room } from '@/types/room';

const STORAGE_KEY = 'estate_clarity.roomBillingStatusOverrides.v1';

export type RoomBillingStatusOverrides = Record<string, BillingStatus>;

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function isBillingStatus(value: unknown): value is BillingStatus {
  return value === 'paid' || value === 'pending' || value === 'unpaid';
}

export function loadRoomBillingStatusOverrides(): RoomBillingStatusOverrides {
  if (!isBrowser()) return {};

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};

    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};

    return Object.entries(parsed as Record<string, unknown>).reduce<RoomBillingStatusOverrides>(
      (acc, [roomNumber, status]) => {
        if (isBillingStatus(status)) {
          acc[roomNumber] = status;
        }

        return acc;
      },
      {}
    );
  } catch {
    return {};
  }
}

export function saveRoomBillingStatusOverrides(
  overrides: RoomBillingStatusOverrides
): void {
  if (!isBrowser()) return;

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
}

export function setRoomBillingStatusOverride(
  roomNumber: string,
  billingStatus: BillingStatus
): RoomBillingStatusOverrides {
  const existing = loadRoomBillingStatusOverrides();
  const next = {
    ...existing,
    [roomNumber]: billingStatus,
  };

  saveRoomBillingStatusOverrides(next);
  return next;
}

export function applyRoomBillingStatusOverrides(rooms: Room[]): Room[] {
  const overrides = loadRoomBillingStatusOverrides();

  return rooms.map((room) => {
    const overrideStatus = overrides[room.number];
    if (!isBillingStatus(overrideStatus)) {
      return room;
    }

    return {
      ...room,
      billingStatus: overrideStatus,
    };
  });
}
