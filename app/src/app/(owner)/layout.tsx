'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import ServiceNotificationPanel from '@/components/layout/ServiceNotificationPanel';
import TopAppBar from '@/components/layout/TopAppBar';
import BottomNavBar from '@/components/layout/BottomNavBar';
import Sidebar from '@/components/layout/Sidebar';
import LanguageToggle from '@/components/layout/LanguageToggle';
import { LanguageProvider, useLanguage } from '@/hooks/useLanguage';
import { useServiceNotifications } from '@/hooks/useServiceNotifications';
import type { ServiceNotification } from '@/types/serviceNotification';

function OwnerShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { language, t } = useLanguage();
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    isNotificationRead,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useServiceNotifications();

  const handleNotificationClick = (notification: ServiceNotification) => {
    markNotificationAsRead(notification.id);
    setIsNotificationPanelOpen(false);
    router.push(notification.href);
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* Desktop sidebar — always visible on lg+ */}
      <Sidebar />

      {/* Main content area — shifted right on desktop for sidebar */}
      <div className="lg:pl-72 pb-32 lg:pb-0">
        <TopAppBar
          title={t('common.appTitle')}
          showMenu={false}
          notificationUnreadCount={unreadCount}
          isNotificationPanelOpen={isNotificationPanelOpen}
          onNotificationToggle={() => 
            setIsNotificationPanelOpen((isOpen) => !isOpen)
          }
          onNotificationClose={() => setIsNotificationPanelOpen(false)}
          notificationPanel={
            <ServiceNotificationPanel
              language={language}
              notifications={notifications}
              unreadCount={unreadCount}
              isNotificationRead={isNotificationRead}
              onNotificationClick={handleNotificationClick}
              onMarkNotificationAsRead={markNotificationAsRead}
              onMarkAllAsRead={markAllNotificationsAsRead}
            />
          }
          rightAction={<LanguageToggle />}
        />
        <main className="max-w-7xl mx-auto">{children}</main>
      </div>

      {/* Bottom nav — mobile only */}
      <BottomNavBar />
    </div>
  );
}

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LanguageProvider>
      <OwnerShell>{children}</OwnerShell>
    </LanguageProvider>
  );
}
