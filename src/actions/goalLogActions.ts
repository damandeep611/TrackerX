"use server";

import { db } from "@/db/drizzle";
import { goalLogs } from "@/db/schema/schema";
import { auth } from "@/lib/auth";
import { and, eq, desc } from "drizzle-orm";
import { headers } from "next/headers";

// Get logs for a specific goal
export async function getGoalLogs(goalId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) throw new Error("Not authenticated");

  const logs = await db
    .select()
    .from(goalLogs)
    .where(
      and(
        eq(goalLogs.goalId, goalId),
        eq(goalLogs.userId, session.user.id)
      )
    )
    .orderBy(desc(goalLogs.startTime));

  return logs.map((log) => ({
    ...log,
    createdAt: log.createdAt.toISOString(),
    startTime: log.startTime.toISOString(),
    endTime: log.endTime.toISOString(),
  }));
}

// Add a new goal log
export async function addGoalLog({
  goalId,
  title,
  startTime,
  endTime,
}: {
  goalId: string;
  title: string;
  startTime: Date;
  endTime: Date;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) throw new Error("Not authenticated");

  // Calculate duration in minutes
  const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 1000 / 60);

  const [newLog] = await db.insert(goalLogs)
    .values({
      goalId,
      userId: session.user.id,
      title,
      startTime,
      endTime,
      durationMinutes,
    })
    .returning();

  return {
    ...newLog,
    createdAt: newLog.createdAt.toISOString(),
    startTime: newLog.startTime.toISOString(),
    endTime: newLog.endTime.toISOString(),
  };
}

// Delete a goal log
export async function deleteGoalLog(id: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) throw new Error("Not authenticated");

  await db.delete(goalLogs)
    .where(
      and(
        eq(goalLogs.id, id),
        eq(goalLogs.userId, session.user.id)
      )
    );

  return { success: true };
}
