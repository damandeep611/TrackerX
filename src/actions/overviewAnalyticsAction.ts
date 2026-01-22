"use server";

import { db } from "@/db/drizzle";
import { timeLog, skillTask, skillCard } from "@/db/schema/schema";
import { auth } from "@/lib/auth";
import { and, eq, sql, gte, desc } from "drizzle-orm";
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



// Get time spent yesterday
export async function getTimeSpentYesterday(): Promise<{
  hoursSpent: number;
  tasksCompleted: number;
}> {
  const userId = await getUserId();

  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split("T")[0];

    // Get time spent yesterday
    const timeResult = await db
      .select({
        totalMinutes: sql<number>`COALESCE(sum(${timeLog.minutes}), 0)`.mapWith(
          Number
        ),
      })
      .from(timeLog)
      .where(
        and(
          eq(timeLog.user_id, userId),
          sql`DATE(${timeLog.logged_date}) = ${yesterdayString}`
        )
      );

    // Get tasks completed yesterday
    const taskResult = await db
      .select({
        completedTasks:
          sql<number>`COALESCE(COUNT(CASE WHEN ${skillTask.done} = true THEN 1 END), 0)`.mapWith(
            Number
          ),
      })
      .from(skillTask)
      .where(
        and(
          eq(skillTask.user_id, userId),
          sql`DATE(${skillTask.updatedAt}) = ${yesterdayString}`
        )
      );

    const totalMinutes = timeResult[0]?.totalMinutes || 0;
    const completedTasks = taskResult[0]?.completedTasks || 0;

    return {
      hoursSpent: Math.round((totalMinutes / 60) * 10) / 10,
      tasksCompleted: completedTasks,
    };
  } catch (error) {
    console.error("Failed to get time spent yesterday:", error);
    return { hoursSpent: 0, tasksCompleted: 0 };
  }
}

// Get weekly time spent
export async function getWeeklyTimeSpent(): Promise<{
  totalHours: number;
  daysWithActivity: number;
}> {
  const userId = await getUserId();

  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const result = await db
      .select({
        totalMinutes: sql<number>`COALESCE(sum(${timeLog.minutes}), 0)`.mapWith(
          Number
        ),
        totalDays:
          sql<number>`COALESCE(COUNT(DISTINCT DATE(${timeLog.logged_date})), 0)`.mapWith(
            Number
          ),
      })
      .from(timeLog)
      .where(
        and(eq(timeLog.user_id, userId), gte(timeLog.logged_date, sevenDaysAgo))
      );

    const totalMinutes = result[0]?.totalMinutes || 0;
    const totalDays = result[0]?.totalDays || 0;

    return {
      totalHours: Math.round((totalMinutes / 60) * 10) / 10,
      daysWithActivity: totalDays,
    };
  } catch (error) {
    console.error("Failed to get weekly time spent:", error);
    return { totalHours: 0, daysWithActivity: 0 };
  }
}

// Get hours spend this month i.e last 30 days , need some modification in this to fetch more data and date accuracy 
export async function getMontlyTimeSpent(): Promise<{
  totalHours: number;
  daysWithActivity: number;
}> {
  const userId = await getUserId();

  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await db
      .select({
        totalMinutes: sql<number>`COALESCE(sum(${timeLog.minutes}), 0)`.mapWith(
          Number
        ),
        totalDays:
          sql<number>`COALESCE(COUNT(DISTINCT DATE(${timeLog.logged_date})), 0)`.mapWith(
            Number
          ),
      })
      .from(timeLog)
      .where(
        and(eq(timeLog.user_id, userId), gte(timeLog.logged_date, thirtyDaysAgo))
      );

    const totalMinutes = result[0]?.totalMinutes || 0;
    const totalDays = result[0]?.totalDays || 0;

    return {
      totalHours: Math.round((totalMinutes / 60) * 10) / 10,
      daysWithActivity: totalDays,
    };
  } catch (error) {
    console.error("Failed to get weekly time spent:", error);
    return { totalHours: 0, daysWithActivity: 0 };
  }
}

// Get most active skill this week
export async function getMostActiveSkill(): Promise<{
  skillName: string;
  hoursSpent: number;
}> {
  const userId = await getUserId();

  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const result = await db
      .select({
        skillName: skillCard.skillName,
        totalMinutes: sql<number>`COALESCE(sum(${timeLog.minutes}), 0)`.mapWith(
          Number
        ),
      })
      .from(timeLog)
      .innerJoin(skillCard, eq(timeLog.skill_id, skillCard.id))
      .where(
        and(eq(timeLog.user_id, userId), gte(timeLog.logged_date, sevenDaysAgo))
      )
      .groupBy(skillCard.skillName)
      .orderBy(desc(sql`sum(${timeLog.minutes})`))
      .limit(1);

    if (result.length === 0) {
      return { skillName: "No activity", hoursSpent: 0 };
    }

    const totalMinutes = result[0]?.totalMinutes || 0;
    return {
      skillName: result[0]?.skillName || "Unknown",
      hoursSpent: Math.round((totalMinutes / 60) * 10) / 10,
    };
  } catch (error) {
    console.error("Failed to get most active skill:", error);
    return { skillName: "Error loading", hoursSpent: 0 };
  }
}

// Get comprehensive overview data
export async function getOverviewAnalytics(): Promise<{
  timeSpentYesterday: { hoursSpent: number; tasksCompleted: number };
  weeklyTime: { totalHours: number; daysWithActivity: number };
  monthlyTime: {totalHours: number; daysWithActivity: number};
  mostActiveSkill: { skillName: string; hoursSpent: number };
}> {
  try {
    const [
      timeSpentYesterday,
      weeklyTime,
      monthlyTime,
      mostActiveSkill,
    ] = await Promise.all([
      getTimeSpentYesterday(),
      getWeeklyTimeSpent(),
      getMontlyTimeSpent(),
      getMostActiveSkill(),
    ]);

    return {
      timeSpentYesterday,
      weeklyTime,
      monthlyTime,
      mostActiveSkill,
    };
  } catch (error) {
    console.error("Failed to get overview analytics:", error);
    return {
      timeSpentYesterday: { hoursSpent: 0, tasksCompleted: 0 },
      weeklyTime: { totalHours: 0, daysWithActivity: 0 },
      monthlyTime: {totalHours: 0, daysWithActivity: 0},
      mostActiveSkill: { skillName: "No data", hoursSpent: 0 },
    };
  }
}
