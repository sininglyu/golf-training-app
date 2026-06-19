# Fairway — Golf Training App

A Next.js 15 (App Router) + TypeScript + Tailwind + shadcn/ui starter for a
golf training app. Uses **TanStack Query (React Query) v5** for data fetching.

## Tech stack

- [Next.js 15](https://nextjs.org/) — App Router, React 18, TypeScript
- [Tailwind CSS](https://tailwindcss.com/) with shadcn/ui theming tokens
- [shadcn/ui](https://ui.shadcn.com/) components (New York style, zinc base, lucide icons)
- [TanStack Query v5](https://tanstack.com/query) + Devtools
- [Prisma 7](https://www.prisma.io/) ORM with local [SQLite](https://www.sqlite.org/) via the `better-sqlite3` driver adapter

## Getting started

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Folder structure

```
src/
  app/
    layout.tsx                # Root layout (wraps with QueryProvider)
    page.tsx                  # Redirects → /dashboard
    globals.css               # Tailwind + shadcn CSS variables
    (app)/                    # Authenticated / main app route group
      layout.tsx              # AppShell (sidebar + header)
      planner/page.tsx        # Weekly Planner
      sessions/page.tsx       # Session Logger
      dashboard/page.tsx      # Progress Dashboard
      coach/page.tsx          # AI Coaching
  components/
    layout/
      app-shell.tsx           # Sidebar + main content shell
      sidebar-nav.tsx         # Persistent sidebar navigation
    providers/
      query-provider.tsx      # TanStack Query client provider
    ui/                       # shadcn/ui components (button, card, …)
  features/
    planner/{api,hooks,components}
    sessions/{api,hooks,components}
    dashboard/{api,hooks,components}
    coach/{api,hooks,components}
  hooks/                      # Cross-feature hooks
  lib/
    utils.ts                  # `cn` classname merger
    query-keys.ts             # Central React Query key factory
    db.ts                     # Prisma Client singleton (SQLite adapter)
  generated/prisma/           # Generated Prisma Client (do not edit)
  types/
    index.ts                  # Shared domain types
prisma/
  schema.prisma               # Database models
  seed.ts                     # Seed script (run via `npm run db:seed`)
  migrations/                 # Migration history
```

### Adding a shadcn/ui component

```bash
npx shadcn@latest add dialog input form label select
```

Config is in `components.json`. The `cn` helper is at `@/lib/utils`.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | Lint with Next.js ESLint config |
| `npm run db:generate` | Regenerate the Prisma Client to `src/generated/prisma` |
| `npm run db:migrate` | Create/apply a new migration (dev) |
| `npm run db:reset` | Drop, re-create, and re-seed the local DB |
| `npm run db:seed` | Run `prisma/seed.ts` against the current DB |
| `npm run db:studio` | Open Prisma Studio to browse data |

## Database

Local SQLite DB lives at `./dev.db` (path controlled by `DATABASE_URL` in `.env`).

### Schema (`prisma/schema.prisma`)

- **User** — email (unique), name, handicap
- **WeeklySession** — `type` enum (`golf | workout | recovery`), date, `plannedDuration` (minutes), `completed`, optional title/focus; belongs to a User, has one `SessionLog`
- **SessionLog** — free-form notes + actualDuration + rating, plus three JSON-string columns: `exercises` (workouts), `golfDrills` (golf practice), `shotsLogged` (shots hit during practice)
- **ShotsGained** — per-round stats: `date`, `course`, `sgOffTee`, `sgApproach`, `sgAroundGreen`, `sgPutting`, `total`

### Accessing the DB in app code

```ts
import { prisma } from "@/lib/db";

const upcoming = await prisma.weeklySession.findMany({
  where: { userId, completed: false, date: { gte: new Date() } },
  orderBy: { date: "asc" },
});
```

The Prisma Client is generated into `src/generated/prisma` and the runtime
instance is constructed with the `better-sqlite3` driver adapter in
`src/lib/db.ts` (Prisma 7 requires an adapter for SQLite).

### First-time setup

```bash
npm install
npm run db:migrate     # creates dev.db and applies migrations
npm run db:seed        # inserts the example user, sessions, and rounds
```
