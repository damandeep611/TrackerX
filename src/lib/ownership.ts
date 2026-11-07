import "server-only";

import { and, eq } from "drizzle-orm";
import { db } from "@/db/drizzle";
import {
  sandboxes,
  sandboxPhases,
  sandboxResources,
  skillCard,
  skillTask,
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

/** Throws unless `phaseId` belongs to `sandboxId` and the sandbox belongs to `userId`. */
export async function assertPhaseOwner(phaseId: string, sandboxId: string, userId: string) {
  const [row] = await db
    .select({ id: sandboxPhases.id })
    .from(sandboxPhases)
    .innerJoin(sandboxes, eq(sandboxPhases.sandboxId, sandboxes.id))
    .where(
      and(
        eq(sandboxPhases.id, phaseId),
        eq(sandboxPhases.sandboxId, sandboxId),
        eq(sandboxes.userId, userId)
      )
    )
    .limit(1);
  if (!row) throw new NotFoundError("Phase");
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
