import {
  text,
  boolean,
  pgTable,
  uuid,
  integer,
  varchar,
  timestamp,
  numeric,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";



export const skillCard = pgTable("skillcard", {
  id: uuid("id").primaryKey().defaultRandom(),
  skillName: text("skill_name").notNull(),
  category: text("category").notNull(),
  targetHours: integer("target-hours").notNull(),
  currentHours: numeric("current-hours", { precision: 5, scale: 2 })
    .default("0.00")
    .notNull(),
  skillColor: text("skill-color").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

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
  tags: text("tags").array().default([]),
  date: timestamp("date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

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
});

// Goals schema for tracking personal goals
export const goals = pgTable("goals", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  slug: text("slug").notNull().unique(),
  startDate: timestamp("start_date"),
  completedDate: timestamp("completed_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
