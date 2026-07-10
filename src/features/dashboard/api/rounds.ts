export interface ShotsGainedRecord {
  id: string;
  userId: string;
  date: string; // ISO string
  course: string;
  sgOffTee: number;
  sgApproach: number;
  sgAroundGreen: number;
  sgPutting: number;
  total: number;
}

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

export async function fetchRounds(take = 20): Promise<ShotsGainedRecord[]> {
  const res = await fetch(`/api/rounds?take=${take}`, { cache: "no-store" });
  if (!res.ok) return parseError(res);
  return (await res.json()) as ShotsGainedRecord[];
}

export async function updateRound(
  id: string,
  patch: Partial<Omit<ShotsGainedRecord, "id" | "userId" | "total">>,
): Promise<ShotsGainedRecord> {
  const res = await fetch(`/api/rounds/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) return parseError(res);
  return (await res.json()) as ShotsGainedRecord;
}

export async function deleteRound(id: string): Promise<void> {
  const res = await fetch(`/api/rounds/${id}`, { method: "DELETE" });
  if (!res.ok) return parseError(res);
}

export async function createRound(input: {
  date: string;
  course: string;
  sgOffTee?: number;
  sgApproach?: number;
  sgAroundGreen?: number;
  sgPutting?: number;
}): Promise<ShotsGainedRecord> {
  const res = await fetch("/api/rounds", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) return parseError(res);
  return (await res.json()) as ShotsGainedRecord;
}
