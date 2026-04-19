export type NotificationChannel = 'line' | 'app';
export type NotificationCategory = 'parcel' | 'billing' | 'complaint' | 'announcement';

export interface PushNotificationMessage {
  channel: NotificationChannel;
  recipient: string;
  title: string;
  body: string;
  category: NotificationCategory;
  metadata?: Record<string, string>;
}

export interface NotificationOutboxItem extends PushNotificationMessage {
  id: string;
  status: 'queued';
  createdAt: string;
}
