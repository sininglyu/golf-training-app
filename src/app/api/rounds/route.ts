import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/current-user";

export const dynamic = "force-dynamic";

interface CreateBody {
  date?: string;
  course?: string;
  sgOffTee?: number;
  sgApproach?: number;
  sgAroundGreen?: number;
  sgPutting?: number;
  /** If provided, automatically attaches this ShotsGained to the SessionLog. */
  sessionId?: string;
}

function asNum(v: unknown, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function serializeRound(r: {
  id: string;
  userId: string;
  date: Date;
  course: string;
  sgOffTee: number;
  sgApproach: number;
  sgAroundGreen: number;
  sgPutting: number;
  total: number;
}) {
  return { ...r, date: r.date.toISOString() };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const takeParam = Number(url.searchParams.get("take") ?? "20");
  const take = Number.isFinite(takeParam) ? Math.min(Math.max(takeParam, 1), 100) : 20;

  const userId = await getCurrentUserId();
  const rounds = await prisma.shotsGained.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    take,
  });

  return NextResponse.json(rounds.map(serializeRound));
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as CreateBody | null;
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const course = body.course?.toString().trim();
  if (!course) {
    return NextResponse.json({ error: "course is required" }, { status: 400 });
  }
  if (typeof body.date !== "string" || Number.isNaN(Date.parse(body.date))) {
    return NextResponse.json(
      { error: "Valid `date` is required (ISO string)" },
      { status: 400 },
    );
  }

  const userId = await getCurrentUserId();

  const sgOffTee = asNum(body.sgOffTee);
  const sgApproach = asNum(body.sgApproach);
  const sgAroundGreen = asNum(body.sgAroundGreen);
  const sgPutting = asNum(body.sgPutting);
  const total = sgOffTee + sgApproach + sgAroundGreen + sgPutting;

  const round = await prisma.shotsGained.create({
    data: {
      userId,
      date: new Date(body.date),
      course,
      sgOffTee,
      sgApproach,
      sgAroundGreen,
      sgPutting,
      total,
    },
  });

  if (body.sessionId) {
    const session = await prisma.weeklySession.findFirst({
      where: { id: body.sessionId, userId },
      select: { id: true },
    });
    if (session) {
      await prisma.sessionLog.upsert({
        where: { sessionId: body.sessionId },
        create: {
          sessionId: body.sessionId,
          shotsGainedId: round.id,
          course,
        },
        update: { shotsGainedId: round.id },
      });
    }
  }

  return NextResponse.json(serializeRound(round), { status: 201 });
}
