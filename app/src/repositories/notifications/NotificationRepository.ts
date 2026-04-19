import type { Result } from '@/repositories/common/Result';
import type {
  NotificationChannel,
  NotificationOutboxItem,
  PushNotificationMessage,
} from '@/types/notification';

export interface NotificationRepository {
  listNotificationOutbox(): Result<NotificationOutboxItem[]>;
  sendNotification(
    channels: NotificationChannel[],
    payload: Omit<PushNotificationMessage, 'channel'>
  ): Result<NotificationOutboxItem[]>;
}
