import type { TranslationKey } from '@/services/i18n';

export interface NavItem {
  labelKey: TranslationKey;
  icon: string;
  href: string;
  activeIcon?: string;
}

export const BOTTOM_NAV_ITEMS: NavItem[] = [
  { labelKey: 'nav.home', icon: 'home', href: '/dashboard', activeIcon: 'home' },
  { labelKey: 'nav.billing', icon: 'receipt_long', href: '/billing', activeIcon: 'receipt_long' },
  { labelKey: 'nav.services', icon: 'room_service', href: '/services', activeIcon: 'room_service' },
  { labelKey: 'nav.settings', icon: 'settings', href: '/settings', activeIcon: 'settings' },
];

export const DRAWER_NAV_ITEMS: NavItem[] = [
  { labelKey: 'nav.home', icon: 'home', href: '/dashboard' },
  { labelKey: 'nav.billing', icon: 'receipt_long', href: '/billing' },
  { labelKey: 'nav.services', icon: 'room_service', href: '/services' },
  { labelKey: 'nav.settings', icon: 'settings', href: '/settings' },
];
