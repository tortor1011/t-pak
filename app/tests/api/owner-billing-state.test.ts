/**
 * Authorization regression tests for GET /api/owner/billing-state.
 * The owner billing summary includes payment and slip-verification data, so it
 * must never be served to unauthenticated callers or tenant sessions.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockAuth, mockServerRepositories } = vi.hoisted(() => ({
  mockAuth: vi.fn(),
  mockServerRepositories: {
    roomRepository: {
      listRooms: vi.fn(),
    },
    billingRepository: {
      loadOwnerBillingAggregation: vi.fn(),
      loadSlipVerificationQueue: vi.fn(),
    },
  },
}));

vi.mock('@/lib/auth', () => ({ auth: mockAuth }));
vi.mock('@/repositories/server', () => ({
  serverRepositories: mockServerRepositories,
}));

import { GET } from '@/app/api/owner/billing-state/route';

const ADMIN_SESSION = {
  user: {
    id: 'owner-id',
    email: 'owner@example.com',
    name: 'Owner',
    role: 'ADMIN' as const,
    isOnboarded: true,
  },
  expires: new Date(Date.now() + 86_400_000).toISOString(),
};

beforeEach(() => {
  vi.clearAllMocks();
  mockServerRepositories.roomRepository.listRooms.mockResolvedValue({ ok: true, value: [] });
  mockServerRepositories.billingRepository.loadOwnerBillingAggregation.mockResolvedValue({
    ok: true,
    value: {
      pendingSlipCount: 0,
      debtQueue: [],
      activeDebtQueue: [],
      totalOutstanding: 0,
    },
  });
  mockServerRepositories.billingRepository.loadSlipVerificationQueue.mockResolvedValue({
    ok: true,
    value: [],
  });
});

describe('GET /api/owner/billing-state', () => {
  it('returns 401 and does not access repositories without a session', async () => {
    mockAuth.mockResolvedValue(null);

    const response = await GET();

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: 'Unauthorized' });
    expect(mockServerRepositories.roomRepository.listRooms).not.toHaveBeenCalled();
  });

  it('returns 403 and does not access repositories for a tenant session', async () => {
    mockAuth.mockResolvedValue({
      ...ADMIN_SESSION,
      user: { ...ADMIN_SESSION.user, role: 'TENANT' as const },
    });

    const response = await GET();

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: 'Forbidden' });
    expect(mockServerRepositories.roomRepository.listRooms).not.toHaveBeenCalled();
  });

  it('returns the owner billing state for an authenticated admin', async () => {
    mockAuth.mockResolvedValue(ADMIN_SESSION);

    const response = await GET();

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      rooms: [],
      pendingSlipCount: 0,
      slipQueue: [],
      debtQueue: [],
      activeDebtQueue: [],
      totalOutstanding: 0,
    });
    expect(mockServerRepositories.roomRepository.listRooms).toHaveBeenCalledOnce();
  });
});