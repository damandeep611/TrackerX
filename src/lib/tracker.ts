/**
 * Pure helpers for the daily tracker (shared by client and server).
 */
import { formatDuration, parseDuration } from "@/lib/duration";
import type { TrackerDay, TrackerDaySummary } from "@/types/tracker";
import { MAX_TRACKER_TASK_MINUTES } from "@/types/tracker";

/**
 * parseDuration plus the way people write it in notes: "1 hour", "1.5 hour",
 * "3hours", "45 min", "1:45 hours", "1 hour 30 min". Null if unreadable.
 */
export function parseTrackerDuration(input: string, max = MAX_TRACKER_TASK_MINUTES): number | null {
  const s = input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/(hours?|hrs?)/g, "h")
    .replace(/(minutes?|mins?)/g, "m")
    .replace(/^(\d+:[0-5]\d)h$/, "$1");
  const minutes = parseDuration(s);
  if (minutes === null || minutes > max) return null;
  return minutes;
}

/** formatDuration, or a placeholder for "not set". */
export function formatMaybe(minutes: number | null | undefined, empty = "—"): string {
  return minutes ? formatDuration(minutes) : empty;
}

export function summarizeDay(day: TrackerDay): TrackerDaySummary {
  let plannedMinutes = 0;
  let actualMinutes = 0;
  let done = 0;
  let estimatedWithActual = 0;
  let actualWithEstimate = 0;
  let carriedOut = 0;
  for (const t of day.tasks) {
    plannedMinutes += t.estimateMinutes ?? 0;
    actualMinutes += t.actualMinutes ?? 0;
    if (t.done) done++;
    else if (t.carry) carriedOut++;
    if (t.estimateMinutes && t.actualMinutes) {
      estimatedWithActual += t.estimateMinutes;
      actualWithEstimate += t.actualMinutes;
    }
  }
  return {
    date: day.date,
    availableMinutes: day.availableMinutes,
    plannedMinutes,
    actualMinutes,
    done,
    total: day.tasks.length,
    estimatedWithActual,
    actualWithEstimate,
    carriedOut,
    learned: day.learned,
  };
}

/** Signed % by which actual time differs from estimates (+18 = 18% longer). Null without data. */
export function estimateDrift(
  rows: Pick<TrackerDaySummary, "estimatedWithActual" | "actualWithEstimate">[]
): number | null {
  let est = 0;
  let act = 0;
  for (const r of rows) {
    est += r.estimatedWithActual;
    act += r.actualWithEstimate;
  }
  if (est === 0) return null;
  return Math.round(((act - est) / est) * 100);
}

/** "YYYY-MM-DD" ± n days (UTC arithmetic on a date key). */
export function shiftDate(key: string, days: number): string {
  const d = new Date(`${key}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** "Monday, 17 November" (UTC, since keys are local dates at UTC midnight). */
export function formatLongDate(key: string): string {
  return new Date(`${key}T00:00:00Z`).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
}

/** "Mon 17 Nov". */
export function formatShortDate(key: string): string {
  return new Date(`${key}T00:00:00Z`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

/** "Today", "Yesterday", "Tomorrow" or "Mon 17 Nov". */
export function relativeDayLabel(key: string, today: string): string {
  if (key === today) return "Today";
  if (key === shiftDate(today, -1)) return "Yesterday";
  if (key === shiftDate(today, 1)) return "Tomorrow";
  return formatShortDate(key);
}
