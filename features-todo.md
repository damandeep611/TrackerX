# features-todo.md — TrackerX follow-ups

Open items left after the refactor (P1–P9, see `refactor-claude.md`). Pick one at a time; each should end with `pnpm build` + `pnpm lint` passing and `CLAUDE.md` updated if structure changes.

## 1. Rate limiting (audit SEC-08)
Nothing is rate-limited today. Upstash (`@upstash/ratelimit` + `@upstash/redis`) was removed in P1 because it was never wired up; the env var names `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` are still in `.env.example`.
- [ ] Decide the backend: Upstash Redis (works on Vercel serverless, needs an account + env vars) vs. a simple Postgres-backed counter (no new service, more DB writes).
- [ ] **`fetchResourceMetadata`** (`src/actions/sandboxActions.ts`): the most important one. It fetches arbitrary URLs server-side (SSRF-safe via `lib/safe-fetch.ts`, but still outbound traffic per call). Suggested: ~20 requests / minute / user.
- [ ] **Auth endpoints** (`/api/auth/[...all]`): Better Auth has a built-in `rateLimit` option in `lib/auth.ts`; enable it (needs a shared store such as the database or Redis on serverless, since in-memory limits don't survive across instances).
- [ ] **Mutations** (create task / log time / log session / add resource): a generous per-user limit (e.g. 120 / minute) to stop scripted abuse without affecting normal use.
- [ ] Return a clear error (`{ success: false, error: "Too many requests, try again in a minute" }`) so the existing toasts show it.

## 2. Tests
There is no test suite. Start where a bug would hurt most: data isolation between users.
- [ ] Pick a runner: Vitest (fast, TS-native) is the natural fit for a Next.js + TS app.
- [ ] Decide the DB strategy: a separate Neon branch for tests (closest to prod), or PGlite / a local Postgres in Docker for offline runs.
- [ ] **Ownership checks** (`src/lib/ownership.ts` + every Server Action): user B must not be able to read, update or delete user A's skills, tasks, time logs, sandboxes, sessions, milestones or resources, even with valid ids. Cover `getOwnedSkill`, `getOwnedTask`, `assertSandboxOwner`, `assertResourceOwner`, `deleteSandboxLog` (subquery scope), `setMilestoneLabel`.
- [ ] **Input validation**: the 3h cap (`minutes` 1–180) in `createTimeLog` / `logSandboxSession`, `zLocalDate` (±2 days), `zHttpUrl`, `safeNext` (only `/dashboard…`, no `//` or `\`).
- [ ] **Pure logic** (no DB, quick wins): `lib/insights.ts` (streaks, consistency, `projectEta`, takeaway sentences), `lib/milestones.ts` (`buildMarkers`, `markerStep`), `lib/duration.ts` (`parseDuration` formats).
- [ ] Add a `pnpm test` script and run it in CI (GitHub Actions) on pushes to `main`.
