'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/layout/PageHeader';
import SearchInput from '@/components/ui/SearchInput';
import { useLanguage } from '@/hooks/useLanguage';
import { useRepositories } from '@/hooks/useRepositories';
import { VEHICLE_REGISTRY_UPDATED_EVENT } from '@/services/vehicleRegistry';
import type { Room } from '@/types/room';
import type { VehicleSearchOptions, VehicleType } from '@/types/vehicle';

interface VehicleRegistrationForm {
  roomId: string;
  plate: string;
  vehicleType: VehicleType;
}

function getVehicleIcon(vehicleType: VehicleType): string {
  if (vehicleType === 'motorcycle') {
    return 'two_wheeler';
  }

  if (vehicleType === 'car') {
    return 'directions_car';
  }

  return 'local_shipping';
}

export default function VehiclesPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const { vehicleRepository, roomRepository } = useRepositories();

  const [search, setSearch] = useState('');
  const [exactMatch, setExactMatch] = useState(false);
  const [activeTenantOnly, setActiveTenantOnly] = useState(true);
  const [directoryRoomFilter, setDirectoryRoomFilter] = useState('');
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [form, setForm] = useState<VehicleRegistrationForm>({
    roomId: '',
    plate: '',
    vehicleType: 'car',
  });

  const [rooms, setRooms] = useState<Room[]>(() => {
    const roomsResult = roomRepository.listRooms();
    if (!roomsResult.ok) {
      return [];
    }

    return roomsResult.value.filter(
      (room) => room.occupancy === 'occupied' && room.tenantId !== null
    );
  });

  const text =
    language === 'th'
      ? {
          title: 'ทะเบียนรถลูกหอ',
          subtitle: 'ใช้ตรวจสอบว่ารถคันนี้เป็นของลูกหอเราไหม',
          total: 'ทะเบียนทั้งหมด',
          active: 'กำลังใช้งาน',
          addTitle: 'ลงทะเบียนรถลูกหอ',
          addVehicle: '+ เพิ่มทะเบียนรถ',
          closeForm: 'ปิด',
          room: 'ห้อง',
          plate: 'ป้ายทะเบียน',
          vehicleType: 'ประเภทรถ',
          addButton: 'บันทึกทะเบียน',
          searchPlaceholder: 'ค้นหาจากทะเบียน ห้อง หรือชื่อผู้เช่า',
          exactMatch: 'ค้นหาแบบทะเบียนตรงตัว',
          activeOnly: 'แสดงเฉพาะผู้เช่า active',
          roomFilter: 'กรองตามห้อง',
          allRooms: 'ทุกห้อง',
          directory: 'Vehicle Directory',
          noResult: 'ไม่พบรายการทะเบียน',
          deactivate: 'ปิดใช้งาน',
          status: {
            verified: 'ยืนยันแล้ว',
            unregistered: 'ยังไม่ยืนยัน',
            inactive: 'ยกเลิกแล้ว',
          },
          type: {
            car: 'รถยนต์',
            motorcycle: 'มอเตอร์ไซค์',
            other: 'อื่นๆ',
          },
          registerSuccess: 'เพิ่มทะเบียนรถเรียบร้อย',
          deactivateSuccess: 'ปิดใช้งานทะเบียนเรียบร้อย',
        }
      : {
          title: 'Resident Vehicle Registry',
          subtitle: 'Check whether a vehicle belongs to your resident.',
          total: 'Total Vehicles',
          active: 'Active Records',
          addTitle: 'Register Resident Vehicle',
          addVehicle: '+ Add Vehicle',
          closeForm: 'Close',
          room: 'Room',
          plate: 'License Plate',
          vehicleType: 'Vehicle Type',
          addButton: 'Register Plate',
          searchPlaceholder: 'Search by plate, room, or tenant',
          exactMatch: 'Exact plate match only',
          activeOnly: 'Show active tenants only',
          roomFilter: 'Filter by room',
          allRooms: 'All rooms',
          directory: 'Vehicle Directory',
          noResult: 'No vehicles matched your filters.',
          deactivate: 'Deactivate',
          status: {
            verified: 'Verified',
            unregistered: 'Unregistered',
            inactive: 'Inactive',
          },
          type: {
            car: 'Car',
            motorcycle: 'Motorcycle',
            other: 'Other',
          },
          registerSuccess: 'Vehicle registered successfully.',
          deactivateSuccess: 'Vehicle was deactivated.',
        };

  useEffect(() => {
    const refreshRooms = () => {
      const roomsResult = roomRepository.listRooms();
      if (!roomsResult.ok) {
        return;
      }

      setRooms(
        roomsResult.value.filter(
          (room) => room.occupancy === 'occupied' && room.tenantId !== null
        )
      );
    };

    const refreshVehicles = () => {
      setRefreshVersion((current) => current + 1);
    };

    window.addEventListener('storage', refreshVehicles);
    window.addEventListener(VEHICLE_REGISTRY_UPDATED_EVENT, refreshVehicles);
    window.addEventListener('storage', refreshRooms);

    return () => {
      window.removeEventListener('storage', refreshVehicles);
      window.removeEventListener(VEHICLE_REGISTRY_UPDATED_EVENT, refreshVehicles);
      window.removeEventListener('storage', refreshRooms);
    };
  }, [roomRepository]);

  const vehicles = useMemo(() => {
    const searchOptions: VehicleSearchOptions = {
      exactMatch,
      activeTenantOnly,
      roomNumber: directoryRoomFilter || undefined,
    };

    if (refreshVersion < 0) {
      return [];
    }

    const result = vehicleRepository.searchVehicles(search, searchOptions);
    return result.ok ? result.value : [];
  }, [
    activeTenantOnly,
    directoryRoomFilter,
    exactMatch,
    refreshVersion,
    search,
    vehicleRepository,
  ]);

  const handleRegisterVehicle = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);
    setErrorMessage(null);

    const selectedRoom = rooms.find((room) => room.id === form.roomId);
    if (!selectedRoom || !selectedRoom.tenantId || !selectedRoom.tenantName) {
      setErrorMessage(
        language === 'th'
          ? 'กรุณาเลือกห้องที่มีผู้เช่าอยู่'
          : 'Please select an occupied room.'
      );
      return;
    }

    const result = vehicleRepository.registerVehicle({
      tenantId: selectedRoom.tenantId,
      tenantName: selectedRoom.tenantName,
      roomNumber: selectedRoom.number,
      plate: form.plate,
      vehicleType: form.vehicleType,
      status: 'verified',
    });

    if (!result.ok) {
      setErrorMessage(result.error.message);
      return;
    }

    setForm({ roomId: '', plate: '', vehicleType: 'car' });
    setFeedback(text.registerSuccess);
    setRefreshVersion((current) => current + 1);
    setIsAddModalOpen(false);
  };

  const handleDeactivateVehicle = (vehicleId: string) => {
    setFeedback(null);
    setErrorMessage(null);

    const result = vehicleRepository.deactivateVehicle(vehicleId);
    if (!result.ok) {
      setErrorMessage(result.error.message);
      return;
    }

    setFeedback(text.deactivateSuccess);
    setRefreshVersion((current) => current + 1);
  };

  const totalVehicles = vehicles.length;
  const activeVehicles = vehicles.filter((vehicle) => vehicle.status !== 'inactive').length;

  return (
    <div className="min-h-screen bg-surface pb-32 lg:pb-8">
      <PageHeader title={text.title} onBack={() => router.back()} />

      <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6 page-transition">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-on-surface-variant font-medium">{text.subtitle}</p>
          </div>
          <button
            className="h-11 px-4 rounded-xl btn-primary-gradient text-on-primary font-bold whitespace-nowrap"
            type="button"
            onClick={() => {
              setErrorMessage(null);
              setIsAddModalOpen(true);
            }}
          >
            {text.addVehicle}
          </button>
        </div>
        <section className="grid grid-cols-2 gap-4">
          <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-[0_12px_30px_rgba(18,28,40,0.04)]">
            <p className="text-xs uppercase tracking-wide text-on-surface-variant">{text.total}</p>
            <p className="text-3xl font-extrabold text-primary">{totalVehicles}</p>
          </div>
          <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-[0_12px_30px_rgba(18,28,40,0.04)]">
            <p className="text-xs uppercase tracking-wide text-on-surface-variant">{text.active}</p>
            <p className="text-3xl font-extrabold text-secondary">{activeVehicles}</p>
          </div>
        </section>

        {feedback && (
          <div className="rounded-xl bg-secondary-container p-3 text-sm font-medium text-on-secondary-container">
            {feedback}
          </div>
        )}

        {errorMessage && (
          <div className="rounded-xl bg-error-container p-3 text-sm font-medium text-on-error-container">
            {errorMessage}
          </div>
        )}

        <section className="space-y-4">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder={text.searchPlaceholder}
          />

          <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-on-surface-variant">
            <label className="inline-flex items-center gap-2">
              <span>{text.roomFilter}</span>
              <select
                className="h-9 px-2 rounded-lg bg-surface-container-low border-none"
                value={directoryRoomFilter}
                onChange={(event) => setDirectoryRoomFilter(event.target.value)}
              >
                <option value="">{text.allRooms}</option>
                {rooms.map((room) => (
                  <option key={room.id} value={room.number}>
                    {room.number}
                  </option>
                ))}
              </select>
            </label>

            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-outline"
                checked={exactMatch}
                onChange={(event) => setExactMatch(event.target.checked)}
              />
              <span>{text.exactMatch}</span>
            </label>

            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-outline"
                checked={activeTenantOnly}
                onChange={(event) => setActiveTenantOnly(event.target.checked)}
              />
              <span>{text.activeOnly}</span>
            </label>
          </div>

          <div className="space-y-3">
            {vehicles.map((vehicle) => (
              <article
                key={vehicle.id}
                className="bg-surface-container-lowest rounded-2xl p-5 shadow-[0_12px_30px_rgba(18,28,40,0.04)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-surface-container-low flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">{getVehicleIcon(vehicle.vehicleType)}</span>
                    </div>
                    <div>
                      <p className="text-lg font-extrabold text-on-surface">{vehicle.plate}</p>
                      <p className="text-sm font-medium text-on-surface-variant">
                        {vehicle.roomNumber} - {vehicle.tenantName}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                      vehicle.status === 'verified'
                        ? 'bg-secondary-container text-on-secondary-container'
                        : vehicle.status === 'unregistered'
                          ? 'bg-error-container text-on-error-container'
                          : 'bg-surface-container-low text-on-surface-variant'
                    }`}
                  >
                    {text.status[vehicle.status]}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs font-medium text-on-surface-variant">
                    {text.vehicleType}: {text.type[vehicle.vehicleType]}
                  </p>
                  {vehicle.status !== 'inactive' && (
                    <button
                      className="h-10 px-4 rounded-xl bg-surface-container-low text-on-surface font-bold text-sm"
                      onClick={() => handleDeactivateVehicle(vehicle.id)}
                      type="button"
                    >
                      {text.deactivate}
                    </button>
                  )}
                </div>
              </article>
            ))}

            {vehicles.length === 0 && (
              <div className="rounded-2xl bg-surface-container-low p-6 text-center text-on-surface-variant font-medium">
                {text.noResult}
              </div>
            )}
          </div>
        </section>

        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px] flex items-end sm:items-center justify-center p-4">
            <div className="w-full max-w-xl bg-surface-container-lowest rounded-2xl p-5 shadow-[0_20px_60px_rgba(18,28,40,0.25)]">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h3 className="text-lg font-bold text-on-surface">{text.addTitle}</h3>
                <button
                  className="h-9 px-3 rounded-lg bg-surface-container-low text-on-surface font-medium"
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  {text.closeForm}
                </button>
              </div>

              <form className="grid grid-cols-1 gap-4" onSubmit={handleRegisterVehicle}>
                <div>
                  <label className="block text-sm font-bold text-on-surface mb-2">{text.room}</label>
                  <select
                    className="w-full h-12 px-3 rounded-xl bg-surface-container-low border-none focus:ring-2 focus:ring-primary"
                    value={form.roomId}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, roomId: event.target.value }))
                    }
                    required
                  >
                    <option value="">--</option>
                    {rooms.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.number} - {room.tenantName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-on-surface mb-2">{text.plate}</label>
                  <input
                    className="w-full h-12 px-4 rounded-xl bg-surface-container-low border-none focus:ring-2 focus:ring-primary"
                    value={form.plate}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, plate: event.target.value }))
                    }
                    type="text"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-on-surface mb-2">{text.vehicleType}</label>
                  <select
                    className="w-full h-12 px-3 rounded-xl bg-surface-container-low border-none focus:ring-2 focus:ring-primary"
                    value={form.vehicleType}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        vehicleType: event.target.value as VehicleType,
                      }))
                    }
                  >
                    <option value="car">{text.type.car}</option>
                    <option value="motorcycle">{text.type.motorcycle}</option>
                    <option value="other">{text.type.other}</option>
                  </select>
                </div>
                <div className="pt-2">
                  <button className="w-full h-12 rounded-xl btn-primary-gradient text-on-primary font-bold" type="submit">
                    {text.addButton}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
