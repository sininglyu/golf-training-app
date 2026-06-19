import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/current-user";
import { encrypt } from "@/lib/crypto";
import { GhinAuthError, GhinNetworkError, loginGhin } from "@/lib/ghin";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { emailOrGhin, password } = body as {
    emailOrGhin?: unknown;
    password?: unknown;
  };
  if (typeof emailOrGhin !== "string" || !emailOrGhin.trim()) {
    return NextResponse.json(
      { error: "`emailOrGhin` is required" },
      { status: 400 },
    );
  }
  if (typeof password !== "string" || !password) {
    return NextResponse.json(
      { error: "`password` is required" },
      { status: 400 },
    );
  }

  let result;
  try {
    result = await loginGhin(emailOrGhin.trim(), password);
  } catch (err) {
    if (err instanceof GhinAuthError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    if (err instanceof GhinNetworkError) {
      return NextResponse.json({ error: err.message }, { status: 502 });
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to connect GHIN" },
      { status: 500 },
    );
  }

  let encrypted;
  try {
    encrypted = encrypt(password);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Encryption failed" },
      { status: 500 },
    );
  }

  const userId = await getCurrentUserId();
  const golfer = result.primary;
  const now = new Date();

  await prisma.$transaction(async (tx) => {
    await tx.ghinCredential.upsert({
      where: { userId },
      create: {
        userId,
        emailOrGhin: emailOrGhin.trim(),
        ghinNumber: golfer.ghinNumber || null,
        golferName: golfer.playerName || null,
        encryptedPassword: encrypted.ciphertext,
        passwordIv: encrypted.iv,
        passwordAuthTag: encrypted.authTag,
        lastSyncedAt: now,
        lastError: null,
      },
      update: {
        emailOrGhin: emailOrGhin.trim(),
        ghinNumber: golfer.ghinNumber || null,
        golferName: golfer.playerName || null,
        encryptedPassword: encrypted.ciphertext,
        passwordIv: encrypted.iv,
        passwordAuthTag: encrypted.authTag,
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
