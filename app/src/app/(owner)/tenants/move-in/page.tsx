'use client';

import { useRouter } from 'next/navigation';
import TenantLifecycleRoomSelector from '@/components/tenants/TenantLifecycleRoomSelector';
import { useLanguage } from '@/hooks/useLanguage';
import PageHeader from '@/components/layout/PageHeader';

export default function MoveInPage() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const text =
    language === 'th'
      ? {
          description:
            'เลือกห้องจากผังห้องก่อนเริ่มลงทะเบียนผู้เช่าใหม่ ระบบจะแสดงทุกห้องและปิดห้องที่ไม่พร้อมย้ายเข้า',
        }
      : {
          description:
            'Select a room from the room map before onboarding a new tenant. All rooms are visible and unavailable rooms are disabled.',
        };

  return (
    <div className="min-h-screen bg-surface pb-32 lg:pb-8">
      <PageHeader title={t('page.moveInTitle')} onBack={() => router.back()} />

      <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-4 max-w-5xl mx-auto page-transition">
        <p className="text-on-surface-variant font-medium">{text.description}</p>
        <TenantLifecycleRoomSelector mode="move-in" />
      </div>
    </div>
  );
}
