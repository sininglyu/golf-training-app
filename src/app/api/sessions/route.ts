import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/current-user";
import { serializeSession } from "@/lib/serializers";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const takeParam = url.searchParams.get("take");
  const take = takeParam ? Math.max(1, Math.min(200, Number(takeParam))) : 50;

  const userId = await getCurrentUserId();

  const sessions = await prisma.weeklySession.findMany({
    where: { userId, completed: true },
    orderBy: { date: "desc" },
    include: { log: true },
    take,
  });

  return NextResponse.json(sessions.map(serializeSession));
}
