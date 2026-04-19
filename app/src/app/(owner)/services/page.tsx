'use client';

import Link from 'next/link';
import { useLanguage } from '@/hooks/useLanguage';

const SERVICE_ITEMS = {
  th: [
    {
      title: 'จัดการคำร้องซ่อม',
      description: 'ติดตามและอัปเดตสถานะงานซ่อมบำรุง',
      icon: 'emergency_home',
      href: '/services/complaints',
      iconColor: 'text-tertiary',
    },
    {
      title: 'ผังห้องพัก',
      description: 'ดูข้อมูลห้องและผู้เช่าทั้งหมด',
      icon: 'bed',
      href: '/rooms',
      iconColor: 'text-primary',
    },
    {
      title: 'ย้ายเข้า',
      description: 'ลงทะเบียนผู้เช่าใหม่และสร้างสัญญา',
      icon: 'person_add',
      href: '/tenants/move-in',
      iconColor: 'text-secondary',
    },
    {
      title: 'ย้ายออก',
      description: 'สรุปยอดก่อนยกเลิกสัญญาและคืนเงินประกัน',
      icon: 'output',
      href: '/tenants/move-out',
      iconColor: 'text-tertiary',
    },
    {
      title: 'รายงานการเงิน',
      description: 'วิเคราะห์รายรับรายจ่ายและแนวโน้มรายเดือน',
      icon: 'assessment',
      href: '/reports',
      iconColor: 'text-primary',
    },
    {
      title: 'ตั้งค่าห้องแบบกลุ่ม',
      description: 'กำหนดราคาและค่าบริการให้หลายห้องพร้อมกัน',
      icon: 'view_module',
      href: '/services/bulk-room-setup',
      iconColor: 'text-secondary',
    },
  ],
  en: [
    {
      title: 'Complaint Management',
      description: 'Handle maintenance requests and issues',
      icon: 'emergency_home',
      href: '/services/complaints',
      iconColor: 'text-tertiary',
    },
    {
      title: 'Room Directory',
      description: 'View all rooms and tenant information',
      icon: 'bed',
      href: '/rooms',
      iconColor: 'text-primary',
    },
    {
      title: 'Tenant Move-in',
      description: 'Register new tenant and create lease',
      icon: 'person_add',
      href: '/tenants/move-in',
      iconColor: 'text-secondary',
    },
    {
      title: 'Tenant Move-out',
      description: 'Process lease termination and refund',
      icon: 'output',
      href: '/tenants/move-out',
      iconColor: 'text-tertiary',
    },
    {
      title: 'Financial Reports',
      description: 'Revenue analysis and expense tracking',
      icon: 'assessment',
      href: '/reports',
      iconColor: 'text-primary',
    },
    {
      title: 'Bulk Room Setup',
      description: 'Set pricing and setup multiple rooms',
      icon: 'view_module',
      href: '/services/bulk-room-setup',
      iconColor: 'text-secondary',
    },
  ],
} as const;

export default function ServicesPage() {
  const { language } = useLanguage();
  const pageTitle = language === 'th' ? 'ศูนย์ปฏิบัติการ' : 'Operations Center';
  const pageDescription =
    language === 'th'
      ? 'จัดการงานบริการและการปฏิบัติงานของอาคาร'
      : 'Manage property operations and services';
  const items = SERVICE_ITEMS[language];

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6 page-transition">
      <h2 className="text-2xl font-bold tracking-tight">{pageTitle}</h2>
      <p className="text-on-surface-variant font-medium">
        {pageDescription}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {items.map((item) => (
          <Link key={item.href} href={item.href}>
            <div className="bg-surface-container-lowest rounded-2xl p-5 flex items-center gap-4 shadow-[0_10px_40px_rgba(18,28,40,0.03)] hover:bg-surface-container-low active:scale-[0.98] transition-all cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center">
                <span className={`material-symbols-outlined ${item.iconColor}`}>
                  {item.icon}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-on-surface">{item.title}</h3>
                <p className="text-sm text-on-surface-variant font-medium">
                  {item.description}
                </p>
              </div>
              <span className="material-symbols-outlined text-outline">chevron_right</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
