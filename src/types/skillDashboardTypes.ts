/** Shared shapes passed between Server Actions and client components. */

export const TASK_STATUSES = ["todo", "in_progress", "done"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

/** A task on a skill, with the time logged against it. */
export interface SkillTask {
  id: string;
  skill_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  tags: string[];
  createdAt: string; // ISO
  updatedAt: string; // ISO
  /** Total minutes logged on this task. */
  minutes: number;
}

export type NewSkillTask = {
  skillId: string;
  title: string;
  description?: string | null;
  tags?: string[];
  status?: TaskStatus;
};

export type SkillTaskPatch = Partial<Pick<SkillTask, "title" | "description" | "tags" | "status">>;

export type NewTimeLog = {
  task_id: string;
  skill_id: string;
  minutes: number;
  /** The user's local calendar date, "YYYY-MM-DD". */
  logged_date: string;
};

/** Longest single time entry, in minutes (owner decision: 3h cap). */
export const MAX_ENTRY_MINUTES = 180;
