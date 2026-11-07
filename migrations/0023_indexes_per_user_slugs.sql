ALTER TABLE "goals" DROP CONSTRAINT "goals_slug_unique";--> statement-breakpoint
ALTER TABLE "skillcard" DROP CONSTRAINT "skillcard_slug_unique";--> statement-breakpoint
CREATE INDEX "sandbox_logs_phase_idx" ON "sandbox_logs" USING btree ("phase_id");--> statement-breakpoint
CREATE INDEX "sandbox_phases_sandbox_idx" ON "sandbox_phases" USING btree ("sandbox_id");--> statement-breakpoint
CREATE INDEX "sandbox_resources_sandbox_idx" ON "sandbox_resources" USING btree ("sandbox_id");--> statement-breakpoint
CREATE INDEX "sandboxes_user_idx" ON "sandboxes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "goal_logs_goal_user_idx" ON "goal_logs" USING btree ("goal_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "goals_user_slug_uq" ON "goals" USING btree ("user_id","slug");--> statement-breakpoint
CREATE UNIQUE INDEX "skillcard_user_slug_uq" ON "skillcard" USING btree ("user_id","slug");--> statement-breakpoint
CREATE INDEX "skill_task_skill_user_idx" ON "skillTask" USING btree ("skill_id","user_id");--> statement-breakpoint
CREATE INDEX "time_log_user_date_idx" ON "timelog" USING btree ("user_id","logged_date");--> statement-breakpoint
CREATE INDEX "time_log_task_idx" ON "timelog" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "time_log_skill_idx" ON "timelog" USING btree ("skill_id");