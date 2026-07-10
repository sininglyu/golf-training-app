"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createRound,
  deleteRound,
  fetchRounds,
  updateRound,
  type ShotsGainedRecord,
} from "@/features/dashboard/api/rounds";
import { queryKeys } from "@/lib/query-keys";

export function useRounds(take = 20) {
  return useQuery({
    queryKey: queryKeys.rounds.list(),
    queryFn: () => fetchRounds(take),
  });
}

export function useUpdateRound() {
  const client = useQueryClient();
  const queryKey = queryKeys.rounds.list();

  return useMutation({
    mutationFn: ({
      id,
      patch,
    }: {
      id: string;
      patch: Partial<Omit<ShotsGainedRecord, "id" | "userId" | "total">>;
    }) => updateRound(id, patch),
    onMutate: async ({ id, patch }) => {
      await client.cancelQueries({ queryKey });
      const previous = client.getQueryData<ShotsGainedRecord[]>(queryKey);
      client.setQueryData<ShotsGainedRecord[]>(queryKey, (old) =>
        old?.map((r) => {
          if (r.id !== id) return r;
          const merged = { ...r, ...patch };
          return {
            ...merged,
            total:
              merged.sgOffTee +
              merged.sgApproach +
              merged.sgAroundGreen +
              merged.sgPutting,
          };
        }),
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

export function useAddRound() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: createRound,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.rounds.list() });
    },
  });
}

export function useDeleteRound() {
  const client = useQueryClient();
  const queryKey = queryKeys.rounds.list();

  return useMutation({
    mutationFn: (id: string) => deleteRound(id),
    onMutate: async (id) => {
      await client.cancelQueries({ queryKey });
      const previous = client.getQueryData<ShotsGainedRecord[]>(queryKey);
      client.setQueryData<ShotsGainedRecord[]>(queryKey, (old) =>
        old?.filter((r) => r.id !== id),
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
