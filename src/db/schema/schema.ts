import {
  text,
  boolean,
  pgTable,
  uuid,
  integer,
  varchar,
  timestamp,
  numeric,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export * from "./sandbox-schema";

export const skillCard = pgTable("skillcard", {
  id: uuid("id").primaryKey().defaultRandom(),
  skillName: text("skill_name").notNull(),
  category: text("category").notNull(),
  targetHours: integer("target-hours").notNull(),
  currentHours: numeric("current-hours", { precision: 5, scale: 2 })
    .default("0.00")
    .notNull(),
  skillColor: text("skill-color").notNull(),
  // Unique per user (see skillcard_user_slug_uq), not globally.
  slug: text("slug").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
}, (t) => [
  uniqueIndex("skillcard_user_slug_uq").on(t.userId, t.slug),
]);

export const skillTask = pgTable("skillTask", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  skill_id: uuid("skill_id")
    .notNull()
    .references(() => skillCard.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: varchar("description_task", { length: 700 }),
  done: boolean("done").default(false).notNull(),
  status: varchar("status", { length: 20 }).default("todo").notNull(),
  tags: text("tags").array().default([]),
  date: timestamp("date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => [
  index("skill_task_skill_user_idx").on(t.skill_id, t.user_id),
]);

export const timeLog = pgTable("timelog", {
  id: uuid("id").primaryKey().defaultRandom(),
  task_id: uuid("task_id")
    .notNull()
    .references(() => skillTask.id, { onDelete: "cascade" }),
  user_id: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  skill_id: uuid("skill_id")
    .notNull()
    .references(() => skillCard.id, { onDelete: "cascade" }),
  minutes: integer("minutes").notNull(),
  logged_date: timestamp("logged_date").defaultNow().notNull(),
  tracked_at: timestamp("tracked_at").defaultNow().notNull(),
}, (t) => [
  index("time_log_user_date_idx").on(t.user_id, t.logged_date),
  index("time_log_task_idx").on(t.task_id),
  index("time_log_skill_idx").on(t.skill_id),
]);
