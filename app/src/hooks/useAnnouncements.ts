"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Announcement } from "@/generated/prisma";

export function useAnnouncements() {
  const queryClient = useQueryClient();

  const announcementsQuery = useQuery({
    queryKey: ["announcements"],
    queryFn: async () => {
      const res = await fetch("/api/announcements");
      if (!res.ok) throw new Error("Failed to fetch announcements");
      const json = await res.json();
      return json.data as Announcement[];
    },
  });

  const createAnnouncement = useMutation({
    mutationFn: async (data: { title: string; message: string; targetAudience?: string; imageUrl?: string }) => {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create announcement");
      const json = await res.json();
      return json.data as Announcement;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
  });

  return {
    announcements: announcementsQuery.data || [],
    isLoading: announcementsQuery.isLoading,
    isError: announcementsQuery.isError,
    createAnnouncement,
  };
}
