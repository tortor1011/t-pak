'use client';

import { useState } from 'react';
import TopAppBar from '@/components/layout/TopAppBar';
import BottomNavBar from '@/components/layout/BottomNavBar';
import NavigationDrawer from '@/components/layout/NavigationDrawer';
import Sidebar from '@/components/layout/Sidebar';

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface">
      {/* Desktop sidebar — always visible on lg+ */}
      <Sidebar />

      {/* Mobile drawer overlay */}
      <NavigationDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

      {/* Main content area — shifted right on desktop for sidebar */}
      <div className="lg:pl-72 pb-32 lg:pb-0">
        <TopAppBar
          title="Dormitory Manager"
          onMenuClick={() => setDrawerOpen(true)}
        />
        <main className="max-w-7xl mx-auto">{children}</main>
      </div>

      {/* Bottom nav — mobile only */}
      <BottomNavBar />
    </div>
  );
}
