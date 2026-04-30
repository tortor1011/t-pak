'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PageHeader from '@/components/layout/PageHeader';
import { useLanguage } from '@/hooks/useLanguage';
import { useRepositories } from '@/hooks/useRepositories';
import { formatCurrency } from '@/utils/currency';
import type { Room } from '@/types/room';

function sortRoomsByNumber(rooms: Room[]): Room[] {
  return [...rooms].sort((a, b) => a.number.localeCompare(b.number, 'en', { numeric: true }));
}

export default function MoveInRoomDetailPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = typeof params.roomId === 'string' ? params.roomId : '';
  const { language } = useLanguage();
  const { roomRepository } = useRepositories();

  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    roomRepository.listRooms().then((roomsResult) => {
      if (roomsResult.ok) {
        setRooms(sortRoomsByNumber(roomsResult.value));
      }
    });
  }, [roomRepository]);

  const text =
    language === 'th'
      ? {
          redirecting: 'กำลังพากลับหน้าเลือกห้อง...',
          roomContextTitle: 'ห้องที่เลือกสำหรับย้ายเข้า',
          room: 'ห้อง',
          floor: 'ชั้น',
          building: 'อาคาร',
          baseRentFromSetup: 'ค่าเช่าจากการตั้งค่าห้อง',
          amenities: 'สิ่งอำนวยความสะดวก',
          noAmenities: 'ไม่มีข้อมูล',
          readyStatus: 'พร้อมย้ายเข้า',
          upload: 'อัปโหลด',
          tenantInfoTitle: 'ข้อมูลผู้เช่า',
          tenantInfoDescription: 'รายละเอียดข้อมูลประจำตัวผู้เช่า',
          fullName: 'ชื่อ-นามสกุล',
          fullNamePlaceholder: 'เช่น สมชาย ศรีสุข',
          phoneNumber: 'เบอร์โทรศัพท์',
          lineId: 'ไลน์ไอดี',
          uploadIdCard: 'อัปโหลดรูปบัตรประชาชน',
          contractDetails: 'รายละเอียดสัญญา',
          contractDuration: 'ระยะเวลาสัญญา',
          oneYear: '1 ปี',
          sixMonths: '6 เดือน',
          monthly: 'รายเดือน (ต่ออายุอัตโนมัติ)',
          startDate: 'วันที่เริ่มสัญญา',
          endDate: 'วันที่สิ้นสุดสัญญา',
          rentCycleHint: 'ระบบจะออกบิลค่าเช่าในวันที่ 1 ของทุกเดือน',
          financials: 'ข้อมูลการเงิน',
          baseRent: 'ค่าเช่าพื้นฐาน (บาท)',
          securityDeposit: 'เงินประกัน',
          depositHint: 'แนะนำให้ใช้เงินประกัน 2 เท่าของค่าเช่าห้อง',
          utilityStartingMeters: 'มิเตอร์ตั้งต้น',
          electricity: 'ไฟฟ้า',
          water: 'น้ำ',
          createProfile: 'สร้างโปรไฟล์และออกสัญญาเช่า',
        }
      : {
          redirecting: 'Redirecting to room selector...',
          roomContextTitle: 'Selected Room for Move-in',
          room: 'Room',
          floor: 'Floor',
          building: 'Building',
          baseRentFromSetup: 'Base rent from room setup',
          amenities: 'Amenities',
          noAmenities: 'No amenities configured',
          readyStatus: 'Ready for move-in',
          upload: 'Upload',
          tenantInfoTitle: 'Tenant Information',
          tenantInfoDescription: 'Personal identity details',
          fullName: 'Full Name',
          fullNamePlaceholder: 'e.g., John Doe',
          phoneNumber: 'Phone Number',
          lineId: 'Line ID',
          uploadIdCard: 'Upload ID Card Photo',
          contractDetails: 'Contract Details',
          contractDuration: 'Contract Duration',
          oneYear: '1 Year',
          sixMonths: '6 Months',
          monthly: 'Monthly (Rolling)',
          startDate: 'Start Date',
          endDate: 'End Date',
          rentCycleHint: 'Rent will be billed on the 1st of each month.',
          financials: 'Financials',
          baseRent: 'Base Rent (THB)',
          securityDeposit: 'Security Deposit',
          depositHint: 'Recommended security deposit: 2x room base rent.',
          utilityStartingMeters: 'Utility Starting Meters',
          electricity: 'Electricity',
          water: 'Water',
          createProfile: 'Create Profile & Generate Lease',
        };

  useEffect(() => {
    const refreshRooms = async () => {
      const roomsResult = await roomRepository.listRooms();
      if (roomsResult.ok) {
        setRooms(sortRoomsByNumber(roomsResult.value));
      }
    };

    window.addEventListener('storage', refreshRooms);
    window.addEventListener('estate_clarity.billing_state_updated', refreshRooms);

    return () => {
      window.removeEventListener('storage', refreshRooms);
      window.removeEventListener('estate_clarity.billing_state_updated', refreshRooms);
    };
  }, [roomRepository]);

  const selectedRoom = rooms.find((room) => room.id === roomId);
  const isAllowedRoom = selectedRoom?.occupancy === 'vacant';

  useEffect(() => {
    if (!selectedRoom || !isAllowedRoom) {
      router.replace('/tenants/move-in');
    }
  }, [isAllowedRoom, router, selectedRoom]);

  if (!selectedRoom || !isAllowedRoom) {
    return (
      <div className="min-h-screen bg-surface pb-32 lg:pb-8">
        <PageHeader
          title={language === 'th' ? 'ย้ายเข้า' : 'Move-in'}
          onBack={() => router.push('/tenants/move-in')}
        />
        <div className="px-4 py-8 text-sm font-medium text-on-surface-variant">{text.redirecting}</div>
      </div>
    );
  }

  const pageTitle =
    language === 'th' ? `ย้ายเข้า: ห้อง ${selectedRoom.number}` : `Move-in: Room ${selectedRoom.number}`;
  const suggestedDeposit = selectedRoom.baseRent * 2;

  return (
    <div className="min-h-screen bg-surface pb-32 lg:pb-8">
      <PageHeader title={pageTitle} onBack={() => router.push('/tenants/move-in')} />

      <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-4xl mx-auto page-transition">
        <section className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_10px_30px_rgba(18,28,40,0.03)] space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-on-surface">{text.roomContextTitle}</h2>
            <span className="text-xs font-bold px-2 py-1 rounded-full bg-secondary-container/20 text-secondary uppercase tracking-wide">
              {text.readyStatus}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-on-surface-variant">{text.room}</p>
              <p className="font-bold text-on-surface text-lg">{selectedRoom.number}</p>
            </div>
            <div>
              <p className="text-on-surface-variant">{text.floor}</p>
              <p className="font-bold text-on-surface text-lg">{selectedRoom.floor}</p>
            </div>
            <div>
              <p className="text-on-surface-variant">{text.building}</p>
              <p className="font-bold text-on-surface">{selectedRoom.building}</p>
            </div>
            <div>
              <p className="text-on-surface-variant">{text.baseRentFromSetup}</p>
              <p className="font-bold text-on-surface">{formatCurrency(selectedRoom.baseRent)}</p>
            </div>
          </div>

          <div>
            <p className="text-on-surface-variant text-sm mb-2">{text.amenities}</p>
            <div className="flex flex-wrap gap-2">
              {selectedRoom.amenities.length > 0 ? (
                selectedRoom.amenities.map((amenity) => (
                  <span
                    key={amenity}
                    className="bg-surface-container-low px-3 py-1 rounded-full text-xs font-bold text-on-surface-variant"
                  >
                    {amenity}
                  </span>
                ))
              ) : (
                <span className="text-sm text-on-surface-variant">{text.noAmenities}</span>
              )}
            </div>
          </div>
        </section>

        <section className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_10px_30px_rgba(18,28,40,0.03)]">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center border-2 border-dashed border-outline-variant relative overflow-hidden group cursor-pointer">
              <span className="material-symbols-outlined text-outline text-3xl">camera_alt</span>
              <div className="absolute inset-0 bg-black/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter">
                  {text.upload}
                </span>
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-on-surface mb-1 leading-tight">
                {text.tenantInfoTitle}
              </h2>
              <p className="text-on-surface-variant text-sm">{text.tenantInfoDescription}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-on-surface mb-2">{text.fullName}</label>
              <input
                className="w-full h-14 px-4 rounded-xl bg-surface-container-low border-none focus:ring-2 focus:ring-primary"
                placeholder={text.fullNamePlaceholder}
                type="text"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-on-surface mb-2">{text.phoneNumber}</label>
                <input
                  className="w-full h-14 px-4 rounded-xl bg-surface-container-low border-none focus:ring-2 focus:ring-primary"
                  placeholder="081-234-5678"
                  type="tel"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-on-surface mb-2">{text.lineId}</label>
                <input
                  className="w-full h-14 px-4 rounded-xl bg-surface-container-low border-none focus:ring-2 focus:ring-primary"
                  placeholder="@id"
                  type="text"
                />
              </div>
            </div>
            <button className="w-full py-4 px-4 rounded-xl bg-secondary-container text-on-secondary-container font-bold text-sm flex items-center justify-center space-x-2 active:scale-[0.98] transition-transform">
              <span className="material-symbols-outlined text-lg">badge</span>
              <span>{text.uploadIdCard}</span>
            </button>
          </div>
        </section>

        <section className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_10px_30px_rgba(18,28,40,0.03)]">
          <h2 className="text-lg font-bold text-on-surface mb-4">{text.contractDetails}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-on-surface mb-2">
                {text.contractDuration}
              </label>
              <select className="w-full h-14 px-4 rounded-xl bg-surface-container-low border-none focus:ring-2 focus:ring-primary appearance-none">
                <option>{text.oneYear}</option>
                <option>{text.sixMonths}</option>
                <option>{text.monthly}</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-on-surface mb-2">{text.startDate}</label>
                <input
                  className="w-full h-14 px-4 rounded-xl bg-surface-container-low border-none focus:ring-2 focus:ring-primary"
                  type="date"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-on-surface mb-2">{text.endDate}</label>
                <input
                  className="w-full h-14 px-4 rounded-xl bg-surface-container-low border-none focus:ring-2 focus:ring-primary"
                  type="date"
                />
              </div>
            </div>
            <div className="flex items-start space-x-2 p-3 bg-primary/5 rounded-xl">
              <span className="material-symbols-outlined text-primary text-lg mt-0.5">info</span>
              <p className="text-xs text-primary font-medium leading-relaxed">{text.rentCycleHint}</p>
            </div>
          </div>
        </section>

        <section className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_10px_30px_rgba(18,28,40,0.03)]">
          <h2 className="text-lg font-bold text-on-surface mb-4">{text.financials}</h2>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-on-surface mb-2">{text.baseRent}</label>
                <input
                  className="w-full h-14 pl-4 pr-10 rounded-xl bg-surface-container-low border-none focus:ring-2 focus:ring-primary font-bold"
                  defaultValue={selectedRoom.baseRent}
                  type="number"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-on-surface mb-2">
                  {text.securityDeposit}
                </label>
                <input
                  className="w-full h-14 pl-4 pr-10 rounded-xl bg-surface-container-low border-none focus:ring-2 focus:ring-primary font-bold"
                  defaultValue={suggestedDeposit}
                  type="number"
                />
              </div>
            </div>

            <p className="text-xs text-on-surface-variant font-medium">{text.depositHint}</p>

            <div className="pt-4 border-t border-surface-container">
              <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-4">
                {text.utilityStartingMeters}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-container-low p-4 rounded-xl">
                  <label className="flex items-center space-x-2 text-xs font-bold text-on-surface-variant mb-2">
                    <span className="material-symbols-outlined text-sm text-blue-500">bolt</span>
                    <span>{text.electricity}</span>
                  </label>
                  <input
                    className="w-full bg-transparent border-none p-0 focus:ring-0 text-xl font-extrabold text-on-surface"
                    placeholder="000.0"
                    type="number"
                  />
                </div>
                <div className="bg-surface-container-low p-4 rounded-xl">
                  <label className="flex items-center space-x-2 text-xs font-bold text-on-surface-variant mb-2">
                    <span className="material-symbols-outlined text-sm text-cyan-500">water_drop</span>
                    <span>{text.water}</span>
                  </label>
                  <input
                    className="w-full bg-transparent border-none p-0 focus:ring-0 text-xl font-extrabold text-on-surface"
                    placeholder="000.0"
                    type="number"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="pt-4 px-2">
          <button className="w-full h-14 rounded-xl btn-primary-gradient text-on-primary font-bold text-lg shadow-[0_10px_30px_rgba(0,74,198,0.25)] active:scale-95 transition-transform">
            {text.createProfile}
          </button>
        </div>
      </div>
    </div>
  );
}
