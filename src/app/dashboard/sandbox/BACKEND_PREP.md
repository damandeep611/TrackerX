# Backend Preparation Plan for Sandbox Module

## Overview
This document outlines the necessary steps, schema changes, and refactoring required to transition the Sandbox "Structure" and "Workspace" tabs from a frontend-only demo to a fully persisted backend solution.

## 1. Database Schema Extensions (`src/db/schema/sandbox-schema.ts`)

The current `sandboxes` table is insufficient. We need to introduce two new entities: `phases` and `sandbox_logs` (or `activity_logs`).

### New Table: `sandbox_phases`
- **id**: UUID (PK)
- **sandbox_id**: UUID (FK -> sandboxes.id, onDelete: cascade)
- **title**: Text
- **description**: Text
- **milestones**: Text[] (Postgres Array) or JSONB. *Recommendation: Text[]*
- **allocated_hours**: Integer or Numeric
- **order_index**: Integer (To maintain Phase 1, Phase 2 sequence)
- **created_at**: Timestamp

### New Table: `sandbox_logs`
- **id**: UUID (PK)
- **phase_id**: UUID (FK -> sandbox_phases.id, onDelete: cascade)
- **title**: Text
- **start_time**: Timestamp (Stores full date+time)
- **end_time**: Timestamp (Stores full date+time)
- **duration**: Numeric (Stored in hours, e.g., 1.5)
- **created_at**: Timestamp

### Updates to `sandboxes` Table
- Ensure `current_hours` is treated as a **cached aggregate**. It should be updated whenever a log is added/edited/deleted, or we should switch to computing it on the fly if performance allows (likely fine for this scale).

## 2. Type Definitions & Interfaces
The frontend interfaces in `sandbox-detail-view.tsx` need to be aligned with the DB schema.

**Current (Frontend Only):**
```typescript
export interface Phase {
  id: number; // Mismatch: DB uses UUID
  milestones: string[];
  // ...
}

export interface ActivityLog {
  id: string; 
  phaseId: number; // Mismatch: DB uses UUID
  startTime: string; // Mismatch: "HH:mm" string is insufficient for history
  endTime: string;
  date: string; // Redundant if start_time is a timestamp
  // ...
}
```

**Required Changes:**
- Update `Phase.id` to `string` (UUID).
- Update `ActivityLog.phaseId` to `string` (UUID).
- Refactor `startTime` and `endTime` in `ActivityLog` to be `Date` objects or ISO strings representing the full timestamp.
- Add `orderIndex` to `Phase` interface.

## 3. Server Actions (`src/actions/sandboxActions.ts`)

We need to implement the following server actions:

**Phases:**
- `createPhase(sandboxId: string, data: CreatePhaseData)`: Should calculate `order_index` automatically (max(order_index) + 1).
- `updatePhase(phaseId: string, data: UpdatePhaseData)`
- `deletePhase(phaseId: string)`
- `reorderPhases(sandboxId: string, orderedIds: string[])`: (Optional, for future drag-and-drop)

**Logs:**
- `logSession(phaseId: string, data: LogSessionData)`:
    - Inserts the log.
    - **CRITICAL:** Must also update the `current_hours` on the parent `sandbox` entity (increment) to keep the dashboard stats fast.
    - *Alternative:* Use a database trigger, but explicit transaction in Server Action is easier to maintain in application code.

## 4. Frontend Refactoring Strategy

### `SandboxDetailView.tsx`
- **State Management:** Replace `useState<Phase[]>` and `useState<ActivityLog[]>` with data fetched from the server.
- **Initial Load:** The page component (`page.tsx`) should fetch `sandbox`, `phases`, and `logs` in parallel and pass them down.
    - *Optimization:* Fetch `phases` with `logs` included (using Drizzle's `with: { logs: true }`).

### `SandboxStructure.tsx`
- **Add Phase:** Replace local `setPhases` with a call to `createPhase` server action.
- **Optimistic Updates:** Use `useOptimistic` or React Query's optimistic updates to make adding phases feel instant.

### `SandboxWorkspace.tsx`
- **Log Session:** `handleSaveSession` currently generates a random ID. Update this to call `logSession` server action.
- **Time Calculation:** Update logic to handle `Date` objects instead of just "HH:mm" strings to ensure duration calculations remain accurate across different dates.

## 5. Potential Pitfalls to Avoid

1.  **Timezone Issues:** Storing "HH:mm" without a date or timezone is risky. Always store UTC Timestamps for `start_time` and `end_time`. Convert to local time on the client for display.
2.  **Orphaned Data:** Ensure `onDelete: "cascade"` is set in the Drizzle schema. Deleting a Sandbox MUST delete all Phases and Logs. Deleting a Phase MUST delete all its Logs.
3.  **Order Stability:** Without an `order_index` column, phases might jump around when the page is refreshed.
4.  **Floating Point Math:** When aggregating `duration` (e.g., 0.1 + 0.2), watch out for precision errors. Use `numeric` type in Postgres and handle formatting (toFixed) on the frontend.

## 6. Recommended Implementation Steps

1.  **Schema:** Create `src/db/schema/sandbox-phases.ts` (or add to `sandbox-schema.ts`) and run migrations.
2.  **Actions:** Create basic CRUD actions.
3.  **Refactor Parent:** Update `SandboxDetailView` to accept initial data props.
4.  **Refactor Children:** Update `SandboxStructure` and `SandboxWorkspace` to use the real data types and call Server Actions.
