import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/current-user";
import { serializeSession } from "@/lib/serializers";
import { parseISODate, weekBounds } from "@/lib/week";
import { SESSION_TYPES, type SessionType } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const weekOf = url.searchParams.get("weekOf");
  const fromStr = url.searchParams.get("from");
  const toStr = url.searchParams.get("to");

  let start: Date;
  let end: Date;
  if (weekOf) {
    ({ start, end } = weekBounds(weekOf));
  } else if (fromStr && toStr) {
    start = parseISODate(fromStr);
    end = parseISODate(toStr);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return NextResponse.json(
        { error: "Invalid `from`/`to` (expected YYYY-MM-DD)" },
        { status: 400 },
      );
    }
    if (end <= start) {
      return NextResponse.json(
        { error: "`to` must be after `from`" },
        { status: 400 },
      );
    }
  } else {
    return NextResponse.json(
      { error: "Provide either `weekOf` or both `from` and `to`" },
      { status: 400 },
    );
  }

  const userId = await getCurrentUserId();

  const sessions = await prisma.weeklySession.findMany({
    where: {
      userId,
      date: { gte: start, lt: end },
    },
    orderBy: { date: "asc" },
    include: { log: true },
  });

  return NextResponse.json(sessions.map(serializeSession));
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const {
    type,
    date,
    plannedDuration,
    title,
    focus,
  }: Partial<{
    type: string;
    date: string;
    plannedDuration: number;
    title: string;
    focus: string;
  }> = body;

  if (!type || !SESSION_TYPES.includes(type as SessionType)) {
    return NextResponse.json(
      { error: `Invalid session type: ${type}` },
      { status: 400 },
    );
  }
  if (typeof date !== "string" || Number.isNaN(Date.parse(date))) {
    return NextResponse.json(
      { error: "Invalid or missing `date` (expected ISO string)" },
      { status: 400 },
    );
  }
  const duration = Number(plannedDuration);
  if (!Number.isFinite(duration) || duration <= 0) {
    return NextResponse.json(
      { error: "`plannedDuration` must be a positive number of minutes" },
      { status: 400 },
    );
  }

  const userId = await getCurrentUserId();
  const created = await prisma.weeklySession.create({
    data: {
      userId,
      type: type as SessionType,
      date: new Date(date),
      plannedDuration: Math.round(duration),
      title: title?.toString().trim() || null,
      focus: focus?.toString().trim() || null,
    },
    include: { log: true },
  });

  return NextResponse.json(serializeSession(created), { status: 201 });
}
