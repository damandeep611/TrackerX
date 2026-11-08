"use server";

import { and, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db/drizzle";
import { timeLog } from "@/db/schema/schema";
import { requireUser } from "@/lib/require-user";
import { getUserToday } from "@/lib/user-today";
import {
  lastNDays,
  summarize,
  type DashboardInsights,
  type SkillActivity,
} from "@/lib/insights";

const HISTORY_DAYS = 365;
const SKILL_DAYS = 14;

/**
 * Everything the home dashboard's insight widgets need, in three grouped
 * queries run in parallel: per-day totals (1 year, for streaks/consistency/
 * week-over-week), per-skill per-day totals (14 days) and each skill's last log.
 */
export async function getDashboardInsights(): Promise<DashboardInsights> {
  const userId = await requireUser();

  const now = await getUserToday();
  const keys = lastNDays(HISTORY_DAYS, now);
  const skillKeys = keys.slice(-SKILL_DAYS);
  const historyStart = new Date(`${keys[0]}T00:00:00.000Z`);
  const skillStart = new Date(`${skillKeys[0]}T00:00:00.000Z`);

  // logged_date is a date stored at UTC midnight (timestamp without tz).
  const day = sql<string>`to_char(${timeLog.logged_date}, 'YYYY-MM-DD')`;
  const minutes = sql<number>`sum(${timeLog.minutes})`.mapWith(Number);
  const mine = eq(timeLog.user_id, userId);

  const [daily, skillDaily, lastLogged] = await Promise.all([
    db
      .select({ day, minutes })
      .from(timeLog)
      .where(and(mine, gte(timeLog.logged_date, historyStart)))
      .groupBy(day),
    db
      .select({ skillId: timeLog.skill_id, day, minutes })
      .from(timeLog)
      .where(and(mine, gte(timeLog.logged_date, skillStart)))
      .groupBy(timeLog.skill_id, day),
    db
      .select({
        skillId: timeLog.skill_id,
        last: sql<string>`to_char(max(${timeLog.logged_date}), 'YYYY-MM-DD')`,
      })
      .from(timeLog)
      .where(mine)
      .groupBy(timeLog.skill_id),
  ]);

  const summary = summarize(new Map(daily.map((r) => [r.day, r.minutes])), now, HISTORY_DAYS);

  const skills: Record<string, SkillActivity> = {};
  const ensure = (id: string) =>
    (skills[id] ??= { minutes7d: 0, daily14: skillKeys.map(() => 0), lastLogged: null });
  const dayIndex = new Map(skillKeys.map((k, i) => [k, i]));
  for (const r of skillDaily) {
    const idx = dayIndex.get(r.day);
    if (idx === undefined) continue;
    const s = ensure(r.skillId);
    s.daily14[idx] += r.minutes;
    if (idx >= SKILL_DAYS - 7) s.minutes7d += r.minutes;
  }
  for (const r of lastLogged) ensure(r.skillId).lastLogged = r.last;

  return { ...summary, skills };
}
