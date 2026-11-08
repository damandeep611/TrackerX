"use server";

import { and, eq, gte, lte, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/drizzle";
import { timeLog } from "@/db/schema/schema";
import { requireUser } from "@/lib/require-user";
import { getOwnedTask } from "@/lib/ownership";
import { recomputeSkillHours } from "@/lib/skill-hours";
import { tryParseInput, zId, zLocalDate } from "@/lib/validation";
import { MAX_ENTRY_MINUTES, type NewTimeLog } from "@/types/skillDashboardTypes";

const newTimeLogInput = z.object({
  task_id: zId,
  skill_id: zId,
  // One entry is capped at 3h (owner decision); longer sessions are split.
  minutes: z
    .number()
    .int()
    .min(1)
    .max(MAX_ENTRY_MINUTES, `Max ${MAX_ENTRY_MINUTES / 60}h per entry`),
  // The user's local calendar day.
  logged_date: zLocalDate,
});

/** Log minutes against a task, on the user's local date. */
export async function createTimeLog(
  data: NewTimeLog
): Promise<{ success: true; id: string } | { success: false; error: string }> {
  const userId = await requireUser();
  const parsed = newTimeLogInput.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid time entry" };
  }
  const input = parsed.data;

  try {
    // The task must belong to the caller and to that skill (SEC-05).
    const task = await getOwnedTask(input.task_id, input.skill_id, userId);
    if (!task) return { success: false, error: "Task not found" };

    const [row] = await db
      .insert(timeLog)
      .values({
        task_id: input.task_id,
        user_id: userId,
        skill_id: input.skill_id,
        minutes: input.minutes,
        logged_date: new Date(`${input.logged_date}T00:00:00.000Z`),
        tracked_at: new Date(),
      })
      .returning({ id: timeLog.id });

    await recomputeSkillHours(input.skill_id, userId);
    return { success: true, id: row.id };
  } catch (error) {
    console.error("Failed to create time log:", error);
    return { success: false, error: "Failed to log time" };
  }
}

/** Remove a time entry (used by the "Undo" toast). */
export async function deleteTimeLog(
  timeLogId: string
): Promise<{ success: boolean; error?: string }> {
  const userId = await requireUser();
  if (!tryParseInput(zId, timeLogId)) return { success: false, error: "Time log not found" };

  try {
    const [deleted] = await db
      .delete(timeLog)
      .where(and(eq(timeLog.id, timeLogId), eq(timeLog.user_id, userId)))
      .returning({ skillId: timeLog.skill_id });
    if (!deleted) return { success: false, error: "Time log not found" };

    await recomputeSkillHours(deleted.skillId, userId);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete time log:", error);
    return { success: false, error: "Failed to delete time log" };
  }
}

// Weekly progress data interface for charts
interface WeeklyProgressData {
  weekLabel: string;
  weekStart: string;
  weekEnd: string;
  hours: number;
}

// Monday 00:00 of the week containing `date` (server-local time).
function startOfWeekMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day + (day === 0 ? -6 : 1));
  d.setHours(0, 0, 0, 0);
  return d;
}

function buildLastSevenWeeks() {
  const currentMonday = startOfWeekMonday(new Date());
  return Array.from({ length: 7 }, (_, idx) => {
    const i = 6 - idx; // weeks ago
    const start = new Date(currentMonday);
    start.setDate(currentMonday.getDate() - i * 7);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    const weekLabel = i === 0 ? "This Week" : i === 1 ? "Last Week" : `${i} weeks ago`;
    return { weekLabel, start, end };
  });
}

// Get last 7 weeks progress data for weekly chart
export async function getLastSevenWeeksProgress(): Promise<
  WeeklyProgressData[]
> {
  const userId = await requireUser();
  const weeks = buildLastSevenWeeks();
  const toRow = (w: (typeof weeks)[number], minutes: number): WeeklyProgressData => ({
    weekLabel: w.weekLabel,
    weekStart: w.start.toISOString().split("T")[0],
    weekEnd: w.end.toISOString().split("T")[0],
    hours: Math.round((minutes / 60) * 10) / 10,
  });

  try {
    // One ranged query, bucketed in JS (PERF-03)
    const rows = await db
      .select({
        loggedDate: timeLog.logged_date,
        totalMinutes: sql<number>`COALESCE(sum(${timeLog.minutes}), 0)`.mapWith(Number),
      })
      .from(timeLog)
      .where(
        and(
          eq(timeLog.user_id, userId),
          gte(timeLog.logged_date, weeks[0].start),
          lte(timeLog.logged_date, weeks[6].end)
        )
      )
      .groupBy(timeLog.logged_date);

    const minutesPerWeek = weeks.map(() => 0);
    for (const row of rows) {
      const t = row.loggedDate.getTime();
      const idx = weeks.findIndex((w) => t >= w.start.getTime() && t <= w.end.getTime());
      if (idx !== -1) minutesPerWeek[idx] += row.totalMinutes;
    }

    return weeks.map((w, idx) => toRow(w, minutesPerWeek[idx]));
  } catch (error) {
    console.error("Failed to get weekly progress data:", error);
    return weeks.map((w) => toRow(w, 0));
  }
}
