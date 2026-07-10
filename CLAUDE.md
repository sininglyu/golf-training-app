# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build
npm run lint         # ESLint via Next.js config

npm run db:migrate   # Create and apply a migration (prompts for name)
npm run db:generate  # Regenerate Prisma Client after schema changes
npm run db:reset     # Drop, re-create, and re-seed the local DB
npm run db:seed      # Seed dev data into existing DB
npm run db:studio    # Browse data in Prisma Studio
```

After every `prisma/schema.prisma` change, run `db:migrate` then `db:generate`. The generated client lives in `src/generated/prisma/` — never edit it manually.

Adding a shadcn/ui component: `npx shadcn@latest add <component-name>`

## Architecture

**Stack:** Next.js 15 App Router · TypeScript · Tailwind CSS · shadcn/ui (New York style, zinc base) · TanStack Query v5 · Prisma 7 + SQLite via `better-sqlite3` driver adapter.

### Route structure

All authenticated pages live under `src/app/(app)/` (route group with shared `AppShell` layout — sidebar + header). API routes live under `src/app/api/`.

### Feature modules

Each feature under `src/features/<name>/` owns three sub-directories:
- `api/` — client-side fetch functions (called by hooks, never directly by components)
- `hooks/` — TanStack Query `useQuery`/`useMutation` hooks
- `components/` — React components scoped to that feature

### Data flow

```
API Route (server) → Prisma → serializer → JSON response
                                          ↓
                              TanStack Query hook (client)
                                          ↓
                                      Component
```

**Serialization:** `src/lib/serializers.ts` converts raw Prisma records to client types — dates become ISO strings, `exercises` (stored as a JSON string) is parsed to `ExerciseSet[]`. Always use `serializeSession` / `serializeLog` in API routes; never serialize ad-hoc.

**Query keys:** All TanStack Query keys are defined in `src/lib/query-keys.ts`. Add new namespaces there; never hardcode key arrays in hooks.

**Optimistic updates:** Mutations follow the pattern: `onMutate` → cancel + snapshot + patch cache, `onError` → rollback from snapshot, `onSettled` → `invalidateQueries`.

### Auth stub

`src/lib/current-user.ts` — `getCurrentUserId()` always returns the first user by `createdAt`. There is no real session system. All API routes call this to get the userId; it creates a dev user if none exists.

### Prisma / DB

- SQLite at `./dev.db` (path from `DATABASE_URL` env var, default `file:./dev.db`)
- Driver adapter pattern: `PrismaClient` is constructed with `PrismaBetterSqlite3` in `src/lib/db.ts`, which exports a singleton `prisma` (guarded with `globalThis` to survive HMR)
- `exercises`, `golfDrills`, `shotsLogged` on `SessionLog` are JSON strings, not native arrays
- `WeeklyFocus.weekOf` is stored as a plain `YYYY-MM-DD` string, not a `DateTime`, to avoid timezone drift

### GHIN integration

`src/lib/ghin.ts` is `server-only`. It calls `api2.ghin.com` (unofficial API) to authenticate and fetch handicap data. GHIN passwords are stored AES-256-GCM encrypted (`src/lib/crypto.ts`) — requires `GHIN_ENCRYPTION_KEY` (32-byte hex) in `.env.local`.

### Date utilities

`src/lib/week.ts` — all date math: `startOfWeek` (returns Monday), `weekBounds`, `formatISODate`, `parseISODate`, `isoWeekNumber`. The planner always passes a Monday YYYY-MM-DD string as `weekOf`; `weekBounds` trusts callers to do this.

### Domain types

`src/types/index.ts` — `SessionType`, `PlannerSession`, `SessionLog`, `ExerciseSet`, `ProgressMetric`, and the `SESSION_TYPES` / `SESSION_TYPE_LABELS` constants. These are the canonical client-side shapes.
