import type { PlannerSession } from "@/types";

export async function fetchSessions(): Promise<PlannerSession[]> {
  const res = await fetch("/api/sessions", { cache: "no-store" });
  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    try {
      const body = (await res.json()) as { error?: string };
      if (body?.error) message = body.error;
    } catch {
      // ignore
    }
    throw new Error(message);
  }
  return (await res.json()) as PlannerSession[];
}
