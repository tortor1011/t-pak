"use client";

import { useState } from "react";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";

export default function BroadcastAlertsPage() {
  const router = useRouter();
  const { announcements, createAnnouncement, isLoading } = useAnnouncements();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title || !message) return;
    setIsSubmitting(true);
    try {
      await createAnnouncement.mutateAsync({ title, message, targetAudience: "all" });
      setTitle("");
      setMessage("");
    } catch (e) {
      console.error(e);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="bg-background text-on-background min-h-screen pb-24 font-public-sans">
      <header className="w-full sticky top-0 z-50 bg-white dark:bg-slate-950 shadow-sm flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="active:scale-95 duration-150 text-blue-600 dark:text-blue-400">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-xl font-bold tracking-tight text-on-background">Broadcast Alerts</h1>
        </div>
      </header>

      <main className="px-6 py-8 space-y-8 max-w-lg mx-auto">
        <section className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant px-1">New Broadcast</h2>
          <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-[0_20px_50px_rgba(18,28,40,0.05)] space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">groups</span>
                Target Audience
              </label>
              <div className="relative">
                <select className="w-full h-[56px] px-4 bg-surface-container-low rounded-xl border-none focus:ring-2 focus:ring-primary appearance-none text-on-surface font-medium">
                  <option value="all">All Tenants</option>
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-outline">expand_more</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">title</span>
                Alert Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-[56px] px-4 bg-surface-container-low rounded-xl border-none focus:ring-2 focus:ring-primary placeholder:text-outline/60 text-on-surface font-medium"
                placeholder="Announcement Title (e.g., Water Maintenance)"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">chat</span>
                Alert Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-4 bg-surface-container-low rounded-xl border-none focus:ring-2 focus:ring-primary placeholder:text-outline/60 text-on-surface font-medium resize-none"
                placeholder="Type your announcement here..."
                rows={4}
              ></textarea>
            </div>

            <div className="pt-2 space-y-6">
              <button disabled={isSubmitting} onClick={handleSubmit} className="w-full h-[64px] bg-gradient-to-b from-primary to-primary-container text-white rounded-2xl font-extrabold text-lg flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-transform disabled:opacity-50">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>campaign</span>
                {isSubmitting ? "Sending..." : "Send Broadcast Now"}
              </button>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">Sent History</h2>
          </div>
          <div className="space-y-4">
            {isLoading && <p>Loading history...</p>}
            {!isLoading && announcements.length === 0 && <p className="text-on-surface-variant text-sm">No recent broadcasts.</p>}
            {!isLoading && announcements.map((announcement, i) => (
              <div key={announcement.id} className="bg-surface-container-low rounded-3xl p-5 flex items-start gap-4 hover:bg-surface-container transition-colors">
                <div className="mt-1">
                  <div className={`w-3 h-3 rounded-full ${i === 0 ? "bg-primary" : "bg-outline-variant"}`}></div>
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="font-bold text-on-surface text-lg leading-tight">{announcement.title}</h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="flex items-center gap-1 text-sm font-medium text-on-secondary-container bg-secondary-container/30 px-3 py-1 rounded-full">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      Sent to {announcement.targetAudience === "all" ? "All" : announcement.targetAudience}
                    </span>
                    <span className="text-sm text-outline flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">schedule</span>
                      {formatDistanceToNow(new Date(announcement.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
