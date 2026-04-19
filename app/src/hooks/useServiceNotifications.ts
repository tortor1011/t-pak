'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Repositories } from '@/repositories';
import { useRepositories } from '@/hooks/useRepositories';
import {
  COMPLAINT_STATE_UPDATED_EVENT,
} from '@/services/complaintQueue';
import {
  DELIVERY_STATE_UPDATED_EVENT,
} from '@/services/deliveryTaskQueue';
import {
  buildServiceNotifications,
} from '@/services/serviceNotificationStream';
import type { ServiceNotification } from '@/types/serviceNotification';

const BILLING_STATE_UPDATED_EVENT = 'estate_clarity.billing_state_updated';

function loadServiceNotificationSnapshot(
  repositories: Pick<
    Repositories,
    'billingRepository' | 'complaintsRepository' | 'deliveryRepository'
  >
): ServiceNotification[] {
  const slipQueueResult = repositories.billingRepository.loadSlipVerificationQueue();
  const complaintsResult = repositories.complaintsRepository.listComplaints();
  const deliveryTasksResult = repositories.deliveryRepository.listDeliveryTasks();

  return buildServiceNotifications({
    slipQueue: slipQueueResult.ok ? slipQueueResult.value : [],
    complaints: complaintsResult.ok ? complaintsResult.value : [],
    deliveryTasks: deliveryTasksResult.ok ? deliveryTasksResult.value : [],
  });
}

export function useServiceNotifications(): {
  notifications: ServiceNotification[];
  unreadCount: number;
  isNotificationRead: (notificationId: string) => boolean;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  refreshNotifications: () => void;
} {
  const { billingRepository, complaintsRepository, deliveryRepository } =
    useRepositories();

  const loadSnapshot = useCallback(
    () =>
      loadServiceNotificationSnapshot({
        billingRepository,
        complaintsRepository,
        deliveryRepository,
      }),
    [billingRepository, complaintsRepository, deliveryRepository]
  );

  const [notifications, setNotifications] = useState<ServiceNotification[]>(() =>
    loadServiceNotificationSnapshot({
      billingRepository,
      complaintsRepository,
      deliveryRepository,
    })
  );
  const [readIds, setReadIds] = useState<string[]>([]);

  const refreshNotifications = useCallback(() => {
    const nextNotifications = loadSnapshot();
    setNotifications(nextNotifications);
    setReadIds((currentReadIds) => {
      const currentReadIdSet = new Set(currentReadIds);

      return nextNotifications
        .filter((notification) => currentReadIdSet.has(notification.id))
        .map((notification) => notification.id);
    });
  }, [loadSnapshot]);

  useEffect(() => {
    const handleStateUpdated = () => {
      refreshNotifications();
    };

    window.addEventListener('storage', handleStateUpdated);
    window.addEventListener(BILLING_STATE_UPDATED_EVENT, handleStateUpdated);
    window.addEventListener(DELIVERY_STATE_UPDATED_EVENT, handleStateUpdated);
    window.addEventListener(COMPLAINT_STATE_UPDATED_EVENT, handleStateUpdated);

    return () => {
      window.removeEventListener('storage', handleStateUpdated);
      window.removeEventListener(BILLING_STATE_UPDATED_EVENT, handleStateUpdated);
      window.removeEventListener(DELIVERY_STATE_UPDATED_EVENT, handleStateUpdated);
      window.removeEventListener(COMPLAINT_STATE_UPDATED_EVENT, handleStateUpdated);
    };
  }, [refreshNotifications]);

  const markNotificationAsRead = useCallback(
    (notificationId: string) => {
      setReadIds((currentReadIds) => {
        if (currentReadIds.includes(notificationId)) {
          return currentReadIds;
        }

        if (!notifications.some((notification) => notification.id === notificationId)) {
          return currentReadIds;
        }

        return [...currentReadIds, notificationId];
      });
    },
    [notifications]
  );

  const markAllNotificationsAsRead = useCallback(() => {
    setReadIds(notifications.map((notification) => notification.id));
  }, [notifications]);

  const readIdSet = useMemo(() => new Set(readIds), [readIds]);

  const isNotificationRead = useCallback(
    (notificationId: string) => readIdSet.has(notificationId),
    [readIdSet]
  );

  const unreadCount = useMemo(
    () =>
      notifications.reduce(
        (count, notification) =>
          readIdSet.has(notification.id) ? count : count + 1,
        0
      ),
    [notifications, readIdSet]
  );

  return {
    notifications,
    unreadCount,
    isNotificationRead,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    refreshNotifications,
  };
}
