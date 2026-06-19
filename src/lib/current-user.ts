import { prisma } from "@/lib/db";

/**
 * Until authentication is wired up, the app treats the first user in the DB
 * (created by `npm run db:seed`) as the signed-in user.
 */
export async function getCurrentUserId(): Promise<string> {
  const user = await prisma.user.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  if (user) return user.id;

  const fallback = await prisma.user.create({
    data: {
      email: `dev-${Date.now()}@example.com`,
      name: "Dev User",
    },
    select: { id: true },
  });
  return fallback.id;
}
