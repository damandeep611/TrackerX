"use server";

import { db } from "@/db/drizzle";
import { timeLog, skillCard } from "@/db/schema/schema";
import { auth } from "@/lib/auth";
import { TimeLog, NewTimeLog } from "@/types/skillDashboardTypes";
import { and, eq, sql, desc, gte, lte } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { updateSkillCardHoursFromTimeLogs } from "./skillCardAction";

// Helper function to get authenticated user ID
async function getUserId(): Promise<string> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id) {
    throw new Error("User not authenticated");
  }
  return session.user.id;
}

// Create a new time log entry
export async function createTimeLog(
  timeLogData: NewTimeLog
): Promise<{ success: boolean; error?: string; timeLog?: TimeLog }> {
  const userId = await getUserId();

  try {
    // Validate input
    if (
      !timeLogData.task_id ||
      !timeLogData.skill_id ||
      timeLogData.minutes <= 0
    ) {
      return { success: false, error: "Invalid time log data" };
    }

    // Set logged_date to today if not provided
    const loggedDate =
      timeLogData.logged_date || new Date().toISOString().split("T")[0];

    const insertedTimeLogs = await db
      .insert(timeLog)
      .values({
        task_id: timeLogData.task_id,
        user_id: userId,
        skill_id: timeLogData.skill_id,
        minutes: timeLogData.minutes,
        logged_date: new Date(loggedDate),
        tracked_at: new Date(),
      })
      .returning();

    if (!insertedTimeLogs || insertedTimeLogs.length === 0) {
      throw new Error("Failed to create time log");
    }

    const createdTimeLog = insertedTimeLogs[0];

    // Update the skill card's current hours based on time logs
    await updateSkillCardHoursFromTimeLogs(timeLogData.skill_id);

    // Get the skill slug for proper revalidation
    // This ensures the skill card and tracking cards show updated time data
    const skill = await db
      .select({ slug: skillCard.slug })
      .from(skillCard)
      .where(eq(skillCard.id, timeLogData.skill_id))
      .limit(1);

    // Only revalidate the specific skill page to reduce unnecessary renders
    if (skill[0]?.slug) {
      revalidatePath(`/dashboard/skills/${skill[0].slug}`);
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
  const userId = await getUserId();

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
  const userId = await getUserId();

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
  const userId = await getUserId();

  // Return empty object if no task IDs provided
  if (!taskIds || taskIds.length === 0) {
    return {};
  }

  // Filter out temporary IDs (those starting with "temp-")
  const validTaskIds = taskIds.filter((id) => !id.startsWith("temp-"));

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

    // Query each valid task ID individually (following the pattern from skillTaskAction.ts)
    for (const taskId of validTaskIds) {
      const result = await db
        .select({
          totalMinutes:
            sql<number>`COALESCE(sum(${timeLog.minutes}), 0)`.mapWith(Number),
        })
        .from(timeLog)
        .where(and(eq(timeLog.task_id, taskId), eq(timeLog.user_id, userId)));

      timeMap[taskId] = result[0]?.totalMinutes || 0;
    }

    return timeMap;
  } catch (error) {
    console.error("Failed to get total time for tasks:", error);
    return {};
  }
}

// Get today's total time spent across all skills (updated to use time logs)
export async function getTodayTotalTimeSpentFromLogs(): Promise<number> {
  const userId = await getUserId();

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
  const userId = await getUserId();

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
    await updateSkillCardHoursFromTimeLogs(skillId);

    // Get the skill slug for proper revalidation
    const skill = await db
      .select({ slug: skillCard.slug })
      .from(skillCard)
      .where(eq(skillCard.id, skillId))
      .limit(1);

    // Only revalidate the specific skill page to reduce unnecessary renders
    if (skill[0]?.slug) {
      revalidatePath(`/dashboard/skills/${skill[0].slug}`);
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
  const userId = await getUserId();

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
