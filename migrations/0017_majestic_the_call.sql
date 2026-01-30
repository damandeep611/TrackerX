ALTER TABLE "goals" ADD COLUMN "completed_date" timestamp;--> statement-breakpoint
ALTER TABLE "skillTask" ADD COLUMN "status" varchar(20) DEFAULT 'todo' NOT NULL;