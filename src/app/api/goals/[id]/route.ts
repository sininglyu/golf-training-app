import { NextResponse } from "next/server";

import { getCurrentUserId } from "@/lib/current-user";
import { prisma } from "@/lib/db";
import { serializeGoal } from "@/lib/serializers";

export const dynamic = "force-dynamic";

const VALID_CATEGORIES = new Set(["general", "ott", "approach", "shortgame", "putting"]);
const VALID_STATUSES = new Set(["active", "achieved"]);
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const userId = await getCurrentUserId();

  const existing = await prisma.goal.findFirst({ where: { id, userId } });
  if (!existing) {
    return NextResponse.json({ error: "Goal not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;

  let title = existing.title;
  if (typeof b.title === "string") {
    const trimmed = b.title.trim();
    if (!trimmed) return NextResponse.json({ error: "title cannot be empty" }, { status: 400 });
    if (trimmed.length > 140) return NextResponse.json({ error: "title must be 140 characters or fewer" }, { status: 400 });
    title = trimmed;
  }

  const description =
    "description" in b
      ? typeof b.description === "string"
        ? b.description.trim() || null
        : null
      : existing.description;

  const category =
    "category" in b && typeof b.category === "string" && VALID_CATEGORIES.has(b.category)
      ? b.category
      : existing.category;

  const targetDate =
    "targetDate" in b
      ? typeof b.targetDate === "string" && DATE_RE.test(b.targetDate)
        ? b.targetDate
        : null
      : existing.targetDate;

  const status =
    "status" in b && typeof b.status === "string" && VALID_STATUSES.has(b.status)
      ? b.status
      : existing.status;

  const updated = await prisma.goal.update({
    where: { id },
    data: { title, description, category, targetDate, status },
  });

  return NextResponse.json(serializeGoal(updated));
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const userId = await getCurrentUserId();

  const existing = await prisma.goal.findFirst({
    where: { id, userId },
    select: { id: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Goal not found" }, { status: 404 });
  }

  await prisma.goal.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
