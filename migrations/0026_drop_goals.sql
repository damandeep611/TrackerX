-- P8: remove 80-hour goals. DESTRUCTIVE: all goals and goal sessions are deleted (owner approved, no migration into sandboxes).
DROP TABLE "goal_logs" CASCADE;--> statement-breakpoint
DROP TABLE "goals" CASCADE;