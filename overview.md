# Project Overview: TrackerX

TrackerX is a skill tracking and productivity dashboard designed to help users manage their skills, tasks, and goals. It allows users to create "Skill Cards," track time spent on specific skills, manage daily routines, and set long-time goals.

## Tech Stack

-   **Framework:** Next.js 15 (App Router)
-   **Language:** TypeScript
-   **Database:** PostgreSQL (via Neon serverless)
-   **ORM:** Drizzle ORM
-   **Authentication:** better-auth (Google OAuth)
-   **Styling:** Tailwind CSS
-   **State/Data Fetching:** TanStack Query (React Query)
-   **UI Components:** Radix UI primitives, Lucide React icons, Framer Motion, Recharts/ECharts for analytics.

## Architecture

The application follows the standard Next.js 15 App Router architecture.

### Directory Structure

-   **`src/app`**: Contains the application routes and pages.
    -   `page.tsx`: The landing page.
    -   `dashboard/`: The main authenticated area of the app.
    -   `api/`: API routes (primarily for authentication via `better-auth` and some specific skill endpoints).
-   **`src/actions`**: Server Actions used for data mutations and fetching. This is the primary interface between the UI and the database.
-   **`src/components`**: Reusable UI components, categorized by feature (e.g., `dashboard`, `auth`, `ui` for shadcn/radix primitives).
-   **`src/db`**: Database configuration and schema definitions.
    -   `schema/`: Drizzle schema definitions (`schema.ts`, `auth-schema.ts`).
-   **`src/lib`**: Utility functions and library configurations (e.g., `auth.ts`, `auth-client.ts`).

### Data Flow

1.  **Database**: The application uses a PostgreSQL database. The schema is defined in `src/db/schema` using Drizzle ORM.
2.  **Server Actions**: Most data interactions happen via Next.js Server Actions located in `src/actions`. These functions run on the server, interact directly with the database using Drizzle, and return data to the client.
3.  **Client Components**: React components (mostly Client Components in `src/components`) use these Server Actions to fetch data or perform mutations. TanStack Query is likely used to manage the async state of these operations (caching, loading states, etc.).

## Key Features

-   **Skill Tracking**: Users can create skills, assign target hours, and track progress.
-   **Task Management**: General tasks and skill-specific tasks (`skillTask`).
-   **Time Logging**: Logging time against specific tasks and skills (`timeLog`).
-   **Analytics**: Visualizing progress and time distribution.
-   **Goals**: Setting and tracking long-term goals.

---

## New Developer Guide

### Getting Started

1.  **Prerequisites**: Node.js, npm/pnpm/yarn.
2.  **Environment Setup**:
    -   Create a `.env` file in the root directory.
    -   Add the necessary environment variables (likely `DATABASE_URL` for Neon/Postgres, and Google OAuth credentials for `better-auth`).
3.  **Installation**: Run `npm install` to install dependencies.
4.  **Database Setup**:
    -   Run `npm run generate` to generate Drizzle migrations.
    -   Run `npm run migrate` to apply migrations to your database.
5.  **Running the App**: Run `npm run dev` to start the development server.

### Understanding the Database

Check `src/db/schema/schema.ts` to understand the relationships.
-   `skillCard`: The central entity.
-   `skillTask`: Tasks belonging to a skill.
-   `timeLog`: Records of time spent on a `skillTask`, linked to a `skillCard`.

---

## Codebase Analysis & Improvements

### Wrong Practices & Production Risks

1.  **N+1 Query Problem (`src/actions/skillCardAction.ts`)**:
    -   **Issue**: The `getSkillCard` action fetches all skills for a user and then iterates through them, performing a separate database query *inside the loop* to calculate progress or fetch related data.
    -   **Impact**: As the number of skills grows, the number of database queries grows linearly (1 + N), causing significant performance degradation and latency.
    -   **Fix**: Refactor this to use a single SQL query with `JOIN` and `GROUP BY` (or Drizzle's `with` API) to fetch skills and their aggregated data in one go.

2.  **Data Inconsistency (Denormalization)**:
    -   **Issue**: The `currentHours` field in the `skillCard` table is updated manually in code (denormalized) rather than being purely calculated from the `timeLog` table.
    -   **Impact**: If a `timeLog` is added, updated, or deleted without correctly updating the corresponding `skillCard.currentHours`, the data will become out of sync. The user will see incorrect totals.
    -   **Fix**:
        -   *Option A (Read-heavy)*: Remove `currentHours` from `skillCard` and calculate it dynamically in the SQL query when fetching skills.
        -   *Option B (Write-heavy)*: Use database triggers to automatically update `currentHours` whenever `timeLog` changes, ensuring ACID compliance.

3.  **Type Safety**:
    -   **Issue**: Usage of `process.env.VARIABLE as string` (or similar type assertions) allows the app to crash at runtime if an environment variable is missing.
    -   **Fix**: Use a validation library like `zod` (e.g., `t3-env` pattern) to validate environment variables at build/startup time.

4.  **Error Handling**:
    -   **Issue**: Error handling in Server Actions is often basic or missing.
    -   **Fix**: Implement a standardized error handling wrapper or pattern to catch database errors and return user-friendly error messages to the client.

### Recommendations for Improvement

1.  **Refactor Data Fetching**: Prioritize fixing the N+1 query in `skillCardAction.ts`. This is the most critical performance bottleneck.
2.  **Centralize Data Logic**: Ensure that logic for calculating "hours spent" lives in one place (preferably the database query or a dedicated service function) to avoid inconsistency.
3.  **Validation**: Add input validation (using Zod) for all Server Actions to ensure data integrity before it reaches the database.

---

## Recent Implementation: 80-Hour Sprint Dashboard

A specialized module for tracking deep-work sprints ("Reactor Core" theme) has been added.

### Key Components
*   **`SprintGauge.tsx`**: A large (500px), interactive radial visualizer with 80 ticks and milestone markers (20h, 40h, 60h).
*   **`SprintSessionModal.tsx`**: A simplified modal for logging activity sessions (Title, Start Time, End Time).
*   **`SprintHistory.tsx`**: A chronological feed of recent logs displaying duration velocity (e.g., +2.5h).
*   **Page**: `src/app/dashboard/80-hour-goals/[goalId]/page.tsx` features a split layout (Gauge left, History right).

### Database Changes
*   **New Table**: `goal_logs` (Linked to `goals` via `goalId`).
    *   Fields: `id`, `goalId`, `userId`, `title`, `startTime`, `endTime`, `durationMinutes`, `createdAt`.
*   **Logic**: Duration is calculated server-side in `goalLogActions.ts` to ensure consistency.

### Styling
*   **Theming**: Fully compatible with Light/Dark modes using global CSS variables (`text-primary`, `bg-background`).
*   **Design**: High-contrast "Mission Control" aesthetic with neon glows and cinematic typography.
