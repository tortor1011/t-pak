'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useOwnerBillingState } from '@/hooks/useOwnerBillingState';
import { useLanguage } from '@/hooks/useLanguage';
import { formatCurrency } from '@/utils/currency';
import RoomCard from '@/components/ui/RoomCard';
import SearchInput from '@/components/ui/SearchInput';
import FilterTabs from '@/components/ui/FilterTabs';
import { getRoomBillingStatusForDisplay } from '@/services/roomBillingDisplay';

export default function DashboardPage() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const { t, language } = useLanguage();
  const { billingState } = useOwnerBillingState();
  const rooms = billingState.rooms;
  const summary = billingState.summary;

  const monthOptions = useMemo(() => {
    const now = new Date();

    return Array.from({ length: 12 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      return {
        value,
        label: date.toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US', {
          month: 'long',
          year: 'numeric',
        }),
      };
    });
  }, [language]);

  const [selectedMonthValue, setSelectedMonthValue] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const filteredRooms = useMemo(() => {
    let filtered = rooms;
    if (activeTab === 'pending') {
      filtered = filtered.filter(
        (room) => getRoomBillingStatusForDisplay(room) === 'pending'
      );
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (r) => r.number.includes(q) || r.tenantName?.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [activeTab, rooms, search]);

  const pendingCount = rooms.filter(
    (room) => getRoomBillingStatusForDisplay(room) === 'pending'
  ).length;
  const tabs = [
    { key: 'all', label: t('common.all') },
    { key: 'pending', label: t('common.pending'), count: pendingCount },
  ];

  const occupancyRate =
    summary.totalRooms > 0
      ? Math.round((summary.occupiedRooms / summary.totalRooms) * 100)
      : 0;

  const selectedMonthLabel =
    monthOptions.find((option) => option.value === selectedMonthValue)?.label ??
    t('common.april2026');

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6 lg:space-y-8 page-transition">
      {/* ── Top Row: Revenue + Quick Stats ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Card */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <div className="relative inline-flex items-center">
              <select
                value={selectedMonthValue}
                onChange={(event) => setSelectedMonthValue(event.target.value)}
                aria-label={t('dashboard.monthlyRevenue')}
                className="appearance-none bg-surface-container-low px-4 py-2 pr-10 rounded-xl text-on-surface font-semibold hover:bg-surface-container focus:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors"
              >
                {monthOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none material-symbols-outlined text-sm absolute right-3 text-on-surface-variant">
                arrow_drop_down
              </span>
              <span className="sr-only">{selectedMonthLabel}</span>
            </div>
          </div>
          <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-[0_10px_40px_rgba(18,28,40,0.03)] space-y-6">
            <div>
              <p className="text-on-surface-variant text-sm uppercase tracking-widest mb-1 font-medium">
                {t('dashboard.monthlyRevenue')}
              </p>
              <h2 className="text-4xl font-black text-on-surface">
                {formatCurrency(summary.totalRevenue)}
              </h2>
            </div>
            <Link href="/billing/debt">
              <div className="bg-surface-container-low p-4 rounded-2xl flex justify-between items-center group active:scale-[0.98] transition-transform cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="bg-tertiary-fixed p-3 rounded-full">
                    <span className="material-symbols-outlined text-tertiary">account_balance_wallet</span>
                  </div>
                  <div>
                    <p className="text-on-surface-variant text-sm font-semibold">{t('dashboard.pendingPayments')}</p>
                    <p className="text-xl font-bold text-tertiary">
                      {formatCurrency(summary.pendingPayments)}
                    </p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-outline group-hover:translate-x-1 transition-transform">
                  chevron_right
                </span>
              </div>
            </Link>
          </div>
        </div>

        {/* Quick Stats — visible on desktop */}
        <div className="hidden lg:flex flex-col gap-4">
          <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-[0_10px_40px_rgba(18,28,40,0.03)] flex-1 flex flex-col justify-center">
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">{t('common.occupied')}</p>
            <p className="text-3xl font-black text-primary">{summary.occupiedRooms}</p>
            <p className="text-sm text-on-surface-variant font-medium">
              {t('dashboard.ofRooms', { total: summary.totalRooms })}
            </p>
          </div>
          <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-[0_10px_40px_rgba(18,28,40,0.03)] flex-1 flex flex-col justify-center">
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">{t('common.vacant')}</p>
            <p className="text-3xl font-black text-secondary">{summary.vacantRooms}</p>
            <p className="text-sm text-on-surface-variant font-medium">{t('dashboard.availableNow')}</p>
          </div>
          <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-[0_10px_40px_rgba(18,28,40,0.03)] flex-1 flex flex-col justify-center">
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">{t('dashboard.occupancyRate')}</p>
            <p className="text-3xl font-black text-on-surface">{occupancyRate}%</p>
            <div className="w-full h-2 bg-surface-container rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-primary rounded-full"
                style={{ width: `${occupancyRate}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Management Console ── */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold tracking-tight">{t('dashboard.managementConsole')}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/billing/meter-reading">
            <button className="w-full h-14 btn-primary-gradient text-on-primary rounded-xl font-bold flex items-center justify-center gap-3 shadow-[0_8px_20px_rgba(0,74,198,0.2)] active:scale-95 transition-all">
              <span className="material-symbols-outlined">speed</span>
              {t('dashboard.readMeters')}
            </button>
          </Link>
          <Link href="/billing/generate">
            <button className="w-full h-14 bg-surface-container-high text-on-surface rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all">
              <span className="material-symbols-outlined text-primary">print</span>
              {t('dashboard.printBills')}
            </button>
          </Link>
          <Link href="/services/complaints">
            <button className="w-full h-14 bg-surface-container-high text-on-surface rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all">
              <span className="material-symbols-outlined text-tertiary">emergency_home</span>
              {t('dashboard.complaints')}
            </button>
          </Link>
        </div>
      </section>

      {/* ── Room Status ── */}
      <section className="space-y-4 lg:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h3 className="text-lg font-bold tracking-tight">{t('dashboard.roomStatus')}</h3>
          <div className="flex gap-3 items-center">
            <FilterTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
        </div>
        <SearchInput value={search} onChange={setSearch} />

        {/* Room Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredRooms.map((room) => {
            const displayBillingStatus = getRoomBillingStatusForDisplay(room);

            return (
              <RoomCard
                key={room.id}
                room={room}
                actionButton={
                  displayBillingStatus === 'pending' ? (
                    <Link href="/billing/verify">
                      <button className="bg-primary text-on-primary px-4 py-2 rounded-xl text-sm font-bold shadow-[0_4px_12px_rgba(0,74,198,0.2)] active:scale-95 transition-all">
                        {t('dashboard.verifySlip')}
                      </button>
                    </Link>
                  ) : displayBillingStatus === 'unpaid' ? (
                    <Link href="/billing/debt">
                      <button className="border-2 border-tertiary text-tertiary px-6 py-2 rounded-xl text-sm font-bold active:scale-95 transition-all">
                        {t('dashboard.remind')}
                      </button>
                    </Link>
                  ) : undefined
                }
              />
            );
          })}
          {filteredRooms.length === 0 && (
            <div className="col-span-full text-center py-12 text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl mb-2 block">search_off</span>
              <p className="font-medium">{t('dashboard.noRoomsFound')}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
