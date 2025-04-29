import {
  text,
  boolean,
  pgTable,
  uuid,
  integer,
  varchar,
  timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const todo = pgTable("todo", {
  id: uuid("id").primaryKey().defaultRandom(),
  text: text("text").notNull(),
  done: boolean("done").default(false).notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const skillCard = pgTable("skillcard", {
  id: uuid("id").primaryKey().defaultRandom(),
  skillName: text("skill_name").notNull(),
  category: text("category").notNull(),
  targetHours: integer("target-hours").notNull(),
  currentHours: integer("current-hours").notNull(),
  skillColor: text("skill-color").notNull(),
  slug: text("slug").notNull().unique(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const task = pgTable("task", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: text("user_id").references(() => user.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  tag: varchar("tag", { length: 50 }),
  duration: integer("duration").default(0).notNull(),
  date: timestamp("date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const skillTask = pgTable("skillTask", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: text("user_id").references(() => user.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  tag: varchar("tag", { length: 50 }),
  duration: integer("duration").default(0).notNull(),
  date: timestamp("date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
