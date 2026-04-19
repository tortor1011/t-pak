import { err, ok, type Result } from '@/repositories/common/Result';
import type { NotificationRepository } from '@/repositories/notifications/NotificationRepository';
import {
  enqueueMultiChannelNotification,
  loadNotificationOutbox,
} from '@/services/notificationGateway';
import type {
  NotificationChannel,
  NotificationOutboxItem,
  PushNotificationMessage,
} from '@/types/notification';

export class MockNotificationRepository implements NotificationRepository {
  listNotificationOutbox(): Result<NotificationOutboxItem[]> {
    try {
      return ok(loadNotificationOutbox());
    } catch (error) {
      return err({
        code: 'UNKNOWN_ERROR',
        message: 'Failed to load notification outbox.',
        details: error,
      });
    }
  }

  sendNotification(
    channels: NotificationChannel[],
    payload: Omit<PushNotificationMessage, 'channel'>
  ): Result<NotificationOutboxItem[]> {
    if (channels.length === 0) {
      return err({
        code: 'VALIDATION_ERROR',
        message: 'At least one notification channel is required.',
      });
    }

    try {
      const queuedItems = enqueueMultiChannelNotification(channels, payload);
      return ok(queuedItems);
    } catch (error) {
      return err({
        code: 'UNKNOWN_ERROR',
        message: 'Failed to enqueue notifications.',
        details: error,
      });
    }
  }
}
