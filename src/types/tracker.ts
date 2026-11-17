/**
 * Daily schedule tracker (/dashboard/tracker). One `TrackerDay` per user per
 * local calendar date ("YYYY-MM-DD"). Durations are whole minutes.
 */

/** Longest estimate / actual time for one task (12h). Not the 3h log cap. */
export const MAX_TRACKER_TASK_MINUTES = 12 * 60;
/** Longest "available time" for a day. */
export const MAX_AVAILABLE_MINUTES = 16 * 60;

export interface TrackerTask {
  id: string;
  title: string;
  /** The "Explain task" column. */
  notes: string | null;
  estimateMinutes: number | null;
  /** Entered by hand at any time; null = not filled in yet. */
  actualMinutes: number | null;
  done: boolean;
  /** Unfinished task that should move to the next day (End of day → Carry over). */
  carry: boolean;
  /** Date of the day this task was carried from, if any. */
  carriedFrom: string | null;
}

/** A line in End of day → Tomorrow. Becomes a task when the next day imports it. */
export interface TomorrowItem {
  id: string;
  title: string;
  estimateMinutes: number | null;
}

export interface TrackerDay {
  date: string;
  /** Rough estimate set in the morning; null until set. Not a limit. */
  availableMinutes: number | null;
  /** The note to self at the top ("You are probably overcomplicating it…"). */
  reminder: string | null;
  /** End of day → "One thing I learned". */
  learned: string | null;
  tasks: TrackerTask[];
  tomorrow: TomorrowItem[];
}

/** What the previous day left for this one (shown as the import banner). */
export interface TrackerCarryIn {
  fromDate: string;
  carried: TrackerTask[];
  planned: TomorrowItem[];
}

/** What getTrackerDay returns. */
export interface TrackerDayData {
  day: TrackerDay;
  carryIn: TrackerCarryIn | null;
}

/** Days shown in the History tab (and summarised by getTrackerHistory). */
export const TRACKER_HISTORY_DAYS = 42;
export const MAX_TASKS_PER_DAY = 100;
export const MAX_TOMORROW_ITEMS = 50;

/** One row of the History tab. */
export interface TrackerDaySummary {
  date: string;
  availableMinutes: number | null;
  plannedMinutes: number;
  actualMinutes: number;
  done: number;
  total: number;
  /** Sum of estimates / actuals over tasks that have both (for estimate accuracy). */
  estimatedWithActual: number;
  actualWithEstimate: number;
  carriedOut: number;
  learned: string | null;
}

export type TrackerTaskPatch = Partial<
  Pick<TrackerTask, "title" | "notes" | "estimateMinutes" | "actualMinutes" | "done" | "carry">
>;

export type TrackerDayPatch = Partial<
  Pick<TrackerDay, "availableMinutes" | "reminder" | "learned">
>;

export type TomorrowPatch = Partial<Pick<TomorrowItem, "title" | "estimateMinutes">>;

/**
 * Everything the Today view can change. The design preview implements it with
 * local state; the real page implements it with React Query mutations.
 */
export interface TrackerDayActions {
  updateDay: (patch: TrackerDayPatch) => void;
  addTask: (input: { title: string; estimateMinutes: number | null }) => void;
  updateTask: (id: string, patch: TrackerTaskPatch) => void;
  deleteTask: (id: string) => void;
  reorderTasks: (orderedIds: string[]) => void;
  addTomorrow: (input: { title: string; estimateMinutes: number | null }) => void;
  updateTomorrow: (id: string, patch: TomorrowPatch) => void;
  removeTomorrow: (id: string) => void;
  importCarryIn: () => void;
  dismissCarryIn: () => void;
}
