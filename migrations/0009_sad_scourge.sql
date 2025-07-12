ALTER TABLE "skillcard" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "skillcard" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;