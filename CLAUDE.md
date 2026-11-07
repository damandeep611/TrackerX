# CLAUDE.md — TrackerX (buildxskill)

Personal skill-mastery and time-auditing dashboard. Users track hours on skills (with a Kanban task board), run 80-hour deep-work goal sprints, and plan open-ended projects in "sandboxes".

Refactor work is tracked in **`refactor-claude.md`**. Check it before changing code.

## Stack (versions from pnpm-lock.yaml)
- Next.js **16.1.6** (App Router), React **19.2.4**, TypeScript 5.9
- Tailwind CSS 4 (`@tailwindcss/postcss`, tokens in `src/app/globals.css`), shadcn/ui (`components.json`, `src/components/ui/`), Radix, `motion` (import from `"motion/react"`; framer-motion is gone), `next-themes`
- PostgreSQL on Neon (`@neondatabase/serverless` Pool) + Drizzle ORM 0.42 / drizzle-kit
- Auth: Better Auth **1.4.18**, Google OAuth only, Drizzle adapter
- Data fetching: TanStack Query 5, Server Actions; the only Route Handler is Better Auth
- Charts: Recharts only (via shadcn `ui/chart.tsx`)
- Icons: **lucide-react only**. Other: date-fns, cheerio (OG scraping), react-hot-toast, @dnd-kit
- `zod` is installed but currently unused (kept for P2 action validation). Upstash was removed; re-add it if P2 picks it for rate limiting.
- Package manager: **pnpm**

## Commands
- `pnpm dev` / `pnpm build` / `pnpm lint` (`eslint .`, since `next lint` no longer exists in Next 16)
- DB: `drizzle.config.ts` → migrations in `migrations/` (`pnpm generate` / `pnpm migrate`). `0021_drop_daily_logs.sql` drops `entries` + `time_slots`; it is **generated but not yet applied**.
- No test suite exists.

## Folder map
```
src/
  actions/            Server Actions ("use server"): all data reads/writes
    goalActions.ts, goalLogActions.ts        80-hour goals + session logs
    sandboxActions.ts                        sandboxes, phases, sessions, resources, OG scraping
    skillCardAction.ts, skillTaskAction.ts   skills + tasks
    timeLogAction.ts                         time logs + weekly/daily rollups (544 lines)
    overviewAnalyticsAction.ts, skillAnalyticsAction.ts
  app/
    api/auth/[...all]/        Better Auth handler
    dashboard/                All app pages (see route map); layout.tsx = Sidebar + ThemeProvider + Toaster
    dashboard/skills/         also holds non-route components (SkillHeader, SkillAnalytics, SkillDropdownMenu)
    dashboard/help/           placeholder page
    providers/QueryProvider.tsx
    layout.tsx                root: Inter via next/font, QueryProvider, Vercel Analytics/SpeedInsights
    page.tsx                  public landing page
  components/
    ui/                       shadcn primitives (button, card, dialog, tabs, chart, modal…)
    dashboard/<feature>/      feature widgets: 80-hour-goals, analytics-components, header,
                              sandbox, sidebar, skillcardComponents, skills, skilltodos, TodoCard
    layout/                   landing page sections (no mock UI or testimonials)
    auth/                     sign-in / sign-out buttons
    modals/DeleteModal.tsx
  db/
    drizzle.ts                Pool + drizzle client (schema object = auth + main; omits sandbox-schema)
    schema/schema.ts          skillCard, skillTask, timeLog, goals, goal_logs
    schema/sandbox-schema.ts  sandboxes, sandbox_phases, sandbox_logs, sandbox_resources
    schema/auth-schema.ts     Better Auth: user, session, account, verification
  hooks/                      useSkillCardsHook (RQ), useOverviewAnalytics &
                              useSkillAnalytics (raw useEffect), useSkillTodoManager, useRecentTags, useTagStats
  lib/                        auth.ts (server), auth-client.ts, api/skillCardApi.ts (RQ↔action bridge), utils.ts (cn)
  types/, utils/              shared types; time/date formatters
```

## Route map
| URL | Rendering | Auth check | Data |
|---|---|---|---|
| `/` | Server | none | — |
| `/dashboard` | Server page → client `SkillDashboard` | in actions only | getSkillCard, overview + weekly analytics actions |
| `/dashboard/skills/[slug]` | Server → client | session (throws), skill scoped by user | skill tasks, time logs, analytics |
| `/dashboard/80-hour-goals` | Client | in actions only | getGoals / addGoal / deleteGoal |
| `/dashboard/80-hour-goals/[goalId]` | Client | in actions only | getGoalBySlug, goal logs |
| `/dashboard/sandbox` | Server → client | in actions | getSandboxes, create/delete |
| `/dashboard/sandbox/[sandboxId]` | Server → client | session only — **not scoped by owner** | sandbox, phases, logs, resources |
| `/dashboard/help`, `/dashboard/usersetting` | Server | none | placeholder pages |

No `middleware.ts`/`proxy.ts`, and no `error.tsx` / `loading.tsx` / `not-found.tsx` anywhere.

## Data model
`user` 1:N → `skillCard` 1:N → `skillTask` 1:N → `timeLog` (timeLog also has skill_id, user_id)
`user` 1:N → `goals` 1:N → `goal_logs`
`user` 1:N → `sandboxes` 1:N → `sandbox_phases` 1:N → `sandbox_logs`; `sandbox_resources` → sandbox (+ optional phase)
All FKs `ON DELETE CASCADE`. `skillCard.slug` and `goals.slug` are **globally** unique (not per user). Sandbox child tables have no `userId`, so ownership has to be checked through the parent sandbox.

## Auth flow
`authClient.signIn.social({ provider: "google", callbackURL: "/dashboard" })` → `/api/auth/[...all]` → session cookie.
Server code calls `auth.api.getSession({ headers: await headers() })`. Several files copy the same `getUserId()` helper. Sign-out redirects to `/` and forces the light theme.

## Conventions (current reality; standardize per refactor-claude.md)
- Path alias `@/` → `src/`.
- Every query must be scoped by `session.user.id` (or, for sandbox children, by the parent sandbox's owner). Many current actions don't do this.
- Prefer semantic Tailwind tokens (`bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`) and shadcn `Button`/`Card`/`Dialog` over raw hex values and hand-rolled elements.
- Backend endpoint pattern (to be standardized in P2): require the session, validate input with zod, check ownership, use a transaction for multi-table writes.

## Env vars (names only, from .env.example)
`BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `DATABASE_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` (Upstash is not wired up yet).
Never read `.env*` files other than `.env.example`.

## External services
Neon Postgres, Google OAuth, Vercel Analytics + Speed Insights. Sandbox resources are fetched from arbitrary URLs server-side (cheerio).
