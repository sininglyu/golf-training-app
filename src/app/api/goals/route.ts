import { NextResponse } from "next/server";

import { getCurrentUserId } from "@/lib/current-user";
import { prisma } from "@/lib/db";
import { serializeGoal } from "@/lib/serializers";

export const dynamic = "force-dynamic";

const VALID_CATEGORIES = new Set(["general", "ott", "approach", "shortgame", "putting"]);
const VALID_STATUSES = new Set(["active", "achieved"]);
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(request: Request) {
  const userId = await getCurrentUserId();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const goals = await prisma.goal.findMany({
    where: {
      userId,
      ...(status && VALID_STATUSES.has(status) ? { status } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(goals.map(serializeGoal));
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;

  if (typeof b.title !== "string" || !b.title.trim()) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }
  const title = b.title.trim();
  if (title.length > 140) {
    return NextResponse.json({ error: "title must be 140 characters or fewer" }, { status: 400 });
  }

  const description =
    typeof b.description === "string" ? b.description.trim() || null : null;

  const category =
    typeof b.category === "string" && VALID_CATEGORIES.has(b.category)
      ? b.category
      : "general";

  const targetDate =
    typeof b.targetDate === "string" && DATE_RE.test(b.targetDate)
      ? b.targetDate
      : null;

  const status =
    typeof b.status === "string" && VALID_STATUSES.has(b.status)
      ? b.status
      : "active";

  const goal = await prisma.goal.create({
    data: { userId, title, description, category, targetDate, status },
  });

  return NextResponse.json(serializeGoal(goal), { status: 201 });
}
