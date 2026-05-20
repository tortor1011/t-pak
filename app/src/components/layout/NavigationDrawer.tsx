'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { DRAWER_NAV_ITEMS } from '@/types/navigation';
import { useLanguage } from '@/hooks/useLanguage';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NavigationDrawer({ isOpen, onClose }: NavigationDrawerProps) {
  const pathname = usePathname();
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-on-surface/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <nav className="fixed inset-y-0 left-0 z-50 flex flex-col p-4 h-full w-[85vw] max-w-80 sm:w-80 rounded-r-xl bg-surface-container-low shadow-[0_20px_50px_rgba(18,28,40,0.05)] slide-in-left">
        {/* Profile Header */}
        <div className="flex flex-col items-start px-4 pt-6 pb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-xl ring-4 ring-primary/10">
              <span className="material-symbols-outlined text-2xl">person</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-on-surface leading-tight">{t('drawer.profileName')}</h3>
              <p className="text-sm font-medium text-primary">{t('drawer.profileRole')}</p>
            </div>
          </div>
          <div className="bg-surface-container px-3 py-1.5 rounded-full">
            <span className="text-xs font-bold text-on-surface-variant tracking-wider uppercase">
              {t('drawer.profileGroup')}
            </span>
          </div>
        </div>

        {/* Nav Items */}
        <div className="flex-1 flex flex-col gap-1 mt-4 overflow-y-auto">
          {DRAWER_NAV_ITEMS.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-4 px-4 py-4 rounded-xl transition-transform active:scale-95 ${
                  active
                    ? 'bg-blue-100 text-blue-700 font-bold'
                    : 'text-slate-700 hover:bg-slate-200 font-medium'
                }`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span>{t(item.labelKey)}</span>
              </Link>
            );
          })}
        </div>

        {/* Logout */}
        <div className="mt-auto pt-4">
          <button 
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center gap-4 px-4 py-4 text-error hover:bg-error-container/20 rounded-xl transition-transform active:scale-95 w-full"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="font-bold">{t('common.logout')}</span>
          </button>
        </div>
      </nav>
    </>
  );
}
