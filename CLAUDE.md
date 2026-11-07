# CLAUDE.md — TrackerX (buildxskill)

Personal skill-mastery and time-auditing dashboard. Users track hours on skills (with a Kanban task board), run 80-hour deep-work goal sprints, and plan open-ended projects in "sandboxes".

Refactor work is tracked in **`refactor-claude.md`**. Check it before changing code.

## Stack (versions from pnpm-lock.yaml)
- Next.js **16.4.5** (App Router), React **19.3**, TypeScript 5.9
- Tailwind CSS 4 (`@tailwindcss/postcss`, tokens in `src/app/globals.css`), shadcn/ui (`components.json`, `src/components/ui/`), Radix, `motion` (import from `"motion/react"`; framer-motion is gone), `next-themes`
- PostgreSQL on Neon (`@neondatabase/serverless` Pool) + Drizzle ORM 0.45 / drizzle-kit 0.31
- Auth: Better Auth **1.7.18**, Google OAuth only, Drizzle adapter
- Data fetching: TanStack Query 5, Server Actions; the only Route Handler is Better Auth
- Charts: Recharts only (via shadcn `ui/chart.tsx`)
- Icons: **lucide-react only**. Other: date-fns, cheerio (OG scraping), react-hot-toast, @dnd-kit
- zod 4 validates every Server Action input (helpers in `src/lib/validation.ts`). No rate limiting yet (Upstash was removed in P1).
- Package manager: **pnpm**

## Commands
- `pnpm dev` / `pnpm build` / `pnpm lint` (`eslint .` with the native flat config from `eslint-config-next`; `next lint` no longer exists in Next 16). `react-hooks/set-state-in-effect` is temporarily set to warn (see eslint.config.mjs).
- DB: `drizzle.config.ts` → migrations in `migrations/` (`pnpm generate` / `pnpm migrate`). **Generated but not yet applied:** `0021_drop_daily_logs.sql` (drops `entries` + `time_slots`) and `0022_better_auth_1_7.sql` (auth-table defaults + 3 indexes).
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
    drizzle.ts                Pool + drizzle client (schema = auth + main; main re-exports sandbox-schema)
    schema/schema.ts          skillCard, skillTask, timeLog, goals, goal_logs
    schema/sandbox-schema.ts  sandboxes, sandbox_phases, sandbox_logs, sandbox_resources
    schema/auth-schema.ts     Better Auth: user, session, account, verification
  hooks/                      useSkillCardsHook (RQ), useOverviewAnalytics &
                              useSkillAnalytics (raw useEffect), useSkillTodoManager, useRecentTags, useTagStats
  lib/                        auth.ts (Better Auth server config), auth-client.ts, api/skillCardApi.ts (RQ↔action bridge), utils.ts (cn)
                              server-only: require-user.ts (requireUser/getCurrentUser, cached per request),
                              ownership.ts (assertSandboxOwner/PhaseOwner/ResourceOwner, getOwnedSkill/Task),
                              validation.ts (zod helpers: zId, zText, zHttpUrl, parseInput/tryParseInput),
                              safe-fetch.ts (SSRF-safe HTML fetch for link previews), skill-hours.ts (recompute cached skill hours)
  proxy.ts                    optimistic redirect to `/` for `/dashboard/*` without a session cookie (not an auth check)
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
| `/dashboard/sandbox/[sandboxId]` | Server → client | owner-scoped via `getSandboxDetail` (404 otherwise) | sandbox, phases, logs, resources |
| `/dashboard/help`, `/dashboard/usersetting` | Server | none | placeholder pages |

`src/proxy.ts` redirects signed-out visitors away from `/dashboard/*`. No `error.tsx` / `loading.tsx` / `not-found.tsx` yet.

## Data model
`user` 1:N → `skillCard` 1:N → `skillTask` 1:N → `timeLog` (timeLog also has skill_id, user_id)
`user` 1:N → `goals` 1:N → `goal_logs`
`user` 1:N → `sandboxes` 1:N → `sandbox_phases` 1:N → `sandbox_logs`; `sandbox_resources` → sandbox (+ optional phase)
All FKs `ON DELETE CASCADE`. `skillCard.slug` and `goals.slug` are **globally** unique (not per user). Sandbox child tables have no `userId`, so ownership has to be checked through the parent sandbox.

## Auth flow
`authClient.signIn.social({ provider: "google", callbackURL: "/dashboard" })` → `/api/auth/[...all]` → session cookie.
Server code calls `requireUser()` from `@/lib/require-user` (never `auth.api.getSession` directly). Sign-out redirects to `/` and forces the light theme.

## Conventions (current reality; standardize per refactor-claude.md)
- Path alias `@/` → `src/`.
- Every Server Action: `const userId = await requireUser()` → validate args with zod (`parseInput`, or `tryParseInput` for actions that return `{ success, error }`) → check ownership of every client-supplied id (`lib/ownership.ts`) → scope every query by `userId` (sandbox children via the parent sandbox).
- Every export of a `"use server"` file is a public endpoint. Put internal helpers in `src/lib/` (with `import "server-only"`), not in action files.
- Never `fetch()` a user-supplied URL directly; use `safeFetchHtml` from `lib/safe-fetch.ts`.
- Prefer semantic Tailwind tokens (`bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`) and shadcn `Button`/`Card`/`Dialog` over raw hex values and hand-rolled elements.
- Use `db.transaction` for multi-table writes (see `logSession`).

## Env vars (names only, from .env.example)
`BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `DATABASE_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` (Upstash is not wired up yet).
Never read `.env*` files other than `.env.example`.

## External services
Neon Postgres, Google OAuth, Vercel Analytics + Speed Insights. Sandbox resources are fetched from arbitrary URLs server-side (cheerio).
