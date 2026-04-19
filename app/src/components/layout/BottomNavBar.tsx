'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BOTTOM_NAV_ITEMS } from '@/types/navigation';
import { useLanguage } from '@/hooks/useLanguage';

export default function BottomNavBar() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard' || pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-8 pt-4 bg-white/80 backdrop-blur-md shadow-[0_-10px_40px_rgba(18,28,40,0.08)] rounded-t-3xl lg:hidden">
      {BOTTOM_NAV_ITEMS.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center px-6 py-3 rounded-2xl active:scale-90 transition-all duration-200 ${
              active
                ? 'bg-blue-100 text-blue-700'
                : 'text-slate-500 hover:text-blue-600'
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              {item.icon}
            </span>
            <span className="font-bold text-[14px] leading-tight mt-1">
              {t(item.labelKey)}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
