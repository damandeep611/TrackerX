ALTER TABLE "goals" ADD COLUMN "slug" text NOT NULL;--> statement-breakpoint
ALTER TABLE "goals" DROP COLUMN "days_to_complete";--> statement-breakpoint
ALTER TABLE "goals" DROP COLUMN "reflection_note";--> statement-breakpoint
ALTER TABLE "goals" DROP COLUMN "is_completed";--> statement-breakpoint
ALTER TABLE "goals" ADD CONSTRAINT "goals_slug_unique" UNIQUE("slug");