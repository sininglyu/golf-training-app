import { NextResponse } from "next/server";

import { getCurrentUserId } from "@/lib/current-user";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

function asNum(v: unknown, fallback: number): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const userId = await getCurrentUserId();

  const existing = await prisma.shotsGained.findFirst({
    where: { id, userId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Round not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;

  const course =
    typeof b.course === "string" && b.course.trim()
      ? b.course.trim()
      : existing.course;

  const date =
    typeof b.date === "string" && !Number.isNaN(Date.parse(b.date))
      ? new Date(b.date)
      : existing.date;

  const sgOffTee = "sgOffTee" in b ? asNum(b.sgOffTee, existing.sgOffTee) : existing.sgOffTee;
  const sgApproach = "sgApproach" in b ? asNum(b.sgApproach, existing.sgApproach) : existing.sgApproach;
  const sgAroundGreen = "sgAroundGreen" in b ? asNum(b.sgAroundGreen, existing.sgAroundGreen) : existing.sgAroundGreen;
  const sgPutting = "sgPutting" in b ? asNum(b.sgPutting, existing.sgPutting) : existing.sgPutting;
  const total = sgOffTee + sgApproach + sgAroundGreen + sgPutting;

  const updated = await prisma.shotsGained.update({
    where: { id },
    data: { course, date, sgOffTee, sgApproach, sgAroundGreen, sgPutting, total },
  });

  return NextResponse.json({ ...updated, date: updated.date.toISOString() });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const userId = await getCurrentUserId();

  const existing = await prisma.shotsGained.findFirst({
    where: { id, userId },
    select: { id: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Round not found" }, { status: 404 });
  }

  await prisma.shotsGained.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
