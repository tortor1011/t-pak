'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/utils/currency';
import SearchInput from '@/components/ui/SearchInput';
import StatusBadge from '@/components/ui/StatusBadge';
import PageHeader from '@/components/layout/PageHeader';
import { useLanguage } from '@/hooks/useLanguage';
import { useRepositories } from '@/hooks/useRepositories';
import { getRoomBillingStatusForDisplay } from '@/services/roomBillingDisplay';

export default function RoomsPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const { roomRepository } = useRepositories();
  const [search, setSearch] = useState('');
  const [rooms, setRooms] = useState(() => {
    const roomsResult = roomRepository.listRooms();
    return roomsResult.ok ? roomsResult.value : [];
  });
  const text =
    language === 'th'
      ? {
          title: 'ผังห้องพัก',
          roomCount: 'ห้อง',
          occupied: 'มีผู้เช่า',
          vacant: 'ว่าง',
          total: 'ทั้งหมด',
          vacantBadge: 'ว่าง',
          reservedBadge: 'จองแล้ว',
          noTenant: 'ไม่มีผู้เช่า',
          base: 'ค่าเช่าพื้นฐาน',
        }
      : {
          title: 'Room Directory',
          roomCount: 'rooms',
          occupied: 'Occupied',
          vacant: 'Vacant',
          total: 'Total',
          vacantBadge: 'VACANT',
          reservedBadge: 'RESERVED',
          noTenant: 'No tenant',
          base: 'Base',
        };

  useEffect(() => {
    const refreshRoomsState = () => {
      const roomsResult = roomRepository.listRooms();
      if (roomsResult.ok) {
        setRooms(roomsResult.value);
      }
    };

    window.addEventListener('storage', refreshRoomsState);
    window.addEventListener('estate_clarity.billing_state_updated', refreshRoomsState);

    return () => {
      window.removeEventListener('storage', refreshRoomsState);
      window.removeEventListener('estate_clarity.billing_state_updated', refreshRoomsState);
    };
  }, [roomRepository]);

  const filteredRooms = useMemo(() => {
    if (!search) return rooms;
    const q = search.toLowerCase();
    return rooms.filter(
      (r) =>
        r.number.includes(q) ||
        r.tenantName?.toLowerCase().includes(q)
    );
  }, [rooms, search]);

  return (
    <div className="min-h-screen bg-surface pb-32 lg:pb-8">
      <PageHeader
        title={text.title}
        onBack={() => router.back()}
        rightAction={
          <span className="text-on-surface-variant font-medium text-sm">
            {rooms.length} {text.roomCount}
          </span>
        }
      />

      <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6 page-transition">
        <SearchInput value={search} onChange={setSearch} />

        {/* Room Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-surface-container-lowest p-4 rounded-2xl text-center shadow-[0_10px_40px_rgba(18,28,40,0.03)]">
            <p className="text-2xl font-black text-primary">
              {rooms.filter((r) => r.occupancy === 'occupied').length}
            </p>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              {text.occupied}
            </p>
          </div>
          <div className="bg-surface-container-lowest p-4 rounded-2xl text-center shadow-[0_10px_40px_rgba(18,28,40,0.03)]">
            <p className="text-2xl font-black text-secondary">
              {rooms.filter((r) => r.occupancy === 'vacant').length}
            </p>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              {text.vacant}
            </p>
          </div>
          <div className="bg-surface-container-lowest p-4 rounded-2xl text-center shadow-[0_10px_40px_rgba(18,28,40,0.03)]">
            <p className="text-2xl font-black text-on-surface">{rooms.length}</p>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              {text.total}
            </p>
          </div>
        </div>

        {/* Room List */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filteredRooms.map((room) => {
            const displayBillingStatus = getRoomBillingStatusForDisplay(room);

            return (
              <Link key={room.id} href={`/rooms/${room.id}`}>
                <div className="bg-surface-container-lowest p-5 rounded-2xl flex justify-between items-center shadow-[0_10px_40px_rgba(18,28,40,0.03)] hover:bg-surface-container-low transition-colors cursor-pointer">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-black text-on-surface">{room.number}</span>
                      {displayBillingStatus ? (
                        <StatusBadge status={displayBillingStatus} />
                      ) : (
                        <span className="bg-surface-variant text-on-surface-variant text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">
                          {room.occupancy === 'reserved'
                            ? text.reservedBadge
                            : text.vacantBadge}
                        </span>
                      )}
                    </div>
                    <p className="text-on-surface-variant font-medium">
                      {room.tenantName ?? text.noTenant}
                    </p>
                    <p className="text-sm font-bold text-on-surface">
                      {text.base}: {formatCurrency(room.baseRent)}
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-outline">chevron_right</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
