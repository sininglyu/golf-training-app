import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/current-user";
import { serializeSession } from "@/lib/serializers";
import type { ExerciseSet } from "@/types";

export const dynamic = "force-dynamic";

interface LogBody {
  notes?: string | null;
  actualDuration?: number | null;
  rating?: number | null;
  practiced?: string | null;
  ballsHit?: number | null;
  course?: string | null;
  score?: number | null;
  exercises?: ExerciseSet[] | null;
  /** Optional new ShotsGained id to attach to this log. */
  shotsGainedId?: string | null;
  /** Whether to mark the underlying session as complete. Defaults to true. */
  markComplete?: boolean;
}

function asNullableString(v: unknown): string | null | undefined {
  if (v === undefined) return undefined;
  if (v === null) return null;
  const s = String(v).trim();
  return s.length === 0 ? null : s;
}

function asNullableInt(v: unknown): number | null | undefined {
  if (v === undefined) return undefined;
  if (v === null || v === "") return null;
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return Math.round(n);
}

function normalizeExercises(input: unknown): string | null | undefined {
  if (input === undefined) return undefined;
  if (input === null) return null;
  if (!Array.isArray(input)) return null;
  const cleaned: ExerciseSet[] = [];
  for (const raw of input) {
    if (!raw || typeof raw !== "object") continue;
    const r = raw as Record<string, unknown>;
    const name = typeof r.name === "string" ? r.name.trim() : "";
    if (!name) continue;
    const sets = Number(r.sets);
    const reps = Number(r.reps);
    if (!Number.isFinite(sets) || !Number.isFinite(reps)) continue;
    const weightRaw = r.weight;
    const weight =
      weightRaw === null || weightRaw === undefined || weightRaw === ""
        ? null
        : Number(weightRaw);
    cleaned.push({
      name,
      sets: Math.max(0, Math.round(sets)),
      reps: Math.max(0, Math.round(reps)),
      weight:
        weight === null || !Number.isFinite(weight)
          ? null
          : Math.round(weight * 10) / 10,
    });
  }
  return cleaned.length === 0 ? null : JSON.stringify(cleaned);
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const body = (await request.json().catch(() => null)) as LogBody | null;
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const userId = await getCurrentUserId();
  const session = await prisma.weeklySession.findFirst({
    where: { id, userId },
  });
  if (!session) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const logData: Record<string, unknown> = {};
  if ("notes" in body) logData.notes = asNullableString(body.notes);
  if ("actualDuration" in body)
    logData.actualDuration = asNullableInt(body.actualDuration);
  if ("rating" in body) {
    const r = asNullableInt(body.rating);
    logData.rating = r == null ? null : Math.max(1, Math.min(5, r));
  }
  if ("practiced" in body) logData.practiced = asNullableString(body.practiced);
  if ("ballsHit" in body) logData.ballsHit = asNullableInt(body.ballsHit);
  if ("course" in body) logData.course = asNullableString(body.course);
  if ("score" in body) logData.score = asNullableInt(body.score);
  if ("shotsGainedId" in body)
    logData.shotsGainedId = asNullableString(body.shotsGainedId);
  if ("exercises" in body) {
    const exercises = normalizeExercises(body.exercises);
    if (exercises !== undefined) logData.exercises = exercises;
  }

  await prisma.sessionLog.upsert({
    where: { sessionId: id },
    create: {
      sessionId: id,
      ...(logData as object),
    },
    update: logData,
  });

  const markComplete = body.markComplete !== false;
  const updated = await prisma.weeklySession.update({
    where: { id },
    data: markComplete ? { completed: true } : {},
    include: { log: true },
  });

  return NextResponse.json(serializeSession(updated));
}
