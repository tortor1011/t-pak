import { describe, expect, it } from 'vitest';
import type { SlipVerificationQueueItem } from '@/repositories/billing/types';
import { buildServiceNotifications } from '@/services/serviceNotificationStream';
import type { Complaint } from '@/types/complaint';
import type { DeliveryTask } from '@/types/delivery';

const BASE_SLIP: SlipVerificationQueueItem = {
  id: 's-test',
  roomNumber: '101',
  tenantName: 'Slip Tenant',
  amount: 4500,
  slipUrl: '/slip.jpg',
  uploadedAt: '2026-04-20T10:00:00.000Z',
  detectedAmount: 4500,
  detectedDate: '2026-04-20',
  isAmountMatch: true,
  decision: 'pending',
  reviewedAt: null,
};

const BASE_COMPLAINT: Complaint = {
  id: 'c-test',
  roomNumber: '202',
  tenantName: 'Complaint Tenant',
  category: 'plumbing',
  title: 'Leaking tap',
  description: 'Water keeps dripping.',
  status: 'new',
  photoUrl: null,
  permissionToEnter: true,
  createdAt: '2026-04-20T11:00:00.000Z',
  resolvedAt: null,
};

const BASE_DELIVERY: DeliveryTask = {
  id: 'p-test',
  tenantName: 'Parcel Tenant',
  roomNumber: '303',
  trackingNumber: 'TRACK-303',
  phone: '0890000000',
  courierName: null,
  status: 'pending',
  requestedAt: '2026-04-20T09:00:00.000Z',
  startedAt: null,
  deliveredAt: null,
  proofPhotoUrl: null,
  deliveryNote: null,
  confirmationChecked: false,
};

describe('buildServiceNotifications', () => {
  it('maps service queues into one newest-first notification stream', () => {
    const notifications = buildServiceNotifications({
      slipQueue: [{ ...BASE_SLIP }],
      complaints: [{ ...BASE_COMPLAINT }],
      deliveryTasks: [{ ...BASE_DELIVERY }],
    });

    expect(notifications.map((item) => item.kind)).toEqual([
      'complaint',
      'slip',
      'parcel',
    ]);
    expect(notifications[0].id).toBe('complaint-c-test');
    expect(notifications[1].id).toBe('slip-s-test');
    expect(notifications[2].id).toBe('parcel-p-test');
  });

  it('excludes inactive service states from notification stream', () => {
    const notifications = buildServiceNotifications({
      slipQueue: [{ ...BASE_SLIP, decision: 'approved' }],
      complaints: [{ ...BASE_COMPLAINT, status: 'resolved', resolvedAt: '2026-04-20T12:00:00.000Z' }],
      deliveryTasks: [{ ...BASE_DELIVERY, status: 'delivered', deliveredAt: '2026-04-20T12:00:00.000Z' }],
    });

    expect(notifications).toHaveLength(0);
  });
});
