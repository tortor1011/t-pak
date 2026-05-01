'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PageHeader from '@/components/layout/PageHeader';
import { useLanguage } from '@/hooks/useLanguage';
import { useRepositories } from '@/hooks/useRepositories';
import { formatCurrency } from '@/utils/currency';
import type { Room } from '@/types/room';
import { Copy, Check, QrCode, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

function sortRoomsByNumber(rooms: Room[]): Room[] {
  return [...rooms].sort((a, b) => a.number.localeCompare(b.number, 'en', { numeric: true }));
}

interface InviteResult {
  inviteCode: string;
  tenantId: string;
  roomNumber: string;
}

// ─── Invite Code Success Screen ───────────────────────────────────────────────
function InviteCodeScreen({ result, onDone }: { result: InviteResult; onDone: () => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(result.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-6 py-12 text-center">
      {/* Success icon */}
      <div className="w-20 h-20 rounded-full bg-secondary-container flex items-center justify-center mb-6 shadow-lg">
        <Check className="w-10 h-10 text-secondary" />
      </div>

      <h1 className="text-2xl font-extrabold text-on-surface mb-2">
        ตั้งค่าห้อง {result.roomNumber} สำเร็จ!
      </h1>
      <p className="text-on-surface-variant text-sm mb-10 max-w-xs">
        ส่งรหัสด้านล่างให้ลูกหอ เพื่อให้เขาสมัครและเชื่อมห้องผ่านแอป T-PAK
      </p>

      {/* Invite code card */}
      <div className="w-full max-w-sm bg-surface-container-lowest rounded-[2rem] p-8 shadow-xl border border-outline-variant/10 mb-6">
        <div className="flex items-center justify-center gap-2 mb-3">
          <QrCode className="w-5 h-5 text-primary" />
          <p className="text-sm font-bold text-primary uppercase tracking-widest">รหัสเชื่อมห้อง</p>
        </div>

        <p className="font-mono font-black text-4xl text-on-surface tracking-[0.15em] mb-6 select-all">
          {result.inviteCode}
        </p>

        <button
          onClick={handleCopy}
          className={`w-full h-14 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${copied
              ? 'bg-secondary-container text-on-secondary-container'
              : 'bg-gradient-to-b from-primary to-primary-container text-white hover:opacity-95 active:scale-[0.98] shadow-md shadow-primary/20'
            }`}
        >
          {copied ? (
            <>
              <Check className="w-5 h-5" />
              คัดลอกแล้ว!
            </>
          ) : (
            <>
              <Copy className="w-5 h-5" />
              คัดลอกรหัส
            </>
          )}
        </button>
      </div>

      {/* Instructions */}
      <div className="w-full max-w-sm bg-primary-container/20 border border-primary/10 rounded-2xl p-4 text-left text-sm mb-8">
        <p className="font-bold text-primary mb-2">วิธีใช้รหัส</p>
        <ol className="text-on-surface-variant space-y-1.5 list-decimal list-inside">
          <li>ลูกหอดาวน์โหลดแอป T-PAK</li>
          <li>กดสมัครสมาชิก → กรอกข้อมูลส่วนตัว</li>
          <li>กรอกรหัสนี้ในหน้า "เชื่อมห้องพัก"</li>
          <li>ระบบเชื่อมห้องอัตโนมัติ ✓</li>
        </ol>
        <p className="text-outline text-xs mt-3">⚠️ รหัสนี้ใช้ได้ครั้งเดียวเท่านั้น</p>
      </div>

      <button
        onClick={onDone}
        className="flex items-center gap-2 text-primary font-bold hover:underline"
      >
        กลับหน้าหลัก
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function MoveInRoomDetailPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = typeof params.roomId === 'string' ? params.roomId : '';
  const { language } = useLanguage();
  const { roomRepository } = useRepositories();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [inviteResult, setInviteResult] = useState<InviteResult | null>(null);

  // Form refs
  const contractDurationRef = useRef<HTMLSelectElement>(null);
  const startDateRef = useRef<HTMLInputElement>(null);
  const endDateRef = useRef<HTMLInputElement>(null);
  const baseRentRef = useRef<HTMLInputElement>(null);
  const securityDepositRef = useRef<HTMLInputElement>(null);
  const electricityRef = useRef<HTMLInputElement>(null);
  const waterRef = useRef<HTMLInputElement>(null);

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
        createProfile: 'สร้างสัญญาและสร้างรหัสเชื่อมห้อง',
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
        createProfile: 'Create Lease & Generate Invite Code',
      };

  const selectedRoom = rooms.find((room) => room.id === roomId);
  const isAllowedRoom = selectedRoom?.occupancy === 'vacant';

  useEffect(() => {
    if (rooms.length > 0 && (!selectedRoom || !isAllowedRoom)) {
      router.replace('/tenants/move-in');
    }
  }, [isAllowedRoom, router, selectedRoom, rooms.length]);

  // ── Form Submit ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom || !roomId) return;

    const moveInDate = startDateRef.current?.value;
    const contractEnd = endDateRef.current?.value;
    const contractDuration = contractDurationRef.current?.value ?? '1-year';
    const baseRent = parseFloat(baseRentRef.current?.value ?? '0');
    const securityDeposit = parseFloat(securityDepositRef.current?.value ?? '0');
    const initialMeterElectricity = parseFloat(electricityRef.current?.value ?? '0');
    const initialMeterWater = parseFloat(waterRef.current?.value ?? '0');

    if (!moveInDate || !contractEnd) {
      setSubmitError('กรุณากรอกวันที่เริ่มต้นและสิ้นสุดสัญญา');
      return;
    }
    if (isNaN(baseRent) || baseRent <= 0) {
      setSubmitError('กรุณากรอกค่าเช่าที่ถูกต้อง');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch('/api/tenant/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId,
          moveInDate,
          contractEnd,
          contractDuration,
          baseRent,
          securityDeposit,
          initialMeterElectricity,
          initialMeterWater,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setSubmitError(data.error ?? 'เกิดข้อผิดพลาด กรุณาลองใหม่');
        return;
      }

      setInviteResult(data as InviteResult);
    } catch {
      setSubmitError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Show Success Screen ──
  if (inviteResult) {
    return (
      <InviteCodeScreen
        result={inviteResult}
        onDone={() => router.replace('/tenants/move-in')}
      />
    );
  }

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

  // Default today and +1 year for date inputs
  const today = new Date().toISOString().split('T')[0];
  const oneYearLater = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-surface pb-32 lg:pb-8">
      <PageHeader title={pageTitle} onBack={() => router.push('/tenants/move-in')} />

      <form onSubmit={handleSubmit} className="px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-4xl mx-auto page-transition">

        {/* Error Banner */}
        {submitError && (
          <div className="bg-error-container text-on-error-container px-4 py-3 rounded-2xl flex items-center gap-3 text-sm font-medium">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {submitError}
          </div>
        )}

        {/* Room Info */}
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

          {selectedRoom.amenities.length > 0 && (
            <div>
              <p className="text-on-surface-variant text-sm mb-2">{text.amenities}</p>
              <div className="flex flex-wrap gap-2">
                {selectedRoom.amenities.map((amenity) => (
                  <span
                    key={amenity}
                    className="bg-surface-container-low px-3 py-1 rounded-full text-xs font-bold text-on-surface-variant"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* How Invite Works — Info Box */}
        <section className="bg-primary-container/20 border border-primary/10 rounded-xl p-5 text-sm">
          <p className="font-bold text-primary mb-1">
            {language === 'th' ? '🔑 ระบบรหัสเชื่อมห้อง' : '🔑 Invite Code System'}
          </p>
          <p className="text-on-surface-variant leading-relaxed">
            {language === 'th'
              ? 'เมื่อกด "สร้างสัญญา" ระบบจะสร้างรหัสเฉพาะสำหรับห้องนี้ นำรหัสไปมอบให้ลูกหอ เพื่อให้เขาสมัครและเชื่อมห้องผ่านแอป T-PAK ได้ทันที'
              : 'Clicking "Create Lease" generates a unique invite code for this room. Give it to the tenant so they can register and link the room through the T-PAK app.'}
          </p>
        </section>

        {/* Contract Details */}
        <section className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_10px_30px_rgba(18,28,40,0.03)]">
          <h2 className="text-lg font-bold text-on-surface mb-4">{text.contractDetails}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-on-surface mb-2">{text.contractDuration}</label>
              <select
                ref={contractDurationRef}
                className="w-full h-14 px-4 rounded-xl bg-surface-container-low border-none focus:ring-2 focus:ring-primary appearance-none"
                defaultValue="1-year"
              >
                <option value="1-year">{text.oneYear}</option>
                <option value="6-months">{text.sixMonths}</option>
                <option value="monthly">{text.monthly}</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-on-surface mb-2">{text.startDate}</label>
                <input
                  ref={startDateRef}
                  className="w-full h-14 px-4 rounded-xl bg-surface-container-low border-none focus:ring-2 focus:ring-primary"
                  type="date"
                  defaultValue={today}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-on-surface mb-2">{text.endDate}</label>
                <input
                  ref={endDateRef}
                  className="w-full h-14 px-4 rounded-xl bg-surface-container-low border-none focus:ring-2 focus:ring-primary"
                  type="date"
                  defaultValue={oneYearLater}
                  required
                />
              </div>
            </div>
            <div className="flex items-start space-x-2 p-3 bg-primary/5 rounded-xl">
              <span className="material-symbols-outlined text-primary text-lg mt-0.5">info</span>
              <p className="text-xs text-primary font-medium leading-relaxed">{text.rentCycleHint}</p>
            </div>
          </div>
        </section>

        {/* Financials */}
        <section className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_10px_30px_rgba(18,28,40,0.03)]">
          <h2 className="text-lg font-bold text-on-surface mb-4">{text.financials}</h2>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-on-surface mb-2">{text.baseRent}</label>
                <input
                  ref={baseRentRef}
                  className="w-full h-14 pl-4 pr-10 rounded-xl bg-surface-container-low border-none focus:ring-2 focus:ring-primary font-bold"
                  defaultValue={selectedRoom.baseRent}
                  type="number"
                  min="0"
                  step="100"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-on-surface mb-2">{text.securityDeposit}</label>
                <input
                  ref={securityDepositRef}
                  className="w-full h-14 pl-4 pr-10 rounded-xl bg-surface-container-low border-none focus:ring-2 focus:ring-primary font-bold"
                  defaultValue={suggestedDeposit}
                  type="number"
                  min="0"
                  step="100"
                  required
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
                    ref={electricityRef}
                    className="w-full bg-transparent border-none p-0 focus:ring-0 text-xl font-extrabold text-on-surface"
                    placeholder="000.0"
                    type="number"
                    min="0"
                    step="0.1"
                    defaultValue="0"
                  />
                </div>
                <div className="bg-surface-container-low p-4 rounded-xl">
                  <label className="flex items-center space-x-2 text-xs font-bold text-on-surface-variant mb-2">
                    <span className="material-symbols-outlined text-sm text-cyan-500">water_drop</span>
                    <span>{text.water}</span>
                  </label>
                  <input
                    ref={waterRef}
                    className="w-full bg-transparent border-none p-0 focus:ring-0 text-xl font-extrabold text-on-surface"
                    placeholder="000.0"
                    type="number"
                    min="0"
                    step="0.1"
                    defaultValue="0"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Submit */}
        <div className="pt-4 px-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full h-14 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${isSubmitting
                ? 'bg-surface-container text-outline cursor-not-allowed'
                : 'btn-primary-gradient text-on-primary shadow-[0_10px_30px_rgba(0,74,198,0.25)] active:scale-95'
              }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {language === 'th' ? 'กำลังสร้าง...' : 'Creating...'}
              </>
            ) : (
              <>
                <QrCode className="w-5 h-5" />
                {text.createProfile}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
