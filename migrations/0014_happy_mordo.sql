CREATE TABLE "entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"date" date NOT NULL,
	"type" varchar(20) NOT NULL,
	"time_minutes" integer,
	"content" text,
	"title" text,
	"color_label" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "time_slots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entry_id" uuid NOT NULL,
	"start_minutes" integer NOT NULL,
	"end_minutes" integer NOT NULL,
	CONSTRAINT "end_greater_than_start" CHECK (end_minutes > start_minutes)
);
--> statement-breakpoint
ALTER TABLE "entries" ADD CONSTRAINT "entries_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_slots" ADD CONSTRAINT "time_slots_entry_id_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_date_idx" ON "entries" USING btree ("user_id","date");--> statement-breakpoint
CREATE INDEX "user_date_color_idx" ON "entries" USING btree ("user_id","date","color_label");--> statement-breakpoint
CREATE INDEX "user_date_type_idx" ON "entries" USING btree ("user_id","date","type");--> statement-breakpoint
CREATE INDEX "user_created_at_idx" ON "entries" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "entry_id_idx" ON "time_slots" USING btree ("entry_id");