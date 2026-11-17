"use server";

import { and, asc, desc, eq, gte, inArray, lt, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/drizzle";
import { trackerDays, trackerTasks, trackerTomorrow } from "@/db/schema/schema";
import { requireUser } from "@/lib/require-user";
import { getOwnedTomorrowItem, getOwnedTrackerTask, NotFoundError } from "@/lib/ownership";
import { shiftDate, summarizeDay } from "@/lib/tracker";
import { getUserToday } from "@/lib/user-today";
import { parseInput, tryParseInput, zDateKey, zId, zOptionalText, zText } from "@/lib/validation";
import {
  MAX_AVAILABLE_MINUTES,
  MAX_TASKS_PER_DAY,
  MAX_TOMORROW_ITEMS,
  MAX_TRACKER_TASK_MINUTES,
  TRACKER_HISTORY_DAYS,
  type TomorrowItem,
  type TrackerCarryIn,
  type TrackerDayData,
  type TrackerDaySummary,
  type TrackerTask,
} from "@/types/tracker";

type Result<T = object> = ({ success: true } & T) | { success: false; error: string };
type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

const fail = (error: string) => ({ success: false as const, error });
const INVALID = "Invalid input";

/** How far back the "from yesterday" banner looks for the previous tracked day. */
const CARRY_IN_LOOKBACK_DAYS = 14;

const zMinutes = z.number().int().min(1).max(MAX_TRACKER_TASK_MINUTES).nullable();
const zTitle = zText(200);
const zNotes = zOptionalText(1000);

const taskCols = {
  id: trackerTasks.id,
  title: trackerTasks.title,
  notes: trackerTasks.notes,
  estimateMinutes: trackerTasks.estimateMinutes,
  actualMinutes: trackerTasks.actualMinutes,
  done: trackerTasks.done,
  carry: trackerTasks.carry,
  carriedFrom: trackerTasks.carriedFrom,
};

const tomorrowCols = {
  id: trackerTomorrow.id,
  title: trackerTomorrow.title,
  estimateMinutes: trackerTomorrow.estimateMinutes,
};

/** Runs a mutation; "not found / not yours" becomes a result instead of a throw. */
async function guard<T extends object>(fn: () => Promise<Result<T>>): Promise<Result<T>> {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof NotFoundError) return fail(e.message);
    throw e;
  }
}

async function todayKey() {
  return (await getUserToday()).toISOString().slice(0, 10);
}

async function findDay(userId: string, date: string) {
  const [row] = await db
    .select()
    .from(trackerDays)
    .where(and(eq(trackerDays.userId, userId), eq(trackerDays.date, date)))
    .limit(1);
  return row;
}

/** The most recent reminder before `date` (new days start with it). */
async function latestReminder(userId: string, date: string) {
  const [row] = await db
    .select({ reminder: trackerDays.reminder })
    .from(trackerDays)
    .where(
      and(eq(trackerDays.userId, userId), lt(trackerDays.date, date), sql`${trackerDays.reminder} is not null`)
    )
    .orderBy(desc(trackerDays.date))
    .limit(1);
  return row?.reminder ?? null;
}

/** The day's id, creating the row (with the last reminder) on first write. */
async function ensureDay(userId: string, date: string): Promise<string> {
  const existing = await findDay(userId, date);
  if (existing) return existing.id;
  const reminder = await latestReminder(userId, date);
  const [row] = await db
    .insert(trackerDays)
    .values({ userId, date, reminder })
    .onConflictDoNothing({ target: [trackerDays.userId, trackerDays.date] })
    .returning({ id: trackerDays.id });
  if (row) return row.id;
  // Lost a race with a parallel first write.
  const again = await findDay(userId, date);
  if (!again) throw new Error("Could not create the day");
  return again.id;
}

/** Writes positions 0..n-1 in the given order (one statement). */
async function writeOrder(tx: Tx | typeof db, dayId: string, ids: string[]) {
  if (ids.length === 0) return;
  const cases = sql.join(
    ids.map((id, i) => sql`when ${id}::uuid then ${i}::int`),
    sql` `
  );
  await tx
    .update(trackerTasks)
    .set({ position: sql`case ${trackerTasks.id} ${cases} end` })
    .where(and(eq(trackerTasks.dayId, dayId), inArray(trackerTasks.id, ids)));
}

/** What the previous tracked day left for `date`: unfinished tasks marked "carry" + its Tomorrow list. */
async function computeCarryIn(userId: string, date: string): Promise<TrackerCarryIn | null> {
  const [prev] = await db
    .select({ id: trackerDays.id, date: trackerDays.date })
    .from(trackerDays)
    .where(
      and(
        eq(trackerDays.userId, userId),
        lt(trackerDays.date, date),
        gte(trackerDays.date, shiftDate(date, -CARRY_IN_LOOKBACK_DAYS))
      )
    )
    .orderBy(desc(trackerDays.date))
    .limit(1);
  if (!prev) return null;

  const [carried, planned] = await Promise.all([
    db
      .select(taskCols)
      .from(trackerTasks)
      .where(and(eq(trackerTasks.dayId, prev.id), eq(trackerTasks.done, false), eq(trackerTasks.carry, true)))
      .orderBy(asc(trackerTasks.position)),
    db.select(tomorrowCols).from(trackerTomorrow).where(eq(trackerTomorrow.dayId, prev.id)).orderBy(asc(trackerTomorrow.position)),
  ]);
  if (carried.length === 0 && planned.length === 0) return null;
  return { fromDate: prev.date, carried, planned };
}

/* -------------------------------------------------------------------------- */
/* Reads                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * One day with its tasks and Tomorrow list. A day that doesn't exist yet comes
 * back empty (with the last reminder); it's created on the first change.
 * `carryIn` is only offered for the user's today.
 */
export async function getTrackerDay(date: string): Promise<TrackerDayData> {
  const userId = await requireUser();
  const key = parseInput(zDateKey, date);
  const row = await findDay(userId, key);

  const [tasks, tomorrow, reminder]: [TrackerTask[], TomorrowItem[], string | null] = row
    ? await Promise.all([
        db.select(taskCols).from(trackerTasks).where(eq(trackerTasks.dayId, row.id)).orderBy(asc(trackerTasks.position)),
        db.select(tomorrowCols).from(trackerTomorrow).where(eq(trackerTomorrow.dayId, row.id)).orderBy(asc(trackerTomorrow.position)),
        Promise.resolve(row.reminder),
      ])
    : [[], [], await latestReminder(userId, key)];

  const carryIn = key === (await todayKey()) && !row?.carryInHandled ? await computeCarryIn(userId, key) : null;

  return {
    day: {
      date: key,
      availableMinutes: row?.availableMinutes ?? null,
      reminder,
      learned: row?.learned ?? null,
      tasks,
      tomorrow,
    },
    carryIn,
  };
}

/** Summaries of the last TRACKER_HISTORY_DAYS days (2 queries). */
export async function getTrackerHistory(): Promise<TrackerDaySummary[]> {
  const userId = await requireUser();
  const today = await todayKey();
  const days = await db
    .select()
    .from(trackerDays)
    .where(and(eq(trackerDays.userId, userId), gte(trackerDays.date, shiftDate(today, -(TRACKER_HISTORY_DAYS - 1)))))
    .orderBy(asc(trackerDays.date));
  if (days.length === 0) return [];

  const tasks = await db
    .select({ dayId: trackerTasks.dayId, ...taskCols })
    .from(trackerTasks)
    .where(inArray(trackerTasks.dayId, days.map((d) => d.id)));

  const byDay = new Map<string, TrackerTask[]>();
  for (const { dayId, ...t } of tasks) {
    const list = byDay.get(dayId) ?? [];
    list.push(t);
    byDay.set(dayId, list);
  }
  return days.map((d) =>
    summarizeDay({
      date: d.date,
      availableMinutes: d.availableMinutes,
      reminder: d.reminder,
      learned: d.learned,
      tasks: byDay.get(d.id) ?? [],
      tomorrow: [],
    })
  );
}

/* -------------------------------------------------------------------------- */
/* Day                                                                        */
/* -------------------------------------------------------------------------- */

const dayPatchInput = z.object({
  date: zDateKey,
  patch: z
    .object({
      availableMinutes: z.number().int().min(1).max(MAX_AVAILABLE_MINUTES).nullable().optional(),
      reminder: zOptionalText(400).optional(),
      learned: zOptionalText(1000).optional(),
    })
    .strict(),
});

export async function updateTrackerDay(input: z.input<typeof dayPatchInput>): Promise<Result> {
  const userId = await requireUser();
  const data = tryParseInput(dayPatchInput, input);
  if (!data) return fail(INVALID);
  const patch = Object.fromEntries(Object.entries(data.patch).filter(([, v]) => v !== undefined));
  if (Object.keys(patch).length === 0) return { success: true };

  const dayId = await ensureDay(userId, data.date);
  await db.update(trackerDays).set({ ...patch, updatedAt: new Date() }).where(eq(trackerDays.id, dayId));
  return { success: true };
}

/* -------------------------------------------------------------------------- */
/* Tasks                                                                      */
/* -------------------------------------------------------------------------- */

const addTaskInput = z.object({
  date: zDateKey,
  title: zTitle,
  notes: zNotes.optional(),
  estimateMinutes: zMinutes.optional(),
  actualMinutes: zMinutes.optional(),
  done: z.boolean().optional(),
  carry: z.boolean().optional(),
  carriedFrom: zDateKey.nullable().optional(),
  /** Insert at this index (Undo of a delete); appended when omitted. */
  index: z.number().int().min(0).max(MAX_TASKS_PER_DAY).optional(),
});

export async function addTrackerTask(input: z.input<typeof addTaskInput>): Promise<Result<{ task: TrackerTask }>> {
  const userId = await requireUser();
  const data = tryParseInput(addTaskInput, input);
  if (!data) return fail(INVALID);
  const dayId = await ensureDay(userId, data.date);

  return db.transaction(async (tx) => {
    const existing = await tx
      .select({ id: trackerTasks.id })
      .from(trackerTasks)
      .where(eq(trackerTasks.dayId, dayId))
      .orderBy(asc(trackerTasks.position));
    if (existing.length >= MAX_TASKS_PER_DAY) return fail(`A day can hold up to ${MAX_TASKS_PER_DAY} tasks`);

    const index = Math.min(data.index ?? existing.length, existing.length);
    const [task] = await tx
      .insert(trackerTasks)
      .values({
        dayId,
        position: index,
        title: data.title,
        notes: data.notes ?? null,
        estimateMinutes: data.estimateMinutes ?? null,
        actualMinutes: data.actualMinutes ?? null,
        done: data.done ?? false,
        carry: data.carry ?? true,
        carriedFrom: data.carriedFrom ?? null,
      })
      .returning(taskCols);

    if (index < existing.length) {
      const ids = existing.map((r) => r.id);
      ids.splice(index, 0, task.id);
      await writeOrder(tx, dayId, ids);
    }
    return { success: true as const, task };
  });
}

const taskPatchInput = z.object({
  taskId: zId,
  patch: z
    .object({
      title: zTitle.optional(),
      notes: zNotes.optional(),
      estimateMinutes: zMinutes.optional(),
      actualMinutes: zMinutes.optional(),
      done: z.boolean().optional(),
      carry: z.boolean().optional(),
    })
    .strict(),
});

export async function updateTrackerTask(input: z.input<typeof taskPatchInput>): Promise<Result> {
  const userId = await requireUser();
  const data = tryParseInput(taskPatchInput, input);
  if (!data) return fail(INVALID);
  return guard(async () => {
    const task = await getOwnedTrackerTask(data.taskId, userId);
    const patch = Object.fromEntries(Object.entries(data.patch).filter(([, v]) => v !== undefined));
    if (Object.keys(patch).length > 0) {
      await db.update(trackerTasks).set(patch).where(eq(trackerTasks.id, task.id));
    }
    return { success: true };
  });
}

export async function deleteTrackerTask(taskId: string): Promise<Result> {
  const userId = await requireUser();
  const id = tryParseInput(zId, taskId);
  if (!id) return fail(INVALID);
  return guard(async () => {
    const task = await getOwnedTrackerTask(id, userId);
    await db.delete(trackerTasks).where(eq(trackerTasks.id, task.id));
    return { success: true };
  });
}

const reorderInput = z.object({
  date: zDateKey,
  orderedIds: z.array(zId).max(MAX_TASKS_PER_DAY),
});

/** Saves the task order. Ids not in the day are ignored; tasks missing from the list keep their relative order at the end. */
export async function reorderTrackerTasks(input: z.input<typeof reorderInput>): Promise<Result> {
  const userId = await requireUser();
  const data = tryParseInput(reorderInput, input);
  if (!data) return fail(INVALID);
  const day = await findDay(userId, data.date);
  if (!day) return fail("Day not found");

  const current = (
    await db
      .select({ id: trackerTasks.id })
      .from(trackerTasks)
      .where(eq(trackerTasks.dayId, day.id))
      .orderBy(asc(trackerTasks.position))
  ).map((r) => r.id);
  const known = new Set(current);
  const ordered = [...new Set(data.orderedIds)].filter((id) => known.has(id));
  const placed = new Set(ordered);
  await writeOrder(db, day.id, [...ordered, ...current.filter((id) => !placed.has(id))]);
  return { success: true };
}

/* -------------------------------------------------------------------------- */
/* Tomorrow list                                                              */
/* -------------------------------------------------------------------------- */

const addTomorrowInput = z.object({
  date: zDateKey,
  title: zTitle,
  estimateMinutes: zMinutes.optional(),
});

export async function addTomorrowItem(
  input: z.input<typeof addTomorrowInput>
): Promise<Result<{ item: TomorrowItem }>> {
  const userId = await requireUser();
  const data = tryParseInput(addTomorrowInput, input);
  if (!data) return fail(INVALID);
  const dayId = await ensureDay(userId, data.date);

  const [{ count, maxPos }] = await db
    .select({
      count: sql<number>`count(*)`.mapWith(Number),
      maxPos: sql<number>`coalesce(max(${trackerTomorrow.position}), -1)`.mapWith(Number),
    })
    .from(trackerTomorrow)
    .where(eq(trackerTomorrow.dayId, dayId));
  if (count >= MAX_TOMORROW_ITEMS) return fail(`Up to ${MAX_TOMORROW_ITEMS} items`);

  const [item] = await db
    .insert(trackerTomorrow)
    .values({ dayId, position: maxPos + 1, title: data.title, estimateMinutes: data.estimateMinutes ?? null })
    .returning(tomorrowCols);
  return { success: true, item };
}

const tomorrowPatchInput = z.object({
  id: zId,
  patch: z.object({ title: zTitle.optional(), estimateMinutes: zMinutes.optional() }).strict(),
});

export async function updateTomorrowItem(input: z.input<typeof tomorrowPatchInput>): Promise<Result> {
  const userId = await requireUser();
  const data = tryParseInput(tomorrowPatchInput, input);
  if (!data) return fail(INVALID);
  return guard(async () => {
    const item = await getOwnedTomorrowItem(data.id, userId);
    const patch = Object.fromEntries(Object.entries(data.patch).filter(([, v]) => v !== undefined));
    if (Object.keys(patch).length > 0) {
      await db.update(trackerTomorrow).set(patch).where(eq(trackerTomorrow.id, item.id));
    }
    return { success: true };
  });
}

export async function removeTomorrowItem(id: string): Promise<Result> {
  const userId = await requireUser();
  const itemId = tryParseInput(zId, id);
  if (!itemId) return fail(INVALID);
  return guard(async () => {
    const item = await getOwnedTomorrowItem(itemId, userId);
    await db.delete(trackerTomorrow).where(eq(trackerTomorrow.id, item.id));
    return { success: true };
  });
}

/* -------------------------------------------------------------------------- */
/* Carry-in ("from yesterday" banner)                                         */
/* -------------------------------------------------------------------------- */

const dateInput = z.object({ date: zDateKey });

/**
 * Adds the previous day's Tomorrow list, then its carried tasks, after the
 * day's own tasks. Titles already on the day (or repeated) are skipped; a
 * planned item that was also carried keeps the carried task's details.
 */
export async function importCarryIn(input: z.input<typeof dateInput>): Promise<Result<{ added: number }>> {
  const userId = await requireUser();
  const data = tryParseInput(dateInput, input);
  if (!data) return fail(INVALID);
  const dayId = await ensureDay(userId, data.date);
  const carryIn = await computeCarryIn(userId, data.date);

  return db.transaction(async (tx) => {
    const existing = await tx
      .select({ title: trackerTasks.title, position: trackerTasks.position })
      .from(trackerTasks)
      .where(eq(trackerTasks.dayId, dayId));
    const seen = new Set(existing.map((t) => t.title.toLowerCase()));
    let position = existing.reduce((m, t) => Math.max(m, t.position), -1) + 1;
    const rows: (typeof trackerTasks.$inferInsert)[] = [];
    const room = MAX_TASKS_PER_DAY - existing.length;

    if (carryIn) {
      const carriedByTitle = new Map(carryIn.carried.map((c) => [c.title.toLowerCase(), c]));
      const candidates = [
        ...carryIn.planned.map((p) => {
          const c = carriedByTitle.get(p.title.toLowerCase());
          return { title: p.title, notes: c?.notes ?? null, estimateMinutes: p.estimateMinutes ?? c?.estimateMinutes ?? null, carried: !!c };
        }),
        ...carryIn.carried.map((c) => ({ title: c.title, notes: c.notes, estimateMinutes: c.estimateMinutes, carried: true })),
      ];
      for (const c of candidates) {
        const k = c.title.toLowerCase();
        if (seen.has(k) || rows.length >= room) continue;
        seen.add(k);
        rows.push({
          dayId,
          position: position++,
          title: c.title,
          notes: c.notes,
          estimateMinutes: c.estimateMinutes,
          carriedFrom: c.carried ? carryIn.fromDate : null,
        });
      }
      if (rows.length > 0) await tx.insert(trackerTasks).values(rows);
    }

    await tx.update(trackerDays).set({ carryInHandled: true, updatedAt: new Date() }).where(eq(trackerDays.id, dayId));
    return { success: true as const, added: rows.length };
  });
}

export async function dismissCarryIn(input: z.input<typeof dateInput>): Promise<Result> {
  const userId = await requireUser();
  const data = tryParseInput(dateInput, input);
  if (!data) return fail(INVALID);
  const dayId = await ensureDay(userId, data.date);
  await db.update(trackerDays).set({ carryInHandled: true, updatedAt: new Date() }).where(eq(trackerDays.id, dayId));
  return { success: true };
}
