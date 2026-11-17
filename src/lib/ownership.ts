import "server-only";

import { and, eq } from "drizzle-orm";
import { db } from "@/db/drizzle";
import {
  sandboxes,
  sandboxResources,
  skillCard,
  skillTask,
  trackerDays,
  trackerTasks,
  trackerTomorrow,
} from "@/db/schema/schema";

export class NotFoundError extends Error {
  constructor(what = "Resource") {
    // Same message whether it doesn't exist or belongs to someone else.
    super(`${what} not found`);
    this.name = "NotFoundError";
  }
}

/** Throws unless `sandboxId` belongs to `userId`. */
export async function assertSandboxOwner(sandboxId: string, userId: string) {
  const [row] = await db
    .select({ id: sandboxes.id })
    .from(sandboxes)
    .where(and(eq(sandboxes.id, sandboxId), eq(sandboxes.userId, userId)))
    .limit(1);
  if (!row) throw new NotFoundError("Sandbox");
}

/** Throws unless `resourceId` belongs to `sandboxId` and the sandbox belongs to `userId`. */
export async function assertResourceOwner(resourceId: string, sandboxId: string, userId: string) {
  const [row] = await db
    .select({ id: sandboxResources.id })
    .from(sandboxResources)
    .innerJoin(sandboxes, eq(sandboxResources.sandboxId, sandboxes.id))
    .where(
      and(
        eq(sandboxResources.id, resourceId),
        eq(sandboxResources.sandboxId, sandboxId),
        eq(sandboxes.userId, userId)
      )
    )
    .limit(1);
  if (!row) throw new NotFoundError("Resource");
}

/** Returns the skill's slug if `skillId` belongs to `userId`, otherwise null. */
export async function getOwnedSkill(skillId: string, userId: string) {
  const [row] = await db
    .select({ id: skillCard.id, slug: skillCard.slug })
    .from(skillCard)
    .where(and(eq(skillCard.id, skillId), eq(skillCard.userId, userId)))
    .limit(1);
  return row ?? null;
}

/** Returns the task if it belongs to `userId` and to `skillId`, otherwise null. */
export async function getOwnedTask(taskId: string, skillId: string, userId: string) {
  const [row] = await db
    .select({ id: skillTask.id })
    .from(skillTask)
    .where(
      and(
        eq(skillTask.id, taskId),
        eq(skillTask.skill_id, skillId),
        eq(skillTask.user_id, userId)
      )
    )
    .limit(1);
  return row ?? null;
}

/** The tracker task with its day's id + date, or throws unless the day belongs to `userId`. */
export async function getOwnedTrackerTask(taskId: string, userId: string) {
  const [row] = await db
    .select({ id: trackerTasks.id, dayId: trackerTasks.dayId, date: trackerDays.date })
    .from(trackerTasks)
    .innerJoin(trackerDays, eq(trackerDays.id, trackerTasks.dayId))
    .where(and(eq(trackerTasks.id, taskId), eq(trackerDays.userId, userId)))
    .limit(1);
  if (!row) throw new NotFoundError("Task");
  return row;
}

/** A "tomorrow" item with its day's id + date, or throws unless the day belongs to `userId`. */
export async function getOwnedTomorrowItem(itemId: string, userId: string) {
  const [row] = await db
    .select({ id: trackerTomorrow.id, dayId: trackerTomorrow.dayId, date: trackerDays.date })
    .from(trackerTomorrow)
    .innerJoin(trackerDays, eq(trackerDays.id, trackerTomorrow.dayId))
    .where(and(eq(trackerTomorrow.id, itemId), eq(trackerDays.userId, userId)))
    .limit(1);
  if (!row) throw new NotFoundError("Item");
  return row;
}
