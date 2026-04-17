'use client';

import Link from 'next/link';

const SERVICE_ITEMS = [
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
];

export default function ServicesPage() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6 page-transition">
      <h2 className="text-2xl font-bold tracking-tight">Operations Center</h2>
      <p className="text-on-surface-variant font-medium">
        Manage property operations and services
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {SERVICE_ITEMS.map((item) => (
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
