'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function BulkRoomSetupPage() {
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [selectedRooms, setSelectedRooms] = useState<number[]>([101, 102, 103, 104, 105, 106, 107, 108, 109, 110]);
  
  const allRoomsOnFloor = [101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112];

  const handleRoomToggle = (room: number) => {
    setSelectedRooms((prev) => 
      prev.includes(room) ? prev.filter(r => r !== room) : [...prev, room]
    );
  };

  const handleSelectAll = () => {
    if (selectedRooms.length === allRoomsOnFloor.length) {
      setSelectedRooms([]);
    } else {
      setSelectedRooms([...allRoomsOnFloor]);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface md:bg-transparent">
      {/* TopAppBar for mobile */}
      <header className="md:hidden bg-white dark:bg-slate-900 shadow-[0_20px_50px_rgba(18,28,40,0.05)] docked full-width top-0 z-10 flex justify-between items-center w-full px-6 py-4">
        <Link href="/services" className="text-blue-600 dark:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors p-2 rounded-full flex items-center justify-center">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>arrow_back</span>
        </Link>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50 font-headline">Bulk Room Setup</h1>
        <button className="text-blue-600 dark:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors p-2 rounded-full flex items-center justify-center">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>help_outline</span>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col pt-4 pb-[340px] px-4 md:px-0 lg:px-8 xl:px-12 md:pb-8">
        <div className="hidden md:flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold tracking-tight">Bulk Room Setup</h2>
        </div>

        {/* Floor Selector */}
        <div className="mb-8">
          <h2 className="text-lg font-bold font-headline mb-4 text-on-surface">Select Floor</h2>
          <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
            {[1, 2, 3, 4].map(floor => (
              <button
                key={floor}
                onClick={() => setSelectedFloor(floor)}
                className={`flex-shrink-0 px-6 py-3 rounded-xl font-bold text-base transition-colors ${
                  selectedFloor === floor 
                    ? 'bg-primary text-on-primary shadow-[0_4px_14px_rgba(0,74,198,0.2)]' 
                    : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-dim'
                }`}
              >
                Floor {floor}
              </button>
            ))}
          </div>
        </div>

        {/* Selection Grid */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold font-headline text-on-surface">Select Rooms</h2>
            <button onClick={handleSelectAll} className="text-primary font-bold text-sm hover:underline">
              {selectedRooms.length === allRoomsOnFloor.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {allRoomsOnFloor.map((room) => {
              const isSelected = selectedRooms.includes(room);
              return (
                <button
                  key={room}
                  onClick={() => handleRoomToggle(room)}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center relative transition-colors ${
                    isSelected 
                      ? 'bg-primary-container text-on-primary-container shadow-sm border-2 border-primary' 
                      : 'bg-surface-container-lowest text-on-surface border-2 border-outline-variant border-opacity-30 hover:bg-surface-container-low'
                  }`}
                >
                  <span className="font-bold text-lg">{room}</span>
                  {isSelected && (
                    <span className="material-symbols-outlined absolute top-2 right-2 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                      check_circle
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </main>

      {/* Overlay / Bottom Sheet for Bulk Actions */}
      {selectedRooms.length > 0 && (
        <div className="fixed bottom-0 left-0 md:left-64 xl:left-72 right-0 bg-surface-container-lowest rounded-t-[1.5rem] shadow-[0_-20px_50px_rgba(18,28,40,0.1)] z-20 px-6 pt-6 pb-8 border-t border-surface-container-low">
          {/* Drag Handle Indicator */}
          <div className="w-12 h-1.5 bg-outline-variant rounded-full mx-auto mb-6 opacity-50 md:hidden"></div>
          
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold font-headline text-on-surface">{selectedRooms.length} Rooms Selected</h2>
              <button 
                onClick={() => setSelectedRooms([])} 
                className="text-on-surface-variant p-2 rounded-full hover:bg-surface-container-low"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="space-y-5 mb-8">
              {/* Base Rent Input */}
              <div className="flex flex-col">
                <label className="text-sm font-bold text-on-surface-variant mb-2 ml-1">Base Rent (THB)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-on-surface-variant font-medium">฿</span>
                  <input 
                    className="w-full h-14 pl-10 pr-4 rounded-xl bg-surface-container-low border-none text-on-surface text-lg font-semibold focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-colors" 
                    type="text" 
                    defaultValue="5,000"
                  />
                </div>
              </div>
            </div>
            
            <button className="w-full h-14 rounded-xl bg-gradient-to-b from-primary to-primary-container text-on-primary font-bold text-lg flex items-center justify-center shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all">
              Apply to Selected Rooms
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
