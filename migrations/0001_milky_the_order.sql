CREATE TABLE "skillcard" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"skill_name" text NOT NULL,
	"category" text NOT NULL,
	"target-hours" integer NOT NULL,
	"current-hours" integer NOT NULL,
	"skill-color" text NOT NULL,
	"user_id" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "skillcard" ADD CONSTRAINT "skillcard_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;