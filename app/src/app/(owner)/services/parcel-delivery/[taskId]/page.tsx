'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PageHeader from '@/components/layout/PageHeader';
import { useLanguage } from '@/hooks/useLanguage';
import { useRepositories } from '@/hooks/useRepositories';

export default function ParcelDeliveryProofPage() {
  const router = useRouter();
  const params = useParams();
  const { language } = useLanguage();
  const { deliveryRepository } = useRepositories();

  const taskId = typeof params.taskId === 'string' ? params.taskId : '';

  const taskResult = taskId
    ? deliveryRepository.findDeliveryTaskById(taskId)
    : { ok: true as const, value: null };
  const task = taskResult.ok ? taskResult.value : null;

  const [proofPhotoUrl, setProofPhotoUrl] = useState('');
  const [deliveryNote, setDeliveryNote] = useState('');
  const [confirmationChecked, setConfirmationChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const text =
    language === 'th'
      ? {
          title: 'หลักฐานส่งพัสดุ',
          fallbackTitle: 'งานพัสดุ',
          notFound: 'ไม่พบรายการพัสดุนี้',
          statusDelivered: 'งานนี้ส่งเรียบร้อยแล้ว',
          room: 'ห้อง',
          tenant: 'ผู้เช่า',
          tracking: 'เลขแทร็ค',
          phone: 'เบอร์โทร',
          photoLabel: 'ลิงก์รูปหลักฐาน',
          photoHint: 'ตัวอย่าง: /mock-delivery-proof.jpg หรือ https://...',
          noteLabel: 'บันทึกเพิ่มเติม',
          notePlaceholder: 'ตำแหน่งวางพัสดุหรือข้อความส่งถึงลูกหอ',
          confirmLabel:
            'ยืนยันว่าพัสดุถูกวางในจุดปลอดภัย และมีภาพหลักฐานครบถ้วน',
          completeButton: 'ยืนยันส่งพัสดุ',
          submitting: 'กำลังบันทึก...',
          completed: 'ส่งพัสดุเรียบร้อยแล้ว',
        }
      : {
          title: 'Delivery Proof',
          fallbackTitle: 'Parcel Task',
          notFound: 'Parcel task was not found.',
          statusDelivered: 'This task is already delivered.',
          room: 'Room',
          tenant: 'Tenant',
          tracking: 'Tracking',
          phone: 'Phone',
          photoLabel: 'Proof Photo URL',
          photoHint: 'Example: /mock-delivery-proof.jpg or https://...',
          noteLabel: 'Delivery Note',
          notePlaceholder: 'Safe drop location or extra details for tenant',
          confirmLabel:
            'I confirm this parcel was placed safely and is visible in the proof photo.',
          completeButton: 'Confirm Delivery',
          submitting: 'Saving...',
          completed: 'Delivery has been completed.',
        };

  const handleCompleteDelivery = () => {
    if (!taskId) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const result = deliveryRepository.completeDeliveryTask(taskId, {
      proofPhotoUrl,
      deliveryNote,
      confirmationChecked,
    });

    if (!result.ok) {
      setIsSubmitting(false);
      setErrorMessage(result.error.message);
      return;
    }
    setIsSubmitting(false);

    setTimeout(() => {
      router.push('/services/parcel-delivery');
    }, 350);
  };

  if (!task) {
    return (
      <div className="min-h-screen bg-surface pb-28">
        <PageHeader
          title={text.fallbackTitle}
          onBack={() => router.push('/services/parcel-delivery')}
        />
        <div className="px-4 py-8 text-on-surface-variant font-medium">{text.notFound}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface pb-28">
      <PageHeader title={text.title} onBack={() => router.push('/services/parcel-delivery')} />

      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-3xl mx-auto space-y-6 page-transition">
        <section className="bg-surface-container-lowest rounded-2xl p-6 shadow-[0_12px_30px_rgba(18,28,40,0.04)] space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-4xl font-extrabold text-on-surface">{task.roomNumber}</p>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-primary-container/20 text-primary">
              {task.status}
            </span>
          </div>
          <p className="text-on-surface-variant font-medium">
            {text.tenant}: {task.tenantName}
          </p>
          <p className="text-on-surface-variant font-medium">
            {text.tracking}: {task.trackingNumber}
          </p>
          <p className="text-on-surface-variant font-medium">
            {text.phone}: {task.phone}
          </p>
        </section>

        {task.status === 'delivered' && (
          <div className="rounded-xl bg-secondary-container p-4 text-on-secondary-container font-medium">
            {text.statusDelivered}
          </div>
        )}

        <section className="bg-surface-container-lowest rounded-2xl p-6 shadow-[0_12px_30px_rgba(18,28,40,0.04)] space-y-4">
          <div>
            <label className="block text-sm font-bold text-on-surface mb-2">{text.photoLabel}</label>
            <input
              className="w-full h-12 px-4 rounded-xl bg-surface-container-low border-none focus:ring-2 focus:ring-primary"
              value={proofPhotoUrl || task.proofPhotoUrl || ''}
              onChange={(event) => setProofPhotoUrl(event.target.value)}
              placeholder={text.photoHint}
              type="text"
              disabled={task.status === 'delivered'}
            />
            <p className="mt-2 text-xs font-medium text-on-surface-variant">{text.photoHint}</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-on-surface mb-2">{text.noteLabel}</label>
            <textarea
              className="w-full min-h-28 p-4 rounded-xl bg-surface-container-low border-none focus:ring-2 focus:ring-primary resize-y"
              value={deliveryNote || task.deliveryNote || ''}
              onChange={(event) => setDeliveryNote(event.target.value)}
              placeholder={text.notePlaceholder}
              disabled={task.status === 'delivered'}
            />
          </div>

          <label className="flex items-start gap-3 rounded-xl bg-surface-container-low p-4 cursor-pointer">
            <input
              type="checkbox"
              className="mt-1 h-5 w-5 rounded border-outline"
              checked={confirmationChecked || task.confirmationChecked}
              onChange={(event) => setConfirmationChecked(event.target.checked)}
              disabled={task.status === 'delivered'}
            />
            <span className="text-sm font-medium text-on-surface">{text.confirmLabel}</span>
          </label>

          {errorMessage && (
            <div className="rounded-xl bg-error-container p-3 text-sm font-medium text-on-error-container">
              {errorMessage}
            </div>
          )}

          {task.status === 'delivered' ? (
            <div className="rounded-xl bg-secondary-container p-3 text-sm font-medium text-on-secondary-container">
              {text.completed}
            </div>
          ) : (
            <button
              className="w-full h-12 rounded-xl btn-primary-gradient text-on-primary font-bold disabled:opacity-60"
              onClick={handleCompleteDelivery}
              type="button"
              disabled={isSubmitting}
            >
              {isSubmitting ? text.submitting : text.completeButton}
            </button>
          )}
        </section>
      </div>
    </div>
  );
}
