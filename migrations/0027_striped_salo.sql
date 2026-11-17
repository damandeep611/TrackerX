CREATE TABLE "tracker_days" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"date" date NOT NULL,
	"available_minutes" integer,
	"reminder" text,
	"learned" text,
	"carry_in_handled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tracker_days_user_date_uq" UNIQUE("user_id","date")
);
--> statement-breakpoint
CREATE TABLE "tracker_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"day_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"title" text NOT NULL,
	"notes" text,
	"estimate_minutes" integer,
	"actual_minutes" integer,
	"done" boolean DEFAULT false NOT NULL,
	"carry" boolean DEFAULT true NOT NULL,
	"carried_from" date,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tracker_tomorrow" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"day_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"title" text NOT NULL,
	"estimate_minutes" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tracker_days" ADD CONSTRAINT "tracker_days_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tracker_tasks" ADD CONSTRAINT "tracker_tasks_day_id_tracker_days_id_fk" FOREIGN KEY ("day_id") REFERENCES "public"."tracker_days"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tracker_tomorrow" ADD CONSTRAINT "tracker_tomorrow_day_id_tracker_days_id_fk" FOREIGN KEY ("day_id") REFERENCES "public"."tracker_days"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "tracker_tasks_day_position_idx" ON "tracker_tasks" USING btree ("day_id","position");--> statement-breakpoint
CREATE INDEX "tracker_tomorrow_day_position_idx" ON "tracker_tomorrow" USING btree ("day_id","position");