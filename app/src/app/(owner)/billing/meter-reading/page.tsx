'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MOCK_METER_READINGS } from '@/services/mockData';
import PageHeader from '@/components/layout/PageHeader';

export default function MeterReadingPage() {
  const router = useRouter();
  
  // State to hold all readings being input
  const [readings, setReadings] = useState(
    MOCK_METER_READINGS.reduce((acc, current) => {
      acc[current.roomId] = {
        electric: current.electricity.current?.toString() || '',
        water: current.water.current?.toString() || ''
      };
      return acc;
    }, {} as Record<string, { electric: string; water: string }>)
  );

  const handleReadingChange = (roomId: string, field: 'electric' | 'water', value: string) => {
    setReadings(prev => ({
      ...prev,
      [roomId]: {
        ...prev[roomId],
        [field]: value
      }
    }));
  };

  const handleSave = () => {
    // In a real app, save to API here
    router.back();
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <PageHeader
        title="จดค่าน้ำ-ค่าไฟ"
        onBack={() => router.back()}
        rightAction={
          <button className="p-2 rounded-full hover:bg-slate-100 transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-500">history</span>
          </button>
        }
      />

      <div className="flex-grow flex flex-col pb-32 lg:pb-8 page-transition">
        <section className="px-4 sm:px-6 lg:px-8 mt-4 max-w-6xl mx-auto w-full">
          <div className="bg-white rounded-2xl shadow-sm border border-outline-variant overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 border-b border-outline-variant text-sm text-on-surface-variant whitespace-nowrap">
                  <th className="py-4 px-4 font-semibold w-24">ห้อง</th>
                  <th className="py-4 px-4 font-semibold text-right">ค่าไฟเดือนก่อน</th>
                  <th className="py-4 px-4 font-semibold">ค่าไฟเดือนนี้</th>
                  <th className="py-4 px-4 font-semibold text-right">ค่าน้ำเดือนก่อน</th>
                  <th className="py-4 px-4 font-semibold">ค่าน้ำเดือนนี้</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_METER_READINGS.map((room) => (
                  <tr key={room.roomId} className="border-b border-outline-variant/30 hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-lg text-on-surface">
                        {room.roomNumber}
                      </div>
                    </td>
                    
                    {/* Electricity */}
                    <td className="py-3 px-4 text-right text-on-surface-variant font-medium">
                      {room.electricity.previous.toLocaleString(undefined, { minimumFractionDigits: 1 })}
                    </td>
                    <td className="py-3 px-4">
                      <input
                        className="w-32 bg-blue-50/50 border border-primary/30 rounded-lg px-3 py-2 text-lg font-bold focus:ring-2 focus:ring-primary/20 transition-all text-on-surface placeholder:text-outline-variant focus:outline-none"
                        placeholder="0.0"
                        step="0.1"
                        type="number"
                        value={readings[room.roomId]?.electric || ''}
                        onChange={(e) => handleReadingChange(room.roomId, 'electric', e.target.value)}
                      />
                    </td>

                    {/* Water */}
                    <td className="py-3 px-4 text-right text-on-surface-variant font-medium">
                      {room.water.previous.toLocaleString(undefined, { minimumFractionDigits: 1 })}
                    </td>
                    <td className="py-3 px-4">
                      <input
                        className="w-32 bg-blue-50/50 border border-primary/30 rounded-lg px-3 py-2 text-lg font-bold focus:ring-2 focus:ring-primary/20 transition-all text-on-surface placeholder:text-outline-variant focus:outline-none"
                        placeholder="0.0"
                        step="0.1"
                        type="number"
                        value={readings[room.roomId]?.water || ''}
                        onChange={(e) => handleReadingChange(room.roomId, 'water', e.target.value)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Footer Action */}
      <div className="fixed bottom-0 left-0 lg:left-72 w-full lg:w-[calc(100%-18rem)] p-6 pb-10 lg:pb-6 bg-gradient-to-t from-surface via-surface to-transparent z-40 pointer-events-none">
        <button
          onClick={handleSave}
          className="w-full max-w-2xl mx-auto h-[64px] btn-primary-gradient text-on-primary rounded-2xl font-bold text-lg shadow-[0_20px_50px_rgba(18,28,40,0.15)] active:scale-95 transition-all flex items-center justify-center gap-3 pointer-events-auto"
        >
          <span className="material-symbols-outlined">save</span>
          บันทึกข้อมูล
        </button>
      </div>
    </div>
  );
}
