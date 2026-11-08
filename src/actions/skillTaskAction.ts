"use server";

import { and, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/drizzle";
import { skillTask, timeLog } from "@/db/schema/schema";
import { requireUser } from "@/lib/require-user";
import { getOwnedSkill } from "@/lib/ownership";
import { recomputeSkillHours } from "@/lib/skill-hours";
import { parseInput, tryParseInput, zId, zOptionalText, zText } from "@/lib/validation";
import {
  TASK_STATUSES,
  type NewSkillTask,
  type SkillTask,
  type SkillTaskPatch,
  type TaskStatus,
} from "@/types/skillDashboardTypes";

const taskStatus = z.enum(TASK_STATUSES);
const zTags = z
  .array(z.string().trim().min(1).max(50))
  .max(10)
  .transform((tags) => [...new Set(tags)]);

const newTaskInput = z.object({
  skillId: zId,
  title: zText(255),
  description: zOptionalText(700),
  tags: zTags.default([]),
  status: taskStatus.default("todo"),
});

const patchInput = z.object({
  taskId: zId,
  skillId: zId,
  patch: z
    .object({
      title: zText(255).optional(),
      description: zOptionalText(700).optional(),
      tags: zTags.optional(),
      status: taskStatus.optional(),
    })
    .refine((p) => Object.keys(p).length > 0, "Nothing to update"),
});

type Result<T = object> = ({ success: true } & T) | { success: false; error: string };
const INVALID = { success: false, error: "Invalid input" } as const;

type TaskRow = typeof skillTask.$inferSelect;

function toTask(t: TaskRow, minutes = 0): SkillTask {
  const status = (TASK_STATUSES as readonly string[]).includes(t.status)
    ? (t.status as TaskStatus)
    : t.done
      ? "done"
      : "todo";
  return {
    id: t.id,
    skill_id: t.skill_id,
    title: t.title,
    description: t.description || null,
    status,
    tags: t.tags ?? [],
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
    minutes,
  };
}

/** All of a skill's tasks, newest first, each with its total logged minutes (one query). */
export async function getSkillTasks(skillId: string): Promise<SkillTask[]> {
  const userId = await requireUser();
  skillId = parseInput(zId, skillId);

  const totals = db
    .select({
      taskId: timeLog.task_id,
      minutes: sql<number>`sum(${timeLog.minutes})`.as("minutes"),
    })
    .from(timeLog)
    .where(and(eq(timeLog.skill_id, skillId), eq(timeLog.user_id, userId)))
    .groupBy(timeLog.task_id)
    .as("totals");

  const rows = await db
    .select({
      task: skillTask,
      minutes: sql<number>`coalesce(${totals.minutes}, 0)`.mapWith(Number),
    })
    .from(skillTask)
    .leftJoin(totals, eq(totals.taskId, skillTask.id))
    .where(and(eq(skillTask.skill_id, skillId), eq(skillTask.user_id, userId)))
    .orderBy(desc(skillTask.createdAt));

  return rows.map((r) => toTask(r.task, r.minutes));
}

export async function addSkillTask(data: NewSkillTask): Promise<Result<{ task: SkillTask }>> {
  const userId = await requireUser();
  const input = tryParseInput(newTaskInput, data);
  if (!input) return INVALID;

  try {
    // The skill must belong to the caller (SEC-04).
    const skill = await getOwnedSkill(input.skillId, userId);
    if (!skill) return { success: false, error: "Skill not found" };

    const [row] = await db
      .insert(skillTask)
      .values({
        user_id: userId,
        skill_id: skill.id,
        title: input.title,
        description: input.description,
        tags: input.tags,
        status: input.status,
        done: input.status === "done",
      })
      .returning();
    return { success: true, task: toTask(row) };
  } catch (error) {
    console.error("Failed to add task:", error);
    return { success: false, error: "Failed to add task. Please try again" };
  }
}

/** Edit any of title / description / tags / status. `done` follows `status`. */
export async function updateSkillTask(
  taskId: string,
  skillId: string,
  patch: SkillTaskPatch
): Promise<Result> {
  const userId = await requireUser();
  const input = tryParseInput(patchInput, { taskId, skillId, patch });
  if (!input) return INVALID;
  const p = input.patch;

  try {
    const result = await db
      .update(skillTask)
      .set({
        ...(p.title !== undefined && { title: p.title }),
        ...(p.description !== undefined && { description: p.description }),
        ...(p.tags !== undefined && { tags: p.tags }),
        ...(p.status !== undefined && { status: p.status, done: p.status === "done" }),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(skillTask.id, input.taskId),
          eq(skillTask.skill_id, input.skillId),
          eq(skillTask.user_id, userId)
        )
      );
    if (result.rowCount === 0) return { success: false, error: "Task not found" };
    return { success: true };
  } catch (error) {
    console.error("Failed to update task:", error);
    return { success: false, error: "Failed to update task. Please try again" };
  }
}

export async function deleteSkillTask(taskId: string, skillId: string): Promise<Result> {
  const userId = await requireUser();
  const ids = tryParseInput(z.object({ taskId: zId, skillId: zId }), { taskId, skillId });
  if (!ids) return INVALID;

  try {
    // Time logs go with the task (ON DELETE CASCADE).
    const result = await db
      .delete(skillTask)
      .where(
        and(
          eq(skillTask.id, ids.taskId),
          eq(skillTask.skill_id, ids.skillId),
          eq(skillTask.user_id, userId)
        )
      );
    if (result.rowCount === 0) return { success: false, error: "Task not found" };
    await recomputeSkillHours(ids.skillId, userId);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete task:", error);
    return { success: false, error: "Failed to delete task. Please try again" };
  }
}
