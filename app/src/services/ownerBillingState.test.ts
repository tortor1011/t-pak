import { afterEach, describe, expect, it } from 'vitest';
import { setRepositories } from '@/repositories';
import type { BillingRepository } from '@/repositories/billing/BillingRepository';
import type {
  BillingAggregationRoom,
  DebtCollectionQueueItem,
  OwnerBillingAggregation,
  SlipVerificationQueueItem,
} from '@/repositories/billing/types';
import type { Result } from '@/repositories/common/Result';
import { MockBillingRepository } from '@/repositories/adapters/mock/MockBillingRepository';
import { MockComplaintsRepository } from '@/repositories/adapters/mock/MockComplaintsRepository';
import { MockDeliveryRepository } from '@/repositories/adapters/mock/MockDeliveryRepository';
import { MockNotificationRepository } from '@/repositories/adapters/mock/MockNotificationRepository';
import { MockReportsRepository } from '@/repositories/adapters/mock/MockReportsRepository';
import { MockRoomRepository } from '@/repositories/adapters/mock/MockRoomRepository';
import { MockSettingsRepository } from '@/repositories/adapters/mock/MockSettingsRepository';
import { MockVehicleRepository } from '@/repositories/adapters/mock/MockVehicleRepository';
import { buildOwnerBillingState } from '@/services/ownerBillingState';
import type { BillItem, MeterReading } from '@/types/billing';

function createErrorResult<T>(message: string): Promise<Result<T>> {
  return Promise.resolve({
    ok: false,
    error: {
      code: 'UNKNOWN_ERROR' as const,
      message,
    },
  });
}

function createBaseBillingRepository(
  overrides: Partial<BillingRepository> = {}
): BillingRepository {
  const base: BillingRepository = {
    loadRoomBills: () =>
      createErrorResult<BillItem[]>('Unexpected loadRoomBills call.'),
    loadMeterReadings: () =>
      createErrorResult<MeterReading[]>('Unexpected loadMeterReadings call.'),
    submitMeterReadings: () =>
      createErrorResult<MeterReading[]>('Unexpected submitMeterReadings call.'),
    loadOwnerBillingAggregation: () =>
      createErrorResult<OwnerBillingAggregation>('Injected aggregation failure.'),
    loadSlipVerificationQueue: () =>
      createErrorResult<SlipVerificationQueueItem[]>(
        'Unexpected loadSlipVerificationQueue call.'
      ),
    reviewSlipVerification: () =>
      createErrorResult<SlipVerificationQueueItem[]>(
        'Unexpected reviewSlipVerification call.'
      ),
    loadDebtCollectionQueue: () =>
      createErrorResult<DebtCollectionQueueItem[]>(
        'Unexpected loadDebtCollectionQueue call.'
      ),
    sendDebtReminder: () =>
      createErrorResult<DebtCollectionQueueItem[]>(
        'Unexpected sendDebtReminder call.'
      ),
    sendBulkDebtRemindersByIds: () =>
      createErrorResult<DebtCollectionQueueItem[]>(
        'Unexpected sendBulkDebtRemindersByIds call.'
      ),
    settleDebtAndMarkRoomPaid: () =>
      createErrorResult<DebtCollectionQueueItem[]>(
        'Unexpected settleDebtAndMarkRoomPaid call.'
      ),
  };

  return {
    ...base,
    ...overrides,
  };
}

function setRepositoriesForTest(billingRepository: BillingRepository): void {
  const notificationRepository = new MockNotificationRepository();

  setRepositories({
    roomRepository: new MockRoomRepository(),
    billingRepository,
    settingsRepository: new MockSettingsRepository(),
    complaintsRepository: new MockComplaintsRepository(),
    reportsRepository: new MockReportsRepository(),
    deliveryRepository: new MockDeliveryRepository(notificationRepository),
    vehicleRepository: new MockVehicleRepository(),
    notificationRepository,
  });
}

function resetDefaultRepositories(): void {
  const notificationRepository = new MockNotificationRepository();

  setRepositories({
    roomRepository: new MockRoomRepository(),
    billingRepository: new MockBillingRepository(),
    settingsRepository: new MockSettingsRepository(),
    complaintsRepository: new MockComplaintsRepository(),
    reportsRepository: new MockReportsRepository(),
    deliveryRepository: new MockDeliveryRepository(notificationRepository),
    vehicleRepository: new MockVehicleRepository(),
    notificationRepository,
  });
}

describe('buildOwnerBillingState', () => {
  afterEach(() => {
    resetDefaultRepositories();
  });

  it('returns empty safe state when owner billing aggregation fails', async () => {
    setRepositoriesForTest(createBaseBillingRepository());

    const state = await buildOwnerBillingState();

    expect(state.rooms).toEqual([]);
    expect(state.pendingSlipCount).toBe(0);
    expect(state.debtQueue).toEqual([]);
    expect(state.activeDebtQueue).toEqual([]);
    expect(state.totalOutstanding).toBe(0);
    expect(state.summary.totalRooms).toBe(0);
  });

  it('uses repository aggregation values when aggregation succeeds', async () => {
    const queueItem: DebtCollectionQueueItem = {
      id: 'd-custom',
      roomNumber: '999',
      tenantName: 'Custom Tenant',
      totalOutstanding: 4321,
      monthsOverdue: 2,
      lastReminder: null,
      phone: '-',
      reminderCount: 2,
    };

    const aggregation: OwnerBillingAggregation = {
      pendingSlipCount: 7,
      debtQueue: [queueItem],
      activeDebtQueue: [queueItem],
      totalOutstanding: 4321,
    };

    setRepositoriesForTest(
      createBaseBillingRepository({
        loadOwnerBillingAggregation: (_rooms: BillingAggregationRoom[]) =>
          Promise.resolve({
            ok: true,
            value: aggregation,
          }),
      })
    );

    const state = await buildOwnerBillingState();

    expect(state.rooms.length).toBeGreaterThan(0);
    expect(state.pendingSlipCount).toBe(7);
    expect(state.debtQueue).toEqual([queueItem]);
    expect(state.activeDebtQueue).toEqual([queueItem]);
    expect(state.totalOutstanding).toBe(4321);
    expect(state.summary.totalRooms).toBeGreaterThan(0);
  });

  it('passes room billing view to repository aggregation', async () => {
    let capturedRooms: BillingAggregationRoom[] = [];

    setRepositoriesForTest(
      createBaseBillingRepository({
        loadOwnerBillingAggregation: (rooms: BillingAggregationRoom[]) => {
          capturedRooms = rooms;

          return Promise.resolve({
            ok: true,
            value: {
              pendingSlipCount: 0,
              debtQueue: [],
              activeDebtQueue: [],
              totalOutstanding: 0,
            },
          });
        },
      })
    );

    await buildOwnerBillingState();

    expect(capturedRooms.length).toBeGreaterThan(0);
    expect(capturedRooms[0]).toHaveProperty('number');
    expect(capturedRooms[0]).toHaveProperty('billingStatus');
  });
});
