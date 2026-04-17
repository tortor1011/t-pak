'use client';

import { useState, useMemo } from 'react';
import { MOCK_COMPLAINTS } from '@/services/mockData';
import { getRelativeTime } from '@/utils/date';
import { ComplaintStatus } from '@/types/complaint';

export default function ComplaintsPage() {
  const [activeTab, setActiveTab] = useState<'open' | 'resolved'>('open');

  const filteredComplaints = useMemo(() => {
    if (activeTab === 'open') {
      return MOCK_COMPLAINTS.filter((c) => c.status !== 'resolved');
    }
    return MOCK_COMPLAINTS.filter((c) => c.status === 'resolved');
  }, [activeTab]);

  const statusBadge = (status: ComplaintStatus) => {
    switch (status) {
      case 'new':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-600 text-white uppercase tracking-wider">
            NEW
          </span>
        );
      case 'in-progress':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-white uppercase tracking-wider">
            IN PROGRESS
          </span>
        );
      case 'resolved':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-secondary text-on-secondary uppercase tracking-wider">
            RESOLVED
          </span>
        );
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 pt-2 pb-32 lg:pb-8 page-transition">
      {/* Filter */}
      <div className="flex justify-between items-center mb-8 bg-surface-container-low p-4 rounded-xl">
        <span className="text-on-surface font-bold">Category: All</span>
        <span className="material-symbols-outlined text-primary">expand_more</span>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setActiveTab('open')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all text-center ${
            activeTab === 'open'
              ? 'bg-primary text-on-primary'
              : 'bg-surface-container-high text-on-surface-variant font-medium'
          }`}
        >
          Open Issues
        </button>
        <button
          onClick={() => setActiveTab('resolved')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all text-center ${
            activeTab === 'resolved'
              ? 'bg-primary text-on-primary'
              : 'bg-surface-container-high text-on-surface-variant font-medium'
          }`}
        >
          Resolved
        </button>
      </div>

      {/* Complaint Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredComplaints.map((complaint) => (
          <div
            key={complaint.id}
            className="bg-surface-container-lowest rounded-xl p-5 shadow-[0_20px_50px_rgba(18,28,40,0.05)]"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="space-y-1 flex-1">
                {statusBadge(complaint.status)}
                <h3 className="text-lg font-extrabold text-on-surface pt-1 leading-tight">
                  Room {complaint.roomNumber}: {complaint.title}
                </h3>
                <p className="text-sm text-on-surface-variant font-medium">
                  Reported {getRelativeTime(complaint.createdAt)}
                </p>
              </div>
              {complaint.photoUrl ? (
                <img
                  className="w-20 h-20 object-cover rounded-xl bg-surface-variant ml-4"
                  src={complaint.photoUrl}
                  alt={complaint.title}
                />
              ) : (
                <div className="w-20 h-20 bg-surface-container flex items-center justify-center rounded-xl ml-4">
                  <span className="material-symbols-outlined text-outline text-3xl">
                    {complaint.category === 'electrical' ? 'light_off' : 'build'}
                  </span>
                </div>
              )}
            </div>
            {complaint.status !== 'resolved' && (
              <button className="w-full h-14 btn-primary-gradient text-on-primary font-bold rounded-xl active:scale-95 transition-transform">
                Update Status
              </button>
            )}
          </div>
        ))}

        {filteredComplaints.length === 0 && (
          <div className="col-span-full text-center py-16 text-on-surface-variant">
            <span className="material-symbols-outlined text-5xl mb-4 block">
              {activeTab === 'open' ? 'sentiment_satisfied' : 'history'}
            </span>
            <h3 className="text-xl font-bold mb-2">
              {activeTab === 'open' ? 'No Open Issues!' : 'No Resolved Issues'}
            </h3>
            <p className="font-medium">
              {activeTab === 'open'
                ? 'Everything is running smoothly'
                : 'Resolved issues will appear here'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
