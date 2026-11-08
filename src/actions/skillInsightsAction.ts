"use server";

import { and, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db/drizzle";
import { skillTask, timeLog } from "@/db/schema/schema";
import { requireUser } from "@/lib/require-user";
import { getOwnedSkill, NotFoundError } from "@/lib/ownership";
import { getUserToday } from "@/lib/user-today";
import { parseInput, zId } from "@/lib/validation";
import {
  buildProjectInsights,
  INSIGHTS_WINDOW_DAYS,
  lastNDays,
  type SkillInsights,
} from "@/lib/insights";

/** Trend, streak, consistency and totals for one skill (2 queries in parallel). */
export async function getSkillInsights(skillId: string): Promise<SkillInsights> {
  const userId = await requireUser();
  skillId = parseInput(zId, skillId);
  if (!(await getOwnedSkill(skillId, userId))) throw new NotFoundError("Skill");

  const today = await getUserToday();
  const keys = lastNDays(INSIGHTS_WINDOW_DAYS, today);
  const start = new Date(`${keys[0]}T00:00:00.000Z`);
  const day = sql<string>`to_char(${timeLog.logged_date}, 'YYYY-MM-DD')`;
  const mine = and(eq(timeLog.skill_id, skillId), eq(timeLog.user_id, userId));

  const [daily, [totals]] = await Promise.all([
    db
      .select({ day, minutes: sql<number>`sum(${timeLog.minutes})`.mapWith(Number) })
      .from(timeLog)
      .where(and(mine, gte(timeLog.logged_date, start)))
      .groupBy(day),
    db
      .select({
        minutes: sql<number>`coalesce(sum(${timeLog.minutes}), 0)`.mapWith(Number),
        last: sql<string | null>`to_char(max(${timeLog.logged_date}), 'YYYY-MM-DD')`,
      })
      .from(timeLog)
      .where(mine),
  ]);

  const byDay = new Map(daily.map((r) => [r.day, r.minutes]));
  return buildProjectInsights(byDay, totals, today);
}

/**
 * Tag chips for the task form: this skill's most recently used tags, plus a
 * few of the user's most frequent tags across all skills that aren't already
 * in the recent list.
 */
export async function getTagSuggestions(
  skillId: string
): Promise<{ recent: string[]; suggested: string[] }> {
  const userId = await requireUser();
  skillId = parseInput(zId, skillId);

  const [recentRows, frequent] = await Promise.all([
    db
      .select({ tags: skillTask.tags })
      .from(skillTask)
      .where(and(eq(skillTask.skill_id, skillId), eq(skillTask.user_id, userId)))
      .orderBy(desc(skillTask.updatedAt))
      .limit(40),
    db.execute<{ tag: string; n: number }>(sql`
      select t.tag, count(*)::int as n
      from ${skillTask}, unnest(${skillTask.tags}) as t(tag)
      where ${skillTask.user_id} = ${userId}
      group by t.tag
      order by n desc, t.tag
      limit 12
    `),
  ]);

  const recent = [...new Set(recentRows.flatMap((r) => r.tags ?? []))].slice(0, 6);
  const suggested = frequent.rows
    .map((r) => r.tag)
    .filter((t) => !recent.includes(t))
    .slice(0, 3);
  return { recent, suggested };
}
