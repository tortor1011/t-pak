export interface NavItem {
  label: string;
  icon: string;
  href: string;
  activeIcon?: string;
}

export const BOTTOM_NAV_ITEMS: NavItem[] = [
  { label: 'Home', icon: 'home', href: '/dashboard', activeIcon: 'home' },
  { label: 'Billing', icon: 'receipt_long', href: '/billing', activeIcon: 'receipt_long' },
  { label: 'Services', icon: 'room_service', href: '/services', activeIcon: 'room_service' },
  { label: 'Settings', icon: 'settings', href: '/settings', activeIcon: 'settings' },
];

export const DRAWER_NAV_ITEMS: NavItem[] = [
  { label: 'Home', icon: 'home', href: '/dashboard' },
  { label: 'Billing', icon: 'receipt_long', href: '/billing' },
  { label: 'Services', icon: 'room_service', href: '/services' },
  { label: 'Settings', icon: 'settings', href: '/settings' },
];
