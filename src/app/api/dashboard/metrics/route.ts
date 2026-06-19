import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/current-user";
import { addDays, startOfWeek } from "@/lib/week";
import type { ProgressMetric } from "@/types";

export const dynamic = "force-dynamic";

/** GHIN convention: plus handicaps are stored negative; render with leading "+". */
function formatIndex(n: number): string {
  if (n < 0) return `+${(-n).toFixed(1)}`;
  return n.toFixed(1);
}

/** Round to 1 decimal place to keep delta display consistent across metrics. */
function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

interface WeekStats {
  completed: number;
  minutes: number;
  ratingSum: number;
  ratingCount: number;
}

function emptyStats(): WeekStats {
  return { completed: 0, minutes: 0, ratingSum: 0, ratingCount: 0 };
}

export async function GET() {
  const userId = await getCurrentUserId();

  const handicapMetric = await buildHandicapMetric(userId);

  const now = new Date();
  const thisStart = startOfWeek(now);
  const thisEnd = addDays(thisStart, 7);
  const lastStart = addDays(thisStart, -7);

  const sessions = await prisma.weeklySession.findMany({
    where: { userId, date: { gte: lastStart, lt: thisEnd } },
    select: {
      date: true,
      completed: true,
      plannedDuration: true,
      log: { select: { actualDuration: true, rating: true } },
    },
  });

  const thisWk = emptyStats();
  const lastWk = emptyStats();
  for (const s of sessions) {
    if (!s.completed) continue;
    const bucket = s.date >= thisStart ? thisWk : lastWk;
    bucket.completed += 1;
    bucket.minutes += s.log?.actualDuration ?? s.plannedDuration;
    if (typeof s.log?.rating === "number") {
      bucket.ratingSum += s.log.rating;
      bucket.ratingCount += 1;
    }
  }

  const sessionsMetric: ProgressMetric = {
    label: "Sessions this week",
    value: thisWk.completed,
    delta: thisWk.completed - lastWk.completed,
  };

  const hoursThis = round1(thisWk.minutes / 60);
  const hoursLast = round1(lastWk.minutes / 60);
  const totalTimeMetric: ProgressMetric = {
    label: "Total practice time",
    value: hoursThis,
    delta: round1(hoursThis - hoursLast),
    unit: "hrs",
  };

  const avgThis =
    thisWk.ratingCount > 0 ? round1(thisWk.ratingSum / thisWk.ratingCount) : null;
  const avgLast =
    lastWk.ratingCount > 0 ? round1(lastWk.ratingSum / lastWk.ratingCount) : null;
  const avgMetric: ProgressMetric = {
    label: "Avg session rating",
    value: avgThis ?? "—",
    delta: avgThis != null && avgLast != null ? round1(avgThis - avgLast) : 0,
    unit: "/5",
  };

  const metrics: ProgressMetric[] = [
    sessionsMetric,
    totalTimeMetric,
    avgMetric,
    handicapMetric,
  ];

  return NextResponse.json(metrics);
}

async function buildHandicapMetric(userId: string): Promise<ProgressMetric> {
  const recent = await prisma.handicapEntry.findMany({
    where: { userId },
    orderBy: { recordedAt: "desc" },
    take: 2,
    select: { index: true },
  });

  const latest = recent[0] ?? null;
  const previous = recent[1] ?? null;

  if (!latest) {
    return { label: "Handicap Index", value: "—", delta: 0 };
  }

  return {
    label: "Handicap Index",
    value: formatIndex(latest.index),
    delta: previous ? round1(latest.index - previous.index) : 0,
  };
}
