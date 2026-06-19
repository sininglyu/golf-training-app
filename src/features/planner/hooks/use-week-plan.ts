"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";
import {
  createRound,
  createSession,
  deleteSession,
  fetchSessionsRange,
  fetchWeekPlan,
  saveSessionLog,
  updateSession,
  type CreateRoundInput,
  type CreateSessionInput,
  type SaveLogInput,
  type UpdateSessionInput,
} from "@/features/planner/api/planner";
import type { PlannerSession } from "@/types";

export function useWeekPlan(weekOf: string) {
  return useQuery({
    queryKey: queryKeys.planner.week(weekOf),
    queryFn: () => fetchWeekPlan(weekOf),
  });
}

/** Fetch all sessions in `[from, to)`; used by the planner's month view. */
export function useSessionsRange(from: string, to: string) {
  return useQuery({
    queryKey: queryKeys.planner.range(from, to),
    queryFn: () => fetchSessionsRange(from, to),
  });
}

/**
 * The mutation hooks below take the *currently rendered* query key so they can
 * apply optimistic updates to whatever cache the caller is reading from
 * (a single week, or a month-spanning range). On settle they always invalidate
 * `queryKeys.planner.all` so any other planner queries (sibling weeks/months,
 * dashboards) refetch and stay consistent.
 */

export function useCreateSession() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSessionInput) => createSession(input),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: queryKeys.planner.all });
    },
  });
}

interface UpdateArgs {
  id: string;
  patch: UpdateSessionInput;
}

export function useUpdateSession(queryKey: QueryKey) {
  const client = useQueryClient();

  return useMutation({
    mutationFn: ({ id, patch }: UpdateArgs) => updateSession(id, patch),
    onMutate: async ({ id, patch }) => {
      await client.cancelQueries({ queryKey });
      const previous = client.getQueryData<PlannerSession[]>(queryKey);
      if (previous) {
        client.setQueryData<PlannerSession[]>(
          queryKey,
          previous.map((s) =>
            s.id === id
              ? {
                  ...s,
                  ...("type" in patch && patch.type ? { type: patch.type } : {}),
                  ...("date" in patch && patch.date ? { date: patch.date } : {}),
                  ...("plannedDuration" in patch &&
                  typeof patch.plannedDuration === "number"
                    ? { plannedDuration: patch.plannedDuration }
                    : {}),
                  ...("title" in patch ? { title: patch.title ?? null } : {}),
                  ...("focus" in patch ? { focus: patch.focus ?? null } : {}),
                  ...("completed" in patch &&
                  typeof patch.completed === "boolean"
                    ? { completed: patch.completed }
                    : {}),
                }
              : s,
          ),
        );
      }
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) client.setQueryData(queryKey, ctx.previous);
    },
    onSettled: (_data, _err, vars) => {
      client.invalidateQueries({ queryKey: queryKeys.planner.all });
      if (vars?.patch && "completed" in vars.patch) {
        client.invalidateQueries({ queryKey: queryKeys.sessions.all });
      }
    },
  });
}

export function useDeleteSession(queryKey: QueryKey) {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteSession(id),
    onMutate: async (id) => {
      await client.cancelQueries({ queryKey });
      const previous = client.getQueryData<PlannerSession[]>(queryKey);
      if (previous) {
        client.setQueryData<PlannerSession[]>(
          queryKey,
          previous.filter((s) => s.id !== id),
        );
      }
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) client.setQueryData(queryKey, ctx.previous);
    },
    onSettled: () => {
      client.invalidateQueries({ queryKey: queryKeys.planner.all });
    },
  });
}

interface SaveLogArgs {
  id: string;
  input: SaveLogInput;
}

export function useSaveSessionLog(queryKey: QueryKey) {
  const client = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: SaveLogArgs) => saveSessionLog(id, input),
    onSuccess: (updated) => {
      const previous = client.getQueryData<PlannerSession[]>(queryKey);
      if (previous) {
        client.setQueryData<PlannerSession[]>(
          queryKey,
          previous.map((s) => (s.id === updated.id ? updated : s)),
        );
      }
      client.invalidateQueries({ queryKey: queryKeys.planner.all });
      client.invalidateQueries({ queryKey: queryKeys.sessions.all });
    },
    onError: () => {
      client.invalidateQueries({ queryKey: queryKeys.planner.all });
    },
  });
}

export function useCreateRound() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateRoundInput) => createRound(input),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: queryKeys.planner.all });
    },
  });
}
