# GEMINI.md - TrackerX (BuildXSkill) Context

## Project Overview
TrackerX is a productivity and skill-tracking dashboard built with **Next.js 15 (App Router)**. It allows users to track skills, log time, manage tasks, and view analytics.

## Tech Stack
- **Framework:** Next.js 15 RC, React 19, TypeScript
- **Styling:** Tailwind CSS 4, Radix UI, Framer Motion
- **Database:** PostgreSQL (Neon) via **Drizzle ORM**
- **Auth:** `better-auth` (Google OAuth)
- **State/Fetching:** TanStack Query (React Query) + Server Actions
- **Charts:** Recharts, ECharts

## Architecture & Patterns

### Data Fetching
- **Primary Pattern:** Client Components -> Custom Hooks (React Query) -> Adapter (`src/lib/api/*.ts`) -> **Server Actions** (`src/actions/*.ts`) -> Database.
- **Server Actions:** Located in `src/actions/`. Used for both data fetching (read) and mutations (write).
- **API Routes:** `src/app/api/` exists but is secondary. The project primarily calls Server Actions directly from the client via the adapter pattern to leverage React Query's caching.
- **Adapter:** `src/lib/api/skillCardApi.ts` wraps Server Actions (e.g., `getSkillCard`) to be used as standard async functions for React Query.

### Database Schema (`src/db/schema/schema.ts`)
- **`skillCard`**: Core entity (Skill Name, Target Hours, Color).
- **`skillTask`**: Tasks linked to a specific `skillCard`.
- **`task`**: Standalone tasks (not linked to a skill).
- **`timeLog`**: Tracks time spent. Links to `skillTask` OR `skillCard`.
- **`dailyRoutine`**: Tracks daily available hours.
- **`goals`**: Long-term user goals.

### Dashboard Structure (`src/app/dashboard/`)
The main dashboard is composed of:
1.  **Page:** `src/app/dashboard/page.tsx` (Wraps `SkillDashboard`)
2.  **Main View:** `src/components/dashboard/skillcardComponents/all-skill-cards.tsx` (`SkillDashboard`)
    - **Header:** `DashboardHeader`
    - **Stats:** `OverviewCards`, `InsightsCards`
    - **Content:** Grid of `SkillCard` components
    - **Actions:** `AddSkillModal`

## Key Files & Logic
- **`src/actions/skillCardAction.ts`**:
    - `getSkillCard()`: Fetches skills & calculates `currentHours` dynamically from `timeLog` (Note: Contains N+1 query pattern via `Promise.all` mapping).
    - `addSkillCard()`, `deleteSkillCard()`: Standard CRUD.
- **`src/lib/api/skillCardApi.ts`**: Bridge file containing `SkillCardApi` object with methods like `getAllSkills`, `getSkillCurrentHours`.
- **`src/hooks/useSkillCardsHook.ts`**: React Query hooks consuming `SkillCardApi`.

## Current Observations
- **Optimization Needed:** `getSkillCard` manually aggregates time logs for every skill in a loop.
- **Refactoring:** Comments suggest a plan to standardize API interactions, possibly moving more logic to `app/api`.
- **Styling:** Comprehensive dark mode support using Tailwind classes.