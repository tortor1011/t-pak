'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { DRAWER_NAV_ITEMS } from '@/types/navigation';
import { useLanguage } from '@/hooks/useLanguage';

export default function Sidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <aside className="hidden lg:flex flex-col w-72 h-screen bg-surface-container-low border-r border-outline-variant/30 fixed left-0 top-0 z-30">
      {/* Brand */}
      <div className="px-6 pt-8 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl btn-primary-gradient flex items-center justify-center shadow-md">
            <span className="material-symbols-outlined text-white text-xl">apartment</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-on-surface leading-tight">{t('sidebar.brandName')}</h1>
            <p className="text-xs font-medium text-on-surface-variant">{t('sidebar.brandTagline')}</p>
          </div>
        </div>
      </div>

      {/* Profile */}
      <div className="px-4 pb-6">
        <div className="flex items-center gap-3 bg-surface-container rounded-2xl p-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-sm ring-2 ring-primary/10">
            <span className="material-symbols-outlined text-lg">person</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-on-surface truncate">{t('sidebar.profileName')}</p>
            <p className="text-xs font-medium text-primary">{t('sidebar.profileGroup')}</p>
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {DRAWER_NAV_ITEMS.map((item) => {
          const active =
            item.href === '/dashboard'
              ? pathname === '/dashboard' || pathname === '/'
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                active
                  ? 'bg-primary/10 text-primary font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container font-medium'
              }`}
            >
              <span
                className={`material-symbols-outlined text-xl ${active ? 'text-primary' : 'text-on-surface-variant group-hover:text-on-surface'}`}
                style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {item.icon}
              </span>
              <span className="text-sm">{t(item.labelKey)}</span>
              {active && (
                <div className="ml-auto w-1.5 h-5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-6 pt-2 border-t border-outline-variant/20 mt-2">
        <button 
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-3 px-4 py-3 text-error hover:bg-error-container/10 rounded-xl transition-all w-full font-medium text-sm"
        >
          <span className="material-symbols-outlined text-xl">logout</span>
          <span>{t('common.logout')}</span>
        </button>
        <p className="text-[10px] text-outline text-center mt-3">Estate Clarity v1.0.0</p>
      </div>
    </aside>
  );
}
