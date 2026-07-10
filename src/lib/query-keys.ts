export const queryKeys = {
  planner: {
    all: ["planner"] as const,
    week: (weekOf: string) => [...queryKeys.planner.all, "week", weekOf] as const,
    range: (from: string, to: string) =>
      [...queryKeys.planner.all, "range", from, to] as const,
  },
  sessions: {
    all: ["sessions"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.sessions.all, "list", filters ?? {}] as const,
    detail: (id: string) => [...queryKeys.sessions.all, "detail", id] as const,
  },
  dashboard: {
    all: ["dashboard"] as const,
    metrics: () => [...queryKeys.dashboard.all, "metrics"] as const,
  },
  weeklyFocus: {
    all: ["weeklyFocus"] as const,
    week: (weekOf: string) => ["weeklyFocus", "week", weekOf] as const,
  },
  rounds: {
    all: ["rounds"] as const,
    list: () => [...queryKeys.rounds.all, "list"] as const,
  },
  goals: {
    all: ["goals"] as const,
    list: () => [...queryKeys.goals.all, "list"] as const,
  },
} as const;
