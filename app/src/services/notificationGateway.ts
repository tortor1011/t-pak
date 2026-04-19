import {
  NotificationChannel,
  NotificationOutboxItem,
  PushNotificationMessage,
  NotificationCategory,
} from '@/types/notification';

const NOTIFICATION_OUTBOX_STORAGE_KEY = 'estate_clarity.notificationOutbox.v1';
export const NOTIFICATION_UPDATED_EVENT = 'estate_clarity.notification_outbox_updated';

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function isNotificationChannel(value: unknown): value is NotificationChannel {
  return value === 'line' || value === 'app';
}

function isNotificationCategory(value: unknown): value is NotificationCategory {
  return (
    value === 'parcel' ||
    value === 'billing' ||
    value === 'complaint' ||
    value === 'announcement'
  );
}

function isRecordStringMap(value: unknown): value is Record<string, string> {
  if (!value || typeof value !== 'object') {
    return false;
  }

  return Object.values(value as Record<string, unknown>).every(
    (entry) => typeof entry === 'string'
  );
}

function sanitizeOutboxItem(item: unknown): NotificationOutboxItem | null {
  if (!item || typeof item !== 'object') {
    return null;
  }

  const parsed = item as Record<string, unknown>;
  const hasMetadata =
    parsed.metadata === undefined || isRecordStringMap(parsed.metadata);

  if (
    typeof parsed.id !== 'string' ||
    !isNotificationChannel(parsed.channel) ||
    typeof parsed.recipient !== 'string' ||
    typeof parsed.title !== 'string' ||
    typeof parsed.body !== 'string' ||
    !isNotificationCategory(parsed.category) ||
    parsed.status !== 'queued' ||
    typeof parsed.createdAt !== 'string' ||
    !hasMetadata
  ) {
    return null;
  }

  const metadata =
    parsed.metadata === undefined
      ? undefined
      : (parsed.metadata as Record<string, string>);

  return {
    id: parsed.id,
    channel: parsed.channel,
    recipient: parsed.recipient,
    title: parsed.title,
    body: parsed.body,
    category: parsed.category,
    metadata,
    status: 'queued',
    createdAt: parsed.createdAt,
  };
}

function dispatchNotificationUpdatedEvent(): void {
  if (!isBrowser()) {
    return;
  }

  window.dispatchEvent(new Event(NOTIFICATION_UPDATED_EVENT));
}

function generateOutboxId(): string {
  return `notify-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function loadNotificationOutbox(): NotificationOutboxItem[] {
  if (!isBrowser()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(NOTIFICATION_OUTBOX_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    const sanitized = parsed
      .map((item) => sanitizeOutboxItem(item))
      .filter((item): item is NotificationOutboxItem => item !== null);

    return sanitized.sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt)
    );
  } catch {
    return [];
  }
}

export function saveNotificationOutbox(outbox: NotificationOutboxItem[]): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(
    NOTIFICATION_OUTBOX_STORAGE_KEY,
    JSON.stringify(outbox)
  );
}

export function enqueuePushNotification(
  message: PushNotificationMessage
): NotificationOutboxItem {
  const queuedItem: NotificationOutboxItem = {
    id: generateOutboxId(),
    status: 'queued',
    createdAt: new Date().toISOString(),
    ...message,
  };

  if (isBrowser()) {
    const outbox = loadNotificationOutbox();
    saveNotificationOutbox([queuedItem, ...outbox]);
    dispatchNotificationUpdatedEvent();
  }

  return queuedItem;
}

export function enqueueMultiChannelNotification(
  channels: NotificationChannel[],
  payload: Omit<PushNotificationMessage, 'channel'>
): NotificationOutboxItem[] {
  const uniqueChannels = Array.from(new Set(channels));
  return uniqueChannels.map((channel) =>
    enqueuePushNotification({
      ...payload,
      channel,
    })
  );
}
