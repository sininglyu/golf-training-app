export type Weekday =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

// Matches Prisma's SessionType enum.
export type SessionType = "golf" | "round" | "workout" | "recovery";

export const SESSION_TYPES: readonly SessionType[] = [
  "golf",
  "round",
  "workout",
  "recovery",
] as const;

export const SESSION_TYPE_LABELS: Record<SessionType, string> = {
  golf: "Golf Practice",
  round: "Round",
  workout: "Strength Workout",
  recovery: "Mobility / Recovery",
};

/** Compact one-word labels used in tight chrome (badges, calendar pills). */
export const SESSION_TYPE_SHORT_LABELS: Record<SessionType, string> = {
  golf: "Golf",
  round: "Round",
  workout: "Workout",
  recovery: "Recovery",
};

export interface ExerciseSet {
  name: string;
  sets: number;
  reps: number;
  weight?: number | null;
}

export interface SessionLog {
  id: string;
  sessionId: string;
  notes: string | null;
  actualDuration: number | null;
  rating: number | null;

  // Golf practice
  practiced: string | null;
  ballsHit: number | null;

  // Round
  course: string | null;
  score: number | null;
  shotsGainedId: string | null;

  // Workout
  exercises: ExerciseSet[] | null;
}

export interface PlannerSession {
  id: string;
  userId: string;
  type: SessionType;
  /** ISO-8601 date-time string. */
  date: string;
  plannedDuration: number;
  completed: boolean;
  title: string | null;
  focus: string | null;
  log: SessionLog | null;
}

export interface ProgressMetric {
  label: string;
  /** Pre-formatted display value. Numbers render as-is; strings are passed through. */
  value: number | string;
  delta: number;
  unit?: string;
  /** When true, the dashboard hides "vs last period" (point-in-time snapshots). */
  snapshot?: boolean;
}
