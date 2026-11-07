# refactor-claude.md — TrackerX refactor plan

Source: AUDIT.md (2026-11-05), re-verified against the code on 2026-11-07. Corrections from that verification are noted inline (**[corrected]** / **[new]**).
Repo context lives in `CLAUDE.md`. Work top to bottom and tick items off as you go.

---

# ROADMAP (execution order)
This combines the owner's todos (T1–T9) with the audit items below. Implement **one phase at a time** and only when asked. Every phase ends with `pnpm build` + `pnpm lint` passing and `CLAUDE.md` updated if structure/conventions changed.
Order principle: delete first (less code to fix) → make it safe → make data fast → build a design system → redesign pages on top of it → polish.

## P1 — Cleanup & removals  (T3, T6, T7 + audit DES-05/07, DES-01, DES-02) — ✅ DONE 2026-11-07 (except applying migration 0021)
- ✅ **Remove Daily Logs (T3):** `app/dashboard/daily-logs/`, `components/dashboard/daily-logs/`, `hooks/useDailyLog.ts`, `app/api/entries/*`, `app/api/analytics/duration/`, `db/schema/daily-log-schema.ts` (+ drizzle.ts registration), `types/dailyLogTypes.ts`, `utils/dailyLogUtils.ts`, the sidebar item, and stray imports (skill-todo-card, skillDashboardTypes). Generate a migration that drops `entries` + `time_slots`. ⚠ This destroys data, so confirm before running it. → Generated as `migrations/0021_drop_daily_logs.sql`; **not applied yet** (run `pnpm migrate` after confirming).
- ✅ **Libraries (T6, T7):** port `WeeklyProgressChart` to Recharts and remove `echarts`/`echarts-for-react`. Remove `react-icons` and `gsap`. Keep **lucide-react** as the only icon set (already used in 60 files). Migrate `framer-motion` → **`motion`** (its renamed successor, `import { motion } from "motion/react"`, 49 files, mechanical swap). Remove the unused `@upstash/*` unless P2 wires them up. → Upstash removed (re-add in P2 if chosen). Also removed the now-unused `react-fast-marquee` + `react-hook-form`. `motion` is 14.x.
- ✅ **Dummy data (T6):** `lib/mock-80-hour-goals-store.ts`; fake landing-page testimonials with `randomuser.me` portraits (`testimonial-section.tsx`) + the `next.config.ts` remotePattern; mock UI on the landing page (`app-mockup.tsx`, `mock-ui.tsx`) to be kept or replaced by real screenshots (owner decides); any hardcoded stat values in dashboard widgets; the `help` DateChecker test stub. → Mockups + testimonials deleted, and the landing feature cards rewritten from fake "notes" features to the real ones. The only hardcoded stat left is UI-08 (goal-card 0/80), which stays in P6.
- ✅ **Dead code:** demouserProfile, goals-list/, NumberSkeleton, ActivityTimeline + skill-activity-timeline, auth-middleware.ts.
- ✅ **Embarrassing bugs:** DES-01 profanity + inverted logic, DES-02 `onCanPlay`.
- ✅ **[new] Lint was broken:** `next lint` doesn't exist in Next 16. The script is now `eslint .`, with `.next/` etc. ignored, and the 20 pre-existing lint errors (unused vars, unescaped quotes, one `any`) are fixed.

## P2 — Security & dependency upgrades  (audit Phase 0, 1, 2)
- Upgrade next, better-auth, drizzle-orm, eslint-config-next, then fix any breakage.
- `requireUser()` helper (`server-only`), ownership checks on every action (SEC-01/03/04/05/07), SSRF fix (SEC-02), zod at every action boundary (SEC-12).
- `proxy.ts` redirect for `/dashboard/*`; rate limit metadata fetching + mutations (or drop Upstash).
- Done before redesigns because the upgrades can break APIs that the UI work would build on.

## P3 — Data layer & fetching speed  (T4 + audit Phase 4, DES-03, DES-04, DES-09)
- DB: indexes, kill the N+1s/loops (PERF-01/02/03), one session lookup per request, per-user slug uniqueness, pool singleton.
- One fetching pattern: Server Components fetch + `HydrationBoundary` prefill React Query (no loading flash on first paint); a `queryKeys` factory; one hook per domain in `hooks/`; optimistic updates + targeted invalidation on mutations; remove raw `useEffect` fetching.
- `loading.tsx` (skeletons) / `error.tsx` / `not-found.tsx` for dashboard segments; `Suspense` around slow widgets.
- Move route-folder components into `components/` (DES-06).

## P4 — Design system foundation  (enables T2, T5, T8; audit Phase 6 baseline)
- Direction from `public/design-inspiration/`: calm near-black / soft-white neutral surfaces, **panel-inside-panel cards** with hairline borders, generous spacing, monospace tabular numerals for metrics, small inline bar sparklines, segmented progress bars, muted labels, a single accent per metric, delta chips ("+12% vs last week"), pill tab switchers. Keep light + dark themes.
- Tokens in `globals.css` (surface levels, border, accent, success/warn/danger), type scale, spacing, radius.
- Primitives: `Button`, `Card`/`Panel`, `StatCard`, `Dialog`/`Sheet`, `Input`, `Tabs`, `Badge`, `EmptyState`, `Skeleton`, `PageHeader`, `PageShell`.
- Motion presets (`lib/motion.ts`): page fade-in, list stagger, hover lift, number count-up, layout transitions; respect `prefers-reduced-motion`.
- Sidebar rebuilt on tokens (fixes light mode), with active states.

## P5 — Home dashboard redesign + insights  (T2, T9)
- Rebuild `/dashboard` on P4 primitives: header with greeting + range picker, KPI stat cards with sparklines and deltas, skills grid with segmented progress, working filters, a real "add skill" card.
- Insights rather than raw numbers: week-over-week trend, streaks, consistency score, best day/time, projected completion date per skill at the current pace, a "neglected skill" nudge, plain-language takeaways ("You're 3h behind last week; Rust hasn't been touched in 6 days").

## P6 — 80-Hour Goals: frictionless logging  (T1)
- Today: you have to open a detail page → open a modal → type a title → enter start/end times by hand, and only same-day sessions work.
- Target (no timer, see Decisions): one-tap quick log (+25m / +50m / +1h / +2h chips) right on the goal card; custom duration input ("1h 30m") ending now by default; title optional (remembers the last one); keyboard shortcut; undo toast instead of confirmation dialogs; sessions that cross midnight.
- Real progress on cards (fixes UI-08), milestone markers every 20h, pace/ETA insight. Restyle on P4.

## P7 — Sandbox redesign  (T5)
- Keep all functionality: phases, sessions, resources, and the radial dial (re-implemented cleanly). Rebuild the list + detail pages on P4 primitives, unify the modals, polish the tabs/command bar, and add consistent empty/loading states.

## P8 — Remaining pages + polish pass  (T8, T9, audit UI-01…07)
- Skill detail page (Kanban, timeline, analytics with insights) moved onto the system; help/settings built or removed from the nav; sweep the remaining raw buttons, hex colors, and 8–9px text; final animation/transition pass; responsive + a11y check (focus rings, labels).

## Decisions
- P1: ✅ Drop the daily-log tables and their data. ✅ Remove the fake landing-page screenshots/mock UI (`app-mockup.tsx`, `mock-ui.tsx`, fake testimonials).
- P6: ✅ **No timer.** The owner logs after the fact. Reduce friction with quick-log chips (+25m/+50m/+1h/+2h), optional/remembered title, "ended now" default, editable duration, undo toast. Drop the start/stop timer bullet.
- P5: ⏳ Which insights to prioritize. Ask at the start of the phase.

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

---

# AUDIT ITEMS (detail referenced by the roadmap)

Severity: Critical = exploitable now · High = serious risk/slowdown · Medium = real but limited · Low = maintainability.

---

## Phase 0 — Dependency upgrades (Critical)
`pnpm audit` reports 6 critical, 73 high, 53 moderate, 10 low.

- [ ] **SEC-09 [corrected] Upgrade `next` 16.1.6 → latest 16.x (above 16.4.0).** AUDIT.md cited only GHSA-26hh-7cqf-hhc6 (a middleware bypass), which is irrelevant because the app has no middleware. The advisories that matter are:
  - Critical RCE: GHSA-2464-fhr4-w9xw (Image Optimization + SVG, ≤16.4.0), GHSA-673q-mjm6-r5xr (`use cache`, ≤16.4.0), GHSA-2xp9-vwfh-vxw4 (AVIF, <16.3.3)
  - Server Actions: GHSA-mq59-m269-xvcx (null-origin CSRF bypass, <16.1.7), GHSA-m99w-x7hq-7vfj / GHSA-p3m5-59mp-jv5r (DoS)
  - Also bump `eslint-config-next` (still pinned to 15.3.0).
- [ ] **SEC-10 [new] Upgrade `better-auth` 1.4.18 → ≥1.7.7.** GHSA-965c-763c-88jm (Critical, "OAuth state can be used as a Magic Link to sign in as another user") and GHSA-g38m-r43w-p2q7 (High, account takeover via OAuth auto-link) both affect the Google OAuth flow this app uses. Expect breaking changes, so regenerate the auth schema afterwards.
- [ ] **SEC-11 [new] Upgrade `drizzle-orm` 0.42 → ≥0.45.2** (GHSA-gpj5-g38j-94v9, SQL identifier escaping). Low practical risk here because the app builds no dynamic identifiers, but it's a cheap fix.
- [ ] Re-run `pnpm audit` and the build after the upgrades. Remaining transitive issues (undici, brace-expansion, postcss, sharp…) should mostly clear up.

## Phase 1 — Authorization / IDOR (Critical–High)
Pattern: every action already checks that a session exists, but many never check **ownership**. Fix this in the data layer. Middleware is not the fix.

- [ ] **SEC-01** `src/actions/sandboxActions.ts:45` — `deleteSandbox` deletes by id only. Add `and(eq(sandboxes.id, id), eq(sandboxes.userId, session.user.id))`.
- [ ] **SEC-03 [expanded]** `src/app/dashboard/sandbox/[sandboxId]/page.tsx:29` — the sandbox is looked up by id only, and phases, logs, and resources are then loaded unscoped too. Scope the sandbox by owner and `notFound()` otherwise; load the children only after that check passes.
- [ ] **SEC-07 [expanded]** `src/actions/sandboxActions.ts` — AUDIT.md listed only update/delete. Actually unscoped:
  - `createPhase` (:71), `updatePhase` (:106/:123), `deletePhase` (:130/:139)
  - `logSession` (:146, also updates `sandboxes` by id at :177)
  - `addResource` (:221), `getResources` (:252), `deleteResource` (:268/:277), `toggleResourceStatus` (:282/:296)
  - Fix: add one `assertSandboxOwner(sandboxId, userId)` helper and resolve phase/resource → sandbox → owner. Also verify that the `phaseId` passed in actually belongs to the given `sandboxId`.
- [ ] **SEC-04** `src/actions/skillTaskAction.ts:94` — `addSkillTasks` trusts the client-supplied `skillId`. It then also updates that skill card by id only (:113), so the attacker can alter another user's hours too.
- [ ] **SEC-05** `src/actions/timeLogAction.ts:44` — `createTimeLog` trusts `task_id`/`skill_id`, then updates `skillCard` by id only (:69). Verify that the task belongs to the user and to that skill.
- [ ] **SEC-02** `src/actions/sandboxActions.ts:185` *(AUDIT said :187)* — `fetchResourceMetadata(url)` is an exported Server Action, which makes it a public POST endpoint with **no session check** and no URL validation (SSRF). Require a session, allow only `https:`, block private/loopback/link-local hosts, set a timeout, and cap the response size. Ideally make it a non-exported helper called from `addResource`.
- [ ] **SEC-12 [new]** No Server Action validates input: zod is used in 0 of the 56 exported actions (it's used only in `api/entries`). Add zod schemas at each action boundary, including protocol validation for `addResource.url` (rendered as `href` at `src/components/dashboard/sandbox/resource-card.tsx:118`).
- [ ] **Shared helper**: replace the duplicated `getUserId()` copies (skillTaskAction.ts:12, timeLogAction.ts:13, others) with one `requireUser()` in `src/lib/` (marked `server-only`).

## Phase 2 — Auth hardening (Medium)
- [ ] **SEC-06 [severity lowered High→Medium]** No `src/middleware.ts` (or `proxy.ts` on Next 16). Add an optimistic redirect for `/dashboard/*` for UX and defense in depth. It does **not** replace the Phase 1 checks.
- [ ] **SEC-08** *(Upstash packages removed in P1)* `package.json:26` — `@upstash/ratelimit` is installed but never imported. Rate-limit `fetchResourceMetadata`, the auth endpoints, and the mutation actions, or remove the packages.
- [x] **DES-07** Delete the 0-byte `src/actions/auth-middleware.ts`.

## Phase 3 — Visible bugs (fast wins)
- [x] **DES-01** `src/components/dashboard/analytics-components/WeeklyProgressChart.tsx:231-233` — profanity shown to users ("No hours logged , bitch ass", "slow ass work") **and** inverted logic: `weeklyChange > 20` (an improvement) shows the scolding message.
- [x] **DES-02** `src/components/modals/DeleteModal.tsx:105` — `onCanPlay={handleCancel}` should be `onClick`. The Cancel button currently does nothing.
- [ ] **UI-04** `src/components/dashboard/skillcardComponents/all-skill-cards.tsx:18,75` — the `filter` state is never applied to the rendered skills, and the dashed "Create new project" card has no handler.
- [ ] **UI-08** `src/app/dashboard/80-hour-goals/page.tsx:210-215` — "0 / 80 Hours" and "0%" are hardcoded. Compute them from `goal_logs`.
- [ ] **DES-08 [expanded]** `src/app/globals.css:187` uses the undefined `var(--text-primary)`; globals.css:199 **and** `src/app/dashboard/layout.tsx` (`text-primary` on the wrapper) set every text color to the primary color. Switch to `text-foreground`.

## Phase 4 — Performance (High–Low)
- [ ] **PERF-01** `src/actions/skillCardAction.ts:50` — N+1: one `sum(timeLog)` query per skill. *[corrected: these run in parallel via `Promise.all`, not sequentially, but it's still N+1.]* Replace with a single `LEFT JOIN … GROUP BY`.
- [ ] **PERF-02** `src/actions/timeLogAction.ts:169-176` — `getTotalTimeForTasks` awaits one query per task in a `for…of` loop. Use `inArray` + `GROUP BY task_id`.
- [ ] **PERF-03** `src/actions/timeLogAction.ts:466` — `getLastSevenWeeksProgress` runs 7 sequential queries. Use one ranged query and bucket the results.
- [ ] **PERF-05 [corrected]** Indexes: `daily-log-schema.ts` already has 5 indexes. `schema.ts` and `sandbox-schema.ts` have none. Add indexes on `skillcard.user_id`, `skill_task(skill_id,user_id)`, `time_log(user_id,logged_date)`, `time_log(task_id)`, `time_log(skill_id)`, `goals.user_id`, `goal_logs(goal_id,user_id)`, `sandboxes.user_id`, `sandbox_phases.sandbox_id`, `sandbox_logs.phase_id`, `sandbox_resources.sandbox_id`.
- [ ] **PERF-08** `src/actions/overviewAnalyticsAction.ts:211` — 4 parallel `getSession` calls for one request. Resolve the user once and pass it down.
- [x] **PERF-04** Two chart libraries in the bundle. Port `WeeklyProgressChart` to Recharts and drop `echarts`/`echarts-for-react` (the ECharts version also has XSS advisory GHSA-fgmj-fm8m-jvvx).
- [ ] **PERF-07** `src/actions/skillCardAction.ts:182` — the manual child deletes are redundant given `ON DELETE CASCADE` (schema.ts:39, :60). Delete the parent only.
- [ ] **PERF-06** `src/db/drizzle.ts:11` — no `globalThis` pool singleton in dev. **[new]** The `schema` object also omits `sandbox-schema`, so `db.query.sandboxes…` isn't available.

## Phase 5 — Architecture
- [ ] **DES-03** Four data-fetching patterns (RQ+actions, RQ+REST, raw `useEffect`+`isMounted` in `useOverviewAnalytics.ts:48`/`useSkillAnalytics`, direct action calls in 80-hour-goals pages). Pick one: Server Components for reads, plus React Query only where client interactivity needs it.
- [ ] **DES-04** `src/db/schema/schema.ts:24,73` — `slug` is globally unique on `skillCard` and `goals`. Make it unique per `(userId, slug)` (requires a migration).
- [ ] **DES-09 [new]** No `error.tsx`, `loading.tsx` or `not-found.tsx` under `src/app/`. Add them at least to `dashboard/`.
- [ ] **DES-06** Move `SkillHeader`, `SkillAnalytics`, `SkillDropdownMenu` (`src/app/dashboard/skills/`) and `help/DateChecker.tsx` into `src/components/`. This gets rid of the `../../../app/...` imports in `SkillPageWrapper.tsx`.
- [x] **DES-05** Dead code to delete (all verified as unimported): `components/dashboard/sidebar/demouserProfile.tsx` (558 lines), `lib/mock-80-hour-goals-store.ts`, `components/dashboard/goals-list/*`, `components/skeletons/NumberSkeleton.tsx`, `components/dashboard/skilltodos/ActivityTimeline.tsx` + `skill-activity-timeline.tsx`; deps `gsap`, `react-icons`.
- [ ] Add tests for the ownership checks in Phase 1. There are no tests at all today.

## Phase 6 — UI consistency
Inventory (verified counts): 112 raw `<button>` tags vs shadcn `Button` imported in 5 files; 65 distinct hex colors; `text-[10px]` ×64, `text-[9px]` ×29, `text-[8px]` ×4; 5 `<img>` tags.

- [ ] **UI-02** `src/components/dashboard/sidebar/Sidebar.tsx:78` — hardcoded `bg-[#09090b] border-zinc-800 text-zinc-400` ignores the light theme. Use the `sidebar` tokens.
- [ ] **UI-01** Migrate the raw buttons to `<Button variant size>`.
- [ ] **UI-03** Replace the hex colors (worst offender: `daily-logs/ClockVisualizer.tsx`) with tokens.
- [ ] **UI-05** Set the minimum text size to `text-xs`; ban 8/9px.
- [ ] **UI-06** Unify the modals (bottom drawer in `add-skill-modal.tsx`, plus custom `SprintSessionModal`, `EntryModal`, `AddPhaseModal`, `DeleteModal`, `DeleteSandboxModal`, and shadcn Dialog in `CreateSandboxModal`) onto one Dialog.
- [ ] **UI-07** `/dashboard/help` and `/dashboard/usersetting` are stubs (help renders a test `DateChecker` with indigo styling). Build them or hide them from the sidebar.

### Page consistency matrix (deviations to fix)
| Route | Title style | Container | Loading / empty | Notable deviation |
|---|---|---|---|---|
| `/dashboard` | `text-2xl font-bold text-white` (hardcoded white) | `p-4` | custom bars | broken filters |
| `/dashboard/80-hour-goals` | `text-2xl font-bold text-foreground` | `max-w-400 p-6` | "Loading goals..." text | hardcoded 0% |
| `/dashboard/80-hour-goals/[goalId]` | `text-lg font-bold` | `max-w-7xl px-4 py-6` | "Loading reactor core..." | sci-fi styling |
| `/dashboard/daily-logs` | date pill, no title | `h-[calc(100vh-2rem)] p-6` | pulse circle | fixed height, no scroll |
| `/dashboard/sandbox` | `text-2xl font-bold` | `p-6` | dashed empty state | only page using shadcn Button |
| `/dashboard/sandbox/[sandboxId]` | breadcrumb + radial | `p-6` | none | tabbed layout |
| `/dashboard/skills/[slug]` | `SkillHeader` | `p-6 max-w-[1600px]` | "Skill Not found..." | Kanban |
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
- Missed: no zod in any Server Action; no error/loading/not-found boundaries; drizzle client omits the sandbox schema; `text-primary` on the dashboard layout.
- Confirmed accurate: DES-01, DES-02, DES-04, DES-05, DES-07, UI-01…UI-08 counts and locations, PERF-02/03/04/06/07/08, SEC-01, SEC-04, SEC-05, SEC-08.
