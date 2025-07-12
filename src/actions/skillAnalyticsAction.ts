"use server";

import { db } from "@/db/drizzle";
import { timeLog, skillTask, skillCard } from "@/db/schema/schema";
import { auth } from "@/lib/auth";
import { and, eq, sql, gte } from "drizzle-orm";
import { headers } from "next/headers";

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

// Get tag statistics for a specific skill
export async function getTagStatsForSkill(skillId: string): Promise<
  {
    tag: string;
    count: number;
  }[]
> {
  const userId = await getUserId();

  try {
    // Get all tasks for this skill with their tags
    const tasks = await db
      .select({
        tags: skillTask.tags,
      })
      .from(skillTask)
      .where(
        and(eq(skillTask.skill_id, skillId), eq(skillTask.user_id, userId))
      );

    // Count tag frequencies
    const tagCounts: Record<string, number> = {};

    tasks.forEach((task) => {
      if (task.tags && Array.isArray(task.tags)) {
        task.tags.forEach((tag) => {
          if (tag && typeof tag === "string") {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          }
        });
      }
    });

    // Convert to array and sort by count (descending)
    const sortedTags = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);

    // Return top 4 tags, with "Others" for the rest
    const topTags = sortedTags.slice(0, 4);
    const otherCount = sortedTags
      .slice(4)
      .reduce((sum, item) => sum + item.count, 0);

    if (otherCount > 0) {
      topTags.push({ tag: "Others", count: otherCount });
    }

    return topTags;
  } catch (error) {
    console.error("Failed to get tag stats for skill:", error);
    return [];
  }
}

// Get average daily time spent for the last 7 days for a specific skill
export async function getAverageDailyTimeForSkill(
  skillId: string
): Promise<{ averageHours: number; totalDays: number }> {
  const userId = await getUserId();

  try {
    // Calculate date 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get time logs for the last 7 days for this skill
    const result = await db
      .select({
        totalMinutes: sql<number>`COALESCE(sum(${timeLog.minutes}), 0)`.mapWith(Number),
        totalDays: sql<number>`COALESCE(COUNT(DISTINCT DATE(${timeLog.logged_date})), 0)`.mapWith(Number),
      })
      .from(timeLog)
      .where(
        and(
          eq(timeLog.skill_id, skillId),
          eq(timeLog.user_id, userId),
          gte(timeLog.logged_date, sevenDaysAgo)
        )
      );

    const totalMinutes = result[0]?.totalMinutes || 0;
    const totalDays = result[0]?.totalDays || 0;

    // Calculate average hours per day
    const averageHours = totalDays > 0 ? totalMinutes / 60 / totalDays : 0;

    return {
      averageHours: Math.round(averageHours * 10) / 10, // Round to 1 decimal place
      totalDays,
    };
  } catch (error) {
    console.error("Failed to get average daily time for skill:", error);
    return { averageHours: 0, totalDays: 0 };
  }
}

// Get task statistics for the last 7 days for a specific skill
export async function getTaskStatsForSkill(
  skillId: string
): Promise<{ completedTasks: number; totalTasks: number }> {
  const userId = await getUserId();

  try {
    // Calculate date 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get task statistics for the last 7 days
    const result = await db
      .select({
        completedTasks: sql<number>`COALESCE(COUNT(CASE WHEN ${skillTask.done} = true THEN 1 END), 0)`.mapWith(Number),
        totalTasks: sql<number>`COALESCE(COUNT(*), 0)`.mapWith(Number),
      })
      .from(skillTask)
      .where(
        and(
          eq(skillTask.skill_id, skillId),
          eq(skillTask.user_id, userId),
          gte(skillTask.createdAt, sevenDaysAgo)
        )
      );

    return {
      completedTasks: result[0]?.completedTasks || 0,
      totalTasks: result[0]?.totalTasks || 0,
    };
  } catch (error) {
    console.error("Failed to get task stats for skill:", error);
    return { completedTasks: 0, totalTasks: 0 };
  }
}

// Get comprehensive analytics for a skill (combines both time and task data)
export async function getSkillAnalytics(skillId: string): Promise<{
  averageDailyHours: number;
  totalDaysWithActivity: number;
  completedTasks: number;
  totalTasks: number;
  createdAt: string;
  description: string | null;
  daysSinceCreation: number;
}> {
  try {
    const userId = await getUserId();
    const [timeData, taskData, skillData] = await Promise.all([
      getAverageDailyTimeForSkill(skillId),
      getTaskStatsForSkill(skillId),
      db
        .select({
          createdAt: skillCard.createdAt,
          description: skillCard.description,
        })
        .from(skillCard)
        .where(and(eq(skillCard.id, skillId), eq(skillCard.userId, userId)))
        .then((rows) => rows[0]),
    ]);

    if (!skillData) {
      throw new Error("Skill not found");
    }

    // Ensure we have a valid date
    const createdAtDate =
      skillData.createdAt instanceof Date
        ? skillData.createdAt
        : new Date(skillData.createdAt);

    const daysSinceCreation = Math.floor(
      (new Date().getTime() - createdAtDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      averageDailyHours: timeData.averageHours,
      totalDaysWithActivity: timeData.totalDays,
      completedTasks: taskData.completedTasks,
      totalTasks: taskData.totalTasks,
      createdAt: createdAtDate.toISOString(),
      description: skillData.description,
      daysSinceCreation: Math.max(0, daysSinceCreation), // Ensure non-negative
    };
  } catch (error) {
    console.error("Failed to get skill analytics:", error);
    return {
      averageDailyHours: 0,
      totalDaysWithActivity: 0,
      completedTasks: 0,
      totalTasks: 0,
      createdAt: new Date().toISOString(),
      description: null,
      daysSinceCreation: 0,
    };
  }
}
