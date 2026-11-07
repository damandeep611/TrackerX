"use server";

import { db } from "@/db/drizzle";
import { goalLogs, goals } from "@/db/schema/schema";
import { and, eq, desc } from "drizzle-orm";
import { z } from "zod";
import { requireUser } from "@/lib/require-user";
import { NotFoundError } from "@/lib/ownership";
import { parseInput, zId } from "@/lib/validation";

const goalLogInput = z
  .object({
    goalId: zId,
    title: z.string().trim().min(1).max(255),
    startTime: z.coerce.date(),
    endTime: z.coerce.date(),
  })
  .refine((l) => l.endTime > l.startTime, "End time must be after start time")
  .refine(
    (l) => l.endTime.getTime() - l.startTime.getTime() <= 24 * 60 * 60 * 1000,
    "A session can't be longer than 24 hours"
  );

// Get logs for a specific goal
export async function getGoalLogs(goalId: string) {
  const userId = await requireUser();
  goalId = parseInput(zId, goalId);

  const logs = await db
    .select()
    .from(goalLogs)
    .where(
      and(
        eq(goalLogs.goalId, goalId),
        eq(goalLogs.userId, userId)
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
export async function addGoalLog(data: {
  goalId: string;
  title: string;
  startTime: Date;
  endTime: Date;
}) {
  const userId = await requireUser();
  const { goalId, title, startTime, endTime } = parseInput(goalLogInput, data);

  // The goal must belong to the caller.
  const [goal] = await db
    .select({ id: goals.id })
    .from(goals)
    .where(and(eq(goals.id, goalId), eq(goals.userId, userId)))
    .limit(1);
  if (!goal) throw new NotFoundError("Goal");

  // Calculate duration in minutes
  const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 1000 / 60);

  const [newLog] = await db.insert(goalLogs)
    .values({
      goalId,
      userId: userId,
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
  const userId = await requireUser();
  id = parseInput(zId, id);

  await db.delete(goalLogs)
    .where(
      and(
        eq(goalLogs.id, id),
        eq(goalLogs.userId, userId)
      )
    );

  return { success: true };
}
