"use server";

import { db } from "@/db/drizzle";
import { skillCard, skillTask } from "@/db/schema/schema";
import { auth } from "@/lib/auth";
import { newSkillTodo, skillTodo } from "@/types/skillDashboardTypes";
import { and, desc, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

//async function to get authenticated user id to use for server action functions
export async function getUserId(): Promise<string> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id) {
    throw new Error("User not Authenticated");
  }
  return session.user.id;
}

// --- Helper functionto update the parent' skillcard current hours
//to calculate the total duration in hours for skill's tasks and update the current hours field on the parent skillCard
export async function updateSkillCardHours(skillId: string): Promise<void> {
  const userId = await getUserId();
  //calculate the sum of durations for this skill's tasks
  try {
    //calculate the sum of durations in minutes for this skill's tasks
    const result = await db
      .select({
        // using sql helper for aggregation , to ensure type is number
        totalDuration: sql<number>`sum(${skillTask.duration})`.mapWith(Number),
      })
      .from(skillTask)
      .where(
        and(eq(skillTask.skill_id, skillId), eq(skillTask.user_id, userId)) //ensure we only sum user's tasks
      );

    const totalMinutes = result[0]?.totalDuration || 0;
    //convert total minutes to hours. using float for precision
    const totalHours = totalMinutes / 60.0;
    await db
      .update(skillCard)
      .set({ currentHours: totalHours.toString() })//ensure currentHours column in skillCard schema can store floats
      .where(and(eq(skillCard.id, skillId), eq(skillCard.userId, userId)));
    console.log(`Updated currentHours for skill ${skillId} to ${totalHours}`);
  } catch (error) {
    console.error(`Failed to update hours for skill ${skillId}:`, error);
  }
}

//----------- now the server action CRUD operations

//ACTION: Get tasks for a specific skill-----------
export async function getSkillTasksForSkill(
  skillId: string
): Promise<skillTodo[]> {
  // ensure the user is authenticated and get their id
  const userId = await getUserId();

  //-------1. fetch tasks from the skillTasks table
  const skillTasks = await db
    .select() //select all columns
    .from(skillTask) //from the skillTask table
    .where(and(eq(skillTask.skill_id, skillId), eq(skillTask.user_id, userId))) //where user_id matches the loggedin userId
    .orderBy(desc(skillTask.createdAt)); //order results by creation date, newest first

  // now data transformation and serialization for the data we are fetching from the database
  return skillTasks.map((t) => ({
    id: t.id,
    skill_id: t.skill_id || "",
    title: t.title,
    tag: t.tag,
    resourceLink: t.resourceLink,
    //converting date objects to ISO strings
    date: t.date.toISOString(),
    duration: t.duration,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  }));
}

//ACTION: Add skill Task

export async function addSkillTasks(
  newTodo: newSkillTodo
): Promise<{ success: boolean; error?: string; newTask?: skillTodo }> {
  //getting user id
  const userId = await getUserId();

  // server side input validation to ensure all input fields are present
  if (!newTodo.skillId) {
    return { success: false, error: "skill ID is missing" };
  }
  if (!newTodo.title || !newTodo.title.trim()) {
    return { success: false, error: "Title is required" };
  }

  try {
    //insert a new row into the skillTask table
    const insertedTasks = await db
      .insert(skillTask)
      .values({
        //map the input data into the corresponding  table columns
        user_id: userId,
        skill_id: newTodo.skillId,
        title: newTodo.title.trim(),
        resourceLink: newTodo.resourceLink?.trim() || null,
        tag: newTodo.tag?.trim() || null,
      })
      .returning(); //ask the database to return the newly inserted row

    //check if the insertion was successful and data is returned
    if (!insertedTasks || insertedTasks.length === 0) {
      throw new Error("Failed to retrieve tasks or retrieve results");
    }
    //get the data for the task that was just created
    const createdSkillTask = insertedTasks[0];
    await updateSkillCardHours(createdSkillTask.skill_id || "");
    // need the slug associated with the skillId to revalidate specific page
    const parentSkill = await db
      .select({ slug: skillCard.slug })
      .from(skillCard)
      .where(eq(skillCard.id, createdSkillTask.skill_id || ""))
      .limit(1);
    if (parentSkill[0]?.slug) {
      revalidatePath(`/dashboard/skills/${parentSkill[0].slug}`);
    }
    //next js caching and cache validation
    revalidatePath("/dashboard");
    // data serialization
    const newTask: skillTodo = {
      id: createdSkillTask.id,
      skill_id: createdSkillTask.skill_id || "",
      title: createdSkillTask.title,
      tag: createdSkillTask.tag,
      resourceLink: createdSkillTask.resourceLink,
      date: createdSkillTask.date.toISOString(),
      duration: createdSkillTask.duration,
      createdAt: createdSkillTask.createdAt.toISOString(),
      updatedAt: createdSkillTask.updatedAt.toISOString(),
    };
    //return success and newly created skill task data
    return { success: true, newTask };
  } catch (error) {
    console.log("Failed to add skill Task to the skill card", error);
    return { success: false, error: "Failed to add Task. Please try again" };
  }
}

// to update the tracked time duration for specific task

export async function updateskillTaskTime(
  taskId: string,
  newDuration: number,
  skillId: string
): Promise<{ success: boolean; error?: string }> {
  //fetching userId
  const userId = await getUserId();

  //input validation
  if (typeof newDuration !== "number" || newDuration < 0) {
    return { success: false, error: "Invalid duration value" };
  }
  try {
    //update rows in the task table
    const result = await db
      .update(skillTask)
      .set({ duration: newDuration, updatedAt: new Date() })
      .where(
        and(
          eq(skillTask.id, taskId),
          eq(skillTask.user_id, userId),
          eq(skillTask.skill_id, skillId) //ensuring task belongs to the specified skill
        )
      );
    if (result.rowCount === 0) {
      return {
        success: false,
        error: "Task not found or you don't have permission to update it",
      };
    }
    await updateSkillCardHours(skillId); //update parent skillCard hours After successful update
    //revalidate
    const parentSkill = await db
      .select({ slug: skillCard.slug })
      .from(skillCard)
      .where(eq(skillCard.id, skillId))
      .limit(1);
    if (parentSkill[0]?.slug) {
      revalidatePath(`/dashboard/skills/${parentSkill[0].slug}`);
    }
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to update task time", error);
    return {
      success: false,
      error: "Failed to update task time. Please try again",
    };
  }
}

//ACTION: Editing the skill card task
export async function editSkillTask(
  taskId: string,
  updatedFields: {
    title: string;
    resourceLink: string | null;
    tag: string | null;
  }
): Promise<{ success: boolean; error?: string }> {
  //ensure user id authenticated
  const userId = await getUserId();

  //input validation
  //to ensure the edited form is not empty
  if (!updatedFields.title || !updatedFields.title.trim()) {
    return { success: false, error: "title is required" };
  }
  try {
    const result = await db
      .update(skillTask)
      .set({
        title: updatedFields.title.trim(),
        resourceLink: updatedFields.resourceLink?.trim() || null,
        tag: updatedFields.tag?.trim() || null,
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
      .where(eq(skillTask.id, taskId))
      .limit(1);
    if (taskData[0]?.skill_id) {
      const parentSkill = await db
        .select({ slug: skillCard.slug })
        .from(skillCard)
        .where(eq(skillCard.id, taskData[0].skill_id))
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

//ACTION:  Delete skill Task

export async function deleteSkillTask(
  taskId: string,
  skillId: string
): Promise<{ success: boolean; error?: string }> {
  //user auth checking
  const userId = await getUserId();
  if (!skillId) {
    return { success: false, error: "Skill ID is missing for delete" };
  }
  try {
    //delete rows from the 'skillTask' table
    const result = await db
      .delete(skillTask)
      .where(
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

    await updateSkillCardHours(skillId);

    // Revalidate
    const parentSkill = await db
      .select({ slug: skillCard.slug })
      .from(skillCard)
      .where(eq(skillCard.id, skillId))
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

