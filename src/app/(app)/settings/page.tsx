import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GhinCard, type GhinStatus } from "@/components/settings/ghin-card";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/current-user";
import { SESSION_TYPE_LABELS, SESSION_TYPES, type SessionType } from "@/types";

export const dynamic = "force-dynamic";

const TYPE_COLOR: Record<SessionType, string> = {
  golf: "#f59e0b",
  round: "#22d3ee",
  workout: "#fb7185",
  recovery: "#60a5fa",
};

export default async function SettingsPage() {
  const userId = await getCurrentUserId();

  const [ghinCredential, latestGhinEntry] = await Promise.all([
    prisma.ghinCredential.findUnique({ where: { userId } }),
    prisma.handicapEntry.findFirst({
      where: { userId, source: "ghin" },
      orderBy: { recordedAt: "desc" },
    }),
  ]);

  const ghinStatus: GhinStatus = {
    connected: Boolean(ghinCredential),
    emailOrGhin: ghinCredential?.emailOrGhin ?? null,
    ghinNumber: ghinCredential?.ghinNumber ?? null,
    golferName: ghinCredential?.golferName ?? null,
    currentIndex: latestGhinEntry?.index ?? null,
    lowIndex: latestGhinEntry?.lowIndex ?? null,
    lastSyncedAt: ghinCredential?.lastSyncedAt?.toISOString() ?? null,
    lastError: ghinCredential?.lastError ?? null,
  };

  return (
    <div className="mx-auto max-w-[680px] space-y-8">
      <h1 className="text-[30px] font-black leading-none tracking-[-0.02em] text-foreground">
        Settings
      </h1>

      {/* GHIN integration */}
      <Card className="p-[22px]">
        <CardHeader className="p-0 pb-4">
          <CardTitle className="text-[17px] font-black tracking-[-0.01em]">
            Integrations
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <GhinCard initialStatus={ghinStatus} />
        </CardContent>
      </Card>

      {/* Session type legend */}
      <Card className="p-[22px]">
        <CardHeader className="p-0 pb-4">
          <CardTitle className="text-[17px] font-black tracking-[-0.01em]">
            Session Types
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-2 gap-3">
            {SESSION_TYPES.map((type) => {
              const color = TYPE_COLOR[type];
              const label = SESSION_TYPE_LABELS[type];
              return (
                <div key={type} className="flex items-center gap-3">
                  <div
                    className="h-[14px] w-[14px] shrink-0 rounded-[4px]"
                    style={{
                      background: color,
                      boxShadow: `0 0 10px ${color}80`,
                    }}
                  />
                  <span className="text-[13px] font-semibold text-foreground">
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
