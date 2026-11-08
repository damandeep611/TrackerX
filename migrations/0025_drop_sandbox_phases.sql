-- P7: remove sandbox phases. Reordered by hand: drizzle-kit dropped the table (CASCADE) before
-- dropping the FK constraints that point at it, which would fail. Requires 0024 (backfill) first.
-- DESTRUCTIVE: phase titles/descriptions/milestones/allocations are discarded (owner approved).
ALTER TABLE "sandbox_logs" DROP CONSTRAINT "sandbox_logs_phase_id_sandbox_phases_id_fk";--> statement-breakpoint
ALTER TABLE "sandbox_resources" DROP CONSTRAINT "sandbox_resources_phase_id_sandbox_phases_id_fk";--> statement-breakpoint
DROP INDEX "sandbox_logs_phase_idx";--> statement-breakpoint
ALTER TABLE "sandbox_logs" ALTER COLUMN "sandbox_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sandbox_logs" ALTER COLUMN "minutes" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sandbox_logs" ALTER COLUMN "logged_date" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sandbox_logs" ALTER COLUMN "title" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "sandbox_logs" DROP COLUMN "phase_id";--> statement-breakpoint
ALTER TABLE "sandbox_logs" DROP COLUMN "start_time";--> statement-breakpoint
ALTER TABLE "sandbox_logs" DROP COLUMN "end_time";--> statement-breakpoint
ALTER TABLE "sandbox_logs" DROP COLUMN "duration";--> statement-breakpoint
ALTER TABLE "sandbox_resources" DROP COLUMN "phase_id";--> statement-breakpoint
-- current_hours was a numeric(5,2) cache (max 999.99h); totals are now summed from sandbox_logs.
ALTER TABLE "sandboxes" DROP COLUMN "current_hours";--> statement-breakpoint
DROP TABLE "sandbox_phases";
