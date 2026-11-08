# refactor-claude.md — TrackerX refactor plan

Source: AUDIT.md (2026-11-05), re-verified against the code on 2026-11-07. Corrections from that verification are noted inline (**[corrected]** / **[new]**).
Repo context lives in `CLAUDE.md`. Work top to bottom and tick items off as you go.

---

# SESSION HANDOFF (read first; last updated 2026-11-08, end of P7)
- **Branch:** `refactor` (branched from `main`). **P1–P7 were fast-forward merged into `main` and pushed to GitHub on 2026-11-08** (production deploys from `main`). Keep doing phase work on `refactor`, then fast-forward `main` when the owner asks. Commits: P1 `612a4c1`, P2 `32a5502`, P3 `e103b7c`, P4 `bd27296` (committed by the owner), P5 `bfd41d4`, P6 `629f930`, P7 `4abbebe`. Leave the owner's own uncommitted changes (if any) out of commits.
- **Plan revised 2026-11-08** (see ROADMAP P5–P8 and Decisions): Kanban replaced by a status list (done, P6), 80-hour goals are **removed** in P8 (Sandbox is the single deep-work feature), sandbox phases/Structure are **removed** (done, P7), and the radial dial has auto markers every 20h that the owner can name (done, P7).
- **Migrations: all applied through 0025 (2026-11-08)** by the owner from the Windows checkout (WSL2 can't reach Neon). The DB had been built with `push`, so drizzle's log stopped before 0010; 0010–0020 were baselined by hand (checked first: tables/constraints matched 0020), then `pnpm migrate` ran 0021–0025. Verified afterwards: all 26 recorded; phases, daily-log tables and old columns gone; new columns, indexes and `sandbox_milestones` present. From now on: `generate` + `migrate`, never `drizzle:push`.
- **Smoke-test P6 + P7 on the hosted site (or once local login works)**: both were only QA'd with seeded data, never against the DB. P6: add a task, change status (click + S/X keys), log +15m and "1h 30m", Undo, "4h" (3h warning), delete a task with time, tag chips, Insights tab, streak/"today" vs your local date. **P7:** create a sandbox (lands on its page), quick-log from a card (+25m) and the panel (title remembered, "1h 30m", "4h" → warning, press L), Undo, delete a session, name a milestone (click a dial marker or a row; empty clears), Insights tab, add a resource (paste → title fetched), mark read, remove + Undo, delete the sandbox. Check that old sessions survived the migration with their hours.
- **Next: P8 (remove 80-hour goals + polish pass).** Ask the owner before starting. Starting points: delete `app/dashboard/80-hour-goals/`, `components/dashboard/80-hour-goals/`, `actions/goalActions.ts` + `goalLogActions.ts`, `hooks/useGoals.ts`, the `goals` keys in `lib/query-keys.ts`, the sidebar item in `nav-config.ts`; migration dropping `goals` + `goal_logs` (next number `0026`; the owner applies it from Windows). Then the UI-01/03/05/07 sweep (`rg "text-\[(8|9|10)px\]|#[0-9a-fA-F]{3,6}|<button"`), delete the legacy token aliases, restore `react-hooks/set-state-in-effect` to error. Optional: an "active sandbox" card on the home dashboard (deferred from P5).
- **Working agreements with the owner:** do one phase at a time; finish each with `pnpm build` + `pnpm lint` (0 errors), update CLAUDE.md + this file, commit on `refactor` when the owner says "yes/proceed", then ask before starting the next phase. Don't push. Can't log in locally (Google OAuth), so verify UI with the screenshot workflow in CLAUDE.md → Design system. When restarting the preview server, kill the `next-server` PID from `ss -ltnp | grep 3458` (the `pnpm start` PID is only the wrapper).
- **Known leftovers:** `react-hooks/set-state-in-effect` is set to warn (restore to error after P8). Legacy token aliases in globals.css. Old dashboard components (goals, landing) still use raw zinc/hex classes. The landing page uses undefined classes (`bg-paper-blue`, `text-brand-orange`, `accent-electric`); now covered by P9 (landing + sign-in redesign). Rate limiting (SEC-08) is undecided. No tests yet. Headless screenshots freeze count-up/Recharts animations at 0: use `--force-prefers-reduced-motion` to see final values.
- **Local login is broken on the owner's WSL2 setup (environment issue, not code; deferred by the owner).** Google sign-in on `localhost:3000` fails with `Failed query: insert into "verification"` + `[cause]: ErrorEvent`, meaning the Neon WebSocket connection failed. It works from Windows and from the hosted site. Done so far: fixed the `generateResolvConf` typo in `/etc/wsl.conf`, and set `/etc/resolv.conf` to `nameserver 8.8.8.8` + `1.1.1.1` + `options single-request-reopen timeout:1 attempts:2` (immutable, `chattr +i`). That cut DNS lookups from ~5.1s to ~0.05s, and a standalone `select 1` over the Neon WebSocket Pool then succeeded. The Neon HTTP driver (`neon()`, not used by the app) still fails with `fetch failed`. Login still failed afterwards. Next ideas: run `next dev` under plain Node rather than `bun run dev`, set `dnsTunneling=true` / `networkingMode=mirrored` in `%UserProfile%\.wslconfig`, and check IPv6 / MTU.

---

# ROADMAP (execution order)
This combines the owner's todos (T1–T13) with the audit items below. Implement **one phase at a time** and only when asked. Every phase ends with `pnpm build` + `pnpm lint` passing and `CLAUDE.md` updated if structure/conventions changed.
Order principle: delete first (less code to fix) → make it safe → make data fast → build a design system → redesign pages on top of it → polish.

## P1 — Cleanup & removals  (T3, T6, T7 + audit DES-05/07, DES-01, DES-02) — ✅ DONE 2026-11-07 (except applying migration 0021)
- ✅ **Remove Daily Logs (T3):** `app/dashboard/daily-logs/`, `components/dashboard/daily-logs/`, `hooks/useDailyLog.ts`, `app/api/entries/*`, `app/api/analytics/duration/`, `db/schema/daily-log-schema.ts` (+ drizzle.ts registration), `types/dailyLogTypes.ts`, `utils/dailyLogUtils.ts`, the sidebar item, and stray imports (skill-todo-card, skillDashboardTypes). Generate a migration that drops `entries` + `time_slots`. ⚠ This destroys data, so confirm before running it. → Generated as `migrations/0021_drop_daily_logs.sql`; **not applied yet** (run `pnpm migrate` after confirming).
- ✅ **Libraries (T6, T7):** port `WeeklyProgressChart` to Recharts and remove `echarts`/`echarts-for-react`. Remove `react-icons` and `gsap`. Keep **lucide-react** as the only icon set (already used in 60 files). Migrate `framer-motion` → **`motion`** (its renamed successor, `import { motion } from "motion/react"`, 49 files, mechanical swap). Remove the unused `@upstash/*` unless P2 wires them up. → Upstash removed (re-add in P2 if chosen). Also removed the now-unused `react-fast-marquee` + `react-hook-form`. `motion` is 14.x.
- ✅ **Dummy data (T6):** `lib/mock-80-hour-goals-store.ts`; fake landing-page testimonials with `randomuser.me` portraits (`testimonial-section.tsx`) + the `next.config.ts` remotePattern; mock UI on the landing page (`app-mockup.tsx`, `mock-ui.tsx`) to be kept or replaced by real screenshots (owner decides); any hardcoded stat values in dashboard widgets; the `help` DateChecker test stub. → Mockups + testimonials deleted, and the landing feature cards rewritten from fake "notes" features to the real ones. The only hardcoded stat left is UI-08 (goal-card 0/80), which stays in P6.
- ✅ **Dead code:** demouserProfile, goals-list/, NumberSkeleton, ActivityTimeline + skill-activity-timeline, auth-middleware.ts.
- ✅ **Embarrassing bugs:** DES-01 profanity + inverted logic, DES-02 `onCanPlay`.
- ✅ **[new] Lint was broken:** `next lint` doesn't exist in Next 16. The script is now `eslint .`, with `.next/` etc. ignored, and the 20 pre-existing lint errors (unused vars, unescaped quotes, one `any`) are fixed.

## P2 — Security & dependency upgrades  (audit Phase 0, 1, 2) — ✅ DONE 2026-11-07 (except rate limiting, migration 0022 not applied)
- ✅ Upgrade next, better-auth, drizzle-orm, eslint-config-next, then fix any breakage. → next 16.4.5, better-auth 1.7.18, drizzle-orm 0.45.4, eslint-config-next 16.4.5 (native flat config), zod 4.6.7, plus `pnpm update` within ranges. `pnpm audit`: 6 crit / 73 high → **0 crit / 0 high / 2 moderate (dev-only)**.
- ✅ `requireUser()` helper (`server-only`), ownership checks on every action (SEC-01/03/04/05/07), SSRF fix (SEC-02), zod at every action boundary (SEC-12). **[new]** Also fixed: `addGoalLog` trusted a client `goalId`; exported internal helpers (`getUserId`, `updateSkillCardHours`, `updateSkillCardHoursFromTimeLogs`) were public endpoints; `logSession` trusted the client's duration (now computed server-side, in a transaction).
- ✅ `proxy.ts` redirect for `/dashboard/*`. ⏳ Rate limit metadata fetching + mutations (Upstash already dropped). Owner decides whether it's needed.
- Done before redesigns because the upgrades can break APIs that the UI work would build on.

## P3 — Data layer & fetching speed  (T4 + audit Phase 4, DES-03, DES-04, DES-09) — ✅ DONE 2026-11-07 (migration 0023 not applied)
- ✅ DB: indexes, kill the N+1s/loops (PERF-01/02/03), one session lookup per request, per-user slug uniqueness, pool singleton. → `migrations/0023_indexes_per_user_slugs.sql` (not applied); `generateSlug` checks only the user's own skills.
- ✅ One fetching pattern: Server Components fetch + `HydrationBoundary` prefill React Query (no loading flash on first paint); a `queryKeys` factory; one hook per domain in `hooks/`; optimistic updates + targeted invalidation on mutations; remove raw `useEffect` fetching. → `lib/query-keys.ts`, `lib/query-client.ts`, `hooks/useSkills|useDashboardAnalytics|useGoals`. Goals pages became server pages + `GoalsView`/`GoalDetailView`. Sandbox kept as server-props + local state (already server-rendered, no client fetching). **[new] Bugs fixed:** logging time never refreshed the timeline, analytics or hours (`onTimeUpdate` was never called); task edit/toggle/delete showed success and kept the optimistic change when the server refused; prefetching pages were being prerendered statically (now `requireUser()` first). **Dead code removed:** `skill-todo-list`, `skill-todo-card`, `TimeBlockList`, `TodoCard/*`, `lib/api/skillCardApi.ts`, 5 old hooks.
- ✅ `loading.tsx` (skeletons) / `error.tsx` / `not-found.tsx` for dashboard segments (+ `ui/skeleton.tsx`). ⏳ `Suspense` around slow widgets: deferred. Pages await all prefetches in parallel and `loading.tsx` covers navigation; revisit streaming per widget in P5 if TTFB matters.
- ✅ Move route-folder components into `components/` (DES-06).

## P4 — Design system foundation  (enables T2, T5, T8; audit Phase 6 baseline) — ✅ DONE 2026-11-07 (`bd27296`)
- Direction from `public/design-inspiration/`: calm near-black / soft-white neutral surfaces, **panel-inside-panel cards** with hairline borders, generous spacing, monospace tabular numerals for metrics, small inline bar sparklines, segmented progress bars, muted labels, a single accent per metric, delta chips ("+12% vs last week"), pill tab switchers. Keep light + dark themes.
- ✅ Tokens in `globals.css` (surface levels, border, accent, success/warn/danger), type scale, spacing, radius. → Rewritten from scratch (oklch, light + dark). Fixes DES-08 (`--text-primary` undefined, body/layout `text-primary`). Fonts are now actually loaded (`--font-sans` used to point at an unloaded Geist). shadcn `accent` restored to its hover-surface meaning; brand accent is `--brand`.
- ✅ Primitives: `Button`, `Card`/`Panel`, `StatCard`, `Dialog`/`Sheet`, `Input`, `Tabs`, `Badge`, `EmptyState`, `Skeleton`, `PageHeader`, `PageShell`. → Plus `Well`, `metric.tsx` (MetricValue, AnimatedNumber, DeltaChip, BarSparkline, SegmentedProgress, ProgressBar), `Textarea`, `Tooltip`, `SectionHeader`. New deps: `@radix-ui/react-dialog`, `@radix-ui/react-tooltip`. `ui/modal.tsx` now wraps Radix Dialog (focus trap/Escape/aria) with the same props, so its 4 users got a11y for free. Visually QA'd in dark, light, and 390px via headless screenshots.
- ✅ Motion presets (`lib/motion.ts`): page fade-in, list stagger, hover lift, number count-up, layout transitions; respect `prefers-reduced-motion`. → `MotionConfig reducedMotion="user"` in `components/dashboard/DashboardProviders.tsx` + a CSS reduced-motion rule; count-up = `AnimatedNumber`.
- ✅ Sidebar rebuilt on tokens (fixes light mode), with active states. → Fixes UI-02. Persisted collapse, tooltips, animated active indicator, mobile top bar + drawer, Radix user menu with a Light/Dark/System switch. **Removed dummy UI:** the "Upgrade to Pro" card, dead Profile/Feedback menu items, the robohash avatar fallback (now initials). Deleted the now-unused `layout/mode-toggle.tsx` and `auth/sign-out.tsx`. **[new] Bug fixed:** dashboard layout rendered a second `<Toaster>`, so every toast showed twice.

## P5 — Home dashboard + skill cards  (T2, T9, T10) — ✅ DONE 2026-11-08
- ✅ **Done:** `/dashboard` = `components/dashboard/home/HomeDashboard` (PageShell/PageHeader: date eyebrow, "Welcome back, {first name}", a takeaway sentence from `buildTakeaway`, brand "New skill"). 4 StatCards: last 7 days (sparkline + % vs the prior 7 days), streak (+ longest), consistency (% active of 28 days, Δ pts vs the prior 28), active skills (+ most time). TrendCard (Recharts, pill tabs: 7 weeks / 28 days, average footer). ConsistencyCard (28-day heat grid + streak). SkillsSection with **working** filters (All/Active/Idle/Completed, with counts), a real "Add a skill" ghost card, and an EmptyState. Skill card rebuilt: `<Link>` (prefetch) + `useLinkStatus` pending bar/spinner, one accent per skill, SegmentedProgress, monospace hours, a 14-day sparkline, "this week" / "last logged N days ago", and a status badge. `add-skill-dialog.tsx` on Dialog (category chips, target presets, color swatches; removed the fake "AI Estimate" button). Added `skills/[slug]/loading.tsx` and reshaped `dashboard/loading.tsx`. Fixes UI-04.
- Data: a new `getDashboardInsights` (3 grouped queries in parallel, math in `lib/insights.ts`) + `queryKeys.dashboard.insights`. **Removed:** `overviewAnalyticsAction.ts`, `getLastSevenDaysActivity`, `analytics-components/*`, `header/DashboardHeader`, `all-skill-cards`, `add-skill-modal`, `ui/BouncingBars`, the overview/weeklyRhythm keys and hooks. `StatCard` gained `deltaSuffix`.
- Deviations: the "range pill tabs" sit on the trend card, not the header (a header range picker had nothing honest to filter). No active-sandbox card (optional; it can come with P7). The greeting is "Welcome back" rather than a time-of-day greeting (the server doesn't know the user's clock).
- ~~**Known limitation → P6:** days are UTC dates.~~ (fixed in P6, see "Time zones fixed") `KanbanTaskCard` logs `new Date().toISOString().split("T")[0]` (the UTC date), so a log between 00:00 and 05:30 IST lands on the previous day. When P6 rebuilds time logging, send the user's local date and consider passing the user's time zone to the "today" calculation.
- *Original plan (kept for reference):*
- Rebuild `/dashboard` on P4 primitives: header with greeting + range picker, KPI stat cards with sparklines and deltas, working filters (fixes UI-04), a real "add skill" card.
- **Redesign the skill cards.** Keep the colored progress-chip idea (the owner likes it), but execute it properly: one accent per skill, segmented progress, monospace hours with a muted unit, calm hierarchy.
- **[new] Instant-feeling navigation to the skill page.** Today `skill-card.tsx:82` navigates with `onClick={() => router.push(...)}`, so there is no prefetch and no feedback until the page is ready. Fix: wrap the card in `<Link href>` (prefetch), show a pending/pressed state on the clicked card (`useLinkStatus` or `useTransition`), and add `app/dashboard/skills/[slug]/loading.tsx` with a skeleton shaped like the new skill page.
- Insights rather than raw numbers: week-over-week trend, streaks, consistency score, best day/time, projected completion date per skill at the current pace, a "neglected skill" nudge, plain-language takeaways ("You're 3h behind last week; Rust hasn't been touched in 6 days").
- Remove the planned "80h sprint" card from the mock (goals are being removed in P8). Optionally show the most active sandbox instead.

## P6 — Skill page rebuild: work-first task + time flow  (T8, T9, T11) — ✅ DONE 2026-11-08
- ✅ **Done:** `components/dashboard/skill-page/*` replaces `skills/*` + `skilltodos/*` (Kanban, timeline, analytics cards, dropdown, form, tag input) and `useSkillTodoManager`.
  - Page = PageShell (max-w-5xl): back link + category, title with skill color, plain-language takeaway (pace → ETA, week vs last week), a menu (Delete skill with confirm; the dummy Reset/Logout/Share items are removed), a progress card (hours / target, SegmentedProgress with 20h markers, this week / streak / finish date), and pill tabs Work / Insights.
  - **Work:** inline quick-add (title + Enter; optional Details = notes, TagPicker, "Start now"; press N to focus). A status list grouped Doing → To do → Done (Done collapsed); a click on the status icon or the S/X/E/Del keys change status/edit/delete. All open tasks are always visible (no date box/filter, which fixes the disappearing-tasks bug). Per-task LogTimeControl: +15m / +30m / +1h + a custom amount ("1h 30m", "90", "1:30"), "ended now" on the **local** date, an Undo toast, and a **3h cap** with a warning (UI + zod `minutes` 1–180). Deleting a task with logged time asks for confirmation; deleting an empty task doesn't.
  - **Tags:** TagPicker shows the skill's recent tags + up to 3 suggested (most used across all skills, ✨), filtered as you type; Enter adds a match or a new tag (max 5).
  - **Insights:** StatCards (finish estimate at the 4-week pace, last 7 days with Δ, consistency 28d, tasks done) + hours per week (8 rolling weeks, dashed line = pace to finish in ~3 months) + time by tag (split evenly across a task's tags) + top tasks.
- Data: tasks are in React Query now (`queryKeys.skills.tasks`), each with `minutes` from one joined query; optimistic add/edit/status/delete/log/undo in `hooks/useSkillPage.ts`. New `skillInsightsAction.ts`; `skillTaskAction` reduced to get/add/update/delete; `timeLogAction` reduced to create/delete + 7-week rollup (removed 8 unused public actions); removed `getCurrentHours`/`getSkillBySlug`, `skillAnalyticsAction.ts`, `utils/format-time.ts`, `modals/DeleteModal.tsx`, the `@dnd-kit/*` deps.
- **Time zones fixed (P5 known limitation):** `TimeZoneCookie` writes `tz`; `lib/user-today.ts` gives the server the user's "today" (dashboard + skill insights); logs carry the browser's local date (server accepts ±2 days of now).
- Deviation: the date **timeline was removed** rather than restyled, because its only job was picking the day for the removed date filter. Weekly hours now live in Insights.
- *Original plan (kept for reference):*
- Purpose of the page: create tasks and log time on them, with as little friction as possible so the focus stays on the work.
- **Remove the Kanban** (`skilltodos/kanban/*`, the `@dnd-kit` dependency if nothing else uses it). Replace it with a **status list**: tasks grouped or filtered by **To do → Doing → Done**, with status changed by a click/shortcut, not by dragging. Keep the existing `status` column (`todo|in_progress|done`).
- **Remove the date box / date filter** on the workflow tab. **[new] Bug:** `SkillKanbanBoard.tsx:144-170` shows only tasks whose `date` equals the selected day, so in-progress or done tasks from earlier days disappear. All open tasks are always visible after the rebuild. The task `date` column becomes plain metadata ("created …").
- **Fast task creation:** an inline quick-add row (type a title + Enter), with description and tags optional and expandable. No modal for the common case.
- **Tags:** in the create/edit form, show clickable chips above the input: the skill's **recently used tags** plus **2–3 suggested tags** (most frequent across the user's tasks). Typing filters the chips; Enter creates a new tag. The tag input already receives `recentTags` (`skill-todo-form.tsx:103`) but only shows them while typing.
- **Fast time logging on each task:** quick chips (+15m / +30m / +1h) plus a custom amount ("1h 30m"), logged as "ended now"; undo toast instead of confirmations. **One time entry is capped at 3h**, enforced in the UI **and** in the zod schema of `createTimeLog` (`minutes` 1–180). Entering more shows a warning ("Max 3h per entry; split longer sessions") instead of failing silently. (Today it is a single fixed "+30m" button, `KanbanTaskCard.tsx:65`; no cap exists anywhere.)
- **Analytics tab redesign:** replace the stitched-together cards with a few useful views on P4 primitives (StatCard/Card+Well/Recharts via `ui/chart`): hours trend vs last period, time by task/tag, consistency, ETA to the target hours at the current pace, plus a short plain-language takeaway. Every widget has to answer "how am I doing / what should I do next".
- Skill header, timeline and dropdown menu moved onto the design system.

## P7 — Sandbox: the single deep-work project feature  (T1, T5, T12) — ✅ DONE 2026-11-08 (migrations 0024 + 0025 not applied)
- ✅ **Done:** `components/dashboard/sandbox/*` rebuilt from scratch on P4 primitives (all 13 old files deleted, plus the stray `BACKEND_PREP.md`).
  - **List** (`SandboxListView`): PageShell/PageHeader (count + hours in the last 7 days), brand "New sandbox", EmptyState, ghost add card, stagger motion. **Card** (`SandboxCard`): stretched `<Link>` (prefetch + `useLinkStatus` spinner), hours / target, SegmentedProgress with 20h markers, "Xh to the 40h milestone", Active/Completed badge, 14-day sparkline, and **quick-log chips +25m/+50m/+1h/+2h** that log without opening the sandbox (undo toast).
  - **Detail** (`SandboxDetailView`): back link, title, plain-language takeaway (pace → ETA, week vs last week), menu → Delete (confirm). **MilestoneDial**: SVG ring cut by a marker every 20h (wider multiples of 20h above 24 markers), animated progress, marker buttons with tooltips (reached / next / ahead), centre readout (hours, %, "12.5h to Type checker"). **QuickLogPanel**: optional title that remembers the last one, chips, custom duration ("1h 30m"), 3h cap + warning, **L** shortcut, "ends now on today's date". **MilestoneList**: every marker with reached / "Xh to go · date" / ~ETA at the 4-week pace; click a row or its dial marker to **name it inline** (Enter saves, Esc cancels, empty clears). Tabs: **Sessions** (grouped by day with totals; delete asks to confirm), **Insights** (finish estimate, last 7 days Δ, consistency, sessions + avg length, hours per week), **Resources** (paste a link → title/preview fetched; read/unread filter; remove with Undo).
  - Dialogs unified on `Dialog` (`SandboxDialogs.tsx`: create with target presets, delete confirm). Fixes UI-06 for sandbox.
- Data: React Query (`queryKeys.sandboxes.list/overview/logs/resources`, `detail(id)` prefix), server prefetch + `HydrationBoundary`, `hooks/useSandbox.ts` with optimistic create/delete, log/undo (bumps the list + overview + session list), milestone rename, resource add/remove/status. Actions return `{ success, error }` for mutations. `getSandboxes` = 2 grouped queries (totals via LEFT JOIN … GROUP BY + 14-day daily buckets), no N+1.
- Schema: `sandbox_logs` now `sandbox_id` (FK cascade, index with `logged_date`), `title` nullable, `minutes`, `logged_date` (local date at UTC midnight, like `timeLog`); phases, `phase_id` on logs/resources, start/end/duration and `sandboxes.current_hours` (a numeric(5,2) cache capped at 999.99h) are gone; totals are summed. New `sandbox_milestones` (only named markers stored). `assertPhaseOwner` and all phase actions removed; `deleteSandboxLog` scopes via a subquery on the user's sandboxes.
- Shared refactors: `buildProjectInsights` / `weeklyPace` / `etaAtPace` in `lib/insights.ts` (skill insights now use it too), `zLocalDate` in `lib/validation.ts` (also used by `createTimeLog`), `WeeklyHoursCard` extracted from `SkillInsightsTab` (now skips its animation under reduced motion), `ui/chip.tsx` extracted from the add-skill dialog.
- **Decision (owner, 2026-11-08):** sessions are stored as **minutes + date** like skills (no start/end times), so the "sessions that cross midnight" bullet is moot: a session belongs to the day it ended.
- Deviations: deleting a sandbox moved from the card to the detail page menu (keeps the card's one-tap logging uncluttered). The Analytics placeholder tab became a real Insights tab. Deleting a session asks for confirmation instead of Undo, because re-logging an older session would fail the ±2-day date check.
- *Original plan (kept for reference):*
- **Sandbox replaces 80-hour goals** (see P8 for the removal). Carry over the frictionless-logging ideas originally planned for goals (no timer, see Decisions): one-tap quick log (+25m / +50m / +1h / +2h) on the sandbox card and detail page; custom duration ("1h 30m") ending now by default; title optional (remembers the last one); keyboard shortcut; undo toast instead of confirmation dialogs; sessions that cross midnight; pace/ETA insight. Apply the same **3h cap + warning per entry** as P6.
- **Remove phases / the Structure tab.** Delete `sandbox-structure.tsx`, `add-phase-modal.tsx`, the phase actions, and the `assertPhaseOwner` helper. **Migration:** add `sandbox_logs.sandbox_id` (FK → sandboxes, cascade, indexed), backfill it from `sandbox_phases.sandbox_id`, drop `sandbox_logs.phase_id`, drop `sandbox_resources.phase_id`, then drop `sandbox_phases` (phase milestones are discarded; the owner approved). Logs now hang directly off the sandbox, which also simplifies the ownership checks.
- **Radial dial rebuilt cleanly** with **auto milestone markers every 20h** up to the target (20, 40, 60, …). The owner can **name any marker** (click the marker → inline label edit). Storage: a new `sandbox_milestones` table (`sandbox_id` FK cascade, `hour_mark` integer, `label` text, unique `(sandbox_id, hour_mark)`). Only named markers are stored; unnamed ones are derived. Show reached/next marker + ETA to the next marker.
- Keep resources (link previews via `safeFetchHtml`). Rebuild the list + detail pages on P4 primitives, unify the modals (UI-06), polish the resource command bar, and add consistent empty/loading states.

## P8 — Remove 80-hour goals + polish pass  (T8, T12, audit UI-01…07)
- **Remove 80-hour goals entirely; the existing goal data is deleted (the owner approved, no migration into sandboxes).** Delete `app/dashboard/80-hour-goals/`, `components/dashboard/80-hour-goals/`, `actions/goalActions.ts` + `goalLogActions.ts`, `hooks/useGoals.ts`, the goal keys in `lib/query-keys.ts`, the sidebar item in `nav-config.ts`, any goal references in overview analytics, and the `goals` + `goal_logs` tables (migration that drops them). UI-08 becomes obsolete. Update the CLAUDE.md route map and data model. (This can be done earlier, right after P7, so the sidebar never shows two overlapping features.)
- Help/settings built or removed from the nav (UI-07); sweep the remaining raw buttons, hex colors, and 8–9px text (UI-01/03/05); delete the legacy token aliases; final animation/transition pass; responsive + a11y check (focus rings, labels); restore `react-hooks/set-state-in-effect` to error.

## P9 — Landing page + sign-in experience  (T13)
- **Landing page redesign** (`app/page.tsx`, `components/layout/landingPage/*`: Navbar, Hero, HeroFoot, FeatureSection, ShowcaseCards, FaqSection, Footer). Keep the core idea: a personal place to track hours on skills, see honest progress, and run deep-work projects (sandboxes). **Not a generic industry/SaaS landing page** (no stock "trusted by" logos, fake metrics, testimonials, pricing tables or growth-hacking sections). It should feel like the app itself: the same P4 tokens, calm surfaces, panel-inside-panel, monospace numbers, and real UI built from the actual components (e.g. a static skill card, a dial with 20h markers, a StatCard), not screenshots or mock UI. Light + dark. Update the copy to match the post-refactor features (no 80-hour goals, no phases, no Kanban).
- Fix the undefined classes the landing page uses today (`bg-paper-blue`, `text-brand-orange`, `accent-electric`); move everything onto tokens. Review whether `Navigation.tsx` / `landingPage/Navbar.tsx` are both needed.
- **Sign-in flow, design + UX** (`components/auth/sign-in.tsx`, Better Auth Google OAuth):
  - Remove the fake 7-second "Signing in… 7s" countdown; show an honest pending state instead (spinner via a lucide icon, button disabled, "Redirecting to Google…").
  - **Errors are currently swallowed** (`console.log(error)` only). That is why the local login failure looked like nothing happened in the browser. Surface failures with a toast + retry, and handle the OAuth `?error=` callback.
  - Consider a dedicated, well-designed sign-in screen/dialog (app name, one-line value statement, a "Continue with Google" button with the proper Google mark, a privacy note), reachable from the landing CTAs.
  - Signed-in visitors on `/` see "Open dashboard" instead of "Sign in" (or are redirected). `proxy.ts` redirects signed-out `/dashboard/*` visits to `/`; preserve the intended path (`?next=`) and pass it as `callbackURL` after sign-in.
  - Sign-out: keep the redirect to `/`; make sure the theme handling after sign-out still makes sense with the new landing page.
- Order: after P8 by default. It's independent of the dashboard work, so the owner may pull it earlier.

## Decisions
- P1: ✅ Drop the daily-log tables and their data. ✅ Remove the fake landing-page screenshots/mock UI (`app-mockup.tsx`, `mock-ui.tsx`, fake testimonials).
- ✅ **No timer** (originally decided for goals, now applies to Sandbox in P7). The owner logs after the fact. Reduce friction with quick-log chips (+25m/+50m/+1h/+2h), optional/remembered title, "ended now" default, editable duration, undo toast. Drop the start/stop timer bullet.
- P5 (2026-11-08): ✅ Prioritize **week-over-week trend** and **streak + consistency**. ❌ Skip best day/time of day. Neglected-skill nudge and per-skill ETA are not prioritized (an ETA can still land on the skill page in P6).
- 2026-11-08 plan revision (owner):
  - ✅ **Remove 80-hour goals** and **delete their existing data** (no conversion into sandboxes). Sandbox is the one deep-work feature.
  - ✅ **Remove sandbox phases / Structure.** Keep **auto milestone markers every 20h** on the radial dial, and each marker can be **named** by the owner.
  - ✅ **No Kanban** on the skill page. Use a task **status list** (To do → Doing → Done).
  - ✅ **One time entry is capped at 3h** (UI + server validation), with a warning when the user tries to log more.
  - ✅ Remove the date box on the skill workflow tab. Tags get recent + suggested chips.

## Owner's original todos (verbatim intent)
- **T1** 80-hour goals: make logging hours/sprint time easy and smooth; the current flow causes friction and mental fatigue.
- **T2** Redesign the home dashboard to feel smooth, premium, easy on the eyes, clean, modern, cozy to navigate (inspiration in `public/design-inspiration/`). The current one feels congested and stressful. Keep dark/light themes but improve them.
- **T3** Remove the daily log feature, its schemas, and its sidebar item.
- **T4** Make data fetching and dashboard flow faster with React / React Query best practices.
- **T5** Redesign the Sandbox pages without losing core functionality. The radial dial idea is good but badly implemented. No design uniformity across the dashboard; bring it to the level of high-end productivity apps.
- **T6** Remove unused chart and icon libraries (one quality icon library only) and all dummy data.
- **T7** Remove gsap; use `motion` (successor to framer-motion).
- **T8** Add subtle animations/transitions so the app feels premium, smooth, and responsive.
- **T9** Charts/analytics should give insights (how the user is performing and what to do better), not just raw data.
- **T10** (2026-11-08) Redesign the skill cards (keep the colored progress chips but do them well). Clicking a card should give immediate feedback / a loading animation while the skill page opens.
- **T11** (2026-11-08) Rebuild the skill page: no Kanban, no date box, a better task-creation flow, tag suggestions (recent + 2–3 suggested), an efficient time-adding flow (quick chips, max 3h per entry with a warning), and useful analytics instead of copy-pasted cards.
- **T12** (2026-11-08) 80-hour goals duplicate Sandbox: remove goals (and their data), keep and improve Sandbox, remove phases/Structure, and keep auto 20h milestone markers that can be named on the radial dial.
- **T13** (2026-11-08) Redesign the landing page around the app's core idea (not an industry-style landing page) so it suits the application, and improve the login system and the login process design-wise.

---

# AUDIT ITEMS (detail referenced by the roadmap)

Severity: Critical = exploitable now · High = serious risk/slowdown · Medium = real but limited · Low = maintainability.

---

## Phase 0 — Dependency upgrades (Critical)
`pnpm audit` reports 6 critical, 73 high, 53 moderate, 10 low.

- [x] **SEC-09 [corrected] Upgrade `next` 16.1.6 → latest 16.x (above 16.4.0).** AUDIT.md cited only GHSA-26hh-7cqf-hhc6 (a middleware bypass), which is irrelevant because the app has no middleware. The advisories that matter are:
  - Critical RCE: GHSA-2464-fhr4-w9xw (Image Optimization + SVG, ≤16.4.0), GHSA-673q-mjm6-r5xr (`use cache`, ≤16.4.0), GHSA-2xp9-vwfh-vxw4 (AVIF, <16.3.3)
  - Server Actions: GHSA-mq59-m269-xvcx (null-origin CSRF bypass, <16.1.7), GHSA-m99w-x7hq-7vfj / GHSA-p3m5-59mp-jv5r (DoS)
  - Also bump `eslint-config-next` (still pinned to 15.3.0).
- [x] **SEC-10 [new] Upgrade `better-auth` 1.4.18 → ≥1.7.7.** GHSA-965c-763c-88jm (Critical, "OAuth state can be used as a Magic Link to sign in as another user") and GHSA-g38m-r43w-p2q7 (High, account takeover via OAuth auto-link) both affect the Google OAuth flow this app uses. Expect breaking changes, so regenerate the auth schema afterwards. → No API breakage. The regenerated schema adds only defaults + 3 indexes (`migrations/0022_better_auth_1_7.sql`, not applied); `verification` timestamps deliberately kept nullable.
- [x] **SEC-11 [new] Upgrade `drizzle-orm` 0.42 → ≥0.45.2** (GHSA-gpj5-g38j-94v9, SQL identifier escaping). Low practical risk here because the app builds no dynamic identifiers, but it's a cheap fix.
- [x] Re-run `pnpm audit` and the build after the upgrades. Remaining transitive issues (undici, brace-expansion, postcss, sharp…) should mostly clear up.

## Phase 1 — Authorization / IDOR (Critical–High)
Pattern: every action already checks that a session exists, but many never check **ownership**. Fix this in the data layer. Middleware is not the fix.

- [x] **SEC-01** `src/actions/sandboxActions.ts:45` — `deleteSandbox` deletes by id only. Add `and(eq(sandboxes.id, id), eq(sandboxes.userId, session.user.id))`.
- [x] **SEC-03 [expanded]** `src/app/dashboard/sandbox/[sandboxId]/page.tsx:29` — the sandbox is looked up by id only, and phases, logs, and resources are then loaded unscoped too. Scope the sandbox by owner and `notFound()` otherwise; load the children only after that check passes.
- [x] **SEC-07 [expanded]** `src/actions/sandboxActions.ts` — AUDIT.md listed only update/delete. Actually unscoped:
  - `createPhase` (:71), `updatePhase` (:106/:123), `deletePhase` (:130/:139)
  - `logSession` (:146, also updates `sandboxes` by id at :177)
  - `addResource` (:221), `getResources` (:252), `deleteResource` (:268/:277), `toggleResourceStatus` (:282/:296)
  - Fix: add one `assertSandboxOwner(sandboxId, userId)` helper and resolve phase/resource → sandbox → owner. Also verify that the `phaseId` passed in actually belongs to the given `sandboxId`.
- [x] **SEC-04** `src/actions/skillTaskAction.ts:94` — `addSkillTasks` trusts the client-supplied `skillId`. It then also updates that skill card by id only (:113), so the attacker can alter another user's hours too.
- [x] **SEC-05** `src/actions/timeLogAction.ts:44` — `createTimeLog` trusts `task_id`/`skill_id`, then updates `skillCard` by id only (:69). Verify that the task belongs to the user and to that skill.
- [x] **SEC-02** `src/actions/sandboxActions.ts:185` *(AUDIT said :187)* — `fetchResourceMetadata(url)` is an exported Server Action, which makes it a public POST endpoint with **no session check** and no URL validation (SSRF). Require a session, allow only `https:`, block private/loopback/link-local hosts, set a timeout, and cap the response size. Ideally make it a non-exported helper called from `addResource`. → Kept exported (the add-resource bar uses it for title preview) but it now requires a session and goes through `lib/safe-fetch.ts`: https + port 443 only, private/reserved IPs blocked **at connect time** (defeats DNS rebinding), redirects re-validated (max 3), 8s timeout, 1MB cap.
- [x] **SEC-12 [new]** No Server Action validates input: zod is used in 0 of the 56 exported actions (it's used only in `api/entries`). Add zod schemas at each action boundary, including protocol validation for `addResource.url` (rendered as `href` at `src/components/dashboard/sandbox/resource-card.tsx:118`).
- [x] **Shared helper**: replace the duplicated `getUserId()` copies (skillTaskAction.ts:12, timeLogAction.ts:13, others) with one `requireUser()` in `src/lib/` (marked `server-only`).

## Phase 2 — Auth hardening (Medium)
- [x] **SEC-06 [severity lowered High→Medium]** No `src/middleware.ts` (or `proxy.ts` on Next 16). Add an optimistic redirect for `/dashboard/*` for UX and defense in depth. It does **not** replace the Phase 1 checks.
- [ ] **SEC-08** *(Upstash packages removed in P1)* `package.json:26` — `@upstash/ratelimit` is installed but never imported. Rate-limit `fetchResourceMetadata`, the auth endpoints, and the mutation actions, or remove the packages.
- [x] **DES-07** Delete the 0-byte `src/actions/auth-middleware.ts`.

## Phase 3 — Visible bugs (fast wins)
- [x] **DES-01** `src/components/dashboard/analytics-components/WeeklyProgressChart.tsx:231-233` — profanity shown to users ("No hours logged , bitch ass", "slow ass work") **and** inverted logic: `weeklyChange > 20` (an improvement) shows the scolding message.
- [x] **DES-02** `src/components/modals/DeleteModal.tsx:105` — `onCanPlay={handleCancel}` should be `onClick`. The Cancel button currently does nothing.
- [x] **UI-04** *(fixed in P5; file since replaced by `home/SkillsSection.tsx`)* `src/components/dashboard/skillcardComponents/all-skill-cards.tsx:18,75` — the `filter` state is never applied to the rendered skills, and the dashed "Create new project" card has no handler.
- [ ] **UI-08** *(becomes obsolete when goals are removed in P8)* `src/app/dashboard/80-hour-goals/page.tsx:210-215` — "0 / 80 Hours" and "0%" are hardcoded. Compute them from `goal_logs`.
- [x] **DES-08 [expanded]** `src/app/globals.css:187` uses the undefined `var(--text-primary)`; globals.css:199 **and** `src/app/dashboard/layout.tsx` (`text-primary` on the wrapper) set every text color to the primary color. Switch to `text-foreground`.

## Phase 4 — Performance (High–Low)
- [x] **PERF-01** `src/actions/skillCardAction.ts:50` — N+1: one `sum(timeLog)` query per skill. *[corrected: these run in parallel via `Promise.all`, not sequentially, but it's still N+1.]* Replace with a single `LEFT JOIN … GROUP BY`.
- [x] **PERF-02** `src/actions/timeLogAction.ts:169-176` — `getTotalTimeForTasks` awaits one query per task in a `for…of` loop. Use `inArray` + `GROUP BY task_id`.
- [x] **PERF-03** `src/actions/timeLogAction.ts:466` — `getLastSevenWeeksProgress` runs 7 sequential queries. Use one ranged query and bucket the results.
- [x] **PERF-05 [corrected]** Indexes: `daily-log-schema.ts` already has 5 indexes. `schema.ts` and `sandbox-schema.ts` have none. Add indexes on `skillcard.user_id`, `skill_task(skill_id,user_id)`, `time_log(user_id,logged_date)`, `time_log(task_id)`, `time_log(skill_id)`, `goals.user_id`, `goal_logs(goal_id,user_id)`, `sandboxes.user_id`, `sandbox_phases.sandbox_id`, `sandbox_logs.phase_id`, `sandbox_resources.sandbox_id`.
- [~] **PERF-08** *(P2: `getCurrentUser` is wrapped in React `cache()`, so repeated lookups in one request should dedupe; confirm in P3)* `src/actions/overviewAnalyticsAction.ts:211` — 4 parallel `getSession` calls for one request. Resolve the user once and pass it down.
- [x] **PERF-04** Two chart libraries in the bundle. Port `WeeklyProgressChart` to Recharts and drop `echarts`/`echarts-for-react` (the ECharts version also has XSS advisory GHSA-fgmj-fm8m-jvvx).
- [x] **PERF-07** `src/actions/skillCardAction.ts:182` — the manual child deletes are redundant given `ON DELETE CASCADE` (schema.ts:39, :60). Delete the parent only.
- [x] **PERF-06** `src/db/drizzle.ts:11` — no `globalThis` pool singleton in dev. ~~**[new]** The `schema` object also omits `sandbox-schema`~~ **[corrected in P2]**: `schema.ts` re-exports `sandbox-schema`, so it *is* registered.

## Phase 5 — Architecture
- [x] **DES-03** Four data-fetching patterns (RQ+actions, RQ+REST, raw `useEffect`+`isMounted` in `useOverviewAnalytics.ts:48`/`useSkillAnalytics`, direct action calls in 80-hour-goals pages). Pick one: Server Components for reads, plus React Query only where client interactivity needs it.
- [x] **DES-04** `src/db/schema/schema.ts:24,73` — `slug` is globally unique on `skillCard` and `goals`. Make it unique per `(userId, slug)` (requires a migration).
- [x] **DES-09 [new]** No `error.tsx`, `loading.tsx` or `not-found.tsx` under `src/app/`. Add them at least to `dashboard/`.
- [x] **DES-06** Move `SkillHeader`, `SkillAnalytics`, `SkillDropdownMenu` (`src/app/dashboard/skills/`) and `help/DateChecker.tsx` into `src/components/`. This gets rid of the `../../../app/...` imports in `SkillPageWrapper.tsx`.
- [x] **DES-05** Dead code to delete (all verified as unimported): `components/dashboard/sidebar/demouserProfile.tsx` (558 lines), `lib/mock-80-hour-goals-store.ts`, `components/dashboard/goals-list/*`, `components/skeletons/NumberSkeleton.tsx`, `components/dashboard/skilltodos/ActivityTimeline.tsx` + `skill-activity-timeline.tsx`; deps `gsap`, `react-icons`.
- [ ] Add tests for the ownership checks in Phase 1. There are no tests at all today.

## Phase 6 — UI consistency
Inventory (verified counts): 112 raw `<button>` tags vs shadcn `Button` imported in 5 files; 65 distinct hex colors; `text-[10px]` ×64, `text-[9px]` ×29, `text-[8px]` ×4; 5 `<img>` tags.

- [x] **UI-02** `src/components/dashboard/sidebar/Sidebar.tsx:78` — hardcoded `bg-[#09090b] border-zinc-800 text-zinc-400` ignores the light theme. Use the `sidebar` tokens.
- [ ] **UI-01** Migrate the raw buttons to `<Button variant size>`.
- [ ] **UI-03** Replace the hex colors (worst offender: `daily-logs/ClockVisualizer.tsx`) with tokens.
- [ ] **UI-05** Set the minimum text size to `text-xs`; ban 8/9px.
- [x] **UI-06** *(skills side done in P5/P6, sandbox in P7; goals' `SprintSessionModal` disappears with P8)* Unify the modals (bottom drawer in `add-skill-modal.tsx`, plus custom `SprintSessionModal`, `EntryModal`, `AddPhaseModal`, `DeleteModal`, `DeleteSandboxModal`, and shadcn Dialog in `CreateSandboxModal`) onto one Dialog.
- [ ] **UI-07** `/dashboard/help` and `/dashboard/usersetting` are stubs (help renders a test `DateChecker` with indigo styling). Build them or hide them from the sidebar.

### Page consistency matrix (deviations to fix)
| Route | Title style | Container | Loading / empty | Notable deviation |
|---|---|---|---|---|
| `/dashboard` | ✅ P5: PageShell/PageHeader | ✅ | ✅ skeleton + EmptyState | — |
| `/dashboard/80-hour-goals` | `text-2xl font-bold text-foreground` | `max-w-400 p-6` | "Loading goals..." text | hardcoded 0% |
| `/dashboard/80-hour-goals/[goalId]` | `text-lg font-bold` | `max-w-7xl px-4 py-6` | "Loading reactor core..." | sci-fi styling |
| `/dashboard/sandbox` | ✅ P7: PageShell/PageHeader | ✅ | ✅ loading.tsx + EmptyState | — |
| `/dashboard/sandbox/[sandboxId]` | ✅ P7: PageShell/PageHeader | ✅ | ✅ loading.tsx + EmptyState | — |
| `/dashboard/skills/[slug]` | ✅ P6: PageShell/PageHeader | ✅ max-w-5xl | ✅ loading.tsx + EmptyState | — |
| `/dashboard/help`, `/usersetting` | bare / none | none | none | stubs |

### Target design baseline
- **Color**: shadcn semantic tokens only (`background`, `card`, `muted`, `border`, `foreground`, `muted-foreground`, `sidebar-*`), plus a single accent (blue-500/600) for progress.
- **Type**: page title `text-2xl font-bold tracking-tight`; section `text-lg font-semibold`; body `text-sm`; meta `text-xs text-muted-foreground`; nothing below 11px.
- **Layout**: one page shell, `mx-auto max-w-7xl p-6 space-y-6`; cards `p-5`; grid `gap-6`.
- **Shape**: cards `rounded-xl`, buttons/inputs `rounded-lg`, chips `rounded-full`; `shadow-sm` → `shadow-md` on hover.
- **One component per job**: `ui/button`, `ui/card`, `ui/dialog`, Recharts via `ui/chart`, lucide icons.

---

## Audit accuracy notes (what AUDIT.md got wrong or missed)
- Wrong: SEC-09 cited an irrelevant middleware-bypass CVE and missed the critical Next.js RCEs plus the critical Better Auth OAuth advisory.
- Under-scoped: SEC-03 and SEC-07 missed 6 more unscoped sandbox actions and the unscoped child loads on the detail page.
- Overstated: SEC-06 rated High, but middleware isn't an authorization layer; Medium is more accurate.
- Inaccurate: PERF-01 called "sequential" (it's parallel); PERF-05 "zero indexes" (daily-log tables are indexed); SEC-02 line number (185, not 187).
- Missed: no zod in any Server Action; no error/loading/not-found boundaries; `text-primary` on the dashboard layout. (The "drizzle client omits the sandbox schema" note was itself wrong: schema.ts re-exports it.)
- Confirmed accurate: DES-01, DES-02, DES-04, DES-05, DES-07, UI-01…UI-08 counts and locations, PERF-02/03/04/06/07/08, SEC-01, SEC-04, SEC-05, SEC-08.
