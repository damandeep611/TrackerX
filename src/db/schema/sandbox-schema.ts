import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const sandboxes = pgTable("sandboxes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  targetHours: integer("target_hours").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [index("sandboxes_user_idx").on(t.userId)]);

/** A logged work session: minutes on the user's local calendar date (stored at UTC midnight, like timeLog). */
export const sandboxLogs = pgTable("sandbox_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  sandboxId: uuid("sandbox_id")
    .notNull()
    .references(() => sandboxes.id, { onDelete: "cascade" }),
  title: text("title"),
  minutes: integer("minutes").notNull(),
  loggedDate: timestamp("logged_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [index("sandbox_logs_sandbox_date_idx").on(t.sandboxId, t.loggedDate)]);

export const sandboxResources = pgTable("sandbox_resources", {
  id: uuid("id").primaryKey().defaultRandom(),
  sandboxId: uuid("sandbox_id")
    .notNull()
    .references(() => sandboxes.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  resourceType: text("resource_type").notNull(), // 'video', 'article', 'repo', 'documentation'
  status: text("status").default("unread").notNull(), // 'unread', 'read'
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [index("sandbox_resources_sandbox_idx").on(t.sandboxId)]);

/** Named 20h markers on the dial. Unnamed markers are derived, not stored. */
export const sandboxMilestones = pgTable("sandbox_milestones", {
  id: uuid("id").primaryKey().defaultRandom(),
  sandboxId: uuid("sandbox_id")
    .notNull()
    .references(() => sandboxes.id, { onDelete: "cascade" }),
  hourMark: integer("hour_mark").notNull(),
  label: text("label").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [unique("sandbox_milestones_sandbox_hour_uq").on(t.sandboxId, t.hourMark)]);
