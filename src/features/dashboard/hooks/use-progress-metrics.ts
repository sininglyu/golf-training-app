"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";
import { fetchProgressMetrics } from "@/features/dashboard/api/metrics";

export function useProgressMetrics() {
  return useQuery({
    queryKey: queryKeys.dashboard.metrics(),
    queryFn: fetchProgressMetrics,
  });
}
