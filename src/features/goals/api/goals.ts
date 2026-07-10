import type { Goal, GoalCategory, GoalStatus } from "@/types";

export interface GoalInput {
  title: string;
  description?: string | null;
  category?: GoalCategory;
  targetDate?: string | null;
  status?: GoalStatus;
}

function parseError(res: Response, fallback: string): Promise<never> {
  return res
    .json()
    .catch(() => null)
    .then((body: unknown) => {
      const msg =
        body &&
        typeof body === "object" &&
        "error" in body &&
        typeof (body as Record<string, unknown>).error === "string"
          ? (body as Record<string, string>).error
          : fallback;
      throw new Error(msg);
    });
}

export async function fetchGoals(status?: GoalStatus): Promise<Goal[]> {
  const url = status ? `/api/goals?status=${encodeURIComponent(status)}` : "/api/goals";
  const res = await fetch(url);
  if (!res.ok) return parseError(res, "Failed to fetch goals");
  return res.json();
}

export async function createGoal(input: GoalInput): Promise<Goal> {
  const res = await fetch("/api/goals", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) return parseError(res, "Failed to create goal");
  return res.json();
}

export async function updateGoal(id: string, patch: Partial<GoalInput>): Promise<Goal> {
  const res = await fetch(`/api/goals/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) return parseError(res, "Failed to update goal");
  return res.json();
}

export async function deleteGoal(id: string): Promise<void> {
  const res = await fetch(`/api/goals/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (!res.ok) return parseError(res, "Failed to delete goal");
}
