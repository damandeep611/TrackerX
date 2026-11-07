import "server-only";

import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db/drizzle";
import { skillCard, timeLog } from "@/db/schema/schema";

/**
 * Recompute a skill card's cached `currentHours` from its time logs.
 * Internal helper (not a Server Action): callers must pass the verified user id.
 */
export async function recomputeSkillHours(skillId: string, userId: string): Promise<void> {
  try {
    const [row] = await db
      .select({
        totalMinutes: sql<number>`COALESCE(sum(${timeLog.minutes}), 0)`.mapWith(Number),
      })
      .from(timeLog)
      .where(and(eq(timeLog.skill_id, skillId), eq(timeLog.user_id, userId)));

    const totalHours = (row?.totalMinutes ?? 0) / 60;

    await db
      .update(skillCard)
      .set({ currentHours: totalHours.toFixed(2) })
      .where(and(eq(skillCard.id, skillId), eq(skillCard.userId, userId)));
  } catch (error) {
    console.error(`Failed to update hours for skill ${skillId}:`, error);
  }
}
