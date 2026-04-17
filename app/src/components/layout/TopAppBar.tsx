'use client';

import { useState } from 'react';

interface TopAppBarProps {
  title: string;
  showMenu?: boolean;
  showBack?: boolean;
  showNotification?: boolean;
  onMenuClick?: () => void;
  onBackClick?: () => void;
  rightAction?: React.ReactNode;
}

export default function TopAppBar({
  title,
  showMenu = true,
  showBack = false,
  showNotification = true,
  onMenuClick,
  onBackClick,
  rightAction,
}: TopAppBarProps) {
  const [hasNotification] = useState(true);

  return (
    <header className="bg-white sticky top-0 z-40 shadow-[0_20px_50px_rgba(18,28,40,0.05)]">
      <div className="flex justify-between items-center w-full px-6 py-4">
        <div className="flex items-center gap-4">
          {showBack && (
            <button
              onClick={onBackClick}
              className="p-2 rounded-full hover:bg-slate-100 transition-colors duration-200 active:scale-95"
            >
              <span className="material-symbols-outlined text-primary">arrow_back</span>
            </button>
          )}
          {/* Menu button only on mobile */}
          {showMenu && !showBack && (
            <button
              onClick={onMenuClick}
              className="material-symbols-outlined text-on-surface hover:bg-slate-50 p-2 rounded-full transition-transform active:scale-95 duration-200 lg:hidden"
            >
              menu
            </button>
          )}
          <h1 className="font-bold text-2xl tracking-tight text-slate-900">
            {title}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {rightAction}
          {showNotification && (
            <div className="relative">
              <button className="material-symbols-outlined text-slate-900 p-2 rounded-full hover:bg-slate-50 transition-transform active:scale-95 duration-200">
                notifications
              </button>
              {hasNotification && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-error rounded-full border-2 border-white" />
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
