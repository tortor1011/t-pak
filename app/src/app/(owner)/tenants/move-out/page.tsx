'use client';

import { useRouter } from 'next/navigation';
import TenantLifecycleRoomSelector from '@/components/tenants/TenantLifecycleRoomSelector';
import { useLanguage } from '@/hooks/useLanguage';
import PageHeader from '@/components/layout/PageHeader';

export default function MoveOutPage() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const text =
    language === 'th'
      ? {
          description:
            'เลือกห้องที่ต้องการสรุปย้ายออกก่อน ระบบจะแสดงทุกห้องและปิดห้องที่ยังไม่มีผู้เช่า',
        }
      : {
          description:
            'Select the room for move-out settlement first. All rooms are visible and rooms without active tenants are disabled.',
        };

  return (
    <div className="min-h-screen bg-surface pb-32 lg:pb-8">
      <PageHeader title={t('page.moveOutTitle')} onBack={() => router.back()} />

      <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-4 max-w-5xl mx-auto page-transition">
        <p className="text-on-surface-variant font-medium">{text.description}</p>
        <TenantLifecycleRoomSelector mode="move-out" />
      </div>
    </div>
  );
}
