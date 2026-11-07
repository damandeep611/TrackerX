"use server";

import { db } from "@/db/drizzle";
import { timeLog } from "@/db/schema/schema";
import { TimeLog, NewTimeLog } from "@/types/skillDashboardTypes";
import { and, eq, sql, desc, gte, lte, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/require-user";
import { getOwnedSkill, getOwnedTask } from "@/lib/ownership";
import { recomputeSkillHours } from "@/lib/skill-hours";
import { parseInput, tryParseInput, zId } from "@/lib/validation";

const newTimeLogInput = z.object({
  task_id: zId,
  skill_id: zId,
  minutes: z.number().int().min(1).max(24 * 60),
  logged_date: z
    .string()
    .refine((v) => !Number.isNaN(new Date(v).getTime()), "Invalid date")
    .optional(),
});

const zDateString = z
  .string()
  .refine((v) => !Number.isNaN(new Date(v).getTime()), "Invalid date");

// Create a new time log entry
export async function createTimeLog(
  timeLogData: NewTimeLog
): Promise<{ success: boolean; error?: string; timeLog?: TimeLog }> {
  const userId = await requireUser();

  try {
    const input = tryParseInput(newTimeLogInput, timeLogData);
    if (!input) {
      return { success: false, error: "Invalid time log data" };
    }

    // The task must belong to the caller and to that skill (SEC-05).
    const task = await getOwnedTask(input.task_id, input.skill_id, userId);
    if (!task) {
      return { success: false, error: "Task not found" };
    }

    // Set logged_date to today if not provided
    const loggedDate =
      input.logged_date || new Date().toISOString().split("T")[0];

    const insertedTimeLogs = await db
      .insert(timeLog)
      .values({
        task_id: input.task_id,
        user_id: userId,
        skill_id: input.skill_id,
        minutes: input.minutes,
        logged_date: new Date(loggedDate),
        tracked_at: new Date(),
      })
      .returning();

    if (!insertedTimeLogs || insertedTimeLogs.length === 0) {
      throw new Error("Failed to create time log");
    }

    const createdTimeLog = insertedTimeLogs[0];

    // Update the skill card's current hours based on time logs
    await recomputeSkillHours(input.skill_id, userId);

    // Only revalidate the specific skill page to reduce unnecessary renders
    const skill = await getOwnedSkill(input.skill_id, userId);
    if (skill?.slug) {
      revalidatePath(`/dashboard/skills/${skill.slug}`);
    }

    const timeLogResult: TimeLog = {
      id: createdTimeLog.id,
      task_id: createdTimeLog.task_id,
      user_id: createdTimeLog.user_id,
      skill_id: createdTimeLog.skill_id,
      minutes: createdTimeLog.minutes,
      logged_date: createdTimeLog.logged_date.toISOString(),
      tracked_at: createdTimeLog.tracked_at.toISOString(),
    };

    return { success: true, timeLog: timeLogResult };
  } catch (error) {
    console.error("Failed to create time log:", error);
    return { success: false, error: "Failed to create time log" };
  }
}

// Get time logs for a specific task
export async function getTimeLogsForTask(taskId: string): Promise<TimeLog[]> {
  const userId = await requireUser();
  if (!tryParseInput(zId, taskId)) return [];

  try {
    const timeLogs = await db
      .select()
      .from(timeLog)
      .where(and(eq(timeLog.task_id, taskId), eq(timeLog.user_id, userId)))
      .orderBy(desc(timeLog.tracked_at));

    return timeLogs.map((log) => ({
      id: log.id,
      task_id: log.task_id,
      user_id: log.user_id,
      skill_id: log.skill_id,
      minutes: log.minutes,
      logged_date: log.logged_date.toISOString(),
      tracked_at: log.tracked_at.toISOString(),
    }));
  } catch (error) {
    console.error("Failed to get time logs for task:", error);
    return [];
  }
}

// Get total time spent for a task (from time logs)
export async function getTotalTimeForTask(taskId: string): Promise<number> {
  const userId = await requireUser();
  if (!tryParseInput(zId, taskId)) return 0;

  try {
    const result = await db
      .select({
        totalMinutes: sql<number>`COALESCE(sum(${timeLog.minutes}), 0)`.mapWith(
          Number
        ),
      })
      .from(timeLog)
      .where(and(eq(timeLog.task_id, taskId), eq(timeLog.user_id, userId)));
    const totalMinutes = result[0]?.totalMinutes || 0;
    return totalMinutes;
  } catch (error) {
    console.error("Failed to get total time for task:", error);
    return 0;
  }
}

// Get total time spent for multiple tasks at once (optimized)
export async function getTotalTimeForTasks(
  taskIds: string[]
): Promise<Record<string, number>> {
  const userId = await requireUser();

  // Return empty object if no task IDs provided
  if (!taskIds || taskIds.length === 0) {
    return {};
  }

  const ids = parseInput(z.array(z.string().max(100)).max(1000), taskIds);

  // Skip optimistic temp IDs ("temp-...") and anything that isn't a uuid
  const validTaskIds = ids.filter((id) => zId.safeParse(id).success);

  // Return empty object if no valid task IDs
  if (validTaskIds.length === 0) {
    return {};
  }

  try {
    const timeMap: Record<string, number> = {};

    // Initialize all task IDs with 0 minutes
    taskIds.forEach((taskId) => {
      timeMap[taskId] = 0;
    });

    // One grouped query for all tasks (PERF-02)
    const rows = await db
      .select({
        taskId: timeLog.task_id,
        totalMinutes: sql<number>`COALESCE(sum(${timeLog.minutes}), 0)`.mapWith(Number),
      })
      .from(timeLog)
      .where(and(inArray(timeLog.task_id, validTaskIds), eq(timeLog.user_id, userId)))
      .groupBy(timeLog.task_id);

    for (const row of rows) {
      timeMap[row.taskId] = row.totalMinutes;
    }

    return timeMap;
  } catch (error) {
    console.error("Failed to get total time for tasks:", error);
    return {};
  }
}

// Get today's total time spent across all skills (updated to use time logs)
export async function getTodayTotalTimeSpentFromLogs(): Promise<number> {
  const userId = await requireUser();

  try {
    const today = new Date();
    const todayString = today.toISOString().split("T")[0];

    const result = await db
      .select({
        totalMinutes: sql<number>`COALESCE(sum(${timeLog.minutes}), 0)`.mapWith(
          Number
        ),
      })
      .from(timeLog)
      .where(
        and(
          eq(timeLog.user_id, userId),
          sql`DATE(${timeLog.logged_date}) = ${todayString}`
        )
      );

    const totalMinutes = result[0]?.totalMinutes || 0;
    const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

    console.log(
      `Today's total time spent (from logs): ${totalHours}h (${totalMinutes} minutes)`
    );
    return totalHours;
  } catch (error) {
    console.error("Failed to get today's total time spent from logs:", error);
    return 0;
  }
}

// Delete a time log entry
export async function deleteTimeLog(
  timeLogId: string
): Promise<{ success: boolean; error?: string }> {
  const userId = await requireUser();
  if (!tryParseInput(zId, timeLogId)) {
    return { success: false, error: "Time log not found or access denied" };
  }

  try {
    // First, get the skill_id from the time log before deleting it
    const timeLogToDelete = await db
      .select({ skill_id: timeLog.skill_id })
      .from(timeLog)
      .where(and(eq(timeLog.id, timeLogId), eq(timeLog.user_id, userId)))
      .limit(1);

    if (!timeLogToDelete || timeLogToDelete.length === 0) {
      return { success: false, error: "Time log not found or access denied" };
    }

    const skillId = timeLogToDelete[0].skill_id;

    // Delete the time log
    const result = await db
      .delete(timeLog)
      .where(and(eq(timeLog.id, timeLogId), eq(timeLog.user_id, userId)));

    if (result.rowCount === 0) {
      return { success: false, error: "Time log not found or access denied" };
    }

    // Update the skill card's current hours after deletion
    await recomputeSkillHours(skillId, userId);

    // Only revalidate the specific skill page to reduce unnecessary renders
    const skill = await getOwnedSkill(skillId, userId);
    if (skill?.slug) {
      revalidatePath(`/dashboard/skills/${skill.slug}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to delete time log:", error);
    return { success: false, error: "Failed to delete time log" };
  }
}

// Get time logs for a specific date range
export async function getTimeLogsForDateRange(
  startDate: string,
  endDate: string
): Promise<TimeLog[]> {
  const userId = await requireUser();
  parseInput(z.object({ startDate: zDateString, endDate: zDateString }), { startDate, endDate });

  try {
    const timeLogs = await db
      .select()
      .from(timeLog)
      .where(
        and(
          eq(timeLog.user_id, userId),
          gte(timeLog.logged_date, new Date(startDate)),
          lte(timeLog.logged_date, new Date(endDate))
        )
      )
      .orderBy(desc(timeLog.logged_date));

    return timeLogs.map((log) => ({
      id: log.id,
      task_id: log.task_id,
      user_id: log.user_id,
      skill_id: log.skill_id,
      minutes: log.minutes,
      logged_date: log.logged_date.toISOString(),
      tracked_at: log.tracked_at.toISOString(),
    }));
  } catch (error) {
    console.error("Failed to get time logs for date range:", error);
    return [];
  }
}

// Get time logs grouped by date for a specific skill and date range
export async function getTimeLogsByDateForSkill(
  skillId: string,
  startDate: Date,
  endDate: Date
): Promise<Record<string, number>> {
  const userId = await requireUser();
  parseInput(
    z.object({ skillId: zId, startDate: z.date(), endDate: z.date() }),
    { skillId, startDate, endDate }
  );

  try {
    const result = await db
      .select({
        date: timeLog.logged_date,
        totalMinutes: sql<number>`sum(${timeLog.minutes})`.mapWith(Number),
      })
      .from(timeLog)
      .where(
        and(
          eq(timeLog.user_id, userId),
          eq(timeLog.skill_id, skillId),
          gte(timeLog.logged_date, startDate),
          lte(timeLog.logged_date, endDate)
        )
      )
      .groupBy(timeLog.logged_date);

    const timeMap: Record<string, number> = {};
    result.forEach((item) => {
      const dateKey = item.date.toISOString().split("T")[0];
      timeMap[dateKey] = (timeMap[dateKey] || 0) + item.totalMinutes;
    });

    return timeMap;
  } catch (error) {
    console.error("Failed to get time logs by date for skill:", error);
    return {};
  }
}

// Weekly activity data interface for insights
interface WeeklyActivityData {
  day: string;
  hours: number;
  hasActivity: boolean;
}

// Weekly progress data interface for charts
interface WeeklyProgressData {
  weekLabel: string;
  weekStart: string;
  weekEnd: string;
  hours: number;
}

// Get last 7 days activity data for insights dashboard
export async function getLastSevenDaysActivity(): Promise<
  WeeklyActivityData[]
> {
  const userId = await requireUser();

  try {
    // Calculate date range for last 7 days including today
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 6);

    // Reset time to start of day for accurate date comparison
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    const result = await db
      .select({
        loggedDate: timeLog.logged_date,
        totalMinutes: sql<number>`COALESCE(sum(${timeLog.minutes}), 0)`.mapWith(
          Number
        ),
      })
      .from(timeLog)
      .where(
        and(
          eq(timeLog.user_id, userId),
          gte(timeLog.logged_date, startDate),
          lte(timeLog.logged_date, endDate)
        )
      )
      .groupBy(timeLog.logged_date)
      .orderBy(timeLog.logged_date);

    // Create a map of dates to hours for easy lookup
    const activityMap = new Map<string, number>();
    result.forEach((item) => {
      const dateKey = item.loggedDate.toISOString().split("T")[0];
      const hours = Math.round((item.totalMinutes / 60) * 10) / 10; // Round to 1 decimal
      activityMap.set(dateKey, hours);
    });

    // Generate array for last 7 days
    const weeklyData: WeeklyActivityData[] = [];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split("T")[0];
      const dayName = dayNames[date.getDay()];

      const hours = activityMap.get(dateKey) || 0;

      weeklyData.push({
        day: dayName,
        hours: hours,
        hasActivity: hours > 0,
      });
    }

    return weeklyData;
  } catch (error) {
    console.error("Failed to get weekly activity data:", error);
    // Return default structure with 7 days and no activity
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = new Date();

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(today.getDate() - (6 - i));
      return {
        day: dayNames[date.getDay()],
        hours: 0,
        hasActivity: false,
      };
    });
  }
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
