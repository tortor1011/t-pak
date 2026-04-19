'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getRelativeTime } from '@/utils/date';
import { Complaint, ComplaintStatus } from '@/types/complaint';
import { useLanguage } from '@/hooks/useLanguage';
import { useRepositories } from '@/hooks/useRepositories';
import {
  COMPLAINT_STATE_UPDATED_EVENT,
  getNextComplaintStatus,
} from '@/services/complaintQueue';
import PageHeader from '@/components/layout/PageHeader';

export default function ComplaintsPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const { complaintsRepository } = useRepositories();
  const [activeTab, setActiveTab] = useState<'open' | 'resolved'>('open');
  const [updatingComplaintId, setUpdatingComplaintId] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    const complaintsResult = complaintsRepository.listComplaints();
    return complaintsResult.ok ? complaintsResult.value : [];
  });

  useEffect(() => {
    const refreshComplaints = () => {
      const complaintsResult = complaintsRepository.listComplaints();
      if (complaintsResult.ok) {
        setComplaints(complaintsResult.value);
      }
    };

    window.addEventListener('storage', refreshComplaints);
    window.addEventListener(COMPLAINT_STATE_UPDATED_EVENT, refreshComplaints);

    return () => {
      window.removeEventListener('storage', refreshComplaints);
      window.removeEventListener(COMPLAINT_STATE_UPDATED_EVENT, refreshComplaints);
    };
  }, [complaintsRepository]);

  const text =
    language === 'th'
      ? {
          title: 'จัดการคำร้องซ่อม',
          statusNew: 'ใหม่',
          statusInProgress: 'กำลังดำเนินการ',
          statusResolved: 'เสร็จสิ้น',
          categoryAll: 'หมวดหมู่: ทั้งหมด',
          tabOpen: 'เรื่องที่เปิดอยู่',
          tabResolved: 'แก้ไขแล้ว',
          room: 'ห้อง',
          reported: 'แจ้งเมื่อ',
          updateToInProgress: 'รับงานซ่อม',
          updateToResolved: 'ทำเครื่องหมายว่าเสร็จสิ้น',
          updating: 'กำลังอัปเดต...',
          updatedToInProgress: 'อัปเดตคำร้องเป็นกำลังดำเนินการแล้ว',
          updatedToResolved: 'อัปเดตคำร้องเป็นเสร็จสิ้นแล้ว',
          noOpenIssues: 'ไม่มีปัญหาที่เปิดอยู่',
          noResolvedIssues: 'ยังไม่มีรายการที่ปิดงาน',
          openDescription: 'ภาพรวมอาคารปกติดี ไม่มีคำร้องใหม่ในตอนนี้',
          resolvedDescription: 'รายการที่แก้ไขเสร็จแล้วจะแสดงในส่วนนี้',
        }
      : {
          title: 'Complaint Management',
          statusNew: 'NEW',
          statusInProgress: 'IN PROGRESS',
          statusResolved: 'RESOLVED',
          categoryAll: 'Category: All',
          tabOpen: 'Open Issues',
          tabResolved: 'Resolved',
          room: 'Room',
          reported: 'Reported',
          updateToInProgress: 'Start Progress',
          updateToResolved: 'Mark as Resolved',
          updating: 'Updating...',
          updatedToInProgress: 'Complaint moved to in-progress.',
          updatedToResolved: 'Complaint marked as resolved.',
          noOpenIssues: 'No Open Issues!',
          noResolvedIssues: 'No Resolved Issues',
          openDescription: 'Everything is running smoothly',
          resolvedDescription: 'Resolved issues will appear here',
        };

  const handleUpdateComplaintStatus = (complaint: Complaint) => {
    const nextStatus = getNextComplaintStatus(complaint.status);
    if (!nextStatus || updatingComplaintId) {
      return;
    }

    setUpdatingComplaintId(complaint.id);
    setFeedbackMessage(null);
    setErrorMessage(null);

    const updatedComplaintsResult = complaintsRepository.updateComplaintStatus(
      complaint.id,
      nextStatus
    );

    if (!updatedComplaintsResult.ok) {
      setErrorMessage(updatedComplaintsResult.error.message);
      setUpdatingComplaintId(null);
      return;
    }

    setComplaints(updatedComplaintsResult.value);
    setFeedbackMessage(
      nextStatus === 'in-progress'
        ? text.updatedToInProgress
        : text.updatedToResolved
    );
    setUpdatingComplaintId(null);
  };

  const getUpdateButtonLabel = (status: ComplaintStatus): string => {
    if (status === 'new') {
      return text.updateToInProgress;
    }

    return text.updateToResolved;
  };
  const filteredComplaints = useMemo(() => {
    if (activeTab === 'open') {
      return complaints.filter((c) => c.status !== 'resolved');
    }
    return complaints.filter((c) => c.status === 'resolved');
  }, [activeTab, complaints]);

  const statusBadge = (status: ComplaintStatus) => {
    switch (status) {
      case 'new':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-600 text-white uppercase tracking-wider">
            {text.statusNew}
          </span>
        );
      case 'in-progress':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-white uppercase tracking-wider">
            {text.statusInProgress}
          </span>
        );
      case 'resolved':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-secondary text-on-secondary uppercase tracking-wider">
            {text.statusResolved}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-surface pb-32 lg:pb-8">
      <PageHeader title={text.title} onBack={() => router.back()} />

      <div className="px-4 sm:px-6 lg:px-8 pt-2 page-transition">
        {/* Filter */}
        <div className="flex justify-between items-center mb-8 bg-surface-container-low p-4 rounded-xl">
          <span className="text-on-surface font-bold">{text.categoryAll}</span>
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
            {text.tabOpen}
          </button>
          <button
            onClick={() => setActiveTab('resolved')}
            className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all text-center ${
              activeTab === 'resolved'
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container-high text-on-surface-variant font-medium'
            }`}
          >
            {text.tabResolved}
          </button>
        </div>

        {/* Complaint Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {feedbackMessage && (
            <div className="col-span-full rounded-xl bg-secondary-container/25 p-3 text-sm font-medium text-on-secondary-container">
              {feedbackMessage}
            </div>
          )}

          {errorMessage && (
            <div className="col-span-full rounded-xl bg-error-container p-3 text-sm font-medium text-on-error-container">
              {errorMessage}
            </div>
          )}

          {filteredComplaints.map((complaint) => (
            <div
              key={complaint.id}
              className="bg-surface-container-lowest rounded-xl p-5 shadow-[0_20px_50px_rgba(18,28,40,0.05)]"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1 flex-1">
                  {statusBadge(complaint.status)}
                  <h3 className="text-lg font-extrabold text-on-surface pt-1 leading-tight">
                    {text.room} {complaint.roomNumber}: {complaint.title}
                  </h3>
                  <p className="text-sm text-on-surface-variant font-medium">
                    {text.reported} {getRelativeTime(complaint.createdAt, language)}
                  </p>
                </div>
                {complaint.photoUrl ? (
                  <Image
                    className="w-20 h-20 object-cover rounded-xl bg-surface-variant ml-4"
                    src={complaint.photoUrl}
                    alt={complaint.title}
                    width={80}
                    height={80}
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
                <button
                  type="button"
                  onClick={() => handleUpdateComplaintStatus(complaint)}
                  disabled={updatingComplaintId !== null}
                  className={`w-full h-14 btn-primary-gradient text-on-primary font-bold rounded-xl transition-transform ${
                    updatingComplaintId !== null
                      ? 'opacity-60 cursor-not-allowed'
                      : 'active:scale-95'
                  }`}
                >
                  {updatingComplaintId === complaint.id
                    ? text.updating
                    : getUpdateButtonLabel(complaint.status)}
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
                {activeTab === 'open' ? text.noOpenIssues : text.noResolvedIssues}
              </h3>
              <p className="font-medium">
                {activeTab === 'open'
                  ? text.openDescription
                  : text.resolvedDescription}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
