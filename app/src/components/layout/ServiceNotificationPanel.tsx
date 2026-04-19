'use client';

import type { Language } from '@/services/i18n';
import type { ServiceNotification } from '@/types/serviceNotification';
import { formatCurrency } from '@/utils/currency';
import { getRelativeTime } from '@/utils/date';

interface ServiceNotificationPanelProps {
  language: Language;
  notifications: ServiceNotification[];
  unreadCount: number;
  isNotificationRead: (notificationId: string) => boolean;
  onNotificationClick: (notification: ServiceNotification) => void;
  onMarkNotificationAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
}

interface NotificationVisual {
  icon: string;
  categoryLabel: string;
  title: string;
  body: string;
  iconContainerClassName: string;
  categoryClassName: string;
}

function getNotificationVisual(
  notification: ServiceNotification,
  language: Language
): NotificationVisual {
  if (notification.kind === 'slip') {
    return {
      icon: 'receipt_long',
      categoryLabel: language === 'th' ? 'บิล' : 'Billing',
      title:
        language === 'th'
          ? `รอตรวจสลิปห้อง ${notification.roomNumber}`
          : `Slip pending for room ${notification.roomNumber}`,
      body:
        language === 'th'
          ? `${notification.tenantName} ส่งสลิปยอด ${formatCurrency(notification.amount)}`
          : `${notification.tenantName} uploaded a payment slip for ${formatCurrency(
              notification.amount
            )}.`,
      iconContainerClassName: 'bg-primary-fixed text-primary',
      categoryClassName: 'text-primary',
    };
  }

  if (notification.kind === 'complaint') {
    const statusLabel =
      language === 'th'
        ? notification.status === 'new'
          ? 'ใหม่'
          : 'กำลังดำเนินการ'
        : notification.status === 'new'
          ? 'NEW'
          : 'IN PROGRESS';

    return {
      icon: 'build',
      categoryLabel: language === 'th' ? 'แจ้งซ่อม' : 'Maintenance',
      title:
        language === 'th'
          ? `ห้อง ${notification.roomNumber}: ${notification.complaintTitle}`
          : `Room ${notification.roomNumber}: ${notification.complaintTitle}`,
      body:
        language === 'th'
          ? `${notification.tenantName} แจ้งสถานะ ${statusLabel}`
          : `${notification.tenantName} reported a ${statusLabel.toLowerCase()} issue.`,
      iconContainerClassName: 'bg-tertiary-fixed-dim text-tertiary',
      categoryClassName: 'text-tertiary',
    };
  }

  const parcelStatusLabel =
    language === 'th'
      ? notification.status === 'pending'
        ? 'รอดำเนินการ'
        : 'กำลังจัดส่ง'
      : notification.status === 'pending'
        ? 'Pending'
        : 'In Progress';

  return {
    icon: 'package_2',
    categoryLabel: language === 'th' ? 'พัสดุ' : 'Parcels',
    title:
      language === 'th'
        ? `คำขอส่งพัสดุห้อง ${notification.roomNumber}`
        : `Parcel request for room ${notification.roomNumber}`,
    body:
      language === 'th'
        ? `${notification.tenantName} ขอให้ส่งเลขพัสดุ ${notification.trackingNumber} (${parcelStatusLabel})`
        : `${notification.tenantName} requested handoff for ${notification.trackingNumber} (${parcelStatusLabel}).`,
    iconContainerClassName: 'bg-secondary-fixed text-on-secondary-container',
    categoryClassName: 'text-on-secondary-container',
  };
}

export default function ServiceNotificationPanel({
  language,
  notifications,
  unreadCount,
  isNotificationRead,
  onNotificationClick,
  onMarkNotificationAsRead,
  onMarkAllAsRead,
}: ServiceNotificationPanelProps) {
  const text =
    language === 'th'
      ? {
          title: 'แจ้งเตือนงานบริการ',
          unreadLabel: 'ยังไม่อ่าน',
          markAll: 'อ่านทั้งหมด',
          markSingle: 'ทำเครื่องหมายว่าอ่านแล้ว',
          openDetail: 'เปิดรายละเอียด',
          emptyTitle: 'ยังไม่มีแจ้งเตือนใหม่',
          emptyDescription: 'เมื่อมีคำร้องใหม่จากลูกหอ รายการจะแสดงที่นี่',
        }
      : {
          title: 'Service Notifications',
          unreadLabel: 'Unread',
          markAll: 'Mark all as read',
          markSingle: 'Mark as read',
          openDetail: 'Open details',
          emptyTitle: 'No new notifications',
          emptyDescription: 'New tenant service requests will appear here.',
        };

  return (
    <section className="w-[min(22rem,calc(100vw-2rem))] sm:w-88 rounded-2xl bg-surface-container-lowest shadow-[0_24px_60px_rgba(18,28,40,0.18)] border border-outline-variant/30 overflow-hidden">
      <header className="px-4 py-3 border-b border-outline-variant/25 bg-surface-container-low">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-black text-on-surface tracking-wide uppercase">
              {text.title}
            </h2>
            <p className="text-xs font-medium text-on-surface-variant">
              {text.unreadLabel}: {unreadCount}
            </p>
          </div>
          <button
            type="button"
            onClick={onMarkAllAsRead}
            disabled={unreadCount === 0}
            className={`text-xs font-bold transition-colors ${
              unreadCount === 0
                ? 'text-outline cursor-not-allowed'
                : 'text-primary hover:text-primary/80'
            }`}
          >
            {text.markAll}
          </button>
        </div>
      </header>

      {notifications.length > 0 ? (
        <div className="max-h-96 overflow-y-auto p-3 space-y-2">
          {notifications.map((notification) => {
            const visual = getNotificationVisual(notification, language);
            const isRead = isNotificationRead(notification.id);

            return (
              <article
                key={notification.id}
                className={`rounded-xl p-3 transition-colors ${
                  isRead
                    ? 'bg-surface-container-low'
                    : 'bg-surface-container-lowest ring-1 ring-primary/20'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${visual.iconContainerClassName}`}
                  >
                    <span className="material-symbols-outlined text-xl">{visual.icon}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <span className={`text-[11px] font-black uppercase tracking-wider ${visual.categoryClassName}`}>
                        {visual.categoryLabel}
                      </span>
                      <span className="text-[11px] text-on-surface-variant font-medium whitespace-nowrap">
                        {getRelativeTime(notification.createdAt, language)}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-on-surface mt-1 leading-tight wrap-break-word">
                      {visual.title}
                    </p>
                    <p className="text-xs text-on-surface-variant font-medium mt-1 leading-relaxed wrap-break-word">
                      {visual.body}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() => onNotificationClick(notification)}
                    className="text-xs font-bold text-primary hover:text-primary/80"
                  >
                    {text.openDetail}
                  </button>
                  {!isRead && (
                    <button
                      type="button"
                      onClick={() => onMarkNotificationAsRead(notification.id)}
                      className="text-xs font-bold text-on-surface-variant hover:text-on-surface"
                    >
                      {text.markSingle}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="px-4 py-10 text-center text-on-surface-variant">
          <span className="material-symbols-outlined text-4xl block mb-2 text-outline">
            notifications_off
          </span>
          <p className="text-sm font-bold">{text.emptyTitle}</p>
          <p className="text-xs font-medium mt-1">{text.emptyDescription}</p>
        </div>
      )}
    </section>
  );
}
