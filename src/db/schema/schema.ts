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

// the schema for the simple Task added in the standalone task management
//first define the 'task' table in the db using pdTable and then
//defining columns and their types/consraints
export const task = pgTable("task", {
  id: uuid("id").primaryKey().defaultRandom(), //column name 'id' type  uuid and marking it as primary key for the table
  user_id: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }), //column name 'user_id' and type text to reference the foreign key string ID's
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  tag: varchar("tag", { length: 50 }),
  duration: integer("duration").default(0).notNull(),
  date: timestamp("date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(), //database Triggers: ORM hooks i.e default now to automatically update the timestamp whenever the row is modified
});

//!UPDATES: to make in the 'task' table
// make the user_id notNull() as every task must have a userID

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
  resourceLink: text("description"),
  resource_link_title: varchar("resource_link_title", { length: 255 }),
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

// Daily routine schema for tracking available hours
export const dailyRoutine = pgTable("daily_routine", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  totalHoursAvailable: numeric("total_hours_available", {
    precision: 5,
    scale: 2,
  }).notNull(),
  routineDate: timestamp("routine_date").defaultNow().notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

// Goals schema for tracking personal goals
export const goals = pgTable("goals", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  startDate: timestamp("start_date"),
  completedDate: timestamp("completed_date"),
  daysToComplete: integer("days_to_complete"),
  reflectionNote: text("reflection_note"),
  isCompleted: boolean("is_completed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
