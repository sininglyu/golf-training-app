import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GhinCard, type GhinStatus } from "@/components/settings/ghin-card";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/current-user";

export const dynamic = "force-dynamic";

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage account integrations and preferences.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Integrations</CardTitle>
          <CardDescription>
            Pull data from external services so Fairway can stay in sync.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <GhinCard initialStatus={ghinStatus} />
        </CardContent>
      </Card>
    </div>
  );
}
