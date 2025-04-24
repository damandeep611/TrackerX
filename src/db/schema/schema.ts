import { text, boolean, pgTable, uuid, integer } from "drizzle-orm/pg-core";
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

export const skillTodo = pgTable("skilltodo", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("task").notNull(),
  relatedSkill: text("related_skill")
    .notNull()
    .references(() => skillCard.id, { onDelete: "cascade" }),
});
