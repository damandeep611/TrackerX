/**
 * Pure helpers for the home-dashboard insights (shared by the server action
 * and the client widgets; no DB access here).
 *
 * Days are UTC calendar dates ("YYYY-MM-DD"): time logs store `logged_date`
 * as a date at UTC midnight, so UTC keys line up with how entries are written.
 */

export type DayBucket = { date: string; minutes: number };

export type SkillActivity = {
  /** Minutes logged in the last 7 days (today included). */
  minutes7d: number;
  /** Minutes per day for the last 14 days, oldest → newest. */
  daily14: number[];
  /** Most recent day with a log, or null if never logged. */
  lastLogged: string | null;
};

export type DashboardInsights = {
  today: string;
  hasAnyLogs: boolean;
  /** Last 28 days, oldest → newest (zero-filled). */
  daily28: DayBucket[];
  last7: { minutes: number; prevMinutes: number; daily: number[] };
  consistency: {
    windowDays: number;
    activeDays: number;
    prevActiveDays: number;
    /** Active days per 7-day chunk of the window, oldest → newest. */
    weekly: number[];
  };
  streak: { current: number; best: number; activeToday: boolean };
  skills: Record<string, SkillActivity>;
};

export const CONSISTENCY_WINDOW = 28;

export function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** The last `n` UTC date keys ending at `today`, oldest → newest. */
export function lastNDays(n: number, today: Date = new Date()): string[] {
  const end = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  return Array.from({ length: n }, (_, i) => dateKey(new Date(end - (n - 1 - i) * 86_400_000)));
}

/** Whole days from `from` to `to` (both date keys). */
export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);
}

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

/**
 * Current + longest run of consecutive active days over `days` (oldest → newest,
 * ending today). The current streak stays alive until today ends, so a streak
 * that ended yesterday still counts (with `activeToday: false`).
 */
export function computeStreak(days: number[]) {
  let best = 0;
  let run = 0;
  for (const m of days) {
    run = m > 0 ? run + 1 : 0;
    best = Math.max(best, run);
  }
  const activeToday = (days.at(-1) ?? 0) > 0;
  let current = 0;
  for (let i = days.length - (activeToday ? 1 : 2); i >= 0 && days[i] > 0; i--) current++;
  return { current, best, activeToday };
}

/** Builds the insight summary from per-day totals (minutes by date key). */
export function summarize(
  minutesByDay: Map<string, number>,
  today: Date = new Date(),
  historyDays = 365
): Omit<DashboardInsights, "skills"> {
  const keys = lastNDays(historyDays, today);
  const series = keys.map((k) => minutesByDay.get(k) ?? 0);
  const w = CONSISTENCY_WINDOW;
  const window = series.slice(-w);
  const prevWindow = series.slice(-2 * w, -w);
  const active = (xs: number[]) => xs.filter((m) => m > 0).length;

  return {
    today: keys.at(-1)!,
    hasAnyLogs: series.some((m) => m > 0),
    daily28: keys.slice(-w).map((date, i) => ({ date, minutes: window[i] })),
    last7: {
      minutes: sum(series.slice(-7)),
      prevMinutes: sum(series.slice(-14, -7)),
      daily: series.slice(-7),
    },
    consistency: {
      windowDays: w,
      activeDays: active(window),
      prevActiveDays: active(prevWindow),
      weekly: Array.from({ length: w / 7 }, (_, i) => active(window.slice(i * 7, i * 7 + 7))),
    },
    streak: computeStreak(series),
  };
}

/** { value: "3.5", unit: "h" } or { value: "45", unit: "m" } under an hour. */
export function splitHours(minutes: number): { value: string; unit: "h" | "m" } {
  if (minutes < 60) return { value: String(Math.round(minutes)), unit: "m" };
  const h = Math.round((minutes / 60) * 10) / 10;
  return { value: Number.isInteger(h) ? String(h) : h.toFixed(1), unit: "h" };
}

/** "45m", "3h", "3.5h". */
export function formatHours(minutes: number): string {
  const { value, unit } = splitHours(minutes);
  return value + unit;
}

/** Signed % change, or undefined when there's no baseline to compare with. */
export function percentChange(current: number, previous: number): number | undefined {
  if (previous <= 0) return undefined;
  return ((current - previous) / previous) * 100;
}

/** One or two plain-language sentences for the dashboard header. */
export function buildTakeaway(i: DashboardInsights): string {
  if (!i.hasAnyLogs) return "Log your first session and your trends will show up here.";

  const { minutes, prevMinutes } = i.last7;
  const diff = minutes - prevMinutes;
  let trend: string;
  if (minutes === 0) {
    trend =
      prevMinutes > 0
        ? `Nothing logged in the last 7 days, down from ${formatHours(prevMinutes)} the week before.`
        : "Nothing logged in the last 7 days.";
  } else if (prevMinutes === 0) {
    trend = `${formatHours(minutes)} logged in the last 7 days, up from nothing the week before.`;
  } else if (Math.abs(diff) < 30) {
    trend = `You're on pace with last week at ${formatHours(minutes)}.`;
  } else {
    trend = `You're ${formatHours(Math.abs(diff))} ${diff > 0 ? "ahead of" : "behind"} last week.`;
  }

  const s = i.streak;
  let streak = "";
  if (s.activeToday && s.current >= 2) streak = ` ${s.current}-day streak and counting.`;
  else if (!s.activeToday && s.current >= 1)
    streak = ` Log today to keep your ${s.current}-day streak.`;

  return trend + streak;
}
