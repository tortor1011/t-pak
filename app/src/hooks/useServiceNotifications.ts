'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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

async function fetchServiceNotificationSnapshot(
  repositories: Pick<
    Repositories,
    'billingRepository' | 'complaintsRepository' | 'deliveryRepository'
  >
): Promise<ServiceNotification[]> {
  const slipQueueResult = await repositories.billingRepository.loadSlipVerificationQueue();
  const complaintsResult = await repositories.complaintsRepository.listComplaints();
  const deliveryTasksResult = await repositories.deliveryRepository.listDeliveryTasks();

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
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ['serviceNotifications'],
    queryFn: () =>
      fetchServiceNotificationSnapshot({
        billingRepository,
        complaintsRepository,
        deliveryRepository,
      }),
    refetchInterval: 5000,
  });

  const [readIds, setReadIds] = useState<string[]>([]);

  const refreshNotifications = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['serviceNotifications'] });
  }, [queryClient]);

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
