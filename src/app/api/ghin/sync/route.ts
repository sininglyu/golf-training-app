import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/current-user";
import { decrypt } from "@/lib/crypto";
import { GhinAuthError, GhinNetworkError, loginGhin } from "@/lib/ghin";

export const dynamic = "force-dynamic";

export async function POST() {
  const userId = await getCurrentUserId();
  const cred = await prisma.ghinCredential.findUnique({ where: { userId } });
  if (!cred) {
    return NextResponse.json(
      { error: "GHIN account not connected." },
      { status: 404 },
    );
  }

  let password: string;
  try {
    password = decrypt({
      ciphertext: cred.encryptedPassword,
      iv: cred.passwordIv,
      authTag: cred.passwordAuthTag,
    });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Could not decrypt stored credentials.",
      },
      { status: 500 },
    );
  }

  let result;
  try {
    result = await loginGhin(cred.emailOrGhin, password);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to refresh GHIN data";
    await prisma.ghinCredential.update({
      where: { userId },
      data: { lastError: message },
    });
    if (err instanceof GhinAuthError) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    if (err instanceof GhinNetworkError) {
      return NextResponse.json({ error: message }, { status: 502 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const golfer = result.primary;
  const now = new Date();

  await prisma.$transaction(async (tx) => {
    await tx.ghinCredential.update({
      where: { userId },
      data: {
        ghinNumber: golfer.ghinNumber || null,
        golferName: golfer.playerName || null,
        lastSyncedAt: now,
        lastError: null,
      },
    });

    if (golfer.handicapIndex != null) {
      await tx.handicapEntry.create({
        data: {
          userId,
          index: golfer.handicapIndex,
          lowIndex: golfer.lowHandicapIndex,
          source: "ghin",
          ghinSnapshot: JSON.stringify(golfer.raw),
          recordedAt: now,
        },
      });
      await tx.user.update({
        where: { id: userId },
        data: { handicap: golfer.handicapIndex },
      });
    }
  });

  return NextResponse.json({
    ghinNumber: golfer.ghinNumber,
    golferName: golfer.playerName,
    clubName: golfer.clubName,
    golfAssociationName: golfer.golfAssociationName,
    currentIndex: golfer.handicapIndex,
    currentDisplay: golfer.display,
    lowIndex: golfer.lowHandicapIndex,
    lowDisplay: golfer.lowHandicapDisplay,
    lastSyncedAt: now.toISOString(),
  });
}
