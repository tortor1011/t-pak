/**
 * API Integration Tests — POST /api/owner/onboarding
 *
 * Environment: Vitest (node)
 * Strategy:
 *   - `@/lib/auth` is vi.mock'd so `auth()` returns a controllable session.
 *   - `@/lib/prisma` is vi.mock'd with a deep mock so NO real DB calls fire.
 *   - The route handler is imported directly and called with a synthetic
 *     Request object, exactly as Next.js would call it.
 *
 * Important: vi.mock() is hoisted to the top of the file by Vitest's
 * transformer. Factories that reference `const` variables declared in module
 * scope will see them as `undefined` (temporal dead zone). We use vi.hoisted()
 * to declare the mock objects so they are created before the factory runs.
 *
 * Tests:
 *   A — Valid payload  → 200, prisma.$transaction called with correct data
 *   B — Invalid payload (Zod failure) → 400, Prisma never called
 *   C — Unauthenticated (no session) → 401, Prisma never called
 *   D — Wrong role (TENANT)          → 403, Prisma never called
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Hoist mocks so they exist when vi.mock factories run ────────────────────
const { mockAuth, mockPrisma, mockTx } = vi.hoisted(() => {
  const mockTx = {
    property: { create: vi.fn() },
    propertySettings: { create: vi.fn() },
    roomType: { create: vi.fn() },
    room: { createMany: vi.fn() },
    user: { update: vi.fn() },
  };

  const mockPrisma = {
    property: { findFirst: vi.fn() },
    $transaction: vi.fn(async (callback: (tx: typeof mockTx) => Promise<unknown>) =>
      callback(mockTx),
    ),
  };

  const mockAuth = vi.fn();

  return { mockAuth, mockPrisma, mockTx };
});

// ─── Register mocks (hoisted factories now safely reference the objects) ─────
vi.mock('@/lib/auth', () => ({ auth: mockAuth }));
vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }));

// ─── Import AFTER mocks are registered ──────────────────────────────────────
import { POST } from '@/app/api/owner/onboarding/route';

// ─── Shared test data ────────────────────────────────────────────────────────

const VALID_SESSION = {
  user: {
    id: 'owner-user-id',
    email: 'owner@test.com',
    name: 'Test Owner',
    role: 'ADMIN' as const,
    isOnboarded: false,
  },
  expires: new Date(Date.now() + 86_400_000).toISOString(),
};

/** Minimal valid payload that satisfies `onboardingSchema`. */
const VALID_PAYLOAD = {
  propertyName: 'My Dormitory',
  address: '99 Test Street, Bangkok',
  phone: '0812345678',
  roomTypes: [
    { id: 'rt-1', name: 'Standard Fan', baseRent: 3500, securityDeposit: 7000 },
  ],
  floors: 3,
  roomsPerFloor: 10,
  roomTypeAssignment: 'ALL_SAME' as const,
  floorAssignments: { all: 'rt-1' },
  waterRateType: 'PER_UNIT' as const,
  electricityRate: 8,
  waterRate: 20,
};

/** Helper to build a synthetic Next.js Request for the route handler. */
function buildRequest(body: unknown): Request {
  return new Request('http://localhost:3000/api/owner/onboarding', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

// ─── Reset all mocks between tests ───────────────────────────────────────────
beforeEach(() => {
  vi.clearAllMocks();

  // Default: no existing property (passes the duplicate-check)
  mockPrisma.property.findFirst.mockResolvedValue(null);

  // Default: tx operations succeed with plausible return values
  mockTx.property.create.mockResolvedValue({ id: 'new-property-id' });
  mockTx.propertySettings.create.mockResolvedValue({});
  mockTx.roomType.create.mockResolvedValue({ id: 'new-room-type-id', baseRent: 3500 });
  mockTx.room.createMany.mockResolvedValue({ count: 30 });
  mockTx.user.update.mockResolvedValue({});
});

// ════════════════════════════════════════════════════════════════════════════
describe('POST /api/owner/onboarding', () => {
  // ── Test A: Valid payload ──────────────────────────────────────────────────
  describe('Test A — valid payload submitted by an authenticated ADMIN', () => {
    it('returns 200 OK and calls prisma.$transaction with the correct data shapes', async () => {
      mockAuth.mockResolvedValue(VALID_SESSION);

      const response = await POST(buildRequest(VALID_PAYLOAD));
      const body = await response.json();

      // ① HTTP status
      expect(response.status).toBe(200);
      expect(body).toMatchObject({ message: 'Onboarding completed' });

      // ② The duplicate-ownership guard ran before the transaction
      expect(mockPrisma.property.findFirst).toHaveBeenCalledOnce();
      expect(mockPrisma.property.findFirst).toHaveBeenCalledWith({
        where: { ownerId: VALID_SESSION.user.id },
        select: { id: true },
      });

      // ③ prisma.$transaction was called exactly once
      expect(mockPrisma.$transaction).toHaveBeenCalledOnce();

      // ④ Property created with correct data shape
      expect(mockTx.property.create).toHaveBeenCalledWith({
        data: {
          name: VALID_PAYLOAD.propertyName,
          address: VALID_PAYLOAD.address,
          phone: VALID_PAYLOAD.phone,
          ownerId: VALID_SESSION.user.id,
        },
      });

      // ⑤ PropertySettings created with correct utility rates
      expect(mockTx.propertySettings.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          propertyId: 'new-property-id',
          electricityRate: VALID_PAYLOAD.electricityRate,
          waterRate: VALID_PAYLOAD.waterRate,
          waterRateType: VALID_PAYLOAD.waterRateType,
        }),
      });

      // ⑥ One RoomType created per entry in the payload
      expect(mockTx.roomType.create).toHaveBeenCalledTimes(VALID_PAYLOAD.roomTypes.length);
      expect(mockTx.roomType.create).toHaveBeenCalledWith({
        data: {
          propertyId: 'new-property-id',
          name: 'Standard Fan',
          baseRent: 3500,
          securityDeposit: 7000,
        },
      });

      // ⑦ Rooms batch-created: floors × roomsPerFloor = 3 × 10 = 30
      expect(mockTx.room.createMany).toHaveBeenCalledOnce();
      const roomCreateManyCall = mockTx.room.createMany.mock.calls[0][0];
      expect(roomCreateManyCall.data).toHaveLength(
        VALID_PAYLOAD.floors * VALID_PAYLOAD.roomsPerFloor,
      );

      // ⑧ Room numbers follow the floor*100+index formula
      const firstRoom = roomCreateManyCall.data[0];
      expect(firstRoom).toMatchObject({
        number: '101',
        floor: 1,
        building: 'A',
        propertyId: 'new-property-id',
      });
      const lastRoom = roomCreateManyCall.data[roomCreateManyCall.data.length - 1];
      expect(lastRoom).toMatchObject({ number: '310', floor: 3 });

      // ⑨ User flagged as onboarded
      expect(mockTx.user.update).toHaveBeenCalledWith({
        where: { id: VALID_SESSION.user.id },
        data: { isOnboarded: true },
      });
    });

    it('returns 409 Conflict when the owner already has a property (duplicate guard)', async () => {
      mockAuth.mockResolvedValue(VALID_SESSION);
      // Simulate existing property
      mockPrisma.property.findFirst.mockResolvedValue({ id: 'existing-prop' });

      const response = await POST(buildRequest(VALID_PAYLOAD));
      const body = await response.json();

      expect(response.status).toBe(409);
      expect(body.error).toMatch(/already completed onboarding/i);
      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });
  });

  // ── Test B: Invalid payload ────────────────────────────────────────────────
  describe('Test B — invalid payload (Zod schema validation failure)', () => {
    it('returns 400 Bad Request and does NOT call prisma when propertyName is too short (fails min(2))', async () => {
      mockAuth.mockResolvedValue(VALID_SESSION);

      const invalidPayload = { ...VALID_PAYLOAD, propertyName: '' };
      const response = await POST(buildRequest(invalidPayload));
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toMatch(/validation failed/i);
      expect(body.details).toBeDefined();
      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });

    it('returns 400 when address is too short (fails min(5))', async () => {
      mockAuth.mockResolvedValue(VALID_SESSION);

      const response = await POST(buildRequest({ ...VALID_PAYLOAD, address: 'hi' }));

      expect(response.status).toBe(400);
      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });

    it('returns 400 when phone is too short (fails min(9))', async () => {
      mockAuth.mockResolvedValue(VALID_SESSION);

      const response = await POST(buildRequest({ ...VALID_PAYLOAD, phone: '123' }));

      expect(response.status).toBe(400);
      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });

    it('returns 400 when floors exceeds maximum of 50', async () => {
      mockAuth.mockResolvedValue(VALID_SESSION);

      const response = await POST(buildRequest({ ...VALID_PAYLOAD, floors: 51 }));

      expect(response.status).toBe(400);
      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });

    it('returns 400 when roomTypes array is empty (fails min(1))', async () => {
      mockAuth.mockResolvedValue(VALID_SESSION);

      const response = await POST(buildRequest({ ...VALID_PAYLOAD, roomTypes: [] }));

      expect(response.status).toBe(400);
      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });

    it('returns 400 when body is not valid JSON', async () => {
      mockAuth.mockResolvedValue(VALID_SESSION);

      const request = new Request('http://localhost:3000/api/owner/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'this is not json {{{',
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });
  });

  // ── Test C: Unauthenticated ────────────────────────────────────────────────
  describe('Test C — unauthenticated request (no session)', () => {
    it('returns 401 Unauthorized and does NOT call prisma', async () => {
      mockAuth.mockResolvedValue(null);

      const response = await POST(buildRequest(VALID_PAYLOAD));
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body.error).toMatch(/unauthorized/i);
      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
      expect(mockPrisma.property.findFirst).not.toHaveBeenCalled();
    });

    it('returns 401 when session exists but user is undefined', async () => {
      mockAuth.mockResolvedValue({ user: undefined, expires: '' });

      const response = await POST(buildRequest(VALID_PAYLOAD));

      expect(response.status).toBe(401);
      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });
  });

  // ── Test D: Wrong role ─────────────────────────────────────────────────────
  describe('Test D — authenticated but wrong role (TENANT)', () => {
    it('returns 403 Forbidden for a TENANT and does NOT call prisma', async () => {
      const tenantSession = {
        ...VALID_SESSION,
        user: { ...VALID_SESSION.user, role: 'TENANT' as const },
      };
      mockAuth.mockResolvedValue(tenantSession);

      const response = await POST(buildRequest(VALID_PAYLOAD));
      const body = await response.json();

      expect(response.status).toBe(403);
      expect(body.error).toMatch(/forbidden/i);
      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
      expect(mockPrisma.property.findFirst).not.toHaveBeenCalled();
    });
  });
});
