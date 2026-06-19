"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";
import { fetchSessions } from "@/features/sessions/api/sessions";

export function useSessions() {
  return useQuery({
    queryKey: queryKeys.sessions.list(),
    queryFn: fetchSessions,
  });
}
