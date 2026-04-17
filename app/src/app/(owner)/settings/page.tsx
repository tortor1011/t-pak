'use client';

import { useState } from 'react';

export default function SettingsPage() {
  const [electricityRate, setElectricityRate] = useState('8');
  const [waterRate, setWaterRate] = useState('20');
  const [lateFee, setLateFee] = useState('200');
  const [lateFeeDay, setLateFeeDay] = useState('5');

  return (
    <div className="px-6 py-8 space-y-8 page-transition">
      <h2 className="text-2xl font-bold tracking-tight">Property Settings</h2>

      {/* Property Info */}
      <section className="bg-surface-container-lowest rounded-2xl p-6 shadow-[0_10px_40px_rgba(18,28,40,0.03)] space-y-4">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-14 h-14 rounded-2xl btn-primary-gradient flex items-center justify-center shadow-lg">
            <span className="material-symbols-outlined text-white text-2xl">apartment</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-on-surface">Dormitory A</h3>
            <p className="text-on-surface-variant font-medium text-sm">Property Group A</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-surface-container">
          <div>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Total Rooms</p>
            <p className="text-lg font-bold text-on-surface">12</p>
          </div>
          <div>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Floors</p>
            <p className="text-lg font-bold text-on-surface">3</p>
          </div>
        </div>
      </section>

      {/* Utility Rates */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold tracking-tight">Utility Pricing Rules</h3>
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-[0_10px_40px_rgba(18,28,40,0.03)] space-y-6">
          {/* Electricity */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-on-surface mb-3">
              <span className="material-symbols-outlined text-primary text-lg">bolt</span>
              Electricity Rate (per kWh)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">
                ฿
              </span>
              <input
                className="w-full h-14 pl-10 pr-4 rounded-xl bg-surface-container-low border-none focus:ring-2 focus:ring-primary font-bold text-lg"
                type="number"
                value={electricityRate}
                onChange={(e) => setElectricityRate(e.target.value)}
              />
            </div>
          </div>

          {/* Water */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-on-surface mb-3">
              <span className="material-symbols-outlined text-cyan-500 text-lg">water_drop</span>
              Water Rate (per m³)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">
                ฿
              </span>
              <input
                className="w-full h-14 pl-10 pr-4 rounded-xl bg-surface-container-low border-none focus:ring-2 focus:ring-primary font-bold text-lg"
                type="number"
                value={waterRate}
                onChange={(e) => setWaterRate(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Late Fee Settings */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold tracking-tight">Late Payment Fine</h3>
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-[0_10px_40px_rgba(18,28,40,0.03)] space-y-6">
          <div>
            <label className="text-sm font-bold text-on-surface mb-3 block">
              Fine Amount (THB/day)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">
                ฿
              </span>
              <input
                className="w-full h-14 pl-10 pr-4 rounded-xl bg-surface-container-low border-none focus:ring-2 focus:ring-primary font-bold text-lg"
                type="number"
                value={lateFee}
                onChange={(e) => setLateFee(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-bold text-on-surface mb-3 block">
              Grace Period (days after due date)
            </label>
            <input
              className="w-full h-14 px-4 rounded-xl bg-surface-container-low border-none focus:ring-2 focus:ring-primary font-bold text-lg"
              type="number"
              value={lateFeeDay}
              onChange={(e) => setLateFeeDay(e.target.value)}
            />
          </div>
          <div className="flex items-start space-x-2 p-3 bg-tertiary-fixed/20 rounded-xl">
            <span className="material-symbols-outlined text-tertiary text-lg mt-0.5">info</span>
            <p className="text-xs text-tertiary font-medium leading-relaxed">
              Late fee of ฿{lateFee}/day will be applied after {lateFeeDay} days past due date
            </p>
          </div>
        </div>
      </section>

      {/* Save Button */}
      <button className="w-full h-14 btn-primary-gradient text-on-primary rounded-2xl font-bold text-lg shadow-[0_8px_20px_rgba(0,74,198,0.2)] active:scale-95 transition-all flex items-center justify-center gap-3">
        <span className="material-symbols-outlined">save</span>
        Save Settings
      </button>

      {/* App Info */}
      <div className="text-center pt-4">
        <p className="text-outline text-sm font-medium">Estate Clarity v1.0.0</p>
        <p className="text-outline text-xs mt-1">Frontend Preview — Owner App</p>
      </div>
    </div>
  );
}
