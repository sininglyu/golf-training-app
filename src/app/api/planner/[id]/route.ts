import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/current-user";
import { serializeSession } from "@/lib/serializers";
import { SESSION_TYPES, type SessionType } from "@/types";

export const dynamic = "force-dynamic";

type PatchBody = Partial<{
  type: string;
  date: string;
  plannedDuration: number;
  title: string | null;
  focus: string | null;
  completed: boolean;
}>;

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const body = (await request.json().catch(() => null)) as PatchBody | null;
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const userId = await getCurrentUserId();
  const existing = await prisma.weeklySession.findFirst({
    where: { id, userId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const data: Record<string, unknown> = {};

  if (body.type !== undefined) {
    if (!SESSION_TYPES.includes(body.type as SessionType)) {
      return NextResponse.json(
        { error: `Invalid session type: ${body.type}` },
        { status: 400 },
      );
    }
    data.type = body.type;
  }
  if (body.date !== undefined) {
    if (typeof body.date !== "string" || Number.isNaN(Date.parse(body.date))) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }
    data.date = new Date(body.date);
  }
  if (body.plannedDuration !== undefined) {
    const d = Number(body.plannedDuration);
    if (!Number.isFinite(d) || d <= 0) {
      return NextResponse.json(
        { error: "plannedDuration must be positive" },
        { status: 400 },
      );
    }
    data.plannedDuration = Math.round(d);
  }
  if (body.title !== undefined) {
    data.title = body.title === null ? null : String(body.title).trim() || null;
  }
  if (body.focus !== undefined) {
    data.focus = body.focus === null ? null : String(body.focus).trim() || null;
  }
  if (body.completed !== undefined) {
    data.completed = Boolean(body.completed);
  }

  const updated = await prisma.weeklySession.update({
    where: { id },
    data,
    include: { log: true },
  });

  return NextResponse.json(serializeSession(updated));
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const userId = await getCurrentUserId();
  const existing = await prisma.weeklySession.findFirst({
    where: { id, userId },
    select: { id: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await prisma.weeklySession.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
