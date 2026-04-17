'use client';

import { useRouter } from 'next/navigation';
import PageHeader from '@/components/layout/PageHeader';

export default function MoveInPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-surface pb-32 lg:pb-8">
      <PageHeader title="Move-in: Room 105" onBack={() => router.back()} />

      <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-4xl mx-auto page-transition">
        {/* Section 1: Tenant Information */}
        <section className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_10px_30px_rgba(18,28,40,0.03)]">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center border-2 border-dashed border-outline-variant relative overflow-hidden group cursor-pointer">
              <span className="material-symbols-outlined text-outline text-3xl">camera_alt</span>
              <div className="absolute inset-0 bg-black/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter">
                  Upload
                </span>
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-on-surface mb-1 leading-tight">
                Tenant Information
              </h2>
              <p className="text-on-surface-variant text-sm">Personal identity details</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-on-surface mb-2">Full Name</label>
              <input
                className="w-full h-14 px-4 rounded-xl bg-surface-container-low border-none focus:ring-2 focus:ring-primary"
                placeholder="e.g., สมชาย ศรีสุข"
                type="text"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-on-surface mb-2">Phone Number</label>
                <input
                  className="w-full h-14 px-4 rounded-xl bg-surface-container-low border-none focus:ring-2 focus:ring-primary"
                  placeholder="081-234-5678"
                  type="tel"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-on-surface mb-2">Line ID</label>
                <input
                  className="w-full h-14 px-4 rounded-xl bg-surface-container-low border-none focus:ring-2 focus:ring-primary"
                  placeholder="@id"
                  type="text"
                />
              </div>
            </div>
            <button className="w-full py-4 px-4 rounded-xl bg-secondary-container text-on-secondary-container font-bold text-sm flex items-center justify-center space-x-2 active:scale-[0.98] transition-transform">
              <span className="material-symbols-outlined text-lg">badge</span>
              <span>Upload ID Card Photo</span>
            </button>
          </div>
        </section>

        {/* Section 2: Contract Details */}
        <section className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_10px_30px_rgba(18,28,40,0.03)]">
          <h2 className="text-lg font-bold text-on-surface mb-4">Contract Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-on-surface mb-2">
                Contract Duration
              </label>
              <select className="w-full h-14 px-4 rounded-xl bg-surface-container-low border-none focus:ring-2 focus:ring-primary appearance-none">
                <option>1 Year</option>
                <option>6 Months</option>
                <option>Monthly (Rolling)</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-on-surface mb-2">Start Date</label>
                <input
                  className="w-full h-14 px-4 rounded-xl bg-surface-container-low border-none focus:ring-2 focus:ring-primary"
                  type="date"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-on-surface mb-2">End Date</label>
                <input
                  className="w-full h-14 px-4 rounded-xl bg-surface-container-low border-none focus:ring-2 focus:ring-primary"
                  type="date"
                />
              </div>
            </div>
            <div className="flex items-start space-x-2 p-3 bg-primary/5 rounded-xl">
              <span className="material-symbols-outlined text-primary text-lg mt-0.5">info</span>
              <p className="text-xs text-primary font-medium leading-relaxed">
                Rent will be billed on the 1st of each month
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Financials */}
        <section className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_10px_30px_rgba(18,28,40,0.03)]">
          <h2 className="text-lg font-bold text-on-surface mb-4">Financials</h2>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-on-surface mb-2">
                  Base Rent (THB)
                </label>
                <input
                  className="w-full h-14 pl-4 pr-10 rounded-xl bg-surface-container-low border-none focus:ring-2 focus:ring-primary font-bold"
                  placeholder="5,500"
                  type="number"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-on-surface mb-2">
                  Security Deposit
                </label>
                <input
                  className="w-full h-14 pl-4 pr-10 rounded-xl bg-surface-container-low border-none focus:ring-2 focus:ring-primary font-bold"
                  placeholder="11,000"
                  type="number"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-surface-container">
              <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-4">
                Utility Starting Meters
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-container-low p-4 rounded-xl">
                  <label className="flex items-center space-x-2 text-xs font-bold text-on-surface-variant mb-2">
                    <span className="material-symbols-outlined text-sm text-blue-500">bolt</span>
                    <span>Electricity</span>
                  </label>
                  <input
                    className="w-full bg-transparent border-none p-0 focus:ring-0 text-xl font-extrabold text-on-surface"
                    placeholder="000.0"
                    type="number"
                  />
                </div>
                <div className="bg-surface-container-low p-4 rounded-xl">
                  <label className="flex items-center space-x-2 text-xs font-bold text-on-surface-variant mb-2">
                    <span className="material-symbols-outlined text-sm text-cyan-500">
                      water_drop
                    </span>
                    <span>Water</span>
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

        {/* Primary Action */}
        <div className="pt-4 px-2">
          <button className="w-full h-[56px] rounded-xl btn-primary-gradient text-on-primary font-bold text-lg shadow-[0_10px_30px_rgba(0,74,198,0.25)] active:scale-95 transition-transform">
            Create Profile & Generate Lease
          </button>
        </div>
      </div>
    </div>
  );
}
