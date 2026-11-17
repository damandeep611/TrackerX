import {
  boolean,
  date,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

/**
 * Daily tracker (/dashboard/tracker). One row per user per local calendar day.
 * `date` is a plain Postgres date ("YYYY-MM-DD" in and out, no time zone),
 * so it needs none of the UTC-midnight handling of the older logged_date columns.
 */
export const trackerDays = pgTable("tracker_days", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  date: date("date", { mode: "string" }).notNull(),
  /** Rough estimate set in the morning; not a limit. */
  availableMinutes: integer("available_minutes"),
  /** Note to self; copied from the previous day when a day is created. */
  reminder: text("reminder"),
  learned: text("learned"),
  /** The "from yesterday" banner was used or dismissed for this day. */
  carryInHandled: boolean("carry_in_handled").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => [unique("tracker_days_user_date_uq").on(t.userId, t.date)]);

/** A task in a day's table. Ordered by `position`. Ownership goes through the parent day. */
export const trackerTasks = pgTable("tracker_tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  dayId: uuid("day_id")
    .notNull()
    .references(() => trackerDays.id, { onDelete: "cascade" }),
  position: integer("position").notNull(),
  title: text("title").notNull(),
  notes: text("notes"),
  estimateMinutes: integer("estimate_minutes"),
  actualMinutes: integer("actual_minutes"),
  done: boolean("done").default(false).notNull(),
  /** Unfinished task offered to the next day (End of day → Carry over). */
  carry: boolean("carry").default(true).notNull(),
  /** Date of the day this task was carried over from. */
  carriedFrom: date("carried_from", { mode: "string" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [index("tracker_tasks_day_position_idx").on(t.dayId, t.position)]);

/** End of day → Tomorrow list. Imported into the next day as tasks when the user accepts. */
export const trackerTomorrow = pgTable("tracker_tomorrow", {
  id: uuid("id").primaryKey().defaultRandom(),
  dayId: uuid("day_id")
    .notNull()
    .references(() => trackerDays.id, { onDelete: "cascade" }),
  position: integer("position").notNull(),
  title: text("title").notNull(),
  estimateMinutes: integer("estimate_minutes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [index("tracker_tomorrow_day_position_idx").on(t.dayId, t.position)]);
