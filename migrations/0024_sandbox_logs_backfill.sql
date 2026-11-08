CREATE TABLE "sandbox_milestones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sandbox_id" uuid NOT NULL,
	"hour_mark" integer NOT NULL,
	"label" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sandbox_milestones_sandbox_hour_uq" UNIQUE("sandbox_id","hour_mark")
);
--> statement-breakpoint
ALTER TABLE "sandbox_logs" ADD COLUMN "sandbox_id" uuid;--> statement-breakpoint
ALTER TABLE "sandbox_logs" ADD COLUMN "minutes" integer;--> statement-breakpoint
ALTER TABLE "sandbox_logs" ADD COLUMN "logged_date" timestamp;--> statement-breakpoint
ALTER TABLE "sandbox_milestones" ADD CONSTRAINT "sandbox_milestones_sandbox_id_sandboxes_id_fk" FOREIGN KEY ("sandbox_id") REFERENCES "public"."sandboxes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sandbox_logs" ADD CONSTRAINT "sandbox_logs_sandbox_id_sandboxes_id_fk" FOREIGN KEY ("sandbox_id") REFERENCES "public"."sandboxes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "sandbox_logs_sandbox_date_idx" ON "sandbox_logs" USING btree ("sandbox_id","logged_date");--> statement-breakpoint
-- Hand-written backfill (P7): logs hang off the sandbox directly, stored as minutes + a calendar date.
-- Old sessions keep their sandbox (via their phase), their length and the UTC date they started on.
UPDATE "sandbox_logs" AS l SET "sandbox_id" = p."sandbox_id" FROM "sandbox_phases" AS p WHERE l."phase_id" = p."id";--> statement-breakpoint
UPDATE "sandbox_logs" SET "minutes" = GREATEST(ROUND("duration" * 60)::integer, 1), "logged_date" = date_trunc('day', "start_time");
