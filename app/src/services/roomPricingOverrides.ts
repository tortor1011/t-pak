import { Room } from '@/types/room';

const STORAGE_KEY = 'estate_clarity.roomPricingOverrides.v1';

export type RoomPricingOverrides = Record<string, number>;

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function isValidOverrideValue(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

export function loadRoomPricingOverrides(): RoomPricingOverrides {
  if (!isBrowser()) return {};

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};

    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};

    return Object.entries(parsed as Record<string, unknown>).reduce<RoomPricingOverrides>(
      (acc, [roomNumber, value]) => {
        if (isValidOverrideValue(value)) {
          acc[roomNumber] = value;
        }
        return acc;
      },
      {}
    );
  } catch {
    return {};
  }
}

export function saveRoomPricingOverrides(overrides: RoomPricingOverrides): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
}

export function applyBulkBaseRentOverrides(
  roomNumbers: number[],
  baseRent: number
): RoomPricingOverrides {
  const existing = loadRoomPricingOverrides();

  const next = roomNumbers.reduce<RoomPricingOverrides>((acc, roomNumber) => {
    acc[String(roomNumber)] = baseRent;
    return acc;
  }, { ...existing });

  saveRoomPricingOverrides(next);
  return next;
}

export function applyRoomPricingOverrides(rooms: Room[]): Room[] {
  const overrides = loadRoomPricingOverrides();

  return rooms.map((room) => {
    const overrideRent = overrides[room.number];
    if (!isValidOverrideValue(overrideRent)) {
      return room;
    }

    const rentDelta = overrideRent - room.baseRent;
    return {
      ...room,
      baseRent: overrideRent,
      currentBill:
        room.currentBill > 0
          ? Math.max(0, room.currentBill + rentDelta)
          : room.currentBill,
    };
  });
}