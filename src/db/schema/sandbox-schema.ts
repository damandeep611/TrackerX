import {
  pgTable,
  uuid,
  text,
  integer,
  numeric,
  timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const sandboxes = pgTable("sandboxes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  targetHours: integer("target_hours").notNull(),
  currentHours: numeric("current_hours", { precision: 5, scale: 2 })
    .default("0.00")
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sandboxPhases = pgTable("sandbox_phases", {
  id: uuid("id").primaryKey().defaultRandom(),
  sandboxId: uuid("sandbox_id")
    .notNull()
    .references(() => sandboxes.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  // Storing milestones as a simple array of strings for now.
  // In Postgres this will be text[]
  milestones: text("milestones").array(), 
  allocatedHours: numeric("allocated_hours", { precision: 5, scale: 2 }).notNull(),
  orderIndex: integer("order_index").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sandboxLogs = pgTable("sandbox_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  phaseId: uuid("phase_id")
    .notNull()
    .references(() => sandboxPhases.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
    duration: numeric("duration", { precision: 5, scale: 2 }).notNull(), // stored in hours
    createdAt: timestamp("created_at").defaultNow().notNull(),
  });
  
  export const sandboxResources = pgTable("sandbox_resources", {
    id: uuid("id").primaryKey().defaultRandom(),
    sandboxId: uuid("sandbox_id")
      .notNull()
      .references(() => sandboxes.id, { onDelete: "cascade" }),
    phaseId: uuid("phase_id")
      .references(() => sandboxPhases.id, { onDelete: "set null" }),
    title: text("title").notNull(),
    url: text("url").notNull(),
    thumbnailUrl: text("thumbnail_url"),
    resourceType: text("resource_type").notNull(), // 'video', 'article', 'repo', 'documentation'
    status: text("status").default("unread").notNull(), // 'unread', 'read'
    createdAt: timestamp("created_at").defaultNow().notNull(),
  });
  