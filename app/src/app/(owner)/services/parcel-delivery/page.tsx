'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SearchInput from '@/components/ui/SearchInput';
import { useLanguage } from '@/hooks/useLanguage';
import { useRepositories } from '@/hooks/useRepositories';
import { DELIVERY_STATE_UPDATED_EVENT } from '@/services/deliveryTaskQueue';
import { NOTIFICATION_UPDATED_EVENT } from '@/services/notificationGateway';
import type { DeliveryTask, DeliveryTaskStatus } from '@/types/delivery';
import { getRelativeTime } from '@/utils/date';

function filterTasks(tasks: DeliveryTask[], query: string): DeliveryTask[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return tasks;
  }

  return tasks.filter((task) => {
    return (
      task.roomNumber.toLowerCase().includes(normalizedQuery) ||
      task.trackingNumber.toLowerCase().includes(normalizedQuery) ||
      task.tenantName.toLowerCase().includes(normalizedQuery) ||
      task.phone.toLowerCase().includes(normalizedQuery)
    );
  });
}

function getStatusClass(status: DeliveryTaskStatus): string {
  switch (status) {
    case 'pending':
      return 'bg-primary-container/20 text-primary';
    case 'in-progress':
      return 'bg-amber-500/15 text-amber-700';
    case 'delivered':
      return 'bg-secondary-container text-on-secondary-container';
  }
}

export default function ParcelDeliveryPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const { deliveryRepository, notificationRepository } = useRepositories();

  const [search, setSearch] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [tasks, setTasks] = useState<DeliveryTask[]>(() => {
    const result = deliveryRepository.listDeliveryTasks();
    return result.ok ? result.value : [];
  });

  const [notificationOutboxCount, setNotificationOutboxCount] = useState<number>(() => {
    const result = notificationRepository.listNotificationOutbox();
    return result.ok ? result.value.length : 0;
  });

  const text =
    language === 'th'
      ? {
          title: 'งานส่งพัสดุถึงห้อง',
          subtitle: 'รับคำขอจากลูกหอ แล้วส่งขึ้นห้องพร้อมหลักฐานรูปภาพ',
          queueStatus: 'สถานะคิว',
          pending: 'รอดำเนินการ',
          inProgress: 'กำลังส่ง',
          delivered: 'ส่งแล้ว',
          requests: 'คำขอ',
          pushQueued: 'รายการ Push ค้างส่ง',
          requestSourceHint: 'คิวนี้ดึงจากคำขอที่ลูกหอส่งเข้ามาเท่านั้น',
          activeList: 'คิวงานพัสดุ',
          noTasks: 'ไม่พบงานพัสดุที่ตรงกับคำค้นหา',
          startDelivery: 'เริ่มส่ง',
          continueDelivery: 'ถ่ายรูปยืนยัน',
          deliveredWithProof: 'มีหลักฐานรูปภาพแล้ว',
          requestedAgo: 'แจ้งเมื่อ',
          searchPlaceholder: 'ค้นหาจากเลขห้อง เลขแทร็ค ชื่อ หรือเบอร์โทร',
          statuses: {
            pending: 'รอดำเนินการ',
            'in-progress': 'กำลังส่ง',
            delivered: 'ส่งแล้ว',
          },
        }
      : {
          title: 'Room Parcel Delivery',
          subtitle: 'Receive tenant parcel requests, deliver to room, and attach photo proof.',
          queueStatus: 'Queue Status',
          pending: 'Pending',
          inProgress: 'In Progress',
          delivered: 'Delivered',
          requests: 'requests',
          pushQueued: 'Queued Push Notifications',
          requestSourceHint: 'This queue is read-only and syncs from tenant-submitted requests.',
          activeList: 'Parcel Task Queue',
          noTasks: 'No parcel tasks matched your search.',
          startDelivery: 'Start Delivery',
          continueDelivery: 'Capture Proof',
          deliveredWithProof: 'Photo proof attached',
          requestedAgo: 'Requested',
          searchPlaceholder: 'Search by room, tracking, tenant, or phone',
          statuses: {
            pending: 'Pending',
            'in-progress': 'In Progress',
            delivered: 'Delivered',
          },
        };

  useEffect(() => {
    const refreshTasks = () => {
      const result = deliveryRepository.listDeliveryTasks();
      if (result.ok) {
        setTasks(result.value);
      }
    };

    const refreshOutbox = () => {
      const result = notificationRepository.listNotificationOutbox();
      if (result.ok) {
        setNotificationOutboxCount(result.value.length);
      }
    };

    window.addEventListener('storage', refreshTasks);
    window.addEventListener(DELIVERY_STATE_UPDATED_EVENT, refreshTasks);
    window.addEventListener('storage', refreshOutbox);
    window.addEventListener(NOTIFICATION_UPDATED_EVENT, refreshOutbox);

    return () => {
      window.removeEventListener('storage', refreshTasks);
      window.removeEventListener(DELIVERY_STATE_UPDATED_EVENT, refreshTasks);
      window.removeEventListener('storage', refreshOutbox);
      window.removeEventListener(NOTIFICATION_UPDATED_EVENT, refreshOutbox);
    };
  }, [deliveryRepository, notificationRepository]);

  const visibleTasks = filterTasks(tasks, search);
  const pendingCount = visibleTasks.filter((task) => task.status === 'pending').length;
  const inProgressCount = visibleTasks.filter(
    (task) => task.status === 'in-progress'
  ).length;
  const deliveredCount = visibleTasks.filter((task) => task.status === 'delivered').length;

  const handleOpenProofFlow = (task: DeliveryTask) => {
    if (task.status === 'pending') {
      const startResult = deliveryRepository.startDeliveryTask(task.id);
      if (!startResult.ok) {
        setErrorMessage(startResult.error.message);
        return;
      }

      setTasks(startResult.value);
    }

    router.push(`/services/parcel-delivery/${task.id}`);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6 page-transition">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-on-surface">{text.title}</h2>
        <p className="text-on-surface-variant font-medium">{text.subtitle}</p>
      </div>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-[0_12px_30px_rgba(18,28,40,0.04)]">
          <p className="text-on-surface-variant text-xs uppercase tracking-wide">{text.pending}</p>
          <p className="text-3xl font-extrabold text-primary">{pendingCount}</p>
        </div>
        <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-[0_12px_30px_rgba(18,28,40,0.04)]">
          <p className="text-on-surface-variant text-xs uppercase tracking-wide">{text.inProgress}</p>
          <p className="text-3xl font-extrabold text-amber-600">{inProgressCount}</p>
        </div>
        <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-[0_12px_30px_rgba(18,28,40,0.04)]">
          <p className="text-on-surface-variant text-xs uppercase tracking-wide">{text.delivered}</p>
          <p className="text-3xl font-extrabold text-secondary">{deliveredCount}</p>
        </div>
        <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-[0_12px_30px_rgba(18,28,40,0.04)]">
          <p className="text-on-surface-variant text-xs uppercase tracking-wide">{text.pushQueued}</p>
          <p className="text-3xl font-extrabold text-primary">{notificationOutboxCount}</p>
        </div>
      </section>

      {/* <section className="bg-surface-container-lowest rounded-2xl p-5 shadow-[0_12px_30px_rgba(18,28,40,0.04)]">
        <p className="text-sm font-medium text-on-surface-variant">{text.requestSourceHint}</p>
      </section> */}

      {errorMessage && (
        <div className="rounded-xl bg-error-container p-3 text-sm font-medium text-on-error-container">
          {errorMessage}
        </div>
      )}

      <section className="space-y-4">
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-on-surface">{text.activeList}</h3>
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder={text.searchPlaceholder}
          />
        </div>

        <div className="space-y-3">
          {visibleTasks.map((task) => (
            <article
              key={task.id}
              className="bg-surface-container-lowest rounded-2xl p-5 shadow-[0_12px_30px_rgba(18,28,40,0.04)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xl font-extrabold text-on-surface">{task.roomNumber}</p>
                  <p className="text-sm font-medium text-primary">{task.tenantName}</p>
                  <p className="text-xs text-on-surface-variant font-medium">
                    {text.requestedAgo} {getRelativeTime(task.requestedAt, language)}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusClass(
                    task.status
                  )}`}
                >
                  {text.statuses[task.status]}
                </span>
              </div>

              <div className="mt-4 space-y-1 text-sm text-on-surface-variant font-medium">
                <p>Tracking: {task.trackingNumber}</p>
                <p>Phone: {task.phone}</p>
                {task.deliveredAt && (
                  <p>{language === 'th' ? 'ส่งเมื่อ' : 'Delivered'}: {getRelativeTime(task.deliveredAt, language)}</p>
                )}
              </div>

              <div className="mt-4">
                {task.status === 'delivered' ? (
                  <div className="inline-flex items-center gap-2 text-sm font-bold text-secondary">
                    <span className="material-symbols-outlined">verified</span>
                    <span>{text.deliveredWithProof}</span>
                  </div>
                ) : (
                  <button
                    className="w-full h-11 rounded-xl btn-primary-gradient text-on-primary font-bold"
                    onClick={() => handleOpenProofFlow(task)}
                    type="button"
                  >
                    {task.status === 'pending'
                      ? text.startDelivery
                      : text.continueDelivery}
                  </button>
                )}
              </div>
            </article>
          ))}

          {visibleTasks.length === 0 && (
            <div className="rounded-2xl bg-surface-container-low p-6 text-center text-on-surface-variant font-medium">
              {text.noTasks}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
