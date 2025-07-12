CREATE TABLE "timelog" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"skill_id" uuid NOT NULL,
	"minutes" integer NOT NULL,
	"logged_date" timestamp DEFAULT now() NOT NULL,
	"tracked_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "skillTask" DROP CONSTRAINT "skillTask_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "skillTask" DROP CONSTRAINT "skillTask_skill_id_skillcard_id_fk";
--> statement-breakpoint
ALTER TABLE "task" DROP CONSTRAINT "task_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "skillTask" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "skillTask" ALTER COLUMN "skill_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "task" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "timelog" ADD CONSTRAINT "timelog_task_id_skillTask_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."skillTask"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timelog" ADD CONSTRAINT "timelog_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timelog" ADD CONSTRAINT "timelog_skill_id_skillcard_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skillcard"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skillTask" ADD CONSTRAINT "skillTask_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skillTask" ADD CONSTRAINT "skillTask_skill_id_skillcard_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skillcard"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task" ADD CONSTRAINT "task_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;