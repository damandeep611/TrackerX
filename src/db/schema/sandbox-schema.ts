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
