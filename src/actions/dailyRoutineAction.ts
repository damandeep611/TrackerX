"use server";

import { db } from "@/db/drizzle";
import { dailyRoutine } from "@/db/schema/schema";
import { auth } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";

export async function setDailyHours(hours: number) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session) throw new Error("Not authenticated");
    // Get today's date at midnight for consistent querying
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Convert hours to string for database consistency
    const hoursString = hours.toString();

    // Check if routine exists for today
    const existingRoutine = await db
      .select()
      .from(dailyRoutine)
      .where(
        and(
          eq(dailyRoutine.userId, session.user.id),
          eq(dailyRoutine.routineDate, today)
        )
      )
      .limit(1);

    let result;
    if (existingRoutine.length > 0) {
      // Update existing routine
      result = await db
        .update(dailyRoutine)
        .set({
          totalHoursAvailable: hoursString,
          lastUpdated: new Date(),
        })
        .where(eq(dailyRoutine.id, existingRoutine[0].id))
        .returning();
    } else {
      // Insert new routine
      result = await db
        .insert(dailyRoutine)
        .values({
          userId: session.user.id,
          totalHoursAvailable: hoursString,
          routineDate: today,
        })
        .returning();
    }

    return { success: true, data: result[0] };
  } catch (error) {
    console.error("Failed to set daily hours:", error);
    return { success: false, error: "Failed to set daily hours" };
  }
}

export async function getTodayRoutine() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session) throw new Error("Not authenticated");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const routine = await db
      .select()
      .from(dailyRoutine)
      .where(
        and(
          eq(dailyRoutine.userId, session.user.id),
          eq(dailyRoutine.routineDate, today)
        )
      )
      .limit(1);

    return { success: true, data: routine[0] };
  } catch (error) {
    console.error("Failed to get today's routine:", error);
    return { success: false, error: "Failed to get today's routine" };
  }
}
