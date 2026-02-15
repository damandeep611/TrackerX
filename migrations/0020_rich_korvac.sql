CREATE TABLE "sandbox_resources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sandbox_id" uuid NOT NULL,
	"phase_id" uuid,
	"title" text NOT NULL,
	"url" text NOT NULL,
	"thumbnail_url" text,
	"resource_type" text NOT NULL,
	"status" text DEFAULT 'unread' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sandbox_resources" ADD CONSTRAINT "sandbox_resources_sandbox_id_sandboxes_id_fk" FOREIGN KEY ("sandbox_id") REFERENCES "public"."sandboxes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sandbox_resources" ADD CONSTRAINT "sandbox_resources_phase_id_sandbox_phases_id_fk" FOREIGN KEY ("phase_id") REFERENCES "public"."sandbox_phases"("id") ON DELETE set null ON UPDATE no action;