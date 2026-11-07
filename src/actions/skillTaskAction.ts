"use server";

import { db } from "@/db/drizzle";
import { skillCard, skillTask, timeLog } from "@/db/schema/schema";
import { newSkillTodo, skillTodo } from "@/types/skillDashboardTypes";
import { and, desc, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/require-user";
import { getOwnedSkill } from "@/lib/ownership";
import { recomputeSkillHours } from "@/lib/skill-hours";
import { parseInput, tryParseInput, zId, zOptionalText, zText } from "@/lib/validation";

const taskStatus = z.enum(["todo", "in_progress", "done"]);
const tags = z.array(z.string().trim().min(1).max(50)).max(20).default([]);

const newTaskInput = z.object({
  skillId: zId,
  title: zText(255),
  description: zOptionalText(700),
  tags,
  status: taskStatus.optional(),
});

const editTaskInput = z.object({
  title: zText(255),
  description: zOptionalText(700),
  tags,
});

const INVALID = { success: false, error: "Invalid input" } as const;

//----------- now the server action CRUD operations

//ACTION: Get tasks for a specific skill-----------
export async function getSkillTasksForSkill(
  skillId: string
): Promise<skillTodo[]> {
  const userId = await requireUser();
  skillId = parseInput(zId, skillId);

  const skillTasks = await db
    .select()
    .from(skillTask)
    .where(and(eq(skillTask.skill_id, skillId), eq(skillTask.user_id, userId)))
    .orderBy(desc(skillTask.createdAt));

  return skillTasks.map((t) => ({
    id: t.id,
    skill_id: t.skill_id || "",
    title: t.title,
    description: t.description || "",
    done: t.done,
    status: t.status || (t.done ? "done" : "todo"), // Fallback/Sync for existing data
    tags: t.tags || [],
    date: t.date.toISOString(),
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  }));
}

//ACTION: Add skill Task
export async function addSkillTasks(
  newTodo: newSkillTodo
): Promise<{ success: boolean; error?: string; newTask?: skillTodo }> {
  const userId = await requireUser();

  if (!newTodo?.title || !newTodo.title.trim()) {
    return { success: false, error: "Title is required" };
  }
  const input = tryParseInput(newTaskInput, newTodo);
  if (!input) return INVALID;

  try {
    // The skill must belong to the caller (SEC-04).
    const parentSkill = await getOwnedSkill(input.skillId, userId);
    if (!parentSkill) {
      return { success: false, error: "Skill not found" };
    }

    const insertedTasks = await db
      .insert(skillTask)
      .values({
        user_id: userId,
        skill_id: parentSkill.id,
        title: input.title,
        description: input.description,
        tags: input.tags,
        status: input.status ?? "todo",
      })
      .returning();

    if (!insertedTasks || insertedTasks.length === 0) {
      throw new Error("Failed to retrieve tasks or retrieve results");
    }

    const createdSkillTask = insertedTasks[0];

    revalidatePath(`/dashboard/skills/${parentSkill.slug}`);

    revalidatePath("/dashboard");

    const newTask: skillTodo = {
      id: createdSkillTask.id,
      skill_id: createdSkillTask.skill_id || "",
      title: createdSkillTask.title,
      description: createdSkillTask.description || "",
      done: createdSkillTask.done,
      status: createdSkillTask.status || "todo",
      tags: createdSkillTask.tags || [],
      date: createdSkillTask.date.toISOString(),
      createdAt: createdSkillTask.createdAt.toISOString(),
      updatedAt: createdSkillTask.updatedAt.toISOString(),
    };

    return { success: true, newTask };
  } catch (error) {
    console.log("Failed to add skill Task to the skill card", error);
    return { success: false, error: "Failed to add Task. Please try again" };
  }
}

//ACTION: Editing the skill card task
export async function editSkillTask(
  taskId: string,
  updatedFields: {
    title: string;
    description: string | null;

    tags: string[];
  }
): Promise<{ success: boolean; error?: string }> {
  const userId = await requireUser();

  if (!updatedFields?.title || !updatedFields.title.trim()) {
    return { success: false, error: "title is required" };
  }
  const input = tryParseInput(editTaskInput, updatedFields);
  const id = tryParseInput(zId, taskId);
  if (!input || !id) return INVALID;
  taskId = id;
  try {
    const result = await db
      .update(skillTask)
      .set({
        title: input.title,
        description: input.description,
        tags: input.tags,
        updatedAt: new Date(),
      })
      .where(and(eq(skillTask.id, taskId), eq(skillTask.user_id, userId)));
    if (result.rowCount === 0) {
      return {
        success: false,
        error: "Task not found or you don't have permission to edit it",
      };
    }
    // Revalidate (if needed - find skillId associated with taskId first)
    const taskData = await db
      .select({ skill_id: skillTask.skill_id })
      .from(skillTask)
      .where(and(eq(skillTask.id, taskId), eq(skillTask.user_id, userId)))
      .limit(1);
    if (taskData[0]?.skill_id) {
      const parentSkill = await db
        .select({ slug: skillCard.slug })
        .from(skillCard)
        .where(and(eq(skillCard.id, taskData[0].skill_id), eq(skillCard.userId, userId)))
        .limit(1);
      if (parentSkill[0]?.slug) {
        revalidatePath(`/dashboard/skills/${parentSkill[0].slug}`);
      }
    }
    return { success: true };
  } catch (error) {
    console.error("failed to edit task", error);
    return { success: false, error: "Failed to edit task. Please try again" };
  }
}

// ACTION : toggle skill task to check uncheck
export async function toggleTaskDone(
  taskId: string,
  skillId: string,
  done: boolean
): Promise<{ success: boolean; error?: string }> {
  const userId = await requireUser();

  if (!skillId) {
    return { success: false, error: "Skill ID is missing for toggle" };
  }
  const ids = tryParseInput(z.object({ taskId: zId, skillId: zId, done: z.boolean() }), { taskId, skillId, done });
  if (!ids) return INVALID;

  try {
    const status = done ? "done" : "todo";
    const result = await db
      .update(skillTask)
      .set({ done, status })
      .where(
        and(
          eq(skillTask.id, taskId),
          eq(skillTask.skill_id, skillId),
          eq(skillTask.user_id, userId)
        )
      );

    if (result.rowCount === 0) {
      return {
        success: false,
        error: "Task not found or you don't have permission to update it",
      };
    }

    // Revalidate path to ensure server-side data consistency
    const parentSkill = await db
      .select({ slug: skillCard.slug })
      .from(skillCard)
      .where(and(eq(skillCard.id, skillId), eq(skillCard.userId, userId)))
      .limit(1);

    if (parentSkill[0]?.slug) {
      revalidatePath(`/dashboard/skills/${parentSkill[0].slug}`);
    }
    revalidatePath("/dashboard");

    return { success: true };
  } catch (err) {
    console.log(err);
    return { success: false, error: "Server error while toggling task" };
  }
}

// ACTION: Update task status (Drag and Drop)
export async function updateTaskStatus(
  taskId: string,
  skillId: string,
  status: string
): Promise<{ success: boolean; error?: string }> {
  const userId = await requireUser();

  if (!skillId) {
    return { success: false, error: "Skill ID is missing for status update" };
  }
  const ids = tryParseInput(z.object({ taskId: zId, skillId: zId, status: taskStatus }), { taskId, skillId, status });
  if (!ids) return INVALID;

  try {
    const done = status === "done";
    const result = await db
      .update(skillTask)
      .set({ status, done })
      .where(
        and(
          eq(skillTask.id, taskId),
          eq(skillTask.skill_id, skillId),
          eq(skillTask.user_id, userId)
        )
      );

    if (result.rowCount === 0) {
      return {
        success: false,
        error: "Task not found or you don't have permission to update it",
      };
    }

    // Revalidate path to ensure server-side data consistency
    const parentSkill = await db
      .select({ slug: skillCard.slug })
      .from(skillCard)
      .where(and(eq(skillCard.id, skillId), eq(skillCard.userId, userId)))
      .limit(1);

    if (parentSkill[0]?.slug) {
      revalidatePath(`/dashboard/skills/${parentSkill[0].slug}`);
    }
    revalidatePath("/dashboard");

    return { success: true };
  } catch (err) {
    console.log(err);
    return { success: false, error: "Server error while updating task status" };
  }
}

//ACTION:  Delete skill Task

export async function deleteSkillTask(
  taskId: string,
  skillId: string
): Promise<{ success: boolean; error?: string }> {
  const userId = await requireUser();
  if (!skillId) {
    return { success: false, error: "Skill ID is missing for delete" };
  }
  const ids = tryParseInput(z.object({ taskId: zId, skillId: zId }), { taskId, skillId });
  if (!ids) return INVALID;
  try {
    //delete rows from the 'skillTask' table
    const result = await db.delete(skillTask).where(
      and(
        eq(skillTask.id, taskId),
        eq(skillTask.user_id, userId),
        eq(skillTask.skill_id, skillId) //ensure task belongs to the specified skillcard
      )
    );
    //check if any rows were actually deleted
    if (result.rowCount === 0) {
      //if no rows deleted, the task didn't exist or didn't belong to theuser
      return {
        success: false,
        error: "Task not found or you don't have permission to delete it",
      };
    }

    await recomputeSkillHours(skillId, userId);

    // Revalidate
    const parentSkill = await db
      .select({ slug: skillCard.slug })
      .from(skillCard)
      .where(and(eq(skillCard.id, skillId), eq(skillCard.userId, userId)))
      .limit(1);
    if (parentSkill[0]?.slug) {
      revalidatePath(`/dashboard/skills/${parentSkill[0].slug}`);
    }
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete task:", error);
    return { success: false, error: "Failed to delete task. Please try again" };
  }
}


// ACTION: Get today's total time spent across all skills
export async function getTodayTotalTimeSpent(): Promise<number> {
  const userId = await requireUser();

  try {
    // Get today's date in YYYY-MM-DD format for date comparison
    const today = new Date();
    const todayString = today.toISOString().split("T")[0]; // YYYY-MM-DD format

    // Get sum of all minutes from time logs for today
    const result = await db
      .select({
        totalMinutes: sql<number>`COALESCE(sum(${timeLog.minutes}), 0)`.mapWith(
          Number
        ),
      })
      .from(timeLog)
      .where(
        and(
          eq(timeLog.user_id, userId),
          sql`DATE(${timeLog.logged_date}) = ${todayString}`
        )
      );

    const totalMinutes = result[0]?.totalMinutes || 0;
    // Convert to hours and round to 1 decimal place
    const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

    console.log(
      `Today's total time spent: ${totalHours}h (${totalMinutes} minutes)`
    );
    return totalHours;
  } catch (error) {
    console.error("Failed to get today's total time spent:", error);
    return 0;
  }
}

