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
  currentHours: numeric("current-hours", { precision: 5, scale: 2 })
    .default("0.00")
    .notNull(),
  skillColor: text("skill-color").notNull(),
  slug: text("slug").notNull().unique(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

// the schema for the simple Task added in the standalone task management
//first define the 'task' table in the db using pdTable and then 
//defining columns and their types/consraints
export const task = pgTable("task", {
  id: uuid("id").primaryKey().defaultRandom(), //column name 'id' type  uuid and marking it as primary key for the table
  user_id: text("user_id").references(() => user.id), //column name 'user_id' and type text to reference the foreign key string ID's
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
  user_id: text("user_id").references(() => user.id),
  skill_id: uuid("skill_id").references(() => skillCard.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  tag: varchar("tag", { length: 50 }),
  duration: integer("duration").default(0).notNull(),
  date: timestamp("date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
