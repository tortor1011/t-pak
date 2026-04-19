'use client';

import { useEffect, useRef, useState } from 'react';

export const TOP_APP_BAR_MOBILE_QUERY = '(max-width: 1023px)';

export function isTopAppBarMobileViewport(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }

  return window.matchMedia(TOP_APP_BAR_MOBILE_QUERY).matches;
}

interface TopAppBarProps {
  title: string;
  showMenu?: boolean;
  showBack?: boolean;
  showNotification?: boolean;
  notificationUnreadCount?: number;
  isNotificationPanelOpen?: boolean;
  onNotificationToggle?: () => void;
  onNotificationClose?: () => void;
  notificationPanel?: React.ReactNode;
  onMenuClick?: () => void;
  onBackClick?: () => void;
  rightAction?: React.ReactNode;
}

export default function TopAppBar({
  title,
  showMenu = true,
  showBack = false,
  showNotification = true,
  notificationUnreadCount = 0,
  isNotificationPanelOpen = false,
  onNotificationToggle,
  onNotificationClose,
  notificationPanel,
  onMenuClick,
  onBackClick,
  rightAction,
}: TopAppBarProps) {
  const notificationContainerRef = useRef<HTMLDivElement | null>(null);
  const [isMobileViewport, setIsMobileViewport] = useState(() =>
    isTopAppBarMobileViewport()
  );

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') {
      return;
    }

    const mediaQuery = window.matchMedia(TOP_APP_BAR_MOBILE_QUERY);

    const handleViewportChange = (event: MediaQueryListEvent) => {
      setIsMobileViewport(event.matches);
    };

    mediaQuery.addEventListener('change', handleViewportChange);

    return () => {
      mediaQuery.removeEventListener('change', handleViewportChange);
    };
  }, []);

  useEffect(() => {
    if (!isNotificationPanelOpen || !onNotificationClose) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const container = notificationContainerRef.current;
      if (!container) {
        return;
      }

      if (!container.contains(event.target as Node)) {
        onNotificationClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onNotificationClose();
      }
    };

    window.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isNotificationPanelOpen, onNotificationClose]);

  const hasUnreadNotifications = notificationUnreadCount > 0;
  const unreadDisplayValue =
    notificationUnreadCount > 99 ? '99+' : `${notificationUnreadCount}`;

  return (
    <header className="bg-white z-40 shadow-[0_20px_50px_rgba(18,28,40,0.05)]">
      <div className="flex justify-between items-center w-full px-6 py-4">
        <div className="flex items-center gap-4 min-w-0">
          {showBack && (
            <button
              onClick={onBackClick}
              className="p-2 rounded-full hover:bg-slate-100 transition-colors duration-200 active:scale-95"
            >
              <span className="material-symbols-outlined text-primary">arrow_back</span>
            </button>
          )}
          {/* Menu button only on mobile */}
          {showMenu && !showBack && isMobileViewport && (
            <button
              onClick={onMenuClick}
              className="material-symbols-outlined text-on-surface hover:bg-slate-50 p-2 rounded-full transition-transform active:scale-95 duration-200"
            >
              menu
            </button>
          )}
          <h1 className="font-bold text-2xl tracking-tight text-slate-900 truncate">
            {title}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {rightAction}
          {showNotification && (
            <div className="relative" ref={notificationContainerRef}>
              <button
                type="button"
                onClick={onNotificationToggle}
                aria-label="Open notifications"
                aria-expanded={isNotificationPanelOpen}
                aria-haspopup="dialog"
                className="material-symbols-outlined text-slate-900 p-2 rounded-full hover:bg-slate-50 transition-transform active:scale-95 duration-200"
              >
                notifications
              </button>
              {hasUnreadNotifications && (
                <span className="absolute top-1 right-1 min-w-5 h-5 px-1 rounded-full bg-error text-on-error text-[10px] font-black border-2 border-white flex items-center justify-center leading-none">
                  {unreadDisplayValue}
                </span>
              )}
              {isNotificationPanelOpen && notificationPanel && (
                <div className="absolute right-0 mt-2 z-50">
                  {notificationPanel}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
