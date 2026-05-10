'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRelativeTime } from '@/utils/date';
import { Complaint, ComplaintStatus } from '@/types/complaint';
import { useLanguage } from '@/hooks/useLanguage';
import { getNextComplaintStatus } from '@/services/complaintQueue';
import PageHeader from '@/components/layout/PageHeader';

export default function ComplaintsPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState<'new' | 'in-progress' | 'resolved'>('new');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: complaints = [], isLoading } = useQuery<Complaint[]>({
    queryKey: ['owner', 'complaints'],
    queryFn: async () => {
      const res = await fetch('/api/complaints');
      if (!res.ok) throw new Error('Failed to fetch complaints');
      return res.json();
    },
    refetchInterval: 5000, // optionally auto-refresh every 5s to keep it real-time like
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ComplaintStatus }) => {
      const res = await fetch(`/api/complaints/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      return res.json() as Promise<Complaint[]>;
    },
    onSuccess: (updatedComplaints, variables) => {
      queryClient.setQueryData(['owner', 'complaints'], updatedComplaints);
      setFeedbackMessage(
        variables.status === 'in-progress'
          ? text.updatedToInProgress
          : text.updatedToResolved
      );
    },
    onError: (error) => {
      setErrorMessage(error.message);
    },
  });

  const filterEmptyStateIcons = {
    'new': 'sentiment_satisfied',
    'in-progress': 'engineering',
    'resolved': 'history'
  } as const;

  const text =
    language === 'th'
      ? {
          title: 'จัดการคำร้องซ่อม',
          statusNew: 'ใหม่',
          statusInProgress: 'กำลังดำเนินการ',
          statusResolved: 'เสร็จสิ้น',
          categoryAll: 'หมวดหมู่: ทั้งหมด',
          tabNew: 'รอรับงาน',
          tabInProgress: 'กำลังดำเนินการ',
          tabResolved: 'แก้ไขแล้ว',
          room: 'ห้อง',
          reported: 'แจ้งเมื่อ',
          updateToInProgress: 'รับงานซ่อม',
          updateToResolved: 'ทำเครื่องหมายว่าเสร็จสิ้น',
          updating: 'กำลังอัปเดต...',
          updatedToInProgress: 'อัปเดตคำร้องเป็นกำลังดำเนินการแล้ว',
          updatedToResolved: 'อัปเดตคำร้องเป็นเสร็จสิ้นแล้ว',
          noOpenIssues: 'ไม่มีปัญหาที่เปิดอยู่ (รอรับงาน)',
          noInProgressIssues: 'ไม่มีรายการที่กำลังดำเนินการ',
          noResolvedIssues: 'ยังไม่มีรายการที่ปิดงาน',
          openDescription: 'ภาพรวมอาคารปกติดี ไม่มีคำร้องใหม่ในตอนนี้',
          inProgressDescription: 'รายการที่รับงานแล้วจะมาอยู่ที่นี่',
          resolvedDescription: 'รายการที่แก้ไขเสร็จแล้วจะแสดงในส่วนนี้',
          closeModal: 'ปิดหน้าต่าง',
          btnConfirm: 'ยืนยันการรับงาน',
          btnResolve: 'ยืนยันเสร็จสิ้น',
        }
      : {
          title: 'Complaint Management',
          statusNew: 'NEW',
          statusInProgress: 'IN PROGRESS',
          statusResolved: 'RESOLVED',
          categoryAll: 'Category: All',
          tabNew: 'New',
          tabInProgress: 'In-Progress',
          tabResolved: 'Resolved',
          room: 'Room',
          reported: 'Reported',
          updateToInProgress: 'Start Progress',
          updateToResolved: 'Mark as Resolved',
          updating: 'Updating...',
          updatedToInProgress: 'Complaint moved to in-progress.',
          updatedToResolved: 'Complaint marked as resolved.',
          noOpenIssues: 'No New Issues!',
          noInProgressIssues: 'No Issues In-Progress',
          noResolvedIssues: 'No Resolved Issues',
          openDescription: 'Everything is running smoothly',
          inProgressDescription: 'Issues you are working on will appear here',
          resolvedDescription: 'Resolved issues will appear here',
          closeModal: 'Close',
          btnConfirm: 'Confirm start',
          btnResolve: 'Confirm resolved',
        };

  const translateTitle = (dbTitle: string) => {
    const dbTitleLower = dbTitle.toLowerCase();
    if (language === 'th') {
      if (dbTitleLower.includes('ac') || dbTitleLower.includes('air')) return 'เครื่องปรับอากาศ (แอร์)';
      if (dbTitleLower.includes('plumbing')) return 'ระบบประปา';
      if (dbTitleLower.includes('electrical')) return 'ระบบไฟฟ้า';
      if (dbTitleLower.includes('appliance')) return 'เครื่องใช้ไฟฟ้า';
      if (dbTitleLower.includes('furniture')) return 'เฟอร์นิเจอร์';
      if (dbTitleLower.includes('internet')) return 'อินเทอร์เน็ต';
      if (dbTitleLower.includes('other')) return 'อื่นๆ';
    } else {
      if (dbTitleLower.includes('ac') || dbTitleLower.includes('air')) return 'Air Conditioner (AC)';
      if (dbTitleLower.includes('plumbing')) return 'Plumbing';
      if (dbTitleLower.includes('electrical')) return 'Electrical';
      if (dbTitleLower.includes('appliance')) return 'Appliance';
      if (dbTitleLower.includes('furniture')) return 'Furniture';
      if (dbTitleLower.includes('internet')) return 'Internet';
      if (dbTitleLower.includes('other')) return 'Other';
    }
    return dbTitle;
  };

  const handleUpdateComplaintStatus = async (complaint: Complaint) => {
    const nextStatus = getNextComplaintStatus(complaint.status);
    if (!nextStatus || updateStatusMutation.isPending) {
      return;
    }

    setFeedbackMessage(null);
    setErrorMessage(null);

    updateStatusMutation.mutate({ id: complaint.id, status: nextStatus }, {
      onSuccess: () => {
        setSelectedComplaint(null); // Close modal on success
      }
    });
  };

  const getUpdateButtonLabel = (status: ComplaintStatus): string => {
    if (status === 'new') {
      return text.updateToInProgress;
    }

    return text.updateToResolved;
  };
  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => c.status === activeTab);
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
            onClick={() => setActiveTab('new')}
            className={`flex-1 py-3 px-2 sm:px-4 rounded-xl font-bold transition-all text-center text-sm sm:text-base ${
              activeTab === 'new'
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container-high text-on-surface-variant font-medium'
            }`}
          >
            {text.tabNew}
          </button>
          <button
            onClick={() => setActiveTab('in-progress')}
            className={`flex-1 py-3 px-2 sm:px-4 rounded-xl font-bold transition-all text-center text-sm sm:text-base ${
              activeTab === 'in-progress'
                ? 'bg-amber-500 text-white'
                : 'bg-surface-container-high text-on-surface-variant font-medium'
            }`}
          >
            {text.tabInProgress}
          </button>
          <button
            onClick={() => setActiveTab('resolved')}
            className={`flex-1 py-3 px-2 sm:px-4 rounded-xl font-bold transition-all text-center text-sm sm:text-base ${
              activeTab === 'resolved'
                ? 'bg-secondary text-on-secondary'
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
              onClick={() => setSelectedComplaint(complaint)}
              className="bg-surface-container-lowest rounded-xl p-5 shadow-[0_20px_50px_rgba(18,28,40,0.05)] cursor-pointer hover:shadow-lg transition-shadow active:scale-[0.99]"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1 flex-1">
                  {statusBadge(complaint.status)}
                  <h3 className="text-lg font-extrabold text-on-surface pt-1 leading-tight">
                    {text.room} {complaint.roomNumber}: {translateTitle(complaint.title)}
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
                      {complaint.category === 'electrical' ? 'light_off' : complaint.category === 'plumbing' ? 'plumbing' : 'build'}
                    </span>
                  </div>
                )}
              </div>
              {complaint.status !== 'resolved' && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUpdateComplaintStatus(complaint);
                  }}
                  disabled={updateStatusMutation.isPending && updateStatusMutation.variables?.id === complaint.id}
                  className={`w-full h-14 font-bold rounded-xl transition-transform ${
                    complaint.status === 'new' ? 'btn-primary-gradient text-on-primary' : 'bg-primary text-on-primary'
                  } ${
                    updateStatusMutation.isPending && updateStatusMutation.variables?.id === complaint.id
                      ? 'opacity-60 cursor-not-allowed'
                      : 'active:scale-95'
                  }`}
                >
                  {updateStatusMutation.isPending && updateStatusMutation.variables?.id === complaint.id
                    ? text.updating
                    : getUpdateButtonLabel(complaint.status)}
                </button>
              )}
            </div>
          ))}

          {filteredComplaints.length === 0 && (
            <div className="col-span-full text-center py-16 text-on-surface-variant">
              <span className="material-symbols-outlined text-5xl mb-4 block">
                {filterEmptyStateIcons[activeTab]}
              </span>
              <h3 className="text-xl font-bold mb-2">
                {activeTab === 'new' ? text.noOpenIssues : activeTab === 'in-progress' ? text.noInProgressIssues : text.noResolvedIssues}
              </h3>
              <p className="font-medium">
                {activeTab === 'new' ? text.openDescription : activeTab === 'in-progress' ? text.inProgressDescription : text.resolvedDescription}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal for Details */}
      {selectedComplaint && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 p-4 sm:p-0"
          onClick={() => setSelectedComplaint(null)}
        >
          <div 
            className="bg-surface rounded-2xl w-full max-w-md p-6 shadow-xl relative animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                {statusBadge(selectedComplaint.status)}
                <h2 className="text-xl font-bold text-on-surface mt-2">
                  {text.room} {selectedComplaint.roomNumber}: {translateTitle(selectedComplaint.title)}
                </h2>
              </div>
              <button 
                onClick={() => setSelectedComplaint(null)}
                className="text-on-surface-variant hover:bg-surface-container p-2 rounded-full transition-colors material-symbols-outlined"
              >
                close
              </button>
            </div>

            {selectedComplaint.photoUrl && (
              <div className="mb-6 relative w-full h-48 bg-surface-container rounded-xl overflow-hidden">
                <Image
                  src={selectedComplaint.photoUrl}
                  alt={selectedComplaint.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            <div className="space-y-4 mb-8">
              <div>
                <span className="text-sm font-bold text-on-surface-variant uppercase tracking-wider block mb-1">
                  รายละเอียด / Description
                </span>
                <p className="text-on-surface bg-surface-container-low p-3 rounded-xl border border-outline-variant/30 min-h-[4rem]">
                  {selectedComplaint.description || '-'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/30">
                  <span className="text-xs font-bold text-on-surface-variant uppercase block mb-1">
                    ผู้แจ้ง / Tenant
                  </span>
                  <span className="text-sm font-bold text-on-surface">{selectedComplaint.tenantName}</span>
                </div>
                <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/30">
                  <span className="text-xs font-bold text-on-surface-variant uppercase block mb-1">
                    หมวดหมู่ / Category
                  </span>
                  <span className="text-sm font-bold text-on-surface capitalize">{selectedComplaint.category}</span>
                </div>
              </div>

              <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/30">
                  <span className="text-xs font-bold text-on-surface-variant uppercase block mb-1">
                    อนุญาตให้เข้าห้อง / Permission to enter
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`material-symbols-outlined text-sm ${selectedComplaint.permissionToEnter ? 'text-primary' : 'text-error'}`}>
                      {selectedComplaint.permissionToEnter ? 'check_circle' : 'cancel'}
                    </span>
                    <span className="text-sm font-bold text-on-surface">
                      {selectedComplaint.permissionToEnter 
                        ? (language === 'th' ? 'อนุญาตเข้าห้องได้แม้ไม่อยู่' : 'Allowed') 
                        : (language === 'th' ? 'ไม่อนุญาต ต้องโทรนัด' : 'Not allowed')}
                    </span>
                  </div>
              </div>
            </div>
            
            <div className="flex gap-4 justify-end mt-6">
              {selectedComplaint.status !== 'resolved' && (
                <button 
                  onClick={() => handleUpdateComplaintStatus(selectedComplaint)}
                  disabled={updateStatusMutation.isPending}
                  className={`flex-1 flex justify-center items-center py-3 bg-primary text-on-primary font-bold rounded-xl transition-all ${
                    updateStatusMutation.isPending ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'
                  }`}
                >
                  {updateStatusMutation.isPending ? (
                    <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>
                  ) : null}
                  {selectedComplaint.status === 'new' ? text.btnConfirm : text.btnResolve}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
