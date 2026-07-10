"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  fetchWeeklyFocus,
  setWeeklyFocus,
  type WeeklyFocusData,
} from "@/features/planner/api/weekly-focus";
import { queryKeys } from "@/lib/query-keys";

export function useWeeklyFocus(weekOf: string) {
  return useQuery({
    queryKey: queryKeys.weeklyFocus.week(weekOf),
    queryFn: () => fetchWeeklyFocus(weekOf),
  });
}

export function useSetWeeklyFocus(weekOf: string) {
  const client = useQueryClient();
  const queryKey = queryKeys.weeklyFocus.week(weekOf);

  return useMutation({
    mutationFn: (text: string) => setWeeklyFocus(weekOf, text),
    onMutate: async (text) => {
      await client.cancelQueries({ queryKey });
      const previous = client.getQueryData<WeeklyFocusData | null>(queryKey);
      client.setQueryData<WeeklyFocusData | null>(queryKey, (old) =>
        old
          ? { ...old, text }
          : { id: "__optimistic__", weekOf, text },
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous !== undefined) {
        client.setQueryData(queryKey, ctx.previous);
      }
    },
    onSettled: () => {
      void client.invalidateQueries({ queryKey });
    },
  });
}
