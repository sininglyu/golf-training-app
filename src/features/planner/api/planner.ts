import type { ExerciseSet, PlannerSession, SessionType } from "@/types";

export interface CreateSessionInput {
  type: SessionType;
  /** Full ISO-8601 datetime string for the planned start of the session. */
  date: string;
  plannedDuration: number;
  title?: string;
  focus?: string;
}

export type UpdateSessionInput = Partial<{
  type: SessionType;
  date: string;
  plannedDuration: number;
  title: string | null;
  focus: string | null;
  completed: boolean;
}>;

async function parseError(res: Response): Promise<never> {
  let message = `Request failed with status ${res.status}`;
  try {
    const body = (await res.json()) as { error?: string };
    if (body?.error) message = body.error;
  } catch {
    // ignore
  }
  throw new Error(message);
}

export async function fetchWeekPlan(
  weekOf: string,
): Promise<PlannerSession[]> {
  const res = await fetch(
    `/api/planner?weekOf=${encodeURIComponent(weekOf)}`,
    { cache: "no-store" },
  );
  if (!res.ok) return parseError(res);
  return (await res.json()) as PlannerSession[];
}

/** Fetch every session in [from, to). Both bounds are local YYYY-MM-DD strings. */
export async function fetchSessionsRange(
  from: string,
  to: string,
): Promise<PlannerSession[]> {
  const params = new URLSearchParams({ from, to });
  const res = await fetch(`/api/planner?${params.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) return parseError(res);
  return (await res.json()) as PlannerSession[];
}

export async function createSession(
  input: CreateSessionInput,
): Promise<PlannerSession> {
  const res = await fetch(`/api/planner`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) return parseError(res);
  return (await res.json()) as PlannerSession;
}

export async function updateSession(
  id: string,
  patch: UpdateSessionInput,
): Promise<PlannerSession> {
  const res = await fetch(`/api/planner/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) return parseError(res);
  return (await res.json()) as PlannerSession;
}

export async function deleteSession(id: string): Promise<void> {
  const res = await fetch(`/api/planner/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (!res.ok) return parseError(res);
}

export interface SaveLogInput {
  notes?: string | null;
  actualDuration?: number | null;
  rating?: number | null;
  practiced?: string | null;
  ballsHit?: number | null;
  course?: string | null;
  score?: number | null;
  exercises?: ExerciseSet[] | null;
  shotsGainedId?: string | null;
  /** Defaults to true on the server. Set to false to save without completing. */
  markComplete?: boolean;
}

export async function saveSessionLog(
  id: string,
  input: SaveLogInput,
): Promise<PlannerSession> {
  const res = await fetch(
    `/api/planner/${encodeURIComponent(id)}/log`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );
  if (!res.ok) return parseError(res);
  return (await res.json()) as PlannerSession;
}

export interface CreateRoundInput {
  date: string;
  course: string;
  sgOffTee?: number;
  sgApproach?: number;
  sgAroundGreen?: number;
  sgPutting?: number;
  sessionId?: string;
}

export interface CreatedRound {
  id: string;
  userId: string;
  date: string;
  course: string;
  sgOffTee: number;
  sgApproach: number;
  sgAroundGreen: number;
  sgPutting: number;
  total: number;
}

export async function createRound(
  input: CreateRoundInput,
): Promise<CreatedRound> {
  const res = await fetch(`/api/rounds`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) return parseError(res);
  return (await res.json()) as CreatedRound;
}
