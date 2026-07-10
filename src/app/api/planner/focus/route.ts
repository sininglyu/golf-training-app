import { NextResponse } from "next/server";

import { getCurrentUserId } from "@/lib/current-user";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

function isValidWeekOf(s: string | null): s is string {
  return typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

export async function GET(request: Request) {
  const weekOf = new URL(request.url).searchParams.get("weekOf");
  if (!isValidWeekOf(weekOf)) {
    return NextResponse.json(
      { error: "Provide `weekOf` as YYYY-MM-DD" },
      { status: 400 },
    );
  }

  const userId = await getCurrentUserId();
  const focus = await prisma.weeklyFocus.findUnique({
    where: { userId_weekOf: { userId, weekOf } },
  });

  return NextResponse.json(
    focus ? { id: focus.id, weekOf: focus.weekOf, text: focus.text } : null,
  );
}

export async function PUT(request: Request) {
  const weekOf = new URL(request.url).searchParams.get("weekOf");
  if (!isValidWeekOf(weekOf)) {
    return NextResponse.json(
      { error: "Provide `weekOf` as YYYY-MM-DD" },
      { status: 400 },
    );
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const raw = (body as Record<string, unknown>).text;
  const text = typeof raw === "string" ? raw.trim() : null;

  if (!text) {
    return NextResponse.json(
      { error: "`text` must be a non-empty string" },
      { status: 400 },
    );
  }
  if (text.length > 280) {
    return NextResponse.json(
      { error: "`text` must be 280 characters or fewer" },
      { status: 400 },
    );
  }

  const userId = await getCurrentUserId();
  const focus = await prisma.weeklyFocus.upsert({
    where: { userId_weekOf: { userId, weekOf } },
    create: { userId, weekOf, text },
    update: { text },
  });

  return NextResponse.json({ id: focus.id, weekOf: focus.weekOf, text: focus.text });
}
