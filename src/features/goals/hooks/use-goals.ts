import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { Goal } from "@/types";
import { queryKeys } from "@/lib/query-keys";
import {
  createGoal,
  deleteGoal,
  fetchGoals,
  updateGoal,
  type GoalInput,
} from "../api/goals";

export function useGoals() {
  return useQuery({
    queryKey: queryKeys.goals.list(),
    queryFn: () => fetchGoals(),
  });
}

export function useCreateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createGoal,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.goals.all });
    },
  });
}

export function useUpdateGoal() {
  const qc = useQueryClient();
  const key = queryKeys.goals.list();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<GoalInput> }) =>
      updateGoal(id, patch),
    onMutate: async ({ id, patch }) => {
      await qc.cancelQueries({ queryKey: key });
      const snapshot = qc.getQueryData<Goal[]>(key);
      qc.setQueryData<Goal[]>(key, (prev) =>
        prev?.map((g) => (g.id === id ? { ...g, ...patch } : g)) ?? [],
      );
      return { snapshot };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.snapshot) qc.setQueryData(key, ctx.snapshot);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.goals.all });
    },
  });
}

export function useDeleteGoal() {
  const qc = useQueryClient();
  const key = queryKeys.goals.list();
  return useMutation({
    mutationFn: deleteGoal,
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: key });
      const snapshot = qc.getQueryData<Goal[]>(key);
      qc.setQueryData<Goal[]>(key, (prev) => prev?.filter((g) => g.id !== id) ?? []);
      return { snapshot };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.snapshot) qc.setQueryData(key, ctx.snapshot);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.goals.all });
    },
  });
}
