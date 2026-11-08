# CLAUDE.md — TrackerX (buildxskill)

Personal skill-mastery and time-auditing dashboard. Users track hours on skills (tasks in a To do / Doing / Done list, quick time logging), run open-ended deep-work projects in "sandboxes" (hour target, quick session logging, a milestone marker every 20h on a radial dial). 80-hour goals still exist but are removed in P8.

Refactor work is tracked in **`refactor-claude.md`**. Check it before changing code. Its top section, **SESSION HANDOFF**, says where work stopped and what comes next.

## Stack (versions from pnpm-lock.yaml)
- Next.js **16.4.5** (App Router), React **19.3**, TypeScript 5.9
- Tailwind CSS 4 (`@tailwindcss/postcss`, tokens in `src/app/globals.css`), shadcn/ui (`components.json`, `src/components/ui/`), Radix (dialog, tooltip, dropdown, tabs…), `motion` (import from `"motion/react"`; framer-motion is gone), `next-themes`
- Fonts: Inter (`--font-inter` → `font-sans`) + Geist Mono (`--font-geist-mono` → `font-mono` / `.tabular` for metric numbers), loaded in `app/layout.tsx`
- PostgreSQL on Neon (`@neondatabase/serverless` Pool) + Drizzle ORM 0.45 / drizzle-kit 0.31
- Auth: Better Auth **1.7.18**, Google OAuth only, Drizzle adapter
- Data fetching: TanStack Query 5 over Server Actions, with server prefetch + `HydrationBoundary`; the only Route Handler is Better Auth
- Charts: Recharts only (via shadcn `ui/chart.tsx`)
- Icons: **lucide-react only**. Other: date-fns, cheerio (OG scraping), react-hot-toast
- zod 4 validates every Server Action input (helpers in `src/lib/validation.ts`). No rate limiting yet (Upstash was removed in P1).
- Package manager: **pnpm**

## Commands
- `pnpm dev` / `pnpm build` / `pnpm lint` (`eslint .` with the native flat config from `eslint-config-next`; `next lint` no longer exists in Next 16). `react-hooks/set-state-in-effect` is temporarily set to warn (see eslint.config.mjs).
- DB: `drizzle.config.ts` → migrations in `migrations/` (`pnpm generate` / `pnpm migrate`). All migrations through `0025` are **applied** (2026-11-08). The prod DB was originally built with `drizzle-kit push`, so 0010–0020 were baselined into `drizzle.__drizzle_migrations` by hand; use `pnpm generate` + `pnpm migrate` from now on, never `drizzle:push`. Migrations can't run from the owner's WSL2 (Neon WebSocket fails); the owner runs them from a Windows checkout. `drizzle-kit migrate` can exit 1 without printing the error: run the drizzle-orm migrator in a small node script to see it.
- No test suite exists.

## Folder map
```
src/
  actions/            Server Actions ("use server"): all data reads/writes
    goalActions.ts, goalLogActions.ts        80-hour goals + session logs
    sandboxActions.ts                        sandboxes (list w/ totals, overview = insights + named milestones), sessions
                                             (logSandboxSession 1–180 min on the local date / deleteSandboxLog), setMilestoneLabel,
                                             resources (add/delete/setResourceStatus) + fetchResourceMetadata (OG scraping)
    skillCardAction.ts, skillTaskAction.ts   skills + tasks (getSkillTasks returns each task with its logged minutes)
    timeLogAction.ts                         createTimeLog (1–180 min, user's local date) / deleteTimeLog (undo) + 7-week rollup
    dashboardInsightsAction.ts               home insights: streak, consistency, week-over-week, per-skill activity
    skillInsightsAction.ts                   skill page: getSkillInsights (trend/streak/consistency/total), getTagSuggestions
  app/
    api/auth/[...all]/        Better Auth handler
    dashboard/                All app pages (see route map); layout.tsx = Sidebar + ThemeProvider + Toaster;
                              loading.tsx (skeleton), error.tsx, not-found.tsx cover every dashboard route
    dashboard/help/           placeholder page
    providers/QueryProvider.tsx
    layout.tsx                root: fonts, QueryProvider, the ONLY <Toaster> (token-styled), Vercel Analytics/SpeedInsights
    page.tsx                  public landing page
  components/
    ui/                       DESIGN SYSTEM (P4). See "Design system" below. button, card (+Well), badge, metric
                              (MetricValue, AnimatedNumber, DeltaChip, BarSparkline, SegmentedProgress, ProgressBar),
                              stat-card (StatCard, StatGrid), dialog, sheet, modal (wraps dialog), tooltip, input (+Textarea), chip,
                              tabs (pill), empty-state, page (PageShell, PageHeader, SectionHeader), skeleton, dropdown-menu, chart
    dashboard/<feature>/      feature widgets: home (HomeDashboard, KpiRow, TrendCard, ConsistencyCard, SkillsSection),
                              80-hour-goals (GoalsView, GoalDetailView…), sidebar,
                              sandbox (SandboxListView, SandboxCard, SandboxDetailView, MilestoneDial, MilestoneList,
                              QuickLog (chips + panel), SessionList, SandboxInsightsTab, ResourcesPanel, SandboxDialogs),
                              insights (WeeklyHoursCard, shared by the skill + sandbox Insights tabs),
                              skillcardComponents (skill-card = <Link> + useLinkStatus pending state, add-skill-dialog),
                              skill-page (SkillPage, QuickAddTask, TaskList/TaskRow, LogTimeControl, TagPicker,
                              TaskEditDialog, SkillInsightsTab), TimeZoneCookie (writes the `tz` cookie)
    layout/                   landing page sections (no mock UI or testimonials)
    auth/                     sign-in / sign-out buttons
  db/
    drizzle.ts                Pool + drizzle client (schema = auth + main; main re-exports sandbox-schema)
    schema/schema.ts          skillCard, skillTask, timeLog, goals, goal_logs
    schema/sandbox-schema.ts  sandboxes, sandbox_phases, sandbox_logs, sandbox_resources
    schema/auth-schema.ts     Better Auth: user, session, account, verification
  hooks/                      one React Query hook file per domain: useSkills (list, per-skill data, time logs),
                              useDashboardAnalytics, useSkillPage (tasks/insights/tags + optimistic task & time-log mutations), useGoals,
                              useSandbox (list/overview/logs/resources + optimistic log/undo, milestone, resource mutations)
  lib/                        auth.ts (Better Auth server config), auth-client.ts, utils.ts (cn),
                              query-keys.ts (hierarchical RQ key factory), query-client.ts (getQueryClient)
                              server-only: require-user.ts (requireUser/getCurrentUser, cached per request),
                              ownership.ts (assertSandboxOwner/ResourceOwner, getOwnedSkill/Task),
                              validation.ts (zod helpers: zId, zText, zOptionalText, zHttpUrl, zLocalDate, parseInput/tryParseInput),
                              safe-fetch.ts (SSRF-safe HTML fetch for link previews), skill-hours.ts (recompute cached skill hours)
                              user-today.ts (user's calendar "today" from the `tz` cookie)
                              shared/pure: duration.ts (parseDuration "1h 30m", formatDuration, localDateKey), insights.ts (UTC day keys, streak/consistency math, buildProjectInsights for skills + sandboxes, projectEta/weeklyPace/etaAtPace, takeaway sentences, formatHours),
                              milestones.ts (dial markers every 20h + named ones: buildMarkers, markerStep),
                              skill-colors.ts (preset skill accents; stored as hex data)
  proxy.ts                    optimistic redirect to `/` for `/dashboard/*` without a session cookie (not an auth check)
  types/                      shared types: skillDashboardTypes (SkillTask, TaskStatus, NewTimeLog, MAX_ENTRY_MINUTES = 180),
                              sandbox (SandboxSummary/Overview/Log/Resource, MILESTONE_STEP_HOURS = 20)
```

## Route map
| URL | Rendering | Auth check | Data |
|---|---|---|---|
| `/` | Server | none | — |
| `/dashboard` | Server prefetch → client `HomeDashboard` | requireUser in page | skills list, dashboard insights, 7-week progress |
| `/dashboard/skills/[slug]` | Server prefetch → client `SkillPage` (`loading.tsx` skeleton) | requireUser; 404 if not owner | tasks (+minutes), skill insights, tag suggestions |
| `/dashboard/80-hour-goals` | Server prefetch → client `GoalsView` | requireUser in page | goals list (optimistic add/delete) |
| `/dashboard/80-hour-goals/[goalId]` | Server prefetch → client `GoalDetailView` | in actions; 404 if not owner | goal + logs (optimistic add/delete) |
| `/dashboard/sandbox` | Server prefetch → client `SandboxListView` (`loading.tsx`) | requireUser in page | sandboxes with totals + 14-day activity (optimistic create/delete/quick log) |
| `/dashboard/sandbox/[sandboxId]` | Server prefetch → client `SandboxDetailView` (`loading.tsx`) | requireUser; 404 via `getSandboxOverview` if not owner | overview (insights + named milestones), sessions, resources |
| `/dashboard/help`, `/dashboard/usersetting` | Server | none | placeholder pages |

`src/proxy.ts` redirects signed-out visitors away from `/dashboard/*`.

## Data model
`user` 1:N → `skillCard` 1:N → `skillTask` 1:N → `timeLog` (timeLog also has skill_id, user_id)
`user` 1:N → `goals` 1:N → `goal_logs`
`user` 1:N → `sandboxes` 1:N → `sandbox_logs` (minutes + `logged_date`), `sandbox_resources`, `sandbox_milestones` (named markers only, unique `(sandbox_id, hour_mark)`). Sandbox totals are summed from `sandbox_logs` (no cached hours column).
All FKs `ON DELETE CASCADE` (delete the parent only). `skillCard.slug` and `goals.slug` are unique **per user** (after migration 0023). Sandbox child tables have no `userId`, so ownership has to be checked through the parent sandbox.

## Auth flow
`authClient.signIn.social({ provider: "google", callbackURL: "/dashboard" })` → `/api/auth/[...all]` → session cookie.
Server code calls `requireUser()` from `@/lib/require-user` (never `auth.api.getSession` directly). Sign-out redirects to `/` and forces the light theme.

## Design system (P4, `src/components/ui/` + `src/app/globals.css` + `src/lib/motion.ts`)
- **Look** (from `public/design-inspiration/`): calm near-black / soft-white surfaces, **panel inside panel**, hairline borders, monospace tabular numbers with a muted unit, small bar sparklines, segmented progress, delta chips ("▲ +12% vs last week"), pill tabs, one accent per metric.
- **Surface tokens** (light + dark in globals.css): `bg-background` (canvas) → `bg-card` (panel) → `bg-surface-2` (inner well) → `bg-surface-3` (raised/hover). Text: `text-foreground`, `text-muted-foreground` (labels), `text-subtle-foreground` (captions). Lines: `border-border`, `border-border-strong`.
- **Accent/status tokens**: `brand` (blue: progress, active nav, main CTA; `bg-brand`, `text-brand`, `bg-brand-soft`), `success|warning|danger` (+ `-soft` backgrounds), metric palette `var(--chart-1..5)` = blue, violet, orange, emerald, rose. shadcn `accent` = subtle hover surface (NOT a brand color).
- **Shadows**: `shadow-panel`, `shadow-raised` (theme-aware via `--panel-shadow` / `--raised-shadow`). Radius base 0.75rem: cards `rounded-2xl`, wells `rounded-xl`, controls `rounded-lg`, chips `rounded-full`.
- **Legacy aliases** still exist for old components: `bg-surface`, `bg-surface-highlight`, `text-text-secondary`, `text-text-tertiary`. Don't use them in new code; delete them once P5–P8 migrate the remaining usages.
- **Composition**: page = `<PageShell><PageHeader title description actions/>…</PageShell>`; KPI = `<StatCard icon title value unit sparkline color delta caption/>` inside `<StatGrid>`; custom card = `<Card><CardHeader><CardTitle><Icon/>Title</CardTitle><CardAction>…</CardAction></CardHeader><Well>…</Well><CardFooter>…</CardFooter></Card>`; empty list = `<EmptyState icon title description action/>`; overlay = `Dialog` (or `Sheet`); `Modal` is a legacy-API wrapper over Dialog.
- **Button variants**: default (primary), brand (one per view), outline, secondary, ghost, destructive, destructive-ghost, link; sizes xs/sm/default/lg/icon/icon-sm/icon-xs. **Badge variants**: neutral, outline, brand, success, warning, danger, solid (+ `dot`).
- **Motion**: presets in `lib/motion.ts` (fadeIn, stagger, listItem, hoverLift, popIn, spring, layoutTransition). `components/dashboard/DashboardProviders.tsx` wraps the dashboard in `<MotionConfig reducedMotion="user">`, and globals.css disables CSS animation under prefers-reduced-motion. `AnimatedNumber` counts up once in view.
- **Sidebar** (`components/dashboard/sidebar/`): nav items in `nav-config.ts`; collapse persisted in localStorage via `hooks/useLocalStorageState.ts`; tooltips when collapsed; animated brand indicator on the active item; mobile = fixed top bar + left `Sheet` drawer (the dashboard `<main>` has `pt-14 md:pt-0`); user menu = Radix dropdown with Light/Dark/System switch + log out.
- Hydration-safe helpers: `hooks/useHydrated.ts`, `hooks/useLocalStorageState.ts` (useSyncExternalStore, so no setState-in-effect).
- **Visual QA without login**: temporarily add a public route (e.g. `src/app/design-preview/`) rendering the components, `pnpm build && PORT=3458 pnpm start`, then screenshot with the cached Chromium: `~/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome --headless=new --no-sandbox --hide-scrollbars --window-size=1440,1250 --virtual-time-budget=4000 --screenshot=<scratchpad>/x.png "http://localhost:3458/design-preview?theme=dark"` (also `?theme=light` and `--window-size=390,1400`). Delete the route before committing. Stop the server by PID, never with `pkill -f "next start"` (that matches and kills the shell itself). **Port 3000 is the owner's other project (ai-writer-ui); never kill it.**

## Conventions (current reality; standardize per refactor-claude.md)
- Path alias `@/` → `src/`.
- Every Server Action: `const userId = await requireUser()` → validate args with zod (`parseInput`, or `tryParseInput` for actions that return `{ success, error }`) → check ownership of every client-supplied id (`lib/ownership.ts`) → scope every query by `userId` (sandbox children via the parent sandbox).
- Every export of a `"use server"` file is a public endpoint. Put internal helpers in `src/lib/` (with `import "server-only"`), not in action files.
- Never `fetch()` a user-supplied URL directly; use `safeFetchHtml` from `lib/safe-fetch.ts`.
- Use the design-system tokens and `components/ui` primitives (see Design system). No raw hex colors, no hand-rolled buttons/modals, nothing below `text-[11px]`.
- Use `db.transaction` for multi-table writes (see `logSession`).
- **Data fetching pattern:** the server page calls `await requireUser()` first (this keeps the route dynamic; `prefetchQuery` swallows errors), then `getQueryClient()` → `prefetchQuery` with keys from `lib/query-keys.ts` → `<HydrationBoundary state={dehydrate(qc)}>`. Client components read the same data through the domain hook in `hooks/`. No `useEffect` fetching.
- **Mutations** go through hooks: optimistic `setQueryData` in `onMutate`, rollback in `onError`, targeted `invalidateQueries` in `onSettled` (e.g. `queryKeys.skills.detail(id)` refreshes all of a skill's data). Ignore optimistic `temp-` ids in follow-up actions.
- **Dates:** `timeLog.logged_date` and `sandbox_logs.logged_date` hold the user's *local* calendar date at UTC midnight (the client sends `localDateKey()`). Server "today" = `getUserToday()` (from the `tz` cookie set by `TimeZoneCookie`). Bucket days with `to_char(logged_date,'YYYY-MM-DD')`, compare with date keys from `lib/insights.ts` (`lastNDays`, `dateKey`), and format them with `timeZone: "UTC"`.
- **Time entries** (skill time logs and sandbox sessions) are capped at 3h (`MAX_ENTRY_MINUTES`) in the UI and in the zod schemas of `createTimeLog` / `logSandboxSession`. Reversible actions use `undoToast` (`components/ui/undo-toast.tsx`) instead of a confirm dialog.
- Avoid N+1s: aggregate with `GROUP BY` / `inArray` / a joined subquery instead of a query per item.

## Env vars (names only, from .env.example)
`BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `DATABASE_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` (Upstash is not wired up yet).
Never read `.env*` files other than `.env.example`.

## External services
Neon Postgres, Google OAuth, Vercel Analytics + Speed Insights. Sandbox resources are fetched from arbitrary URLs server-side (cheerio).
