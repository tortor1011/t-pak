'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { MOCK_ROOMS } from '@/services/mockData';
import { formatCurrency } from '@/utils/currency';
import SearchInput from '@/components/ui/SearchInput';
import StatusBadge from '@/components/ui/StatusBadge';

export default function RoomsPage() {
  const [search, setSearch] = useState('');

  const filteredRooms = useMemo(() => {
    if (!search) return MOCK_ROOMS;
    const q = search.toLowerCase();
    return MOCK_ROOMS.filter(
      (r) =>
        r.number.includes(q) ||
        r.tenantName?.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6 page-transition">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Room Directory</h2>
        <span className="text-on-surface-variant font-medium text-sm">
          {MOCK_ROOMS.length} rooms
        </span>
      </div>

      <SearchInput value={search} onChange={setSearch} />

      {/* Room Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-surface-container-lowest p-4 rounded-2xl text-center shadow-[0_10px_40px_rgba(18,28,40,0.03)]">
          <p className="text-2xl font-black text-primary">
            {MOCK_ROOMS.filter((r) => r.occupancy === 'occupied').length}
          </p>
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
            Occupied
          </p>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-2xl text-center shadow-[0_10px_40px_rgba(18,28,40,0.03)]">
          <p className="text-2xl font-black text-secondary">
            {MOCK_ROOMS.filter((r) => r.occupancy === 'vacant').length}
          </p>
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
            Vacant
          </p>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-2xl text-center shadow-[0_10px_40px_rgba(18,28,40,0.03)]">
          <p className="text-2xl font-black text-on-surface">{MOCK_ROOMS.length}</p>
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
            Total
          </p>
        </div>
      </div>

      {/* Room List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {filteredRooms.map((room) => (
          <Link key={room.id} href={`/rooms/${room.id}`}>
            <div className="bg-surface-container-lowest p-5 rounded-2xl flex justify-between items-center shadow-[0_10px_40px_rgba(18,28,40,0.03)] hover:bg-surface-container-low transition-colors cursor-pointer">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-black text-on-surface">{room.number}</span>
                  <StatusBadge status={room.billingStatus} />
                  {room.occupancy === 'vacant' && (
                    <span className="bg-surface-variant text-on-surface-variant text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">
                      VACANT
                    </span>
                  )}
                </div>
                <p className="text-on-surface-variant font-medium">
                  {room.tenantName ?? 'No tenant'}
                </p>
                <p className="text-sm font-bold text-on-surface">
                  Base: {formatCurrency(room.baseRent)}
                </p>
              </div>
              <span className="material-symbols-outlined text-outline">chevron_right</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
