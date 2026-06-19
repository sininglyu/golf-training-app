import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/current-user";

export const dynamic = "force-dynamic";

export async function DELETE() {
  const userId = await getCurrentUserId();
  await prisma.ghinCredential
    .delete({ where: { userId } })
    .catch(() => {
      // Already disconnected — treat as a no-op.
    });
  return NextResponse.json({ ok: true });
}
