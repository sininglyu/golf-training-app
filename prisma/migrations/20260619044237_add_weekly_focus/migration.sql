-- CreateTable
CREATE TABLE "WeeklyFocus" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "weekOf" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WeeklyFocus_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "WeeklyFocus_userId_weekOf_idx" ON "WeeklyFocus"("userId", "weekOf");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyFocus_userId_weekOf_key" ON "WeeklyFocus"("userId", "weekOf");
