'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import StatusBadge from '@/components/ui/StatusBadge';
import { useLanguage } from '@/hooks/useLanguage';
import { useRepositories } from '@/hooks/useRepositories';
import type { Room } from '@/types/room';
import { formatCurrency } from '@/utils/currency';

export type TenantLifecycleMode = 'move-in' | 'move-out';

type FloorFilter = number | 'all';

interface TenantLifecycleRoomSelectorProps {
  mode: TenantLifecycleMode;
}

function isRoomSelectable(room: Room, mode: TenantLifecycleMode): boolean {
  if (mode === 'move-in') {
    return room.occupancy === 'vacant';
  }

  return room.occupancy === 'occupied';
}

function getOccupancyLabel(
  occupancy: Room['occupancy'],
  language: 'th' | 'en'
): string {
  if (language === 'th') {
    if (occupancy === 'occupied') return 'มีผู้เช่า';
    if (occupancy === 'vacant') return 'ว่าง';
    return 'จองแล้ว';
  }

  if (occupancy === 'occupied') return 'Occupied';
  if (occupancy === 'vacant') return 'Vacant';
  return 'Reserved';
}

function getDisabledReason(
  room: Room,
  mode: TenantLifecycleMode,
  language: 'th' | 'en'
): string {
  if (mode === 'move-in') {
    if (room.occupancy === 'occupied') {
      return language === 'th'
        ? 'ห้องนี้มีผู้เช่าอยู่แล้ว'
        : 'This room already has an active tenant.';
    }

    return language === 'th'
      ? 'ห้องนี้ถูกจองไว้ ยังไม่พร้อมย้ายเข้า'
      : 'This room is reserved and unavailable for move-in.';
  }

  if (room.occupancy === 'vacant') {
    return language === 'th'
      ? 'ห้องนี้ยังไม่มีผู้เช่า ไม่สามารถสรุปย้ายออกได้'
      : 'This room has no tenant to move out.';
  }

  return language === 'th'
    ? 'ห้องนี้ยังไม่เปิดสัญญา จึงยังสรุปย้ายออกไม่ได้'
    : 'This room is reserved and not eligible for move-out yet.';
}

function sortRoomsByNumber(rooms: Room[]): Room[] {
  return [...rooms].sort((a, b) => a.number.localeCompare(b.number, 'en', { numeric: true }));
}

export default function TenantLifecycleRoomSelector({ mode }: TenantLifecycleRoomSelectorProps) {
  const router = useRouter();
  const { language } = useLanguage();
  const { roomRepository } = useRepositories();
  const [selectedFloor, setSelectedFloor] = useState<FloorFilter>('all');
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [rooms, setRooms] = useState<Room[]>(() => {
    const result = roomRepository.listRooms();
    return result.ok ? sortRoomsByNumber(result.value) : [];
  });

  const text =
    language === 'th'
      ? {
          floorFilter: 'ตัวกรองชั้น',
          allFloors: 'ทุกชั้น',
          roomMapTitle: 'ผังห้อง',
          roomMapDescription:
            mode === 'move-in'
              ? 'เลือกห้องที่ต้องการย้ายเข้า ระบบจะแสดงทุกห้องและปิดห้องที่ไม่พร้อมใช้งาน'
              : 'เลือกห้องที่ต้องการย้ายออก ระบบจะแสดงทุกห้องและปิดห้องที่ไม่มีผู้เช่า',
          noTenant: 'ไม่มีผู้เช่า',
          baseRent: 'ค่าเช่า',
          noRoomsFound: 'ไม่พบข้อมูลห้อง',
          noRoomsDescription: 'ยังไม่มีข้อมูลห้องจากผังห้องในระบบ',
          selectedRoomLabel: 'ห้องที่เลือก',
          selectRoomHint: 'กรุณาเลือกห้องจากผังด้านบน',
          continueAction: mode === 'move-in' ? 'เริ่มย้ายเข้า' : 'สรุปย้ายออก',
          goToRoom: 'ไปยังห้อง',
        }
      : {
          floorFilter: 'Floor Filter',
          allFloors: 'All Floors',
          roomMapTitle: 'Room Map',
          roomMapDescription:
            mode === 'move-in'
              ? 'Select a room for move-in. All rooms are shown and unavailable rooms are disabled.'
              : 'Select a room for move-out. All rooms are shown and rooms without tenants are disabled.',
          noTenant: 'No tenant',
          baseRent: 'Base Rent',
          noRoomsFound: 'No rooms found',
          noRoomsDescription: 'No rooms are available from the configured room map yet.',
          selectedRoomLabel: 'Selected Room',
          selectRoomHint: 'Please select a room from the map above.',
          continueAction: mode === 'move-in' ? 'Start Move-in' : 'Open Move-out Settlement',
          goToRoom: 'Go to Room',
        };

  useEffect(() => {
    const refreshRooms = () => {
      const result = roomRepository.listRooms();
      if (result.ok) {
        setRooms(sortRoomsByNumber(result.value));
      }
    };

    window.addEventListener('storage', refreshRooms);
    window.addEventListener('estate_clarity.billing_state_updated', refreshRooms);

    return () => {
      window.removeEventListener('storage', refreshRooms);
      window.removeEventListener('estate_clarity.billing_state_updated', refreshRooms);
    };
  }, [roomRepository]);

  const floorList = useMemo(() => {
    return [...new Set(rooms.map((room) => room.floor))].sort((a, b) => a - b);
  }, [rooms]);

  const visibleRooms = useMemo(() => {
    if (selectedFloor === 'all') {
      return rooms;
    }

    return rooms.filter((room) => room.floor === selectedFloor);
  }, [rooms, selectedFloor]);

  const selectedRoom = useMemo(() => {
    if (!selectedRoomId) {
      return null;
    }

    return rooms.find((room) => room.id === selectedRoomId) ?? null;
  }, [rooms, selectedRoomId]);

  const isSelectedRoomAllowed = selectedRoom ? isRoomSelectable(selectedRoom, mode) : false;

  const handleContinue = () => {
    if (!selectedRoom || !isSelectedRoomAllowed) {
      return;
    }

    const targetBasePath = mode === 'move-in' ? '/tenants/move-in' : '/tenants/move-out';
    router.push(`${targetBasePath}/${selectedRoom.id}`);
  };

  return (
    <div className="space-y-5">
      <section className="bg-surface-container-lowest rounded-2xl p-4 sm:p-5 shadow-[0_10px_30px_rgba(18,28,40,0.03)] space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-on-surface">{text.roomMapTitle}</h2>
          <p className="text-sm text-on-surface-variant">{text.roomMapDescription}</p>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">
            {text.floorFilter}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedFloor('all')}
              className={`h-9 px-4 rounded-full text-sm font-bold transition-colors ${
                selectedFloor === 'all'
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {text.allFloors}
            </button>
            {floorList.map((floor) => (
              <button
                key={floor}
                onClick={() => setSelectedFloor(floor)}
                className={`h-9 px-4 rounded-full text-sm font-bold transition-colors ${
                  selectedFloor === floor
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {language === 'th' ? `ชั้น ${floor}` : `Floor ${floor}`}
              </button>
            ))}
          </div>
        </div>
      </section>

      {visibleRooms.length === 0 ? (
        <section className="bg-surface-container-low rounded-2xl p-6 text-center">
          <p className="text-on-surface font-bold">{text.noRoomsFound}</p>
          <p className="text-sm text-on-surface-variant mt-1">{text.noRoomsDescription}</p>
        </section>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {visibleRooms.map((room) => {
            const selectable = isRoomSelectable(room, mode);
            const isSelected = selectedRoomId === room.id;
            const disabledReason = selectable
              ? null
              : getDisabledReason(room, mode, language);

            return (
              <button
                key={room.id}
                type="button"
                onClick={() => {
                  if (selectable) {
                    setSelectedRoomId(room.id);
                  }
                }}
                className={`text-left rounded-2xl p-4 border transition-all shadow-[0_10px_25px_rgba(18,28,40,0.03)] ${
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-surface-container-high bg-surface-container-lowest'
                } ${
                  selectable
                    ? 'hover:bg-surface-container-low active:scale-[0.99]'
                    : 'opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <p className="text-2xl font-black text-on-surface">{room.number}</p>
                  <StatusBadge status={room.billingStatus} />
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${
                      room.occupancy === 'vacant'
                        ? 'bg-secondary-container/20 text-secondary'
                        : room.occupancy === 'occupied'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-tertiary/10 text-tertiary'
                    }`}
                  >
                    {getOccupancyLabel(room.occupancy, language)}
                  </span>
                </div>

                <p className="text-sm font-medium text-on-surface-variant line-clamp-1">
                  {room.tenantName ?? text.noTenant}
                </p>
                <p className="text-sm font-bold text-on-surface mt-1">
                  {text.baseRent}: {formatCurrency(room.baseRent)}
                </p>

                {disabledReason && (
                  <p className="text-xs text-error mt-3 font-medium">{disabledReason}</p>
                )}
              </button>
            );
          })}
        </section>
      )}

      <section className="bg-surface-container-lowest rounded-2xl p-4 sm:p-5 shadow-[0_10px_30px_rgba(18,28,40,0.03)] space-y-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">
            {text.selectedRoomLabel}
          </p>
          {selectedRoom ? (
            <p className="text-on-surface font-bold text-lg">
              {text.goToRoom} {selectedRoom.number}
            </p>
          ) : (
            <p className="text-sm text-on-surface-variant">{text.selectRoomHint}</p>
          )}
        </div>

        <button
          onClick={handleContinue}
          disabled={!isSelectedRoomAllowed}
          className={`w-full h-12 rounded-xl font-bold transition-all ${
            isSelectedRoomAllowed
              ? 'btn-primary-gradient text-on-primary shadow-[0_8px_24px_rgba(0,74,198,0.22)] active:scale-[0.99]'
              : 'bg-surface-container text-on-surface-variant cursor-not-allowed'
          }`}
        >
          {text.continueAction}
        </button>
      </section>
    </div>
  );
}
