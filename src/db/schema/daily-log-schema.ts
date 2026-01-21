import {
  pgTable,
  uuid,
  integer,
  varchar,
  text,
  timestamp,
  date,
  index,
  check,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { user } from "./auth-schema";

export const entries = pgTable('entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }), // Changed to text to match auth-schema user.id
  date: date('date').notNull(),
  type: varchar('type', { length: 20 }).notNull(), // 'log-note' or 'activity'
  
  // log-note fields
  timeMinutes: integer('time_minutes'), // 0-1440, nullable
  content: text('content'), // nullable
  
  // activity fields
  title: text('title'), // nullable
  colorLabel: varchar('color_label', { length: 50 }), // nullable
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'), // soft delete
}, (table) => ({
  userDateIdx: index('user_date_idx').on(table.userId, table.date),
  userDateColorIdx: index('user_date_color_idx').on(table.userId, table.date, table.colorLabel),
  userDateTypeIdx: index('user_date_type_idx').on(table.userId, table.date, table.type),
  userCreatedAtIdx: index('user_created_at_idx').on(table.userId, table.createdAt),
}));

export const timeSlots = pgTable('time_slots', {
  id: uuid('id').primaryKey().defaultRandom(),
  entryId: uuid('entry_id').notNull().references(() => entries.id, { onDelete: 'cascade' }),
  startMinutes: integer('start_minutes').notNull(), // 0-1440
  endMinutes: integer('end_minutes').notNull(), // 0-1440
}, (table) => ({
  entryIdIdx: index('entry_id_idx').on(table.entryId),
  checkConstraint: check('end_greater_than_start', sql`end_minutes > start_minutes`),
}));

export const entriesRelations = relations(entries, ({ many }) => ({
  timeSlots: many(timeSlots),
}));

export const timeSlotsRelations = relations(timeSlots, ({ one }) => ({
  entry: one(entries, {
    fields: [timeSlots.entryId],
    references: [entries.id],
  }),
}));
