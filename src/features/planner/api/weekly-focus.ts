export interface WeeklyFocusData {
  id: string;
  weekOf: string;
  text: string;
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

export async function fetchWeeklyFocus(
  weekOf: string,
): Promise<WeeklyFocusData | null> {
  const res = await fetch(
    `/api/planner/focus?weekOf=${encodeURIComponent(weekOf)}`,
    { cache: "no-store" },
  );
  if (!res.ok) return parseError(res);
  return (await res.json()) as WeeklyFocusData | null;
}

export async function setWeeklyFocus(
  weekOf: string,
  text: string,
): Promise<WeeklyFocusData> {
  const res = await fetch(
    `/api/planner/focus?weekOf=${encodeURIComponent(weekOf)}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    },
  );
  if (!res.ok) return parseError(res);
  return (await res.json()) as WeeklyFocusData;
}
